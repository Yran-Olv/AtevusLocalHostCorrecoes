import { FlowBuilderModel } from "../../models/FlowBuilder";
import { WebhookModel } from "../../models/Webhook";
import { randomString } from "../../utils/randomCode";
import AppError from "../../errors/AppError";
import logger from "../../utils/logger";

interface node {
    id: string,
    position: { x: number, y: number },
    data: { 
        label?: string
        sec?: number
        title?: string
        text?: string
        key?: string
        condition?: string
        value?: string
        message?: string
        arrayOption?: Array<{ number: number; value: string }>
        url?: string
        percent?: number
        seq?: string[]
        elements?: Array<{ number: string; value: string; original?: string; record?: boolean }>
        id?: number
    },
    type: string,
    style?: { backgroundColor: string; color: string; padding?: number; borderRadius?: number }
}

interface body {
    nodes : node[]
    idFlow: number
    connections: any[]
}

interface Request {
  companyId: number;
  bodyData: body;
}

// Função de validação de fluxo
const validateFlow = (nodes: node[], connections: any[]): void => {
  // Validar se há nós
  if (!nodes || nodes.length === 0) {
    throw new AppError('Fluxo deve ter pelo menos um nó');
  }

  // Validar se há nó inicial
  const hasStartNode = nodes.some(node => node.type === 'start');
  if (!hasStartNode) {
    throw new AppError('Fluxo deve ter um nó inicial (start)');
  }

  // Validar estrutura dos nós
  for (const node of nodes) {
    if (!node.id || !node.type) {
      throw new AppError(`Nó inválido: falta id ou type`);
    }

    // Validar tipos específicos
    if (node.type === 'menu') {
      if (!node.data?.arrayOption || node.data.arrayOption.length === 0) {
        throw new AppError(`Nó menu (${node.id}) deve ter pelo menos uma opção`);
      }
    }

    if (node.type === 'condition') {
      if (!node.data?.key || !node.data?.condition || node.data?.value === undefined) {
        throw new AppError(`Nó condition (${node.id}) deve ter key, condition e value`);
      }
    }

    if (node.type === 'randomizer') {
      if (node.data?.percent === undefined || node.data.percent < 0 || node.data.percent > 100) {
        throw new AppError(`Nó randomizer (${node.id}) deve ter percent entre 0 e 100`);
      }
    }

    if (node.type === 'ticket') {
      if (!node.data?.id && !node.data?.data?.id) {
        throw new AppError(`Nó ticket (${node.id}) deve ter um id de fila`);
      }
    }
  }

  // Validar conexões
  if (!connections || !Array.isArray(connections)) {
    throw new AppError('Conexões devem ser um array');
  }

  // Validar se as conexões referenciam nós existentes
  const nodeIds = new Set(nodes.map(n => n.id));
  for (const conn of connections) {
    if (!conn.source || !conn.target) {
      throw new AppError('Conexão inválida: falta source ou target');
    }
    if (!nodeIds.has(conn.source)) {
      throw new AppError(`Conexão inválida: nó origem (${conn.source}) não existe`);
    }
    if (!nodeIds.has(conn.target)) {
      throw new AppError(`Conexão inválida: nó destino (${conn.target}) não existe`);
    }
  }

  logger.debug('Validação de fluxo passou', {
    nodesCount: nodes.length,
    connectionsCount: connections.length
  });
};

const FlowUpdateDataService = async ({
  companyId,
  bodyData
}: Request): Promise<String> => {
  try {
    // Validar fluxo antes de salvar
    validateFlow(bodyData.nodes, bodyData.connections);

    // Verificar se o fluxo existe e pertence à empresa
    const existingFlow = await FlowBuilderModel.findOne({
      where: { id: bodyData.idFlow, company_id: companyId }
    });

    if (!existingFlow) {
      throw new AppError('Fluxo não encontrado ou não pertence à empresa');
    }

    const flow = await FlowBuilderModel.update({ 
        flow: {
            nodes: bodyData.nodes,
            connections: bodyData.connections
        } 
    },{
      where: {id: bodyData.idFlow, company_id: companyId}
    });

    logger.info('Fluxo atualizado com sucesso', {
      idFlow: bodyData.idFlow,
      companyId,
      nodesCount: bodyData.nodes.length,
      connectionsCount: bodyData.connections.length
    });

    return 'ok';
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error("Erro ao atualizar fluxo", {
      idFlow: bodyData.idFlow,
      companyId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw new AppError('Erro ao atualizar fluxo');
  }
};

export default FlowUpdateDataService;
