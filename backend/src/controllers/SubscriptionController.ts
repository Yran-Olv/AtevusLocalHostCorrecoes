import { Request, Response } from "express";
import * as Yup from "yup";
import Gerencianet from "gn-api-sdk-typescript";
import AppError from "../errors/AppError";

import { getGerencianetOptions } from "../config/Gn";
import Company from "../models/Company";
import Invoices from "../models/Invoices";
import { getIO } from "../libs/socket";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import Plan from "../models/Plan";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const options = await getGerencianetOptions();
  const gerencianet = new Gerencianet(options);

  return res.json(gerencianet.getSubscriptions());
};

export const createSubscription = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const options = await getGerencianetOptions();
  const gerencianet = new Gerencianet(options);
  const { companyId } = req.user;

  // Validação mais flexível - aceita string ou number
  const schema = Yup.object().shape({
    price: Yup.mixed().required("Preço é obrigatório"),
    users: Yup.mixed().required("Número de usuários é obrigatório"),
    plan: Yup.string().required("Plano é obrigatório"),
    invoiceId: Yup.number().required("ID da fatura é obrigatório")
  });

  if (!(await schema.isValid(req.body))) {
    const errors = await schema.validate(req.body, { abortEarly: false }).catch(err => err);
    throw new AppError(`Validação falhou: ${errors.message || "Dados inválidos"}`, 400);
  }

  // Validações de dados obrigatórios
  const updateCompany = await Company.findOne({ where: { id: companyId } });
  
  if (!updateCompany) {
    throw new AppError("Empresa não encontrada", 404);
  }

  if (!updateCompany.planId) {
    throw new AppError("Empresa não possui plano associado", 400);
  }

  const plan = await Plan.findOne({ where: { id: updateCompany.planId } });
  
  if (!plan) {
    throw new AppError("Plano não encontrado", 404);
  }

  if (!plan.amount || Number(plan.amount) <= 0) {
    throw new AppError("Valor do plano inválido", 400);
  }

  const { invoiceId, price: priceFromBody } = req.body;

  if (!invoiceId) {
    throw new AppError("ID da fatura é obrigatório", 400);
  }

  // Usa o preço do body se fornecido, senão usa o do plano
  let finalPrice: number;
  if (priceFromBody) {
    finalPrice = typeof priceFromBody === 'string' ? parseFloat(priceFromBody) : priceFromBody;
  } else {
    finalPrice = parseFloat(plan.amount.toString());
  }

  if (isNaN(finalPrice) || finalPrice <= 0) {
    throw new AppError("Valor do pagamento inválido", 400);
  }

  // Formata o preço para BRL (Real brasileiro) - formato esperado pelo Gerencianet PIX
  // O Gerencianet espera o valor como string com 2 casas decimais
  const price = finalPrice.toFixed(2);

  const devedor: any = { nome: updateCompany.name || "Cliente" };

  // Valida e formata documento
  if (!updateCompany.document || updateCompany.document.trim() === "") {
    throw new AppError("Documento da empresa é obrigatório para gerar cobrança PIX", 400);
  }

  const doc = updateCompany.document.replace(/\D/g, "");

  if (doc.length === 11) {
    devedor.cpf = doc;
  } else if (doc.length === 14) {
    devedor.cnpj = doc;
  } else {
    throw new AppError("Documento inválido. Deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)", 400);
  }

  // Valida chave PIX
  if (!process.env.GERENCIANET_CHAVEPIX) {
    throw new AppError("Chave PIX não configurada no servidor", 500);
  }

  const body = {
    calendario: {
      expiracao: 3600
    },
    devedor: {
      ...devedor
    },
    valor: {
      original: price
    },
    chave: process.env.GERENCIANET_CHAVEPIX,
    solicitacaoPagador: `#Fatura:${invoiceId}`
  };

  try {
    console.log('Criando cobrança PIX:', JSON.stringify(body, null, 2));
    
    const pix = await gerencianet.pixCreateImmediateCharge(null, body);

    if (!pix || !pix.loc || !pix.loc.id) {
      throw new AppError("Erro ao criar cobrança PIX: resposta inválida da API", 500);
    }

    const qrcode = await gerencianet.pixGenerateQRCode({ id: pix.loc.id });

    if (!qrcode || !qrcode.qrcode) {
      throw new AppError("Erro ao gerar QR Code PIX", 500);
    }

    return res.json({
      ...pix,
      qrcode
    });
  } catch (error: any) {
    console.error('Erro ao criar assinatura Gerencianet:', error);
    
    // Extrai mensagem de erro mais detalhada
    let errorMessage = "Erro ao processar pagamento";
    
    if (error?.response?.data) {
      errorMessage = error.response.data.mensagem || error.response.data.message || JSON.stringify(error.response.data);
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Log detalhado para debugging
    console.error('Detalhes do erro:', {
      message: errorMessage,
      status: error?.response?.status,
      data: error?.response?.data,
      body: body
    });

    throw new AppError(`Erro ao criar cobrança PIX: ${errorMessage}`, error?.response?.status || 400);
  }
};

