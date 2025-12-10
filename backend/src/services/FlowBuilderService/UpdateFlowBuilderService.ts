import { FlowBuilderModel } from "../../models/FlowBuilder";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number;
  name: string;
  flowId: number;
}

const UpdateFlowBuilderService = async ({
  companyId,
  name,
  flowId
}: Request): Promise<String> => {
  try {

    const nameExist = await FlowBuilderModel.findOne({
      where: {
        name,
        company_id: companyId
      }
    })

    if(nameExist && nameExist.id !== flowId){
      logger.warn('Nome de fluxo já existe', { name, companyId, existingFlowId: nameExist.id });
      return 'exist'
    }

    const flow = await FlowBuilderModel.update({ name }, {
      where: {id: flowId, company_id: companyId}
    });

    logger.info('Fluxo atualizado com sucesso', { flowId, name, companyId });
    return 'ok';
  } catch (error) {
    logger.error("Erro ao atualizar fluxo", {
      flowId,
      name,
      companyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw new AppError('Erro ao atualizar fluxo');
  }
};

export default UpdateFlowBuilderService;
