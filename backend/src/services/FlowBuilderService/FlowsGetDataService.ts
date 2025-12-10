import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number;
  idFlow: number
}

interface Response {
  flow: FlowBuilderModel
}

const FlowsGetDataService = async ({
  companyId,
  idFlow
}: Request): Promise<Response> => {
  
    try {
        const flow = await FlowBuilderModel.findOne({
          where: {
            company_id: companyId,
            id: idFlow
          }
        });

        if (!flow) {
          throw new AppError('Fluxo não encontrado');
        }

        logger.debug('Dados do fluxo obtidos', { companyId, idFlow });
        return {
            flow: flow
        }
      } catch (error) {
        logger.error('Erro ao obter dados do fluxo', {
          companyId,
          idFlow,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error instanceof AppError ? error : new AppError('Erro ao obter dados do fluxo');
      }
};

export default FlowsGetDataService;
