import cacheLayer from "../libs/cache";
import Whatsapp from "../models/Whatsapp";
import logger from "../utils/logger";

export async function cleanOrphanSessions(companyId?: number): Promise<void> {
  try {
    logger.info('🧹 Iniciando limpeza de sessões órfãs no Redis...');
    
    const validWhatsapps = await Whatsapp.findAll({
      where: companyId ? { companyId } : {},
      attributes: ['id', 'status']
    });
    
    const validIds = validWhatsapps.map(w => w.id);
    const connectedIds = validWhatsapps.filter(w => w.status === 'CONNECTED').map(w => w.id);
    
    logger.info(`WhatsApps válidos: ${validIds.length}, Conectados: ${connectedIds.length}`);
    
    const allSessionKeys = await cacheLayer.getKeys('sessions:*');
    
    const sessionsByWhatsappId = new Map<number, number>();
    
    for (const key of allSessionKeys) {
      const match = key.match(/sessions:(\d+):/);
      if (match) {
        const whatsappId = parseInt(match[1]);
        sessionsByWhatsappId.set(
          whatsappId,
          (sessionsByWhatsappId.get(whatsappId) || 0) + 1
        );
      }
    }
    
    logger.info(`Total de WhatsApps com sessões no Redis: ${sessionsByWhatsappId.size}`);
    
    let orphanKeys = 0;
    let disconnectedKeys = 0;
    
    for (const [whatsappId, keyCount] of sessionsByWhatsappId) {
      if (!validIds.includes(whatsappId)) {
        logger.warn(`WhatsApp ID ${whatsappId} não existe no banco. Limpando ${keyCount} chaves órfãs...`);
        await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);
        orphanKeys += keyCount;
      } else if (!connectedIds.includes(whatsappId)) {
        logger.info(`WhatsApp ID ${whatsappId} está DESCONECTADO. Limpando ${keyCount} chaves antigas...`);
        await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);
        disconnectedKeys += keyCount;
      }
    }
    
    logger.info(`✅ Limpeza concluída!`);
    logger.info(`   Chaves órfãs removidas: ${orphanKeys}`);
    logger.info(`   Chaves de desconectados removidas: ${disconnectedKeys}`);
    logger.info(`   WhatsApps conectados preservados: ${connectedIds.length}`);
    
  } catch (error) {
    logger.error(`Erro na limpeza de sessões órfãs: ${error.message}`);
    throw error;
  }
}


