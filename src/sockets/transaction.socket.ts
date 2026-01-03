import { TransactionModel } from "../models/transactions.model";
import { STATUS_TYPE, TRANSACTION_TYPE } from "../types/wallet.type";
import { UserBetModel } from "../models/user-bet.model";
import { WalletModel } from "../models/wallet.model";

// Ceci permet de checker les paris des utilisateurs terminés
export const usersBetChecker = async () => {
  const userBetModel = new UserBetModel();
  const transactionModel = new TransactionModel();
  const walletModel = new WalletModel();
  let betsList: string[] = [];
  let errorList: string[] = [];
  let isError: boolean = false;

  const userBets = await userBetModel.getBetsByPaymentState((error) => {
    console.log("users-bets-getting-error =>", error?.message);
    isError = true;
  });

  betsList = userBets ? userBets.map((bet) => String(bet.id)) : [];

  if (betsList.length && userBets?.length && !isError) {

    for (const bet of userBets) {
      try {
        // 1️⃣ Premier étape on cree la transaction...
        const res = await transactionModel.create(
          {
            creator_id: bet.uid,
            amount: bet.win ? bet.potentialGain : bet.potentialLoss,
            type: bet.win ? TRANSACTION_TYPE.GAIN : TRANSACTION_TYPE.LOSS,
            status: STATUS_TYPE.DONE,
            description: bet.win
              ? `Gain - ${bet.prediction}`
              : `Perte - ${bet.prediction}`,
          },
          (error) => {
            console.log("users-transactions-creating-error =>", error?.message);
            errorList.push(error?.details ?? error?.message ?? "");
          }
        );

        if (res == null) continue;

        // 2️⃣ Seconde étape on recuperer le porte-feuille de l'utilisateur...
        let userWallet = await walletModel.getByUid(bet.uid, (error) => {
          console.log("users-wallet-getting-error =>", error?.message);
          errorList.push(error?.details ?? error?.message ?? "");
        });

        if (userWallet == null) continue;

        // 3️⃣ Troisième étape... on met à jour le porte-feuille de l'utilisateur...
        userWallet = await walletModel.update(
          {
            ...userWallet,
            funds: bet.win
              ? userWallet.funds + bet.potentialGain
              : userWallet.funds - bet.potentialLoss,
          },
          (error) => {
            console.log("users-wallet-updating-error =>", error?.message);
            errorList.push(error?.details ?? error?.message ?? "");
          }
        );

        if (userWallet == null) continue;

        // 4️⃣ Derniere étape on desactive le parie
        await userBetModel.update({ ...bet, isPayed: true }, (error) => {
          console.log("users-bets-updating-error =>", error?.message);
          errorList.push(error?.details ?? error?.message ?? "");
          errorList.push("true");
        });

        if (errorList.includes("true")) {
          //  5eme  étape... on met à jour le porte-feuille de l'utilisateur...
          userWallet = await walletModel.update(
            {
              ...userWallet,
              funds: bet.win
                ? userWallet.funds - bet.potentialGain
                : userWallet.funds + bet.potentialLoss,
            },
            (error) => {
              console.log("users-wallet-updating-error =>", error?.message);
            }
          );
          await transactionModel.delete(String(res?.id));
        }
      } catch (error) {}
    }
  }

  if (errorList.length) {
    errorList.forEach((error) => {
      console.log("Erreur ==>", error);
    });
  }

  console.log("users-bets-list ===>", betsList);
};
