import AppError from "../../errors/AppError";
import { WebhookModel } from "../../models/Webhook";
import { sendMessageFlow } from "../../controllers/MessageController";
import { IConnections, INodes } from "./DispatchWebHookService";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import CreateContactService from "../ContactServices/CreateContactService";
import Contact from "../../models/Contact";
import CreateTicketService from "../TicketServices/CreateTicketService";
import CreateTicketServiceWebhook from "../TicketServices/CreateTicketServiceWebhook";
import { SendMessage } from "../../helpers/SendMessage";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Ticket from "../../models/Ticket";
import fs from "fs";
import GetWhatsappWbot from "../../helpers/GetWhatsappWbot";
import path from "path";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import SendWhatsAppMediaFlow, { typeSimulation } from "../WbotServices/SendWhatsAppMediaFlow";
import { randomizarCaminho } from "../../utils/randomizador";
import { SendMessageFlow } from "../../helpers/SendMessageFlow";
import formatBody from "../../helpers/Mustache";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import ShowTicketService from "../TicketServices/ShowTicketService";
import CreateMessageService, {
  MessageData
} from "../MessageServices/CreateMessageService";
import { randomString } from "../../utils/randomCode";
import ShowQueueService from "../QueueService/ShowQueueService";
import { getIO } from "../../libs/socket";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import ShowTicketUUIDService from "../TicketServices/ShowTicketFromUUIDService";
import logger from "../../utils/logger";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import CompaniesSettings from "../../models/CompaniesSettings";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { delay } from "bluebird";

interface IAddContact {
  companyId: number;
  name: string;
  phoneNumber: string;
  email?: string;
  dataMore?: any;
}

// Helper function to construct JSON line (moved before getFieldValue)
const constructJsonLine = (line: string, json: any) => {
  let valor = json
  const chaves = line.split(".")

  if (chaves.length === 1) {
    return valor[chaves[0]]
  }

  for (const chave of chaves) {
    valor = valor[chave]
  }
  return valor
};

// Helper function to get field value from dataWebhook or ticket
const getFieldValue = (key: string, dataWebhook: any, ticket: Ticket | null): any => {
  if (!key) return null;
  
  // Try to get from dataWebhook first
  if (dataWebhook && typeof dataWebhook === 'object') {
    try {
      return constructJsonLine(key, dataWebhook);
    } catch (e) {
      // Continue to try ticket
    }
  }
  
  // Try to get from ticket
  if (ticket) {
    const ticketData: any = ticket.toJSON ? ticket.toJSON() : ticket;
    try {
      return constructJsonLine(key, ticketData);
    } catch (e) {
      // Field not found
    }
  }
  
  return null;
};

// Helper function to evaluate condition
const evaluateCondition = (
  fieldValue: any,
  condition: string,
  compareValue: string
): boolean => {
  if (fieldValue === null || fieldValue === undefined) {
    return false;
  }

  const fieldStr = String(fieldValue).toLowerCase().trim();
  const compareStr = String(compareValue).toLowerCase().trim();

  switch (condition) {
    case "equals":
    case "==":
      return fieldStr === compareStr;
    case "notEquals":
    case "!=":
      return fieldStr !== compareStr;
    case "contains":
      return fieldStr.includes(compareStr);
    case "notContains":
      return !fieldStr.includes(compareStr);
    case "startsWith":
      return fieldStr.startsWith(compareStr);
    case "endsWith":
      return fieldStr.endsWith(compareStr);
    case "greaterThan":
    case ">":
      return Number(fieldValue) > Number(compareValue);
    case "lessThan":
    case "<":
      return Number(fieldValue) < Number(compareValue);
    case "greaterThanOrEqual":
    case ">=":
      return Number(fieldValue) >= Number(compareValue);
    case "lessThanOrEqual":
    case "<=":
      return Number(fieldValue) <= Number(compareValue);
    default:
      logger.warn(`Operador de condição desconhecido: ${condition}`);
      return false;
  }
};

