import { verify } from "jsonwebtoken";
import { Response as Res } from "express";

import User from "../../models/User";
import AppError from "../../errors/AppError";
import ShowUserService from "../UserServices/ShowUserService";
import authConfig from "../../config/auth";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";

interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
  companyId: number;
}

interface Response {
  user: User;
  newToken: string;
  refreshToken: string;
}

export const RefreshTokenService = async (
  res: Res,
  token: string,
  allowMultipleSessions: boolean = false
): Promise<Response> => {
  try {
    const decoded = verify(token, authConfig.refreshSecret);
    const { id, tokenVersion, companyId } = decoded as RefreshTokenPayload;

    const user = await ShowUserService(id, companyId);

    // Se tokenVersion não corresponde e não permite múltiplas sessões, lança erro
    if (user.tokenVersion !== tokenVersion) {
      if (allowMultipleSessions) {
        // Permite múltiplas sessões: atualiza o tokenVersion do token para corresponder ao atual do usuário
        // Isso permite que esta sessão continue funcionando
        const newToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);
        return { user, newToken, refreshToken };
      } else {
        // Retorna erro especial para indicar conflito de sessão
        res.clearCookie("jrt");
        throw new AppError("ERR_SESSION_CONFLICT", 409);
      }
    }

    const newToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    return { user, newToken, refreshToken };
  } catch (err: any) {
    // Se for erro de conflito de sessão, propaga
    if (err.message === "ERR_SESSION_CONFLICT") {
      throw err;
    }
    res.clearCookie("jrt");
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }
};
