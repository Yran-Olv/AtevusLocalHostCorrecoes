import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as LoginConfigController from "../controllers/LoginConfigController";

const loginConfigRoutes = express.Router();

loginConfigRoutes.get(
  "/login-config",
  LoginConfigController.index
);

loginConfigRoutes.get(
  "/login-config/themes",
  isAuth,
  isSuper,
  LoginConfigController.getThemes
);

loginConfigRoutes.put(
  "/login-config",
  isAuth,
  isSuper,
  LoginConfigController.update
);

export default loginConfigRoutes;

