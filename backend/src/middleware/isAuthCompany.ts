import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";

/**
 * Middleware de autenticação para rotas da empresa usando token de ambiente
 * Verifica se o token fornecido corresponde ao token configurado em COMPANY_TOKEN
 * 
 * @throws {AppError} ERR_SESSION_EXPIRED (401) se não houver token ou se o token não corresponder
 * @throws {AppError} Invalid token (403) se houver erro ao validar o token
 */
const isAuthCompany = async (
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
    // Obter token da empresa configurado nas variáveis de ambiente
    const getToken = process.env.COMPANY_TOKEN;
    
    // Verificar se o token da empresa está configurado
    if (!getToken) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    // Verificar se o token fornecido corresponde ao token configurado
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

export default isAuthCompany;
