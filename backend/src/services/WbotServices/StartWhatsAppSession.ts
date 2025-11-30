import { initWASocket, hasError515, clearError515 } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import logger from "../../utils/logger";
import * as Sentry from "@sentry/node";
import cacheLayer from "../../libs/cache";
import DeleteBaileysService from "../BaileysServices/DeleteBaileysService";
import { cleanOrphanSessions } from "../../helpers/cleanOrphanSessions";

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number,
  cleanSession: boolean = false
): Promise<void> => {
  
  // Verificar se houve erro 515 anterior - se sim, limpar preventivamente
  const hadError515 = hasError515(whatsapp.id);
  
  if (cleanSession || hadError515) {
    const reason = hadError515 ? "erro 515 detectado anteriormente" : "limpeza solicitada";
    logger.info(`[${whatsapp.name}] Limpando sessão do WhatsApp ${whatsapp.name} (ID: ${whatsapp.id}) antes de conectar... (Motivo: ${reason})`);
    try {
      // Limpar campo session no banco de dados
      await whatsapp.update({ 
        session: "",
        qrcode: "",
        retries: 0
      });
      // Limpar dados do Baileys
      await DeleteBaileysService(whatsapp.id);
      // Limpar cache Redis
      await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);
      // Remover marca de erro 515 após limpeza
      clearError515(whatsapp.id);
      
      // Aguardar um pouco para garantir que tudo foi limpo completamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.info(`[${whatsapp.name}] Sessão completamente limpa. Novo QR code será gerado.`);
    } catch (error) {
      logger.warn(`[${whatsapp.name}] Erro ao limpar sessão: ${error.message}`);
    }
  }
  
  if (whatsapp.status === "DISCONNECTED" || whatsapp.status === "PENDING") {
    logger.info(`🧹 Limpando sessões órfãs da empresa ${companyId} antes de conectar...`);
    try {
      await cleanOrphanSessions(companyId);
    } catch (error) {
      logger.warn(`Aviso ao limpar sessões órfãs: ${error.message}`);
    }
  }
  
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-whatsappSession`, {
      action: "update",
      session: whatsapp
    });

  try {
    const wbot = await initWASocket(whatsapp);
   
    if (wbot.id) {
      wbotMessageListener(wbot, companyId);
      wbotMonitor(wbot, whatsapp, companyId);
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};
