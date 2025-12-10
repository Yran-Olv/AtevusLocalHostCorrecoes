import { FlowBuilderModel } from "../../models/FlowBuilder";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  userId: number;
  name: string;
  companyId: number
}

const CreateFlowBuilderService = async ({
  userId,
  name,
  companyId
}: Request): Promise<FlowBuilderModel | string> => {
  try {
    
    const nameExist = await FlowBuilderModel.findOne({
      where: {
        name,
        company_id: companyId
      }
    })


    if(nameExist){
      return 'exist'
    }

    const flow = await FlowBuilderModel.create({
      user_id: userId,
      company_id: companyId,
      name: name,
    });

    logger.info('Fluxo criado com sucesso', { userId, name, companyId, flowId: flow.id });
    return flow;
  } catch (error) {
    logger.error("Erro ao criar fluxo", {
      userId,
      name,
      companyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw new AppError('Erro ao criar fluxo');
  }
};

export default CreateFlowBuilderService;
