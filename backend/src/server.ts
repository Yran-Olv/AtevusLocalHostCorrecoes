import 'dotenv/config';
import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import cron from "node-cron";
import { initIO } from "./libs/socket";
import logger from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import BullQueue from './libs/queue';

import { startQueueProcess } from "./queues";

// Configurar timeout para requisições (30 segundos)
const REQUEST_TIMEOUT = 30000;
// import { ScheduledMessagesJob, ScheduleMessagesGenerateJob, ScheduleMessagesEnvioJob, ScheduleMessagesEnvioForaHorarioJob } from "./wbotScheduledMessages";

const server = app.listen(process.env.PORT || 8080, async () => {
  try {
    const companies = await Company.findAll({
      where: { status: true },
      attributes: ["id"]
    });

    const allPromises: any[] = [];
    companies.map(async c => {
      const promise = StartAllWhatsAppsSessions(c.id);
      allPromises.push(promise);
    });

    Promise.all(allPromises).then(async () => {
      await startQueueProcess();
    }).catch(error => {
      logger.error("Erro ao iniciar sessões WhatsApp:", error);
    });

    if (process.env.REDIS_URI_ACK && process.env.REDIS_URI_ACK !== '') {
      BullQueue.process();
    }

    logger.info(`✅ Server started on port: ${process.env.PORT || 8080}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  } catch (error) {
    logger.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
});

// Configurar timeout do servidor
server.timeout = REQUEST_TIMEOUT;
server.keepAliveTimeout = 65000; // 65 segundos
server.headersTimeout = 66000; // 66 segundos

process.on("uncaughtException", err => {
  logger.error({
    type: "uncaughtException",
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason: any, p: Promise<any>) => {
  logger.error({
    type: "unhandledRejection",
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: p,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

// cron.schedule("* * * * * *", async () => {

//   try {
//     // console.log("Running a job at 5 minutes at America/Sao_Paulo timezone")
//     await ScheduledMessagesJob();
//     await ScheduleMessagesGenerateJob();
//   }
//   catch (error) {
//     logger.error(error);
//   }

// });

// cron.schedule("* * * * * *", async () => {

//   try {
//     // console.log("Running a job at 01:00 at America/Sao_Paulo timezone")
//     console.log("Running a job at 2 minutes at America/Sao_Paulo timezone")
//     await ScheduleMessagesEnvioJob();
//     await ScheduleMessagesEnvioForaHorarioJob()
//   }
//   catch (error) {
//     logger.error(error);
//   }

// });

initIO(server);
gracefulShutdown(server);
