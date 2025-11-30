import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";

/**
 * Middleware de autenticação para APIs externas usando token do WhatsApp
 * Verifica se o token fornecido corresponde a um WhatsApp cadastrado
 * 
 * @throws {AppError} ERR_SESSION_EXPIRED (401) se não houver token ou se o token não for encontrado
 * @throws {AppError} Invalid token (403) se houver erro ao validar o token
 */
const isAuthApi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  // Verificar se o header de autorização existe
  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  // Extrair token do header (formato: "Bearer <token>")
  const [, token] = authHeader.split(" ");
  
  try {
    // Buscar WhatsApp pelo token no banco de dados
    const whatsapp = await Whatsapp.findOne({ where: { token } });

    const getToken = whatsapp?.token;
    
    // Verificar se o WhatsApp foi encontrado
    if (!getToken) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // Verificar se o token corresponde exatamente
    if (getToken !== token) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
  } catch (err) {
    // Se o erro já for AppError, re-lançar
    if (err instanceof AppError) {
      throw err;
    }
    // Erro inesperado ao validar token
    throw new AppError(
      "Token inválido. Tentaremos atribuir um novo na próxima solicitação",
      403
    );
  }

  return next();
};

export default isAuthApi;
