import * as UserController from "../controllers/user.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const AuthRouter = express.Router();

AuthRouter.post("/register", UserController.createUser);

AuthRouter.post("/register/:id", UserController.createParrainedUser);

AuthRouter.post("/login", UserController.loginUser);

AuthRouter.post(
  "/logout",
  authenticateUserByAccessToken,
  UserController.logoutUser
);

AuthRouter.post("/verify-otp", UserController.verifyOTPUser);

AuthRouter.post("/send-otp", UserController.sendOTP);

AuthRouter.post("/resend-otp", UserController.resendOTP);

AuthRouter.post("/reset-password", UserController.resetPassword);

AuthRouter.post("/change-password", UserController.changePassword);

export default AuthRouter;
