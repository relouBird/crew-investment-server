import * as WalletController from "../controllers/wallet.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const WalletRouter = express.Router();

WalletRouter.get(
  "/",
  authenticateUserByAccessToken,
  WalletController.getAccountDetails
);

WalletRouter.get(
  "/all",
  authenticateUserByAccessToken,
  WalletController.allWallets
);

WalletRouter.post(
  "/refill-account",
  authenticateUserByAccessToken,
  WalletController.refillAccount
);

WalletRouter.post(
  "/withdraw-account",
  authenticateUserByAccessToken,
  WalletController.withdrawalAccount
);

export default WalletRouter;
