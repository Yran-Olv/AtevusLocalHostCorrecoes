import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import * as LoginConfigController from "../controllers/LoginConfigController";

const upload = multer(uploadConfig);
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

loginConfigRoutes.post(
  "/login-config/upload-image",
  isAuth,
  isSuper,
  upload.single("file"),
  LoginConfigController.uploadImage
);

export default loginConfigRoutes;

