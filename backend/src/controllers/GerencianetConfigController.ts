import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import GerencianetConfig from "../models/GerencianetConfig";
import isSuper from "../middleware/isSuper";

export const index = async (req: Request, res: Response): Promise<Response> => {
  let config = await GerencianetConfig.findOne();

  // Se não existe, cria uma configuração padrão
  if (!config) {
    config = await GerencianetConfig.create({
      sandbox: true,
      clientId: "",
      clientSecret: "",
      chavePix: "",
      pixCert: "",
      webhookUrl: "",
      pixCertPassword: ""
    });
  }

  // Não retorna o clientSecret completo por segurança
  const safeConfig = {
    ...config.toJSON(),
    clientSecret: config.clientSecret ? "***" + config.clientSecret.slice(-4) : ""
  };

  return res.status(200).json(safeConfig);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    sandbox: Yup.boolean(),
    clientId: Yup.string(),
    clientSecret: Yup.string(),
    chavePix: Yup.string(),
    pixCert: Yup.string(),
    webhookUrl: Yup.string().url("URL inválida"),
    pixCertPassword: Yup.string()
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  let config = await GerencianetConfig.findOne();

  // Se clientSecret não foi enviado ou está vazio, mantém o atual
  const updateData = { ...req.body };
  if (!updateData.clientSecret || updateData.clientSecret === "") {
    delete updateData.clientSecret;
  }

  if (!config) {
    config = await GerencianetConfig.create(updateData);
  } else {
    await config.update(updateData);
  }

  // Não retorna o clientSecret completo por segurança
  const safeConfig = {
    ...config.toJSON(),
    clientSecret: config.clientSecret ? "***" + config.clientSecret.slice(-4) : ""
  };

  return res.status(200).json(safeConfig);
};

// Endpoint para obter configuração completa (apenas para uso interno)
export const getFullConfig = async (): Promise<GerencianetConfig | null> => {
  return await GerencianetConfig.findOne();
};

