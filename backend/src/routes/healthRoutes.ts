import { Router, Request, Response } from "express";
import { Sequelize } from "sequelize";
import logger from "../utils/logger";

const healthRoutes = Router();

// Health check simples
healthRoutes.get("/health", async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    logger.error("Health check error:", error);
    return res.status(500).json({
      status: "error",
      message: "Health check failed"
    });
  }
});

// Health check completo (com verificação de banco de dados)
healthRoutes.get("/health/ready", async (req: Request, res: Response) => {
  try {
    const db = require("../database").default as Sequelize;
    
    // Verificar conexão com banco de dados
    await db.authenticate();
    
    // Verificar Redis (se configurado)
    const redisStatus = process.env.REDIS_URI_ACK ? "configured" : "not_configured";
    
    return res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: "connected",
        redis: redisStatus
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB"
      }
    });
  } catch (error: any) {
    logger.error("Readiness check error:", error);
    return res.status(503).json({
      status: "not_ready",
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === "production" 
        ? "Service unavailable" 
        : error.message
    });
  }
});

// Health check para liveness (Kubernetes/Docker)
healthRoutes.get("/health/live", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString()
  });
});

export default healthRoutes;

