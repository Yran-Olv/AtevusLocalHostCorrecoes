import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  userId: number;
  hashId: string;
  data: any
}

interface webhookCustom {
	config: null | {
    lastRequest: {},
    keys:{}
  }
}

const DispatchWebHookService = async ({
  userId,
  hashId,
  data
}: Request): Promise<WebhookModel> => {
  try {

    const webhook = await WebhookModel.findOne({
      where:{
        user_id: userId,
        hash_id: hashId,
      }
    });

    const config = {
      lastRequest: {
        ...data
      },
    }

    const webhookUpdate = await WebhookModel.update({ config }, {
      where: {hash_id: hashId, user_id: userId}
    });

    if (!webhook) {
      throw new AppError('Webhook não encontrado');
    }

    logger.debug('Webhook atualizado', { userId, hashId });
    return webhook;
  } catch (error) {
    logger.error("Erro ao atualizar webhook", {
      userId,
      hashId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw error instanceof AppError ? error : new AppError('Erro ao atualizar webhook');
  }
};

export default DispatchWebHookService;
