import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import * as Sentry from "@sentry/node";
import { config as dotenvConfig } from "dotenv";
import bodyParser from 'body-parser';

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import logger from "./utils/logger";
import { messageQueue, sendScheduledMessages } from "./queues";
import BullQueue from "./libs/queue"
import BullBoard from 'bull-board';
import basicAuth from 'basic-auth';
import { validateEnvironment } from "./config/validateEnv";

// Função de middleware para autenticação básica
export const isBullAuth = (req, res, next) => {
  const user = basicAuth(req);

  if (!user || user.name !== process.env.BULL_USER || user.pass !== process.env.BULL_PASS) {
    res.set('WWW-Authenticate', 'Basic realm="example"');
    return res.status(401).send('Authentication required.');
  }
  next();
};

// Carregar variáveis de ambiente
dotenvConfig();

// Validar variáveis de ambiente obrigatórias
validateEnvironment();

// Inicializar Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({ 
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0
  });
}

const app = express();

// Configuração de filas
app.set("queues", {
  messageQueue,
  sendScheduledMessages
});

// Configurar origens permitidas para CORS
// Incluir tanto a URL do frontend quanto localhost para desenvolvimento
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean); // Remove valores undefined/null

// Configuração do BullBoard
if (String(process.env.BULL_BOARD).toLocaleLowerCase() === 'true' && process.env.REDIS_URI_ACK !== '') {
  BullBoard.setQueues(BullQueue.queues.map(queue => queue && queue.bull));
  app.use('/admin/queues', isBullAuth, BullBoard.UI);
}

// Middlewares de Segurança
// Helmet - Headers de segurança HTTP
if (process.env.NODE_ENV === 'production') {
  // Em produção, usar configuração mais restritiva
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
  }));
} else {
  // Em desenvolvimento, configuração mais permissiva
  app.use(helmet({
    contentSecurityPolicy: false, // Desabilitar CSP em desenvolvimento
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
  }));
}

app.use(compression()); // Compressão HTTP
app.use(bodyParser.json({ limit: '5mb' })); // Aumentar o limite de carga para 5 MB
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// Configurar CORS com opções mais permissivas para desenvolvimento
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      // Permitir requisições sem origem (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);
      
      // Em desenvolvimento, permitir todas as origens
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // Permitir se estiver na lista de origens permitidas
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));

// Rotas
app.use(routes);

// Manipulador de erros do Sentry
app.use(Sentry.Handlers.errorHandler());

// Middleware de tratamento de erros
app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  // Garantir que headers CORS estão presentes mesmo em erros
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ 
      error: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
  }

  // Log completo do erro
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query
  });

  // Em produção, não expor detalhes do erro
  return res.status(500).json({ 
    error: "Internal server error",
    ...(process.env.NODE_ENV !== 'production' && { 
      message: err.message,
      stack: err.stack 
    })
  });
});

export default app;
