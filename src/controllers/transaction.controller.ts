import { Request, Response } from "express";
import { User } from "@supabase/supabase-js";
import { TransactionModel } from "../models/transactions.model";
import { WalletModel } from "../models/wallet.model";
import { UserWalletTransaction, UserWalletType } from "../types/wallet.type";
import { TransferResponse, PaymentResponse } from "notchpay-api";

// fonction qui est appelé afin de recuperer toutes les transactions des utilisateurs...
export const allTransactions = async (req: Request, res: Response) => {
  const transactions = new TransactionModel();
  let isError = false;
  let errorMessage = "";

  const data = await transactions.getAll((error) => {
    isError = true;
    console.log("transaction-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Transaction Checked...",
        data,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Transaction To Check Found...",
        data: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé afin de creer une transaction...
export const createTransaction = async (req: Request, res: Response) => {}

// fonction qui est appelé pour verifier si la transaction a été effectué et permet de la conclure si oui...
export const checkTransactionState = async (req: Request, res: Response) => {
  const wallet = new WalletModel();
  const transactions = new TransactionModel();
  // utils datas...
  let transaction_to_check: UserWalletTransaction | null = null;
  let wallet_data: UserWalletType | null = null;
  const transaction_id = req.params.id ?? ""; // Ce type...
  const user = (req as any).user as User;
  let isError = false;
  let errorMessage = "";

  console.log("transaction-id-to-check =>", transaction_id);

  if (transaction_id && transaction_id != "") {
    // recupere la transacion à mettre à jour et le wallet...
    transaction_to_check = await transactions.getByTransactionID(
      transaction_id,
      (error) => {
        isError = true;
        console.log(
          "transaction-getting-error =>",
          error?.message,
          " on email :",
          user.email
        );
        errorMessage = error?.message ?? "";
      }
    );

    // Ce recupere le porte feuille de l'utilisateur concerné...
    wallet_data = await wallet.getByUid(user.id ?? "", (error) => {
      isError = true;
      console.log(
        "wallet-getting-error =>",
        error?.message,
        " on email :",
        user.email
      );
      errorMessage = error?.message ?? "";
    });
  }

  if (!isError && transaction_id && transaction_to_check && wallet_data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Transaction Checked...",
        wallet: wallet_data,
        transaction: transaction_to_check,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Transaction To Check Found...",
        data: errorMessage,
      });
    }, 1000);
  }
};

// fonction asynchrone qui va s'appeler  pour controller les transactions en cours...
export const checkPaymentState = async (req: Request, res: Response) => {
  const transactions = new TransactionModel();
  const wallets = new WalletModel();
  let isError = false;
  let errorMessage = "";
  let transactionState: PaymentResponse | null = null;

  const data = await transactions.getByTransactionID(
    req.params.id ?? "",
    (error) => {
      isError = true;
      console.log("transactions-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    }
  );

  if (!isError && data) {
    transactionState = await transactions.checkPayment(
      data?.transaction_id ?? "",
      (error) => {
        isError = true;
        errorMessage = error.message ?? "";
      }
    );
  }

  if (!isError && data && transactionState) {
    if (transactionState.transaction.status == "pending") {
      // continue
    } else if (transactionState.transaction.status == "processing") {
      // continue
    } else if (transactionState.transaction.status == "complete") {
      // Recuperer d'abord son portefeuille..
      const wallet = (await wallets.getByUid(data.creator_id, (error) => {
        isError = true;
        console.log("wallet-getting-error =>", error?.message);
        errorMessage = error?.message ?? "";
      })) as UserWalletType;

      // met à jour la transaction...
      await transactions.update({ ...data, status: "done" }, (error) => {
        isError = true;
        console.log("transactions-update-error =>", error?.message);
        errorMessage = error?.message ?? "";
      });

      //met à jour donc le portefeuille avec son argent
      await wallets.update(
        {
          ...wallet,
          funds: wallet.funds + transactionState.transaction.amount,
        },
        (error) => {
          isError = true;
          console.log("wallet-update-error =>", error?.message);
          errorMessage = error?.message ?? "";
        }
      );
    } else {
      await transactions.update({ ...data, status: "failed" }, (error) => {
        isError = true;
        console.log("transactions-update-error =>", error?.message);
        errorMessage = error?.message ?? "";
      });
    }
  } else {
  }

  if (!isError && data && transactionState) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Transaction Checked...",
        data: transactionState,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Transaction To Check Found Test...",
        data: errorMessage,
      });
    }, 1000);
  }
};

// fonction asynchrone pour controller les transactions en cours...
export const checkWithdrawState = async (req: Request, res: Response) => {
  const transactions = new TransactionModel();
  const wallets = new WalletModel();
  let isError = false;
  let errorMessage = "";
  let transactionState: TransferResponse | null = null;

  const data = await transactions.getByTransactionID(
    req.params.id ?? "",
    (error) => {
      isError = true;
      console.log("transactions-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    }
  );

  console.log("data =>", data);

  if (!isError && data) {
    transactionState = await transactions.checkTransfer(
      data.transaction_id ?? "",
      (error) => {
        isError = true;
        errorMessage = error.message ?? "";
      }
    );
  }

  if (!isError && data && transactionState) {
    if (transactionState.transfer.status == "pending") {
      // continue;
    } else if (transactionState.transfer.status == "processing") {
      // continue;
    } else if (transactionState.transfer.status == "failed") {
      //---------------------------------------- à remplacer plus tard par complete
      // met à jour la transaction...
      await transactions.update({ ...data, status: "done" }, (error) => {
        isError = true;
        console.log("transactions-update-error =>", error?.message);
        errorMessage = error?.message ?? "";
      });
    } else {
      // Recuperer d'abord son portefeuille..
      const wallet = (await wallets.getByUid(data.creator_id, (error) => {
        isError = true;
        console.log("wallet-getting-error =>", error?.message);
        errorMessage = error?.message ?? "";
      })) as UserWalletType;

      await transactions.update({ ...data, status: "failed" }, (error) => {
        isError = true;
        console.log("transactions-update-error =>", error?.message);
        errorMessage = error?.message ?? "";
      });

      //met à jour donc le portefeuille avec son argent
      await wallets.update(
        {
          ...wallet,
          funds: wallet.funds + transactionState.transfer.amount,
        },
        (error) => {
          isError = true;
          console.log("wallet-update-error =>", error?.message);
          errorMessage = error?.message ?? "";
        }
      );
    }
  } else {
  }

  if (!isError && data && transactionState) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Transfers Checked...",
        data: transactionState,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Transfers To Check Found Test...",
        data: errorMessage,
      });
    }, 1000);
  }
};
