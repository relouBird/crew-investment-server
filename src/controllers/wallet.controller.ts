import { Request, Response } from "express";
import { User } from "@supabase/supabase-js";
import { WalletModel } from "../models/wallet.model";
import {
  RefillWalletType,
  UserWalletTransaction,
  UserWalletType,
} from "../types/wallet.type";
import { TransactionModel } from "../models/transactions.model";
import { TransferResponse, PaymentResponse } from "notchpay-api";

// fonction qui est appelé afin de recuperer toutes les informations par rapport au compte d'un utilisateur..
export const getAccountDetails = async (req: Request, res: Response) => {
  const transactions = new TransactionModel();
  const wallet = new WalletModel();
  let isError = false;
  let errorMessage = "";
  const user = (req as any).user as User;

  const datas = await wallet.getByUid(user.id, (error) => {
    console.log("get-wallet-error =>", error?.message);
    isError = true;
    errorMessage = error?.message ?? "";
  });

  if (!isError && datas) {
    const transaction_datas = await transactions.getManyByUuid(
      user.id,
      (error) => {
        console.log("get-transactions-error =>", error?.message);
        isError = true;
        errorMessage = error?.message ?? "";
      }
    );
    if (!isError && transaction_datas) {
      let deposit: number = 0;
      let withdraw: number = 0;
      let growth: number = 0;
      // calculs la somme de tout les depots...
      transaction_datas
        .filter(
          (transaction) =>
            transaction.type == "deposit" && transaction.status == "done"
        )
        .forEach((trans) => {
          deposit += trans.amount;
        });

      // calcul la somme de tout les retraits...
      transaction_datas
        .filter(
          (transaction) =>
            transaction.type == "withdrawal" && transaction.status == "done"
        )
        .forEach((trans) => {
          withdraw += trans.amount;
        });

      // calcul l'évolution...
      growth =
        deposit != 0 ? ((datas.funds + withdraw - deposit) / deposit) * 100 : 0;

      // Send...
      setTimeout(async () => {
        res.status(200).json({
          message: "User wallet getted...",
          data: { ...datas, growth, total_wins: 0 },
        });
      }, 1000);
    } else {
      setTimeout(async () => {
        res.status(404).json({
          message: "Not Transactions Found...",
          data: errorMessage,
        });
      }, 1000);
    }
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "Not Wallet Found...",
        data: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé lors de la requete et permettant de creer un nouvel utilisateur
export const refillAccount = async (req: Request, res: Response) => {
  const wallet = new WalletModel();
  const transactions = new TransactionModel();
  // utils datas...
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

  if (!data && reqBody && isError) {
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

  if (!isError && reqBody && data) {
    const dataRefill = await wallet.refill(
      user.email ?? "",
      reqBody,
      (error) => {
        isError = true;
        console.log(
          "wallet-refill-error =>",
          error.message,
          " on email :",
          user.email
        );
        errorMessage = error.message ?? "";
      }
    );

    const transaction_init =
      dataRefill &&
      (await transactions.create(
        {
          creator_id: user.id,
          amount: reqBody.amount,
          transaction_id: dataRefill?.transaction.reference,
        },
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
      ));

    setTimeout(async () => {
      res.status(200).json({
        message: "Transaction Initialized...",
        data: {
          ...reqBody,
          transaction_id: transaction_init?.transaction_id,
          transaction_details: dataRefill?.transaction,
        },
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

  if (!isError && reqBody && data && reqBody.amount < data.funds) {
    const dataWithdraw = await wallet.withdraw(reqBody, (error) => {
      isError = true;
      console.log(
        "wallet-withdraw-error =>",
        error.message,
        " on email :",
        user.email
      );
      errorMessage = error.message ?? "";
    });

    const transaction_init =
      dataWithdraw &&
      (await transactions.create(
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
      ));

    //met à jour donc le portefeuille avec son argent
    await wallet.update(
      {
        ...data,
        funds: data.funds - (dataWithdraw?.transfer.amount_total ?? 0),
      },
      (error) => {
        isError = true;
        console.log("wallet-update-error =>", error?.message);
        errorMessage = error?.message ?? "";
      }
    );

    setTimeout(async () => {
      res.status(200).json({
        message: "WithDraw Transaction Initialized...",
        data: {
          ...reqBody,
          transaction_id: transaction_init?.transaction_id,
          transaction_details: dataWithdraw?.transfer,
        },
      });
    }, 2000);
  } else if (!isError && reqBody && data && reqBody.amount > data.funds) {
    setTimeout(async () => {
      res.status(404).json({
        message: "Not Found...",
        data: "You've insufficient balance funds...",
      });
    }, 1000);
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
    } else if (transactionState.transfer.status == "complete") {
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

// fonction asynchrone qui va s'appeler chaque 30 secondes pour controller les transactions en cours...
export const socketCheckPaymentState = async () => {
  const transactions = new TransactionModel();
  const wallets = new WalletModel();
  let isError = false;
  let errorMessage = "";
  let transaction_id_tab: string[] = [];
  let transactionStateList: PaymentResponse[] | null = null;

  const data = await transactions.getManyByState("pending", (error) => {
    isError = true;
    console.log("transactions-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    transaction_id_tab = data.map((elt) => {
      return elt.transaction_id;
    });

    transactionStateList = await transactions.checkListPayment(
      transaction_id_tab,
      (error) => {
        isError = true;
        errorMessage = error.message ?? "";
      }
    );
  }

  if (!isError && data && transactionStateList) {
    // maintenant nous allons check toutes les transactions et les recuperer
    for (let index = 0; index < transactionStateList.length; index++) {
      const elementState = transactionStateList[index];
      const transaction = data[index];

      if (elementState.transaction.status == "pending") {
        continue;
      }
      if (elementState.transaction.status == "processing") {
        continue;
      } else if (elementState.transaction.status == "complete") {
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

// fonction asynchrone qui va s'appeler chaque 30 secondes pour controller les transactions en cours...
export const socketCheckWithdrawState = async () => {
  const transactions = new TransactionModel();
  const wallets = new WalletModel();
  let isError = false;
  let errorMessage = "";
  let transaction_id_tab: string[] = [];
  let transactionStateList: TransferResponse[] | null = null;

  const data = await transactions.getManyByState("pending", (error) => {
    isError = true;
    console.log("transactions-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    transaction_id_tab = data.map((elt) => {
      return elt.transaction_id;
    });

    transactionStateList = await transactions.checkListTransfers(
      transaction_id_tab,
      (error) => {
        isError = true;
        errorMessage = error.message ?? "";
      }
    );
  }

  if (!isError && data && transactionStateList) {
    // maintenant nous allons check toutes les transactions et les recuperer
    for (let index = 0; index < transactionStateList.length; index++) {
      const elementState = transactionStateList[index];
      const transaction = data[index];

      if (elementState.transfer.status == "pending") {
        continue;
      }
      if (elementState.transfer.status == "processing") {
        continue;
      } else if (elementState.transfer.status == "complete") {
        // met à jour la transaction...
        await transactions.update(
          { ...transaction, status: "done" },
          (error) => {
            isError = true;
            console.log("transactions-update-error =>", error?.message);
            errorMessage = error?.message ?? "";
          }
        );
      } else {
        // Recuperer d'abord son portefeuille..
        const wallet = (await wallets.getByUid(
          transaction.creator_id,
          (error) => {
            isError = true;
            console.log("wallet-getting-error =>", error?.message);
            errorMessage = error?.message ?? "";
          }
        )) as UserWalletType;

        await transactions.update(
          { ...transaction, status: "failed" },
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
