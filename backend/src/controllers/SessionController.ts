import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

import AuthUserService from "../services/UserServices/AuthUserService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import FindUserFromToken from "../services/AuthServices/FindUserFromToken";
import { createAccessToken, createRefreshToken } from "../helpers/CreateTokens";
import User from "../models/User";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, disconnectOtherSessions } = req.body;

  // Por padrão, não desconecta outras sessões (permite múltiplas sessões)
  // Só desconecta se explicitamente solicitado
  const { token, serializedUser, refreshToken } = await AuthUserService({
    email,
    password,
    disconnectOtherSessions: disconnectOtherSessions === true // Só desconecta se explicitamente true
  });
 
  SendRefreshToken(res, refreshToken);

  const io = getIO();

  io.of(serializedUser.companyId.toString())
  .emit(`company-${serializedUser.companyId}-auth`, {
    action: "update",
    user: {
      id: serializedUser.id,
      email: serializedUser.email,
      companyId: serializedUser.companyId,
      token: serializedUser.token
    }
  });
  

  return res.status(200).json({
    token,
    user: serializedUser
  });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const { allowMultipleSessions } = req.body; // Parâmetro opcional do frontend

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  try {
    const { user, newToken, refreshToken } = await RefreshTokenService(
      res,
      token,
      allowMultipleSessions === true
    );

    SendRefreshToken(res, refreshToken);

    return res.json({ token: newToken, user });
  } catch (err: any) {
    // Se for conflito de sessão, retorna código especial
    if (err.message === "ERR_SESSION_CONFLICT") {
      return res.status(409).json({
        error: "ERR_SESSION_CONFLICT",
        message: "Outra sessão está ativa. Deseja desconectar a outra sessão ou manter ambas?"
      });
    }
    throw err;
  }
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const user = await FindUserFromToken(token);
  const { id, profile, super: superAdmin } = user;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  return res.json({ id, profile, super: superAdmin });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.user;
  if (id) {
    const user = await User.findByPk(id);
    await user.update({ online: false });
  }
  res.clearCookie("jrt");

  return res.send();
};

// Nova rota para desconectar outras sessões
export const disconnectOtherSessions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.user;
  
  if (!id) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError("ERR_USER_NOT_FOUND", 404);
  }

  // Incrementa tokenVersion para invalidar outras sessões
  await user.update({ tokenVersion: (user.tokenVersion || 0) + 1 });
  await user.reload();

  // Gera novos tokens
  const newToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  SendRefreshToken(res, refreshToken);

  return res.status(200).json({
    token: newToken,
    message: "Outras sessões foram desconectadas"
  });
};
