import { Request, Response } from "express";
import { User } from "@supabase/supabase-js";
import { WalletModel } from "../models/wallet.model";
import {
  RefillWalletType,
  TransactionType,
  UserWalletTransaction,
  UserWalletType,
} from "../types/wallet.type";
import { TransactionModel } from "../models/transactions.model";

// fonction qui est appelé afin de recuperer toutes les informations par rapport au compte d'un utilisateur..
export const getAccountDetails = async (req: Request, res: Response) => {
  const transactions = new TransactionModel();
  let isError = false;
  let errorMessage = "";
};

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
      { creator_id: user.id, amount: reqBody.amount },
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
          error?.detail,
          " on email :",
          user.email
        );
        errorMessage = error?.detail ?? "";
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
export const withdrawalAccount = async (req: Request, res: Response) => {
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
      { creator_id: user.id, amount: reqBody.amount, type: "withdrawal" },
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
    wallet.withdraw(
      transaction_init.transaction_id ?? "111-111-111",
      reqBody,
      (error) => {
        isError = true;
        console.log(
          "wallet-withdraw-error =>",
          error?.detail,
          " on email :",
          user.email
        );
        errorMessage = error?.detail ?? "";
      }
    );

    setTimeout(async () => {
      res.status(200).json({
        message: "WithDraw Transaction Initialized...",
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

// fonction asynchrone qui va s'appeler chaque 30 secondes pour controller les transactions en cours...
export const socketCheckTransactionState = async () => {
  const transactions = new TransactionModel();
  const wallets = new WalletModel();
  let isError = false;
  let errorMessage = "";
  let transaction_id_tab: string[] = [];
  let transactionStateList: TransactionType[] | null = null;

  const data = await transactions.getManyByState("pending", (error) => {
    isError = true;
    console.log("transactions-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    transaction_id_tab = data.map((elt) => {
      return elt.transaction_id;
    });

    transactionStateList = await transactions.checkTransactionStateMention(
      transaction_id_tab,
      (error) => {
        isError = true;
        errorMessage = error?.detail ?? "";
      }
    );
  }

  if (!isError && data && transactionStateList) {
    // maintenant nous allons check toutes les transactions et les recuperer
    for (let index = 0; index < transactionStateList.length; index++) {
      const elementState = transactionStateList[index];
      const transaction = data[index];

      if (elementState.status == "PENDING") {
        continue;
      } else if (elementState.status == "SUCCESS") {
        // Recuperer d'abord son portefeuille..
        const wallet = (await wallets.getByUid(
          transaction.creator_id,
          (error) => {
            isError = true;
            console.log("wallet-getting-error =>", error?.message);
            errorMessage = error?.message ?? "";
          }
        )) as UserWalletType;

        // met à jour la transaction...
        await transactions.update(
          { ...transaction, status: "done" },
          (error) => {
            isError = true;
            console.log("transactions-update-error =>", error?.message);
            errorMessage = error?.message ?? "";
          }
        );

        //met à jour donc le portefeuille avec son argent
        await wallets.update(
          {
            ...wallet,
            funds: wallet.funds + transaction.amount,
          },
          (error) => {
            isError = true;
            console.log("wallet-update-error =>", error?.message);
            errorMessage = error?.message ?? "";
          }
        );
      } else {
        await transactions.update(
          { ...transaction, status: "failed" },
          (error) => {
            isError = true;
            console.log("transactions-update-error =>", error?.message);
            errorMessage = error?.message ?? "";
          }
        );
      }
    }
  } else {
  }
};

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

// fonction qui est appelé afin de recuperer tout les portefeuilles des utilisateurs...
export const allWallets = async (req: Request, res: Response) => {
  const wallets = new WalletModel();
  let isError = false;
  let errorMessage = "";

  const data = await wallets.getAll((error) => {
    isError = true;
    console.log("wallet-getting-error =>", error?.message);
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
