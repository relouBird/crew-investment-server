import * as UserController from "../controllers/user.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const UserRouter = express.Router();

UserRouter.get("/", authenticateUserByAccessToken, UserController.getUser);

UserRouter.post(
  "/update-infos",
  authenticateUserByAccessToken,
  UserController.updateUserInfos
);

UserRouter.post(
  "/change-password",
  authenticateUserByAccessToken,
  UserController.changeUserPassword
);

UserRouter.delete(
  "/delete-account",
  authenticateUserByAccessToken,
  UserController.deleteAccount
);

export default UserRouter;
