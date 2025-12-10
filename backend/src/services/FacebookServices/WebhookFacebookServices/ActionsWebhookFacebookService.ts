import Chatbot from "../../../models/Chatbot";
import Contact from "../../../models/Contact";
import Queue from "../../../models/Queue";
import Ticket from "../../../models/Ticket";
import Whatsapp from "../../../models/Whatsapp";
import ShowTicketService from "../../TicketServices/ShowTicketService";
import { IConnections, INodes } from "../../WebhookService/DispatchWebHookService"
import { getAccessToken, sendAttachmentFromUrl, sendText, showTypingIndicator } from "../graphAPI";
import formatBody from "../../../helpers/Mustache";
import axios from "axios";
import fs from "fs";
import { sendFacebookMessageMedia } from "../sendFacebookMessageMedia";
import mime from "mime";
import path from "path";
import { getIO } from "../../../libs/socket";
import { randomizarCaminho } from "../../../utils/randomizador";
import CreateLogTicketService from "../../TicketServices/CreateLogTicketService";
import UpdateTicketService from "../../TicketServices/UpdateTicketService";
import FindOrCreateATicketTrakingService from "../../TicketServices/FindOrCreateATicketTrakingService";
import ShowQueueService from "../../QueueService/ShowQueueService";
import ffmpeg from "fluent-ffmpeg";
import { fi } from "date-fns/locale";
import queue from "../../../libs/queue";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import logger from "../../../utils/logger";
import AppError from "../../../errors/AppError";

// Usar FFmpeg do pacote @ffmpeg-installer/ffmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);


interface IAddContact {
    companyId: number;
    name: string;
    phoneNumber: string;
    email?: string;
    dataMore?: any;
}

interface NumberPhrase {
    number: string,
    name: string,
    email: string
}

// Helper function to construct JSON line
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

