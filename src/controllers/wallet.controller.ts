import { Request, Response } from "express";
import { User } from "@supabase/supabase-js";
import { WalletModel } from "../models/wallet.model";
import {
  RefillWalletType,
  UserWalletTransaction,
  UserWalletType,
} from "../types/wallet.type";
import { TransactionModel } from "../models/transactions.model";

// fonction qui est appelé afin de recuperer toutes les informations par rapport au compte d'un utilisateur..
export const getAccountDetails = async (req: Request, res: Response) => {};

// fonction qui est appelé lors de la requete et permettant de creer un nouvel utilisateur
export const refillAccount = async (req: Request, res: Response) => {
  const wallet = new WalletModel();
  const transactions = new TransactionModel();
  // utils datas...
  let transaction_init: UserWalletTransaction | null = null;
  const reqBody = req.body as RefillWalletType; // Ce type...
  const user = (req as any).user as User;
  let isError = false;
  let errorMessage = "";

  console.log(`identification-wallet-transaction =>`, reqBody);

  let data: UserWalletType | null = null;

  if (reqBody) {
    data = await wallet.getByUid(user.id ?? "", (error) => {
      isError = true;
      console.log(
        "wallet-getting-error =>",
        error?.message,
        " on email :",
        user.email
      );
      errorMessage = error?.message ?? "";
    });
    console.log("data-getted =>", data);
  }

  if (!data && reqBody) {
    data = await wallet.create({ uid: user.id }, (error) => {
      isError = true;
      console.log(
        "wallet-create-error =>",
        error?.message,
        " on email :",
        user.email
      );
      errorMessage = error?.message ?? "";
    });
  }

  if (!isError && reqBody) {
    transaction_init = await transactions.create(
      { type: "deposit" },
      (error) => {
        isError = true;
        console.log(
          "transaction-create-error =>",
          error?.message,
          " on email :",
          user.email
        );
        errorMessage = error?.message ?? "";
      }
    );
  }

  if (!isError && reqBody && transaction_init) {
    wallet.refill(
      transaction_init.transaction_id ?? "111-111-111",
      reqBody,
      (error) => {
        isError = true;
        console.log(
          "wallet-refill-error =>",
          error?.message,
          " on email :",
          user.email
        );
        errorMessage = error?.message ?? "";
      }
    );

    // await wallet.sendConfirmationViaMail(
    //   reqBody.amount,
    //   user.email ?? "",
    //   trans?.transaction.pk ?? "",
    //   trans && !trans.transaction.isSuccess()
    // );

    setTimeout(async () => {
      res.status(200).json({
        message: "Transaction Initialized...",
        data: { ...reqBody, transaction_id: transaction_init.transaction_id },
      });
    }, 2000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Transaction To Initialize Found...",
        data: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui permet de verifier un OTP... lors de la creation de compte
export const withdrawalAccount = async (req: Request, res: Response) => {};

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

  if (!isError && transaction_id && transaction_to_check) {
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

// fonction qui permet de renvoyer un autre OTP
export const sendOTP = async (req: Request, res: Response) => {};

// fonction qui permet de connecter un utilisateurs
export const loginUser = async (req: Request, res: Response) => {};