export const ActionsWebhookService = async (
  whatsappId: number,
  idFlowDb: number,
  companyId: number,
  nodes: INodes[],
  connects: IConnections[],
  nextStage: string,
  dataWebhook: any,
  details: any,
  hashWebhookId: string,
  pressKey?: string,
  idTicket?: number,
  numberPhrase: "" | { number: string; name: string; email: string } = ""
): Promise<string> => {
  const startTime = Date.now();
  const TIMEOUT_PER_NODE = 30000; // 30 segundos por nó
  const MAX_EXECUTION_TIME = 300000; // 5 minutos total
  
  try {
    const io = getIO()
    let next = nextStage;
    logger.debug('ActionsWebhookService iniciado', {
      idFlowDb,
      companyId,
      nextStage,
      idTicket,
      nodesCount: nodes.length,
      connectionsCount: connects.length
    });
    let createFieldJsonName = "";

    const connectStatic = connects;
    if (numberPhrase === "") {
      const nameInput = details.inputs.find(item => item.keyValue === "nome");
      nameInput.data.split(",").map(dataN => {
        const lineToData = details.keysFull.find(item => item === dataN);
        let sumRes = "";
        if (!lineToData) {
          sumRes = dataN;
        } else {
          sumRes = constructJsonLine(lineToData, dataWebhook);
        }
        createFieldJsonName = createFieldJsonName + sumRes
      });
    } else {
      createFieldJsonName = numberPhrase.name;
    }


    let numberClient = "";

    if (numberPhrase === "") {
      const numberInput = details.inputs.find(
        item => item.keyValue === "celular"
      );

      numberInput.data.split(",").map(dataN => {
        const lineToDataNumber = details.keysFull.find(item => item === dataN);
        let createFieldJsonNumber = "";
        if (!lineToDataNumber) {
          createFieldJsonNumber = dataN;
        } else {
          createFieldJsonNumber = constructJsonLine(
            lineToDataNumber,
            dataWebhook
          );
        }

        numberClient = numberClient + createFieldJsonNumber;
      });
    } else {
      numberClient = numberPhrase.number;
    }


    numberClient = removerNaoLetrasNumeros(numberClient);

    if (numberClient.substring(0, 2) === "55") {
      if (parseInt(numberClient.substring(2, 4)) >= 31) {
        if (numberClient.length === 13) {
          numberClient =
            numberClient.substring(0, 4) + numberClient.substring(5, 13);
        }
      }
    }

    let createFieldJsonEmail = "";

    if (numberPhrase === "") {
      const emailInput = details.inputs.find(item => item.keyValue === "email");
      emailInput.data.split(",").map(dataN => {

        const lineToDataEmail = details.keysFull.find(item =>
          item.endsWith("email")
        );

        let sumRes = "";
        if (!lineToDataEmail) {
          sumRes = dataN;
        } else {
          sumRes = constructJsonLine(lineToDataEmail, dataWebhook);
        }

        createFieldJsonEmail = createFieldJsonEmail + sumRes;
      });
    } else {
      createFieldJsonEmail = numberPhrase.email;
    }



    // Otimização: Criar Maps para busca O(1)
    const nodesMap = new Map<string, INodes>();
    nodes.forEach(node => {
      nodesMap.set(node.id, node);
    });

    const connectionsMap = new Map<string, IConnections[]>();
    connects.forEach(conn => {
      const key = `${conn.source}-${conn.sourceHandle || ''}`;
      if (!connectionsMap.has(key)) {
        connectionsMap.set(key, []);
      }
      connectionsMap.get(key)!.push(conn);
    });

    // Map de conexões por source (para busca rápida)
    const connectionsBySource = new Map<string, IConnections[]>();
    connects.forEach(conn => {
      if (!connectionsBySource.has(conn.source)) {
        connectionsBySource.set(conn.source, []);
      }
      connectionsBySource.get(conn.source)!.push(conn);
    });

    const lengthLoop = nodes.length;
    const whatsapp = await GetDefaultWhatsApp(whatsappId, companyId);

    if (whatsapp.status !== "CONNECTED") {
      logger.warn('WhatsApp não conectado', { whatsappId, companyId });
      return "";
    }

    let execCount = 0;
    let execFn = "";
    let ticket = null;
    let noAlterNext = false;

    // Verificar timeout total
    if (Date.now() - startTime > MAX_EXECUTION_TIME) {
      logger.error('Timeout total do fluxo', { idFlowDb, idTicket, executionTime: Date.now() - startTime });
      throw new AppError('Tempo máximo de execução do fluxo excedido');
    }

    for (var i = 0; i < lengthLoop; i++) {
      // Verificar timeout por nó
      const nodeStartTime = Date.now();
      if (Date.now() - nodeStartTime > TIMEOUT_PER_NODE) {
        logger.warn('Timeout no nó', { idFlowDb, idTicket, nodeIndex: i, executionTime: Date.now() - nodeStartTime });
        break;
      }

      let nodeSelected: any;
      let ticketInit: Ticket;
      
      if (idTicket) {
        ticketInit = await Ticket.findOne({
          where: { id: idTicket, whatsappId }
        });

        if (!ticketInit) {
          logger.warn('Ticket não encontrado', { idTicket, whatsappId });
          break;
        }

        if (ticketInit.status === "closed") {
          logger.debug('Ticket fechado, interrompendo fluxo', { idTicket });
          break;
        } else {
          await ticketInit.update({
            dataWebhook: {
              status: "process",
            },
          });
        }
      }

      if (pressKey) {
        if (pressKey === "parar") {
          if (idTicket) {
            ticketInit = await Ticket.findOne({
              where: { id: idTicket, whatsappId }
            });
            if (ticketInit) {
              await ticketInit.update({
                status: "closed"
              });
            }
          }
          logger.debug('Fluxo interrompido por comando "parar"', { idFlowDb, idTicket });
          break;
        }

        if (execFn === "") {
          nodeSelected = {
            type: "menu"
          };
        } else {
          nodeSelected = nodesMap.get(execFn);
          if (!nodeSelected) {
            logger.warn('Nó não encontrado', { nodeId: execFn, idFlowDb });
            break;
          }
        }
      } else {
        const otherNode = nodesMap.get(next);
        if (otherNode) {
          nodeSelected = otherNode;
        } else {
          logger.warn('Próximo nó não encontrado', { nodeId: next, idFlowDb });
          break;
        }
      }

      if (!nodeSelected) {
        logger.warn('Nó selecionado é nulo', { next, execFn, idFlowDb });
        break;
      }

      if (nodeSelected.type === "message") {
        let msg;
        if (dataWebhook === "") {
          msg = {
            body: nodeSelected.data.label,
            number: numberClient,
            companyId: companyId
          };
        } else {
          const dataLocal = {
            nome: createFieldJsonName,
            numero: numberClient,
            email: createFieldJsonEmail
          };
          msg = {
            body: replaceMessages(
              nodeSelected.data.label,
              details,
              dataWebhook,
              dataLocal
            ),
            number: numberClient,
            companyId: companyId
          };
        }

        await SendMessage(whatsapp, {
          number: numberClient,
          body: msg.body
        });
        //TESTE BOTÃO
        //await SendMessageFlow(whatsapp, {
        //  number: numberClient,
        //  body: msg.body
        //} )
        await intervalWhats("1");
      }

      if (nodeSelected.type === "ticket") {
        const queueId = nodeSelected.data?.data?.id || nodeSelected.data?.id
        const queue = await ShowQueueService(queueId, companyId)


        await ticket.update({
          status: 'pending',
          queueId: queue.id,
          userId: ticket.userId,
          companyId: companyId,
          flowWebhook: true,
          lastFlowId: nodeSelected.id,
          hashFlowId: hashWebhookId,
          flowStopped: idFlowDb.toString()
        });

        await FindOrCreateATicketTrakingService({
          ticketId: ticket.id,
          companyId,
          whatsappId: ticket.whatsappId,
          userId: ticket.userId
        })



        await UpdateTicketService({
          ticketData: {
            status: "pending",
            queueId: queue.id
          },
          ticketId: ticket.id,
          companyId
        })


        await CreateLogTicketService({
          ticketId: ticket.id,
          type: "queue",
          queueId: queue.id
        });

        let settings = await CompaniesSettings.findOne({
          where: {
            companyId: companyId
          }
        })

        const { queues, greetingMessage, maxUseBotQueues, timeUseBotQueues } = await ShowWhatsAppService(whatsappId, companyId);

        if (greetingMessage.length > 1) {
          const body = formatBody(`${greetingMessage}`, ticket);

          const ticketDetails = await ShowTicketService(ticket.id, companyId);

          await ticketDetails.update({
            lastMessage: formatBody(queue.greetingMessage, ticket.contact)
          });

          await SendWhatsAppMessage({
            body,
            ticket: ticketDetails,
            quotedMsg: null
          });

          SetTicketMessagesAsRead(ticketDetails);
        }


      }


      if (nodeSelected.type === "singleBlock") {
        for (var iLoc = 0; iLoc < nodeSelected.data.seq.length; iLoc++) {

          const elementNowSelected = nodeSelected.data.seq[iLoc];

          let ticketUpdate = await Ticket.findOne({
            where: { id: idTicket, companyId }
          });

          if (ticketUpdate.status === "open") {

            pressKey = "999";
            execFn = undefined;


            await ticket.update({
              lastFlowId: null,
              dataWebhook: null,
              queueId: null,
              hashFlowId: null,
              flowWebhook: false,
              flowStopped: null
            });
            break;
          }

          if (ticketUpdate.status === "closed") {

            pressKey = "999";
            execFn = undefined;

            await ticket.reload();

            io.of(String(companyId))
              // .to(oldStatus)
              // .to(ticketId.toString())
              .emit(`company-${ticket.companyId}-ticket`, {
                action: "delete",
                ticketId: ticket.id
              });

            break;
          }


          if (elementNowSelected.includes("message")) {
            // await SendMessageFlow(whatsapp, {
            //   number: numberClient,
            //   body: nodeSelected.data.elements.filter(
            //     item => item.number === elementNowSelected
            //   )[0].value
            // });
            const bodyFor = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0].value;

            const ticketDetails = await ShowTicketService(ticket.id, companyId);

            let msg;

            if (dataWebhook === "") {
              msg = bodyFor;
            } else {
              const dataLocal = {
                nome: createFieldJsonName,
                numero: numberClient,
                email: createFieldJsonEmail
              };
              msg = replaceMessages(bodyFor, details, dataWebhook, dataLocal);
            }

            await delay(3000);
            await typeSimulation(ticket, 'composing')

            await SendWhatsAppMessage({
              body: msg,
              ticket: ticketDetails,
              quotedMsg: null
            });

            SetTicketMessagesAsRead(ticketDetails);

            await ticketDetails.update({
              lastMessage: formatBody(bodyFor, ticket.contact)
            });


            await intervalWhats("1");
          }
          if (elementNowSelected.includes("interval")) {
            await intervalWhats(
              nodeSelected.data.elements.filter(
                item => item.number === elementNowSelected
              )[0].value
            );
          }


          if (elementNowSelected.includes("img")) {

            await typeSimulation(ticket, 'composing')

            const { getPublicPathFromRoot } = require("../../utils/pathHelper");
            const mediaRelativePath = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0].value;
            const mediaPath = getPublicPathFromRoot(mediaRelativePath);
            
            await SendMessage(whatsapp, {
              number: numberClient,
              body: "",
              mediaPath
            });
            await intervalWhats("1");
          }


          if (elementNowSelected.includes("audio")) {
            const { getPublicPathFromRoot } = require("../../utils/pathHelper");
            const mediaRelativePath = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0].value;
            const mediaDirectory = getPublicPathFromRoot(mediaRelativePath);
            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });

            await typeSimulation(ticket, 'recording');

            await SendWhatsAppMediaFlow({
              media: mediaDirectory,
              ticket: ticketInt,
              isRecord: nodeSelected.data.elements.filter(
                item => item.number === elementNowSelected
              )[0].record
            });
            //fs.unlinkSync(mediaDirectory.split('.')[0] + 'A.mp3');
            await intervalWhats("1");
          }
          if (elementNowSelected.includes("video")) {
            const { getPublicPathFromRoot } = require("../../utils/pathHelper");
            const mediaRelativePath = nodeSelected.data.elements.filter(
              item => item.number === elementNowSelected
            )[0].value;
            const mediaDirectory = getPublicPathFromRoot(mediaRelativePath);
            const ticketInt = await Ticket.findOne({
              where: { id: ticket.id }
            });

            await typeSimulation(ticket, 'recording');

            await SendWhatsAppMediaFlow({
              media: mediaDirectory,
              ticket: ticketInt
            });
            //fs.unlinkSync(mediaDirectory.split('.')[0] + 'A.mp3');
            await intervalWhats("1");
          }
        }
      }


      // Implementação do nó CONDITION
      if (nodeSelected.type === "condition") {
        try {
          const fieldKey = nodeSelected.data?.key;
          const condition = nodeSelected.data?.condition;
          const compareValue = nodeSelected.data?.value;

          if (!fieldKey || !condition || compareValue === undefined) {
            logger.error('Condição inválida: campos obrigatórios faltando', {
              nodeId: nodeSelected.id,
              fieldKey,
              condition,
              compareValue
            });
            break;
          }

          const fieldValue = getFieldValue(fieldKey, dataWebhook, ticket);
          const conditionMet = evaluateCondition(fieldValue, condition, compareValue);

          logger.debug('Condição avaliada', {
            nodeId: nodeSelected.id,
            fieldKey,
            fieldValue,
            condition,
            compareValue,
            result: conditionMet
          });

          // Buscar conexões do nó condition
          const conditionConnections = connectionsBySource.get(nodeSelected.id) || [];
          const trueConnection = conditionConnections.find(c => c.sourceHandle === "true");
          const falseConnection = conditionConnections.find(c => c.sourceHandle === "false");

          if (conditionMet && trueConnection) {
            next = trueConnection.target;
            noAlterNext = true;
            logger.debug('Condição verdadeira, seguindo para nó', { next });
          } else if (!conditionMet && falseConnection) {
            next = falseConnection.target;
            noAlterNext = true;
            logger.debug('Condição falsa, seguindo para nó', { next });
          } else {
            logger.warn('Conexões de condição não encontradas', {
              nodeId: nodeSelected.id,
              hasTrueConnection: !!trueConnection,
              hasFalseConnection: !!falseConnection
            });
            break;
          }
        } catch (error) {
          logger.error('Erro ao processar nó condition', {
            nodeId: nodeSelected.id,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          break;
        }
      }

      // Implementação do nó INTERVAL
      if (nodeSelected.type === "interval") {
        const seconds = nodeSelected.data?.sec || 1;
        await intervalWhats(String(seconds));
        logger.debug('Intervalo executado', { nodeId: nodeSelected.id, seconds });
      }

      let isRandomizer: boolean;
      if (nodeSelected.type === "randomizer") {
        const selectedRandom = randomizarCaminho(nodeSelected.data.percent / 100);

        const resultConnect = connectionsBySource.get(nodeSelected.id) || [];
        if (selectedRandom === "A") {
          const connA = resultConnect.find(item => item.sourceHandle === "a");
          if (connA) {
            next = connA.target;
            noAlterNext = true;
          } else {
            logger.warn('Conexão "a" não encontrada no randomizador', { nodeId: nodeSelected.id });
            break;
          }
        } else {
          const connB = resultConnect.find(item => item.sourceHandle === "b");
          if (connB) {
            next = connB.target;
            noAlterNext = true;
          } else {
            logger.warn('Conexão "b" não encontrada no randomizador', { nodeId: nodeSelected.id });
            break;
          }
        }
        isRandomizer = true;
      }

      let isMenu: boolean;

      if (nodeSelected.type === "menu") {

        if (pressKey) {

          const filterOne = connectStatic.filter(confil => confil.source === next)
          const filterTwo = filterOne.filter(filt2 => filt2.sourceHandle === "a" + pressKey)
          if (filterTwo.length > 0) {
            execFn = filterTwo[0].target
          } else {
            execFn = undefined
          }
          // execFn =
          //   connectStatic
          //     .filter(confil => confil.source === next)
          //     .filter(filt2 => filt2.sourceHandle === "a" + pressKey)[0]?.target ??
          //   undefined;
          if (execFn === undefined) {
            break;
          }
          pressKey = "999";

          const isNodeExist = nodesMap.get(execFn);

          if (isNodeExist) {
            isMenu = isNodeExist.type === "menu";
          } else {
            isMenu = false;
          }
        } else {
          let optionsMenu = "";
          nodeSelected.data.arrayOption.map(item => {
            optionsMenu += `[${item.number}] ${item.value}\n`;
          });

          const menuCreate = `${nodeSelected.data.message}\n\n${optionsMenu}`;

          let msg;
          if (dataWebhook === "") {
            msg = {
              body: menuCreate,
              number: numberClient,
              companyId: companyId
            };
          } else {
            const dataLocal = {
              nome: createFieldJsonName,
              numero: numberClient,
              email: createFieldJsonEmail
            };
            msg = {
              body: replaceMessages(menuCreate, details, dataWebhook, dataLocal),
              number: numberClient,
              companyId: companyId
            };
          }

          const ticketDetails = await ShowTicketService(ticket.id, companyId);

          const messageData: MessageData = {
            wid: randomString(50),
            ticketId: ticket.id,
            body: msg.body,
            fromMe: true,
            read: true
          };

          //await CreateMessageService({ messageData: messageData, companyId });

          //await SendWhatsAppMessage({ body: bodyFor, ticket: ticketDetails, quotedMsg: null })

          // await SendMessage(whatsapp, {
          //   number: numberClient,
          //   body: msg.body
          // });

          await typeSimulation(ticket, 'composing')

          await SendWhatsAppMessage({
            body: msg.body,
            ticket: ticketDetails,
            quotedMsg: null
          });

          SetTicketMessagesAsRead(ticketDetails);

          await ticketDetails.update({
            lastMessage: formatBody(msg.body, ticket.contact)
          });
          await intervalWhats("1");

          if (ticket) {
            ticket = await Ticket.findOne({
              where: { id: ticket.id, whatsappId: whatsappId, companyId: companyId }
            });
          } else {
            ticket = await Ticket.findOne({
              where: { id: idTicket, whatsappId: whatsappId, companyId: companyId }
            });
          }

          if (ticket) {
            await ticket.update({
              queueId: ticket.queueId ? ticket.queueId : null,
              userId: null,
              companyId: companyId,
              flowWebhook: true,
              lastFlowId: nodeSelected.id,
              dataWebhook: dataWebhook,
              hashFlowId: hashWebhookId,
              flowStopped: idFlowDb.toString()
            });
          }

          break;
        }
      }

      let isContinue = false;

      if (pressKey === "999" && execCount > 0) {
        pressKey = undefined;
        const execConnections = connectionsBySource.get(execFn) || [];
        const result = execConnections[0];
        if (!result) {
          next = "";
          logger.debug('Nenhuma conexão encontrada após execFn', { execFn });
        } else {
          if (!noAlterNext) {
            next = result.target;
          }
        }
      } else {
        let result: IConnections | { target: string } | undefined;

        if (isMenu) {
          result = { target: execFn };
          isContinue = true;
          pressKey = undefined;
        } else if (isRandomizer) {
          isRandomizer = false;
          result = { target: next };
        } else {
          const nextConnections = connectionsBySource.get(next) || [];
          result = nextConnections[0];
        }

        if (!result) {
          next = "";
          logger.debug('Nenhuma conexão encontrada', { next, isMenu, isRandomizer });
        } else {
          if (!noAlterNext) {
            next = result.target;
          }
        }
      }

      if (!pressKey && !isContinue) {
        const nextNodeConnections = connectionsBySource.get(nodeSelected.id) || [];
        const nextNodeCount = nextNodeConnections.length;

        if (nextNodeCount === 0) {
          logger.debug('Fim do fluxo: nenhuma conexão encontrada', {
            nodeId: nodeSelected.id,
            nodeType: nodeSelected.type
          });

          await Ticket.findOne({
            where: { id: idTicket, whatsappId, companyId: companyId }
          });
          await ticket.update({
            lastFlowId: null,
            dataWebhook: {
              status: "process",
            },
            hashFlowId: null,
            flowWebhook: false,
            flowStopped: idFlowDb.toString()
          });
          break;
        }
      }

      isContinue = false;

      if (next === "") {
        break;
      }

      ticket = await Ticket.findOne({
        where: { id: idTicket, whatsappId, companyId: companyId }
      });

      if (!ticket) {
        logger.warn('Ticket não encontrado para atualização', { idTicket, whatsappId, companyId });
        break;
      }

      if (ticket.status === "closed") {
        io.of(String(companyId))
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "delete",
            ticketId: ticket.id
          });
        logger.debug('Ticket fechado durante execução do fluxo', { idTicket });
        break;
      }
      await ticket.update({
        whatsappId: whatsappId,
        queueId: ticket?.queueId,
        userId: null,
        companyId: companyId,
        flowWebhook: true,
        lastFlowId: nodeSelected.id,
        dataWebhook: dataWebhook,
        hashFlowId: hashWebhookId,
        flowStopped: idFlowDb.toString()
      });

      noAlterNext = false;
      execCount++;
    }

    const executionTime = Date.now() - startTime;
    logger.info('Fluxo executado com sucesso', {
      idFlowDb,
      idTicket,
      nodesExecuted: execCount,
      executionTime,
      finalNode: next
    });

    return "ok";
  } catch (error) {
    const executionTime = Date.now() - startTime;
    logger.error('Erro ao executar fluxo', {
      idFlowDb,
      idTicket,
      companyId,
      executionTime,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Atualizar ticket para limpar estado do fluxo em caso de erro
    if (idTicket) {
      try {
        const errorTicket = await Ticket.findOne({
          where: { id: idTicket, companyId }
        });
        if (errorTicket) {
          await errorTicket.update({
            flowWebhook: false,
            lastFlowId: null,
            flowStopped: null,
            dataWebhook: {
              status: "error",
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }
      } catch (updateError) {
        logger.error('Erro ao atualizar ticket após erro no fluxo', {
          idTicket,
          updateError: updateError instanceof Error ? updateError.message : String(updateError)
        });
      }
    }

    throw error;
  }
};

function removerNaoLetrasNumeros(texto: string) {
  // Substitui todos os caracteres que não são letras ou números por vazio
  return texto.replace(/[^a-zA-Z0-9]/g, "");
}

const sendMessageWhats = async (
  whatsId: number,
  msg: any,
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>
) => {
  sendMessageFlow(whatsId, msg, req);
  return Promise.resolve();
};

const intervalWhats = (time: string) => {
  const seconds = parseInt(time) * 1000;
  return new Promise(resolve => setTimeout(resolve, seconds));
};



const replaceMessages = (
  message: string,
  details: any,
  dataWebhook: any,
  dataNoWebhook?: any
) => {
  const matches = message.match(/\{([^}]+)\}/g);


  if (dataWebhook) {
    let newTxt = message.replace(/{+nome}+/, dataNoWebhook.nome);
    newTxt = newTxt.replace(/{+numero}+/, dataNoWebhook.numero);
    newTxt = newTxt.replace(/{+email}+/, dataNoWebhook.email);
    return newTxt;
  }

  if (matches && matches.includes("inputs")) {
    const placeholders = matches.map(match => match.replace(/\{|\}/g, ""));
    let newText = message;
    placeholders.map(item => {
      const value = details["inputs"].find(
        itemLocal => itemLocal.keyValue === item
      );
      const lineToData = details["keysFull"].find(itemLocal =>
        itemLocal.endsWith(`.${value.data}`)
      );
      const createFieldJson = constructJsonLine(lineToData, dataWebhook);
      newText = newText.replace(`{${item}}`, createFieldJson);
    });
    return newText;
  } else {
    return message;
  }



};