export const createWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required(),
    url: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave, url } = req.body;

  const body = {
    webhookUrl: url
  };

  const params = {
    chave
  };

  try {
    const options = await getGerencianetOptions();
    const gerencianet = new Gerencianet(options);

    const create = await gerencianet.pixConfigWebhook(params, body);

    // const params1 = {
    //   inicio: '2022-12-20T00:01:35Z',
    //   fim: '2022-12-31T23:59:00Z',
    // };
    // const pixListWebhook = await gerencianet.pixListWebhook(params1);

    // const params2 = {
    //   chave: 'c5c0f5a4-efe2-447f-8c73-55f8c0f07284',
    // };
    // const pixDetailWebhook = await gerencianet.pixDetailWebhook(params2);

    return res.json(create);
  } catch (error) {
    console.log(error);
  }
};

export const deleteWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave } = req.body;

  const params = {
    chave
  };

  const options = await getGerencianetOptions();
  const gerencianet = new Gerencianet(options);

  const deleteWebhook = await gerencianet.pixDeleteWebhook(params);

  return res.json(deleteWebhook);
};

export const webhook = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { type } = req.params;

  const { evento } = req.body;

  if (evento === "teste_webhook") {
    return res.json({ ok: true });
  }

  if (req.body.pix) {
    const options = await getGerencianetOptions();
    const gerencianet = new Gerencianet(options);

    req.body.pix.forEach(async (pix: any) => {

      const detalhe = await gerencianet.pixDetailCharge({ txid: pix.txid });

      if (detalhe.status === "CONCLUIDA") {
        const { solicitacaoPagador } = detalhe;

        const invoiceID = solicitacaoPagador.replace("#Fatura:", "");
        const invoices = await Invoices.findByPk(invoiceID);
        
        if (!invoices) {
          console.error(`Invoice ${invoiceID} not found`);
          return;
        }
        
        const companyId = invoices.companyId;
        const company = await Company.findByPk(companyId);

        if (!company) {
          console.error(`Company ${companyId} not found`);
          return;
        }

        // Valida se a data de vencimento atual é válida
        let expiresAt: Date;
        if (company.dueDate && !isNaN(new Date(company.dueDate).getTime())) {
          expiresAt = new Date(company.dueDate);
        } else {
          // Se não houver data válida, usa a data atual
          expiresAt = new Date();
        }
        
        // Adiciona 30 dias ao vencimento atual
        expiresAt.setDate(expiresAt.getDate() + 30);
        const date = expiresAt.toISOString().split("T")[0];

        await company.update({
          dueDate: date
        });

          const invoi = await invoices.update({
            id: invoiceID,
            status: 'paid'
          });

          await company.reload();

          const io = getIO();

          const companyUpdate = await Company.findOne({
            where: {
              id: companyId
            }
          });

          io.of(String(companyId)).emit(`company-${companyId}-payment`, {
            action: detalhe.status,
            company: companyUpdate
          });
        }
    });
  }

  return res.json({ ok: true });
};
