import { Router } from "express";
import * as SessionController from "../controllers/SessionController";
import * as UserController from "../controllers/UserController";
import * as PasswordRecoveryController from "../controllers/PasswordRecoveryController";
import isAuth from "../middleware/isAuth";
import envTokenAuth from "../middleware/envTokenAuth";

const authRoutes = Router();

authRoutes.post("/signup", UserController.store);
authRoutes.post("/login", SessionController.store);
authRoutes.post("/refresh_token", SessionController.update);
authRoutes.post("/disconnect-other-sessions", isAuth, SessionController.disconnectOtherSessions);
authRoutes.delete("/logout", isAuth, SessionController.remove);
authRoutes.get("/me", isAuth, SessionController.me);
authRoutes.post("/password-recovery", PasswordRecoveryController.requestRecovery);
authRoutes.post("/reset-password", PasswordRecoveryController.resetPassword);

export default authRoutes;
