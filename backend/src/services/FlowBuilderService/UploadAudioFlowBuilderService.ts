import { FlowAudioModel } from "../../models/FlowAudio";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowImgModel } from "../../models/FlowImg";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  userId: number;
  name: string;
  companyId: number
}

const UploadAudioFlowBuilderService = async ({
  userId,
  name,
  companyId
}: Request): Promise<FlowAudioModel> => {
  try {
    const flowImg = await FlowAudioModel.create({
      userId: userId,
      companyId: companyId,
      name: name,
    });

    logger.info('Áudio do fluxo criado', { userId, name, companyId, audioId: flowImg.id });
    return flowImg;
  } catch (error) {
    logger.error("Erro ao criar áudio do fluxo", {
      userId,
      name,
      companyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw new AppError('Erro ao criar áudio do fluxo');
  }
};

export default UploadAudioFlowBuilderService;
