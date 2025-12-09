import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as WhitelabelConfigController from "../controllers/WhitelabelConfigController";

const whitelabelConfigRoutes = Router();

whitelabelConfigRoutes.get(
  "/whitelabel-config",
  isAuth,
  isSuper,
  WhitelabelConfigController.index
);

whitelabelConfigRoutes.put(
  "/whitelabel-config",
  isAuth,
  isSuper,
  WhitelabelConfigController.update
);

whitelabelConfigRoutes.post(
  "/whitelabel-config/reset",
  isAuth,
  isSuper,
  WhitelabelConfigController.reset
);

export default whitelabelConfigRoutes;

