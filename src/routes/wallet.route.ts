import * as WalletController from "../controllers/wallet.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const WalletRouter = express.Router();

WalletRouter.post(
  "/",
  authenticateUserByAccessToken,
  WalletController.getAccountDetails
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

WalletRouter.get(
  "/check-transaction/:id",
  authenticateUserByAccessToken,
  WalletController.checkTransactionState
);

export default WalletRouter;
