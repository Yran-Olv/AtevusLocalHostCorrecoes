import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as GerencianetConfigController from "../controllers/GerencianetConfigController";

const gerencianetConfigRoutes = express.Router();

gerencianetConfigRoutes.get(
  "/gerencianet-config",
  isAuth,
  isSuper,
  GerencianetConfigController.index
);

gerencianetConfigRoutes.put(
  "/gerencianet-config",
  isAuth,
  isSuper,
  GerencianetConfigController.update
);

export default gerencianetConfigRoutes;

