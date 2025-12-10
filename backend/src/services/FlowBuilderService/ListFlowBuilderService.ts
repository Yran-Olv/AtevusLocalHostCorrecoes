import { WebhookModel } from "../../models/Webhook";
import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import logger from "../../utils/logger";
import AppError from "../../errors/AppError";

interface Request {
  companyId: number;
}

interface Response {
  flows: FlowBuilderModel[];
}

const ListFlowBuilderService = async ({
  companyId,
}: Request): Promise<Response> => {
  
    try {
        const flows = await FlowBuilderModel.findAll({
          where: {
            company_id: companyId
          },
          order: [['createdAt', 'DESC']]
        });

        logger.debug('Fluxos listados', { companyId, count: flows.length });
        return {
            flows: flows.map(flow => flow.toJSON()),
        }
      } catch (error) {
        logger.error('Erro ao listar fluxos', {
          companyId,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        throw new AppError('Erro ao listar fluxos');
      }
};

export default ListFlowBuilderService;
