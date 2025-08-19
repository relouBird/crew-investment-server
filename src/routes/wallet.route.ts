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
  "/check-transaction/:id/payment",
  authenticateUserByAccessToken,
  WalletController.checkPaymentState
);

WalletRouter.get(
  "/check-transaction/:id/transfer",
  authenticateUserByAccessToken,
  WalletController.checkWithdrawState
);

WalletRouter.get(
  "/all/wallets",
  WalletController.allWallets
);

WalletRouter.get(
  "/all/transactions",
  WalletController.allTransactions
);


export default WalletRouter;
