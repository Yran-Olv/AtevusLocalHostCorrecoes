import { FlowBuilderModel } from "../../models/FlowBuilder";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  id: number;
}

const DuplicateFlowBuilderService = async ({
  id
}: Request): Promise<FlowBuilderModel> => {
  try {
    const flow = await FlowBuilderModel.findOne({
      where: {
        id: id
      }
    });

    if (!flow) {
      throw new AppError('Fluxo não encontrado para duplicação');
    }

    const duplicate = await FlowBuilderModel.create({
      name: flow.name + " - copy",
      flow: flow.flow,
      user_id: flow.user_id,
      company_id: flow.company_id
    });

    logger.info('Fluxo duplicado com sucesso', { originalId: id, duplicateId: duplicate.id });
    return duplicate;
  } catch (error) {
    logger.error("Erro ao duplicar fluxo", {
      id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw error instanceof AppError ? error : new AppError('Erro ao duplicar fluxo');
  }
};

export default DuplicateFlowBuilderService;
