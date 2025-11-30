import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";

import { getIO } from "../libs/socket";
import ShowUserService from "../services/UserServices/ShowUserService";
import { updateUser } from "../helpers/updateUser";

/**
 * Interface para o payload do token JWT
 */
interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

/**
 * Middleware de autenticação para rotas protegidas
 * Verifica se o token JWT é válido e extrai informações do usuário
 * 
 * @throws {AppError} ERR_SESSION_EXPIRED (401) se não houver token ou se o token for inválido/expirado
 * @throws {AppError} Invalid token (403) se o token estiver malformado
 */
const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  // Verificar se o header de autorização existe
  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  // Extrair token do header (formato: "Bearer <token>")
  const [, token] = authHeader.split(" ");

  try {
    // Verificar e decodificar o token JWT
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId } = decoded as TokenPayload;

    // Atualizar último acesso do usuário
    updateUser(id, companyId);

    // Adicionar informações do usuário ao request para uso nas rotas
    req.user = {
      id,
      profile,
      companyId
    };
  } catch (err: any) {
    // Se o erro já for ERR_SESSION_EXPIRED, re-lançar
    if (err.message === "ERR_SESSION_EXPIRED" && err.statusCode === 401) {
      throw new AppError(err.message, 401);
    } else {
      // Token inválido ou malformado
      throw new AppError(
        "Token inválido. Tentaremos atribuir um novo na próxima solicitação",
        403
      );
    }
  }

  return next();
};

export default isAuth;