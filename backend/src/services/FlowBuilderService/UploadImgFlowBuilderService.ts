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

const UploadImgFlowBuilderService = async ({
  userId,
  name,
  companyId
}: Request): Promise<FlowImgModel> => {
  try {
    const flowImg = await FlowImgModel.create({
      userId: userId,
      companyId: companyId,
      name: name,
    });

    logger.info('Imagem do fluxo criada', { userId, name, companyId, imgId: flowImg.id });
    return flowImg;
  } catch (error) {
    logger.error("Erro ao criar imagem do fluxo", {
      userId,
      name,
      companyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw new AppError('Erro ao criar imagem do fluxo');
  }
};

export default UploadImgFlowBuilderService;
