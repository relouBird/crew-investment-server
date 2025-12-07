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
    userBets.forEach(async (gettedBet) => {
      let isErrorDetails = false;

      // Premier étape on cree la transaction...
      const res = await transactionModel.create(
        {
          creator_id: gettedBet.uid,
          amount: gettedBet.win
            ? gettedBet.potentialGain
            : gettedBet.potentialLoss,
          type: gettedBet.win ? TRANSACTION_TYPE.GAIN : TRANSACTION_TYPE.LOSS,
          status: STATUS_TYPE.DONE,
          description: gettedBet.win
            ? `Gain - ${gettedBet.prediction}`
            : `Perte - ${gettedBet.prediction}`,
        },
        (error) => {
          console.log("users-transactions-creating-error =>", error?.message);
          errorList.push(error?.details ?? error?.message ?? "");
          isErrorDetails = true;
        }
      );

      // Seconde étape on recuperer le porte-feuille de l'utilisateur...
      const userWallet =
        !isErrorDetails &&
        (await walletModel.getByUid(gettedBet.uid, (error) => {
          console.log("users-wallet-getting-error =>", error?.message);
          errorList.push(error?.details ?? error?.message ?? "");
          isErrorDetails = true;
        }));

      // Troisième étape... on met à jour le porte-feuille de l'utilisateur...
      !isErrorDetails &&
        userWallet &&
        walletModel.update(
          {
            ...userWallet,
            funds: gettedBet.win
              ? userWallet.funds + gettedBet.potentialGain
              : userWallet.funds - gettedBet.potentialLoss,
          },
          (error) => {
            console.log("users-wallet-updating-error =>", error?.message);
            errorList.push(error?.details ?? error?.message ?? "");
            isErrorDetails = true;
          }
        );

      let isDeleted: boolean = false;
      // Derniere étape on desactive le parie
      userBetModel.update({ ...gettedBet, isPayed: true }, (error) => {
        console.log("users-bets-updating-error =>", error?.message);
        errorList.push(error?.details ?? error?.message ?? "");
        isErrorDetails = true;
        isDeleted = true;
      });

      if (isDeleted) {
        !isErrorDetails &&
          userWallet &&
          walletModel.update(
            {
              ...userWallet,
              funds: gettedBet.win
                ? userWallet.funds - gettedBet.potentialGain
                : userWallet.funds + gettedBet.potentialLoss,
            },
            (error) => {
              console.log("users-wallet-updating-error =>", error?.message);
              errorList.push(error?.details ?? error?.message ?? "");
              isErrorDetails = true;
            }
          );

        await transactionModel.delete(String(res?.id));
      }
    });
  }

  if (errorList.length) {
    errorList.forEach((error) => {
      console.log("Erreur ==>", error);
    });
  }

  console.log("users-bets-list ===>", betsList);
};
