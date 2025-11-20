import * as TransactionController from "../controllers/transaction.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const TransactionRouter = express.Router();

TransactionRouter.get(
  "/",
  authenticateUserByAccessToken,
  TransactionController.allTransactions
);

TransactionRouter.post(
  "/",
  authenticateUserByAccessToken,
  TransactionController.createTransaction
);

TransactionRouter.get(
  "/:id/check",
  authenticateUserByAccessToken,
  TransactionController.checkTransactionState
);

TransactionRouter.get(
  "/:id/check-payment",
  authenticateUserByAccessToken,
  TransactionController.checkPaymentState
);

TransactionRouter.get(
  "/:id/check-transfer",
  authenticateUserByAccessToken,
  TransactionController.checkWithdrawState
);

export default TransactionRouter;
