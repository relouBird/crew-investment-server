import { TransferResponse, PaymentResponse } from "notchpay-api";
import { TransactionModel } from "../models/transactions.model";
import { WalletModel } from "../models/wallet.model";
import { UserWalletType } from "../types/wallet.type";

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
      } else if (elementState.transfer.status == "failed") {
        //---------------------------------------- à remplacer plus tard par complete
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