export const ActionsWebhookFacebookService = async (
    token: Whatsapp,
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
    numberPhrase?: NumberPhrase
): Promise<string> => {
    const startTime = Date.now();
    const TIMEOUT_PER_NODE = 30000; // 30 segundos por nó
    const MAX_EXECUTION_TIME = 300000; // 5 minutos total

    try {
        const io = getIO()
        let next = nextStage;
        logger.debug('ActionsWebhookFacebookService iniciado', {
            idFlowDb,
            companyId,
            nextStage,
            idTicket,
            nodesCount: nodes.length,
            connectionsCount: connects.length
        });
        let createFieldJsonName = "";
        const connectStatic = connects;

        // Otimização: Criar Maps para busca O(1)
        const nodesMap = new Map<string, INodes>();
        nodes.forEach(node => {
            nodesMap.set(node.id, node);
        });

        const connectionsBySource = new Map<string, IConnections[]>();
        connects.forEach(conn => {
            if (!connectionsBySource.has(conn.source)) {
                connectionsBySource.set(conn.source, []);
            }
            connectionsBySource.get(conn.source)!.push(conn);
        });

        const lengthLoop = nodes.length;
    const getSession = await Whatsapp.findOne({
        where: {
            facebookPageUserId: token.facebookPageUserId
        },
        include: [
            {
                model: Queue,
                as: "queues",
                attributes: ["id", "name", "color", "greetingMessage"],
                include: [
                    {
                        model: Chatbot,
                        as: "chatbots",
                        attributes: ["id", "name", "greetingMessage"]
                    }
                ]
            }
        ],
        order: [
            ["queues", "id", "ASC"],
            ["queues", "chatbots", "id", "ASC"]
        ]
    })

    let execCount = 0;

    let execFn = "";

    let ticket = null;

    let noAlterNext = false;

    let selectedQueueid = null;

        // Verificar timeout total
        if (Date.now() - startTime > MAX_EXECUTION_TIME) {
            logger.error('Timeout total do fluxo Facebook', { idFlowDb, idTicket, executionTime: Date.now() - startTime });
            throw new AppError('Tempo máximo de execução do fluxo excedido');
        }

    for (var i = 0; i < lengthLoop; i++) {
        // Verificar timeout por nó
        const nodeStartTime = Date.now();
        if (Date.now() - nodeStartTime > TIMEOUT_PER_NODE) {
            logger.warn('Timeout no nó Facebook', { idFlowDb, idTicket, nodeIndex: i, executionTime: Date.now() - nodeStartTime });
            break;
        }

        let nodeSelected: any;
        let ticketInit: Ticket;
        if (idTicket) {
            ticketInit = await Ticket.findOne({
                where: { id: idTicket }
            });

            if (!ticketInit) {
                logger.warn('Ticket não encontrado Facebook', { idTicket });
                break;
            }

            if (ticketInit.status === "closed") {
                logger.debug('Ticket fechado, interrompendo fluxo Facebook', { idTicket });
                break;
            } else {
                await ticketInit.update({
                    dataWebhook: {
                        status: "process",
                    },
                })
            }
        }
        if (pressKey) {
            if (pressKey === "parar") {
                if (idTicket) {
                    const ticket = await Ticket.findOne({
                        where: { id: idTicket }
                    });
                    if (ticket) {
                        await ticket.update({
                            status: "closed"
                        });
                    }
                }
                logger.debug('Fluxo Facebook interrompido por comando "parar"', { idFlowDb, idTicket });
                break;
            }

            if (execFn === "") {
                nodeSelected = {
                    type: "menu"
                };
            } else {
                nodeSelected = nodesMap.get(execFn);
                if (!nodeSelected) {
                    logger.warn('Nó não encontrado Facebook', { nodeId: execFn, idFlowDb });
                    break;
                }
            }
        } else {
            const otherNode = nodesMap.get(next);
            if (otherNode) {
                nodeSelected = otherNode;
            } else {
                logger.warn('Próximo nó não encontrado Facebook', { nodeId: next, idFlowDb });
                break;
            }
        }

        if (!nodeSelected) {
            logger.warn('Nó selecionado é nulo Facebook', { next, execFn, idFlowDb });
            break;
        }

        // Implementação do nó CONDITION
        if (nodeSelected.type === "condition") {
            try {
                const fieldKey = nodeSelected.data?.key;
                const condition = nodeSelected.data?.condition;
                const compareValue = nodeSelected.data?.value;

                if (!fieldKey || !condition || compareValue === undefined) {
                    logger.error('Condição inválida Facebook: campos obrigatórios faltando', {
                        nodeId: nodeSelected.id,
                        fieldKey,
                        condition,
                        compareValue
                    });
                    break;
                }

                const fieldValue = getFieldValue(fieldKey, dataWebhook, ticket);
                const conditionMet = evaluateCondition(fieldValue, condition, compareValue);

                logger.debug('Condição avaliada Facebook', {
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
                    logger.debug('Condição verdadeira Facebook, seguindo para nó', { next });
                } else if (!conditionMet && falseConnection) {
                    next = falseConnection.target;
                    noAlterNext = true;
                    logger.debug('Condição falsa Facebook, seguindo para nó', { next });
                } else {
                    logger.warn('Conexões de condição não encontradas Facebook', {
                        nodeId: nodeSelected.id,
                        hasTrueConnection: !!trueConnection,
                        hasFalseConnection: !!falseConnection
                    });
                    break;
                }
            } catch (error) {
                logger.error('Erro ao processar nó condition Facebook', {
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
            logger.debug('Intervalo executado Facebook', { nodeId: nodeSelected.id, seconds });
        }

        if (nodeSelected.type === "ticket") {
            const queueId = nodeSelected.data?.data?.id || nodeSelected.data?.id;
            const queue = await ShowQueueService(queueId, companyId);

            selectedQueueid = queue.id;
            logger.debug('Ticket node processado Facebook', { queueId: queue.id, nodeId: nodeSelected.id });
        }

        if (nodeSelected.type === "singleBlock") {

            for (var iLoc = 0; iLoc < nodeSelected.data.seq.length; iLoc++) {
                const elementNowSelected = nodeSelected.data.seq[iLoc];
                logger.debug('Processando elemento singleBlock Facebook', { elementNowSelected, nodeId: nodeSelected.id });

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


                    const contact = await Contact.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });

                    const bodyBot: string = formatBody(
                        `${bodyFor}`,
                        ticket
                    );

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_on"
                    );

                    await intervalWhats("5");

                    const sentMessage = await sendText(
                        contact.number,
                        bodyBot,
                        getSession.facebookUserToken);

                    await ticketDetails.update({
                        lastMessage: formatBody(bodyFor, ticket.contact)
                    });

                    await updateQueueId(ticket, companyId, selectedQueueid)

                    await intervalWhats("1");

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_off"
                    );

                }


                if (elementNowSelected.includes("interval")) {
                    await intervalWhats(
                        nodeSelected.data.elements.filter(
                            item => item.number === elementNowSelected
                        )[0].value
                    );
                }


                if (elementNowSelected.includes("img")) {
                    const { getPublicPathFromRoot } = require("../../../../utils/pathHelper");
                    const mediaRelativePath = nodeSelected.data.elements.filter(
                        item => item.number === elementNowSelected
                    )[0].value;
                    const mediaPath = getPublicPathFromRoot(mediaRelativePath);

                    const contact = await Contact.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });


                    // Obtendo o tipo do arquivo
                    const fileExtension = path.extname(mediaPath);

                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path.basename(mediaPath, fileExtension);

                    //Obtendo o tipo do arquivo
                    const mimeType = mime.lookup(mediaPath);

                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`


                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_on"
                    );

                    await intervalWhats("5");

                    const sendMessage = await sendAttachmentFromUrl(
                        contact.number,
                        domain,
                        "image",
                        getSession.facebookUserToken
                    );

                    const ticketDetails = await ShowTicketService(ticket.id, companyId);

                    await ticketDetails.update({
                        lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_off"
                    );

                }


                if (elementNowSelected.includes("audio")) {
                    const { getPublicPathFromRoot } = require("../../../../utils/pathHelper");
                    const mediaRelativePath = nodeSelected.data.elements.filter(
                        item => item.number === elementNowSelected
                    )[0].value;
                    const mediaDirectory = getPublicPathFromRoot(mediaRelativePath);

                    const contact = await Contact.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });

                    // Obtendo o tipo do arquivo
                    const fileExtension = path.extname(mediaDirectory);

                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path.basename(mediaDirectory, fileExtension);

                    //Obtendo o tipo do arquivo
                    const mimeType = mime.lookup(mediaDirectory);

                    const fileNotExists = path.resolve(__dirname, "..", "..", "..", "..", "public", fileNameWithoutExtension + ".mp4");

                    if (fileNotExists) {
                        const folder = path.resolve(__dirname, "..", "..", "..", "..", "public", fileNameWithoutExtension + fileExtension);
                        await convertAudio(folder)
                    }

                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}.mp4`


                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_on"
                    );

                    await intervalWhats("5");

                    const sendMessage = await sendAttachmentFromUrl(
                        contact.number,
                        domain,
                        "audio",
                        getSession.facebookUserToken
                    );


                    const ticketDetails = await ShowTicketService(ticket.id, companyId);

                    await ticketDetails.update({
                        lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_off"
                    );

                }


                if (elementNowSelected.includes("video")) {
                    const { getPublicPathFromRoot } = require("../../../../utils/pathHelper");
                    const mediaRelativePath = nodeSelected.data.elements.filter(
                        item => item.number === elementNowSelected
                    )[0].value;
                    const mediaDirectory = getPublicPathFromRoot(mediaRelativePath);


                    const contact = await Contact.findOne({
                        where: { number: numberPhrase.number, companyId }
                    });

                    // Obtendo o tipo do arquivo
                    const fileExtension = path.extname(mediaDirectory);

                    //Obtendo o nome do arquivo sem a extensão
                    const fileNameWithoutExtension = path.basename(mediaDirectory, fileExtension);

                    //Obtendo o tipo do arquivo
                    const mimeType = mime.lookup(mediaDirectory);

                    const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`


                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_on"
                    );

                    const sendMessage = await sendAttachmentFromUrl(
                        contact.number,
                        domain,
                        "video",
                        getSession.facebookUserToken
                    );

                    const ticketDetails = await ShowTicketService(ticket.id, companyId);

                    await ticketDetails.update({
                        lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
                    });

                    await showTypingIndicator(
                        contact.number,
                        getSession.facebookUserToken,
                        "typing_off"
                    );
                }

            }
        }

        if (nodeSelected.type === "img") {
            const { getPublicPathFromRoot } = require("../../../../utils/pathHelper");
            const mediaPath = getPublicPathFromRoot(nodeSelected.data.url);


            // Obtendo o tipo do arquivo
            const fileExtension = path.extname(mediaPath);

            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path.basename(mediaPath, fileExtension);

            //Obtendo o tipo do arquivo
            const mimeType = mime.lookup(mediaPath);

            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`

            const contact = await Contact.findOne({
                where: { number: numberPhrase.number, companyId }
            });

            await showTypingIndicator(
                contact.number,
                getSession.facebookUserToken,
                "typing_on"
            );

            await intervalWhats("5");

            const sendMessage = await sendAttachmentFromUrl(
                contact.number,
                domain,
                "image",
                getSession.facebookUserToken
            );

            const ticketDetails = await ShowTicketService(ticket.id, companyId);

            await ticketDetails.update({
                lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
            });

            await showTypingIndicator(
                contact.number,
                getSession.facebookUserToken,
                "typing_off"
            );
        }

        if (nodeSelected.type === "audio") {
            const { getPublicPathFromRoot } = require("../../../../utils/pathHelper");
            const mediaDirectory = getPublicPathFromRoot(nodeSelected.data.url);

            const contact = await Contact.findOne({
                where: { number: numberPhrase.number, companyId }
            });

            // Obtendo o tipo do arquivo
            const fileExtension = path.extname(mediaDirectory);

            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path.basename(mediaDirectory, fileExtension);

            //Obtendo o tipo do arquivo
            const mimeType = mime.lookup(mediaDirectory);

            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`


            const sendMessage = await sendAttachmentFromUrl(
                contact.number,
                domain,
                "audio",
                getSession.facebookUserToken
            );

            const ticketDetails = await ShowTicketService(ticket.id, companyId);

            await ticketDetails.update({
                lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact)
            });

            await intervalWhats("1");
        }
        if (nodeSelected.type === "interval") {
            await intervalWhats(nodeSelected.data.sec);
        }
            if (nodeSelected.type === "video") {
                const { getPublicPathFromRoot } = require("../../../../utils/pathHelper");
                const mediaDirectory = getPublicPathFromRoot(nodeSelected.data.url);


            const contact = await Contact.findOne({
                where: { number: numberPhrase.number, companyId }
            });

            // Obtendo o tipo do arquivo
            const fileExtension = path.extname(mediaDirectory);

            //Obtendo o nome do arquivo sem a extensão
            const fileNameWithoutExtension = path.basename(mediaDirectory, fileExtension);

            //Obtendo o tipo do arquivo
            const mimeType = mime.lookup(mediaDirectory);

            const domain = `${process.env.BACKEND_URL}/public/${fileNameWithoutExtension}${fileExtension}`


            await showTypingIndicator(
                contact.number,
                getSession.facebookUserToken,
                "typing_on"
            );

            const sendMessage = await sendAttachmentFromUrl(
                contact.number,
                domain,
                "video",
                getSession.facebookUserToken
            );

            const ticketDetails = await ShowTicketService(ticket.id, companyId);

            await ticketDetails.update({
                lastMessage: formatBody(`${fileNameWithoutExtension}${fileExtension}`, ticket.contact),
            });

            await showTypingIndicator(
                contact.number,
                getSession.facebookUserToken,
                "typing_off"
            );
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
                    logger.warn('Conexão "a" não encontrada no randomizador Facebook', { nodeId: nodeSelected.id });
                    break;
                }
            } else {
                const connB = resultConnect.find(item => item.sourceHandle === "b");
                if (connB) {
                    next = connB.target;
                    noAlterNext = true;
                } else {
                    logger.warn('Conexão "b" não encontrada no randomizador Facebook', { nodeId: nodeSelected.id });
                    break;
                }
            }
            isRandomizer = true;
        }
        let isMenu: boolean;

        if (nodeSelected.type === "menu") {
            if (pressKey) {
                const nextConnections = connectionsBySource.get(next) || [];
                const filterTwo = nextConnections.filter(filt2 => filt2.sourceHandle === "a" + pressKey);
                
                if (filterTwo.length > 0) {
                    execFn = filterTwo[0].target;
                } else {
                    execFn = undefined;
                }

                if (execFn === undefined) {
                    logger.warn('Opção de menu não encontrada Facebook', { pressKey, next, idFlowDb });
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


                const ticketDetails = await ShowTicketService(ticket.id, companyId);


                //await CreateMessageService({ messageData: messageData, companyId });

                //await SendWhatsAppMessage({ body: bodyFor, ticket: ticketDetails, quotedMsg: null })

                // await SendMessage(whatsapp, {
                //   number: numberClient,
                //   body: msg.body
                // });


                await ticketDetails.update({
                    lastMessage: formatBody(menuCreate, ticket.contact)
                });

                const contact = await Contact.findOne({
                    where: { number: numberPhrase.number, companyId }
                });


                await showTypingIndicator(
                    contact.number,
                    getSession.facebookUserToken,
                    "typing_on"
                );

                await intervalWhats("5");

                await sendText(
                    numberPhrase.number,
                    menuCreate,
                    getSession.facebookUserToken
                );


                await showTypingIndicator(
                    contact.number,
                    getSession.facebookUserToken,
                    "typing_off"
                );

                ticket = await Ticket.findOne({
                    where: { id: idTicket, companyId: companyId }
                });


                await ticket.update({
                    status: "pending",
                    queueId: ticket.queueId ? ticket.queueId : null,
                    userId: null,
                    companyId: companyId,
                    flowWebhook: true,
                    lastFlowId: nodeSelected.id,
                    dataWebhook: dataWebhook,
                    hashFlowId: hashWebhookId,
                    flowStopped: idFlowDb.toString()
                });

                break;
            }
        }

        let isContinue = false;

        if (pressKey === "999" && execCount > 0) {
            pressKey = undefined;
            const execConnections = connectionsBySource.get(execFn) || [];
            const result = execConnections[0];
            if (!result) {
                logger.debug('Nenhuma conexão encontrada após execFn Facebook', { execFn });
                next = "";
            } else {
                if (!noAlterNext) {
                    if (ticket) {
                        await ticket.reload();
                    }
                    next = result.target;
                }
            }
        } else {
            let result;

            if (isMenu) {
                result = { target: execFn };
                isContinue = true;
                pressKey = undefined;
            } else if (isRandomizer) {
                isRandomizer = false;
                result = next;
            } else {
                const nextConnections = connectionsBySource.get(next) || [];
                result = nextConnections[0];
            }

            if (!result) {
                logger.debug('Nenhuma conexão encontrada Facebook', { next, isMenu, isRandomizer });
                next = "";
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
                logger.debug('Fim do fluxo Facebook: nenhuma conexão encontrada', {
                    nodeId: nodeSelected.id,
                    nodeType: nodeSelected.type
                });

                const ticket = await Ticket.findOne({
                    where: { id: idTicket, companyId: companyId }
                });

                await ticket.update({
                    lastFlowId: null,
                    dataWebhook: {
                        status: "process",
                    },
                    queueId: ticket.queueId ? ticket.queueId : null,
                    hashFlowId: null,
                    flowWebhook: false,
                    flowStopped: idFlowDb.toString()
                });

                await ticket.reload();

                break;
            }
        }

        isContinue = false;

        if (next === "") {
            break;
        }


        ticket = await Ticket.findOne({
            where: { id: idTicket, companyId: companyId }
        });

        await ticket.update({
            queueId: null,
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
    logger.info('Fluxo Facebook executado com sucesso', {
        idFlowDb,
        idTicket,
        nodesExecuted: execCount,
        executionTime,
        finalNode: next
    });

    return "ok";
    } catch (error) {
        const executionTime = Date.now() - startTime;
        logger.error('Erro ao executar fluxo Facebook', {
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
                logger.error('Erro ao atualizar ticket após erro no fluxo Facebook', {
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
}

async function updateQueueId(ticket: Ticket, companyId: number, queueId: number) {
    await ticket.update({
        status: 'pending',
        queueId: queueId,
        userId: ticket.userId,
        companyId: companyId,
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
            queueId: queueId 
        },
        ticketId: ticket.id,
        companyId
    })


    await CreateLogTicketService({
        ticketId: ticket.id,
        type: "queue",
        queueId: queueId
    });

}

function convertAudio(inputFile: string): Promise<string> {
    let outputFile: string;


    if (inputFile.endsWith(".mp3")) {
        outputFile = inputFile.replace(".mp3", ".mp4");
    }

    logger.debug('Convertendo áudio para MP4', { inputFile, outputFile });

    return new Promise((resolve, reject) => {
        ffmpeg(inputFile)
            .toFormat('mp4')
            .save(outputFile)
            .on('end', () => {
                logger.debug('Conversão de áudio concluída', { outputFile });
                resolve(outputFile);
            })
            .on('error', (err) => {
                logger.error('Erro durante conversão de áudio', {
                    inputFile,
                    outputFile,
                    error: err instanceof Error ? err.message : String(err)
                });
                reject(err);
            });
    });

}
