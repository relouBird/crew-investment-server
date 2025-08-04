import * as WalletController from "../controllers/wallet.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const WalletRouter = express.Router();

WalletRouter.get(
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

WalletRouter.get(
  "/all/wallets",
  authenticateUserByAccessToken,
  WalletController.allWallets
);

WalletRouter.get(
  "/all/transactions",
  authenticateUserByAccessToken,
  WalletController.allTransactions
);

export default WalletRouter;
