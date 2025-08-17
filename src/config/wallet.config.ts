import {
  PaymentOperation,
  RandomGenerator,
  TransactionResponse,
} from "@hachther/mesomb";
import {
  ErrorHandler,
  MesombErrorHandler,
  MesombError,
} from "../types/database.type";
import { PAYMENT_METHOD, TransactionType } from "../types/wallet.type";

const applicationKey = process.env.MESOMB_APPLICATION_KEY || "";
const accessKey = process.env.MESOMB_ACCESS_KEY || "";
const secretKey = process.env.MESOMB_SECRET_KEY || "";

// Declaration du client de paiement..
//--------------------------------------------
const client_payment = new PaymentOperation({
  applicationKey,
  accessKey,
  secretKey,
});

/**
 * Cette fonction permet de charger le compte INVESTIA de l'utilisateur...
 * @param {string} userNumber C'est le numero de la transaction
 * @param {number} amount c'est le montant de la transaction...
 * @param {PAYMENT_METHOD} service C'est le reseau sur lequel on effectue la transaction...
 * @returns {Promise<TransactionResponse | undefined>}
 */
const collectFromUserAccount = async (
  userNumber: string,
  amount: number,
  service: PAYMENT_METHOD,
  transaction_id: string
): Promise<TransactionResponse | undefined> => {
  try {
    const response = await client_payment.makeCollect({
      mode: "asynchronous",
      payer: userNumber || "670000000",
      amount: amount || 300,
      service: service || "MTN",
      nonce: RandomGenerator.nonce(),
      trxID: transaction_id, // optional
    });

    return response;
  } catch (error) {
    console.log("error =>", error);
    return undefined;
  }
};

/**
 * Cette fonction permet d'envoyer des fonds sur le compte de l'utilisateur...
 * @param {string} userNumber C'est le numero de la transaction
 * @param {number} amount c'est le montant de la transaction...
 * @param {PAYMENT_METHOD} service C'est le reseau sur lequel on effectue la transaction...
 * @returns {Promise<TransactionResponse | undefined>}
 */
const sendFundsToUserAccount = async (
  userNumber: string,
  amount: number,
  service: PAYMENT_METHOD,
  transaction_id: string
): Promise<TransactionResponse | undefined> => {
  try {
    const response = await client_payment.makeDeposit({
      receiver: userNumber || "670000000",
      amount: amount || 300,
      service: service || "MTN",
      nonce: RandomGenerator.nonce(),
      trxID: transaction_id, // optional
    });

    return response;
  } catch (error) {
    console.log("error =>", error);
    return undefined;
  }
};

/**
 * Cette fonction permet de renvoyer l'argent de la transaction à un utilisateur si l'operation echoue...
 * @param {string} transaction_id C'est l'id  de la transaction
 * @returns {Promise<TransactionResponse>}
 */
const refundToUserAccountFromTransactionId = async (
  transaction_id: string
): Promise<TransactionResponse> => {
  const transaction = await client_payment.refundTransaction(
    transaction_id,
    {}
  );
  return transaction;
};

/**
 * Cette fonction permet de controler la transaction d'un utilisateur...
 * @param {string[]} transaction_id_list C'est l'id  de la transaction
 * @returns {Promise<TransactionType[] | undefined>}
 */
const checkFromTransactionId = async (
  transaction_id_list: string[],
  errorHandler?: MesombErrorHandler
): Promise<TransactionType[] | undefined> => {
  try {
    const transaction =
      await client_payment.checkTransactions(transaction_id_list);
    return transaction as TransactionType[];
  } catch (error) {
    errorHandler && errorHandler(error as MesombError);
    return undefined;
  }
};

/**
 * Cette fonction permet de renvoyer l'argent de la transaction à un utilisateur si l'operation echoue...
 * @param {string} transaction_id C'est l'id  de la transaction
 * @returns {Promise<TransactionType>}
 */
const getFromTransactionId = async (
  transaction_id: string
): Promise<TransactionType> => {
  const transaction = await client_payment.getTransactions([transaction_id]);
  return transaction[0] as TransactionType;
};

export {
  collectFromUserAccount,
  sendFundsToUserAccount,
  refundToUserAccountFromTransactionId,
  checkFromTransactionId,
  getFromTransactionId,
};
