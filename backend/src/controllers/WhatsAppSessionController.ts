import { Request, Response } from "express";
import { getWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import cacheLayer from "../libs/cache";
import Whatsapp from "../models/Whatsapp";
import { getIO } from "../libs/socket";

/**
 * Inicia uma nova sessão do WhatsApp
 * Gera um QR Code para autenticação via WhatsApp Web
 */
const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
  await StartWhatsAppSession(whatsapp, companyId);

  return res.status(200).json({ message: "Iniciando sessão." });
};

/**
 * Gera um código de conexão no formato do WhatsApp Web
 * Formato: XXXX-XXXX (exemplo: RNAV-L5HX)
 * Primeira parte: 4 letras maiúsculas
 * Segunda parte: 4 caracteres alfanuméricos (letras e números)
 */
const generateConnectionCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  // Primeira parte: 4 letras maiúsculas (exemplo: RNAV)
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * 26));
  }
  
  code += '-';
  
  // Segunda parte: 4 caracteres alfanuméricos (exemplo: L5HX)
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

/**
 * Inicia conexão do WhatsApp usando número de telefone
 * Gera um código de conexão que o usuário deve inserir no WhatsApp do celular
 * O código é armazenado no cache Redis por 5 minutos
 */
const storeWithPhone = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { phoneNumber } = req.body;
  const { companyId } = req.user;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Número de telefone é obrigatório" });
  }

  try {
    const whatsapp = await ShowWhatsAppService(whatsappId, companyId);
    
    // Gerar código de conexão no formato WhatsApp (ex: RNAV-L5HX)
    const connectionCode = generateConnectionCode();
    
    // Armazenar código de conexão no cache Redis (válido por 5 minutos = 300 segundos)
    // O código será usado para validar a conexão quando o usuário inserir no celular
    await cacheLayer.set(`connectionCode:${whatsappId}`, connectionCode, "EX", 300);
    await cacheLayer.set(`phoneNumber:${whatsappId}`, phoneNumber, "EX", 300);
    
    // Atualizar status do WhatsApp para aguardar código
    await whatsapp.update({ 
      status: "qrcode",
      qrcode: "",
      retries: 0
    });
    
    // Emitir evento via Socket.IO para atualizar o frontend em tempo real
    // O frontend receberá o código e exibirá para o usuário
    const io = getIO();
    const whatsappData = whatsapp.toJSON();
    io.of(String(companyId))
      .emit(`company-${companyId}-whatsappSession`, {
        action: "update",
        session: {
          ...whatsappData,
          connectionCode: connectionCode,
          requiresCode: true
        }
      });
    
    return res.status(200).json({ 
      message: "Código de conexão gerado com sucesso",
      connectionCode: connectionCode,
      phoneNumber: phoneNumber
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Erro ao gerar código de conexão" });
  }
};

/**
 * Verifica o código de conexão inserido pelo usuário
 * NOTA: Esta funcionalidade completa requer integração com WhatsApp Business API
 * Atualmente, o código é apenas gerado e exibido, mas a validação real
 * precisa ser implementada com a API oficial do WhatsApp
 */
const verifyCode = async (req: Request, res: Response): Promise<Response> => {
  return res.status(501).json({ 
    error: "A verificação de código por número de telefone ainda não está implementada. Por favor, use o QR Code para conectar.",
    note: "Esta funcionalidade requer integração com WhatsApp Business API"
  });
};

/**
 * Atualiza e reinicia a sessão do WhatsApp
 * Limpa a sessão atual e gera um novo QR Code
 */
const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;

  const whatsapp = await Whatsapp.findOne({ where: { id: whatsappId, companyId } });

  // Limpar sessão atual para forçar nova autenticação
  await whatsapp.update({ session: "" });
  
  // Reiniciar sessão apenas se for canal WhatsApp (não API oficial)
  if (whatsapp.channel === "whatsapp") {
    await StartWhatsAppSession(whatsapp, companyId);
  }

  return res.status(200).json({ message: "Sessão reiniciada com sucesso." });
};

/**
 * Desconecta e remove a sessão do WhatsApp
 * Limpa todos os dados da sessão e arquivos do Baileys
 */
const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  
  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  // Se for canal WhatsApp (não API oficial), desconectar via Baileys
  if (whatsapp.channel === "whatsapp") {
    // Deletar arquivos de sessão do Baileys
    await DeleteBaileysService(whatsappId);

    // Obter instância do socket e desconectar
    const wbot = getWbot(whatsapp.id);
    wbot.logout();
    wbot.ws.close();
  }

  return res.status(200).json({ message: "Sessão desconectada com sucesso." });
};

export default { store, remove, update, storeWithPhone, verifyCode };
