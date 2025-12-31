import { Request, Response } from "express";
import { User } from "@supabase/supabase-js";
import { WalletModel } from "../models/wallet.model";
import {
  beneficiaryResponse,
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

  // Ici ON RECUPERE LE PORTE-FEUILLE DE L'UTILISATEUR
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

  // SI CAS PLUS HAUT ECHEANT
  // --------> ON CREE UN NOUVEAU PORTE-FEUILLE
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

  // ICI ON INITIALISE LE PAYMENT
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

    // SI CAS PLUS HAUT REUSSIT
    // -----------> ON CREE UNE TRANSACTION
    const transaction_init =
      dataRefill &&
      (await transactions.create(
        {
          creator_id: user.id,
          description: `Depot - ${reqBody.service}`,
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

    dataRefill
      ? setTimeout(async () => {
          res.status(200).json({
            message: "Transaction Initialized...",
            data: {
              ...reqBody,
              transaction_id: transaction_init?.transaction_id,
              transaction_details: dataRefill?.transaction,
            },
          });
        }, 2000)
      : setTimeout(async () => {
          res.status(403).json({
            message: "Not Found...",
            details: "Something where wrongs when launched...",
          });
        }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Transaction To Initialize Found...",
        details: errorMessage,
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

  // Ici ON RECUPERE LE PORTE-FEUILLE DE L'UTILISATEUR
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

  // SI CAS PLUS HAUT ECHEANT
  // --------> ON CREE UN NOUVEAU PORTE-FEUILLE
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

  // ICI ON INITIALISE LE TRANSFER
  if (!isError && reqBody && data && reqBody.amount < data.funds) {
    const dataWithdraw = await wallet.simpleWithdraw(
      user.user_metadata.firstName + " " + user.user_metadata.lastName,
      reqBody.transaction_number,
      reqBody.amount,
      (error) => {
        isError = true;
        console.log(
          "wallet-withdraw-error =>",
          error.message,
          " on email :",
          user.email
        );
        errorMessage = error.message ?? "";
      }
    );

    const transaction_init =
      dataWithdraw &&
      (await transactions.create(
        {
          creator_id: user.id,
          amount: reqBody.amount,
          description: `Retrait - ${reqBody.service}`,
          transaction_id: dataWithdraw.transfer.reference,
          type: "withdrawal",
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

    //met à jour donc le portefeuille avec son argent
    dataWithdraw &&
      (await wallet.update(
        {
          ...data,
          funds: data.funds - (dataWithdraw?.transfer.amount ?? 0),
        },
        (error) => {
          isError = true;
          console.log("wallet-update-error =>", error?.message);
          errorMessage = error?.message ?? "";
        }
      ));

    dataWithdraw
      ? setTimeout(async () => {
          //  SI LA TRANSACTION REUSSIE
          res.status(200).json({
            message: "WithDraw Transaction Initialized...",
            data: {
              ...reqBody,
              transaction_id: transaction_init?.transaction_id,
              transaction_details: dataWithdraw?.transfer,
            },
          });
        }, 2000)
      : setTimeout(async () => {
          // SI LA TRANSACTION AU NIVEAU DE NOTCHPAY A ECHOUE
          res.status(403).json({
            message: "Not Found...",
            details: "Something where wrongs when launched...",
          });
        }, 1000);
  } else if (!isError && reqBody && data && reqBody.amount > data.funds) {
    setTimeout(async () => {
      // SI LES FONDS SONT INSUFFISANTS
      res.status(402).json({
        message: "Not Found...",
        details: "You've insufficient balance funds...",
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      // ERREUR DONT ON ARRIVE PAS A GERER
      res.status(404).json({
        message: "No Transaction To Initialize Found...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// // fonction qui permet de verifier un OTP... lors de la creation de compte
// export const withdrawalAccount = async (req: Request, res: Response) => {
//   const wallet = new WalletModel();
//   const transactions = new TransactionModel();
//   // utils datas...
//   const reqBody = req.body as RefillWalletType; // Ce type...
//   const user = (req as any).user as User;
//   let isError = false;
//   let errorMessage = "";

//   console.log(`identification-wallet-transaction =>`, reqBody);

//   let data: UserWalletType | null = null;

//   // Ici ON RECUPERE LE PORTE-FEUILLE DE L'UTILISATEUR
//   if (reqBody) {
//     data = await wallet.getByUid(user.id ?? "", (error) => {
//       isError = true;
//       console.log(
//         "wallet-getting-error =>",
//         error?.message,
//         " on email :",
//         user.email
//       );
//       errorMessage = error?.message ?? "";
//     });
//     console.log("data-getted =>", data);
//   }

//   // SI CAS PLUS HAUT ECHEANT
//   // --------> ON CREE UN NOUVEAU PORTE-FEUILLE
//   if (!data && reqBody) {
//     data = await wallet.create({ uid: user.id }, (error) => {
//       isError = true;
//       console.log(
//         "wallet-create-error =>",
//         error?.message,
//         " on email :",
//         user.email
//       );
//       errorMessage = error?.message ?? "";
//     });
//   }

//   // ICI ON INITIALISE LE TRANSFER
//   if (!isError && reqBody && data && reqBody.amount < data.funds) {
//     let beneficiary: beneficiaryResponse | undefined = undefined;

//     if (data.funds_id === "") {
//       let name: string =
//         user.user_metadata.firstName + " " + user.user_metadata.lastName;

//       console.log("wallet-user-name =>", name);

//       // ======> S'IL Y A UN BENEFICIARE ON VA LE LOAD
//       if (data.funds_id && data.funds_id != "") {
//         // continue
//       } else {
//         // SINON ON LE CREE LE BENECIFIAIRE ET ON MET A JOUR LE WALLET
//         beneficiary = await wallet.createBeneficiary(
//           name,
//           user.email ?? "",
//           reqBody.transaction_number,
//           reqBody.service,
//           (error) => {
//             console.log(
//               "wallet-create-beneficiary-error =>",
//               error.message,
//               " on email :",
//               user.email
//             );
//             errorMessage = error.message ?? "";
//           }
//         );
//       }

//       data = (await wallet.update(
//         { ...data, funds_id: beneficiary?.beneficiary.id ?? "" },
//         (error) => {
//           console.log(
//             "wallet-create-beneficiary-error =>",
//             error?.message,
//             " on email :",
//             user.email
//           );
//           errorMessage = error?.message ?? "";
//         }
//       )) as UserWalletType;
//     }

//     const stater =
//       beneficiary != undefined ||
//       (data.funds_id != undefined && data.funds_id != "");

//     const dataWithdraw = stater
//       ? await wallet.withdraw(data.funds_id, reqBody.amount, (error) => {
//           isError = true;
//           console.log(
//             "wallet-withdraw-error =>",
//             error.message,
//             " on email :",
//             user.email
//           );
//           errorMessage = error.message ?? "";
//         })
//       : undefined;

//     const transaction_init =
//       dataWithdraw &&
//       (await transactions.create(
//         {
//           creator_id: user.id,
//           amount: reqBody.amount,
//           description: `Retrait - ${reqBody.service}`,
//           transaction_id: dataWithdraw.transfer.reference,
//           type: "withdrawal",
//         },
//         (error) => {
//           isError = true;
//           console.log(
//             "transaction-create-error =>",
//             error?.message,
//             " on email :",
//             user.email
//           );
//           errorMessage = error?.message ?? "";
//         }
//       ));

//     //met à jour donc le portefeuille avec son argent
//     dataWithdraw &&
//       (await wallet.update(
//         {
//           ...data,
//           funds: data.funds - (dataWithdraw?.transfer.amount ?? 0),
//         },
//         (error) => {
//           isError = true;
//           console.log("wallet-update-error =>", error?.message);
//           errorMessage = error?.message ?? "";
//         }
//       ));

//     dataWithdraw
//       ? setTimeout(async () => {
//           //  SI LA TRANSACTION REUSSIE
//           res.status(200).json({
//             message: "WithDraw Transaction Initialized...",
//             data: {
//               ...reqBody,
//               transaction_id: transaction_init?.transaction_id,
//               transaction_details: dataWithdraw?.transfer,
//             },
//           });
//         }, 2000)
//       : setTimeout(async () => {
//           // SI LA TRANSACTION AU NIVEAU DE NOTCHPAY A ECHOUE
//           res.status(403).json({
//             message: "Not Found...",
//             details: "Something where wrongs when launched...",
//           });
//         }, 1000);
//   } else if (!isError && reqBody && data && reqBody.amount > data.funds) {
//     setTimeout(async () => {
//       // SI LES FONDS SONT INSUFFISANTS
//       res.status(402).json({
//         message: "Not Found...",
//         details: "You've insufficient balance funds...",
//       });
//     }, 1000);
//   } else {
//     setTimeout(async () => {
//       // ERREUR DONT ON ARRIVE PAS A GERER
//       res.status(404).json({
//         message: "No Transaction To Initialize Found...",
//         details: errorMessage,
//       });
//     }, 1000);
//   }
// };
