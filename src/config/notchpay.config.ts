import {
  NotchPay,
  TransferResponse,
  TransfersResponse,
  PaymentResponse,
  PaymentsResponse,
  CompletePaymentResponse,
  InitializePaymentPayload,
  CompletePaymentPayload,
  InitializeTransferPayload,
} from "notchpay-api";
import {
  CancelResponse,
  METHOD_PAYMENT,
  METHOD_REQUEST,
} from "../types/wallet.type";
import { ApiError, WalletErrorHandler } from "../types/database.type";

// Set up your secrets
const BASE = "https://api.notchpay.co";
const PUBLIC_KEY = process.env.NOTCHPAY_PUBLIC_KEY!;
const PRIVATE_KEY = process.env.NOTCHPAY_PRIVATE_KEY!;

const METHOD: Record<string, METHOD_REQUEST> = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

// For endpoints requiring advanced authentication
const notchpayWithGrant = new NotchPay({
  endpoint: "api.notchpay.co",
  publicKey: process.env.NOTCHPAY_PUBLIC_KEY || "",
  secretKey: process.env.NOTCHPAY_PRIVATE_KEY || "",
});

// ceci permet de gerer les depots...
const notchPayment = async (
  method: METHOD_REQUEST,
  endpoint: string = "",
  payload?: InitializePaymentPayload | CompletePaymentPayload
) => {
  const url = `${BASE}/payments/${encodeURIComponent(endpoint)}`;
  console.log(method , "/ url =>", url);
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `${PUBLIC_KEY}`, // ta clé secrète
    },
    body: payload && JSON.stringify(payload),
  });
  return response;
};

// ceci permet de gerer les transferts...
const notchTransfer = async (
  method: METHOD_REQUEST,
  endpoint: string = "",
  payload?: InitializeTransferPayload
) => {
  const response = await fetch(
    `${BASE}/transfer/${encodeURIComponent(endpoint)}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PUBLIC_KEY}`,
        "X-Grant": PRIVATE_KEY,
      },
      body: payload && JSON.stringify(payload),
    }
  );
  return response;
};

/**
 * Cette fonction permet de créer une transaction pour l'utilisateur...
 * @param {string} email C'email de l'utilisateur
 * @param {string} phone C'est le numero de la transaction
 * @param {number} amount c'est le montant de la transaction...
 * @returns {Promise<PaymentResponse | undefined>}
 */
export const createPayment = async (
  email: string,
  phone: string,
  amount: number,
  errorHandler?: WalletErrorHandler
): Promise<PaymentResponse | undefined> => {
  try {
    const payload = {
      amount,
      currency: "XAF",
      email,
      phone,
    };
    const response = await notchPayment(METHOD.POST, "", payload);

    if (!response.ok) {
      throw new Error(
        `Process payment failed: ${response.status} ${await response.text()}`
      );
    }
    const payments = (await response.json()) as PaymentResponse;
    console.log("Payments created:", payments);
    return payments;
  } catch (error) {
    console.log("creating-payment-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de lancer reellement la transaction coté marchant une transaction pour l'utilisateur...
 * @param {METHOD_PAYMENT} service C'est le reseau sur lequel on effectue la transaction...
 * @param {string} phone C'est le numero de la transaction
 * @param {string} transaction_id C'est l'id de la transaction personnalisé...
 * @returns {Promise<CompletePaymentResponse | undefined>}
 */
export const completePayment = async (
  transaction_id: string,
  service: METHOD_PAYMENT,
  phone: string,
  errorHandler?: WalletErrorHandler
): Promise<CompletePaymentResponse | undefined> => {
  try {
    const payload = {
      channel: service,
      data: {
        phone,
      },
    };
    const response = await notchPayment(METHOD.POST, transaction_id, payload);

    if (!response.ok) {
      throw new Error(
        `Process payment failed: ${response.status} ${await response.text()}`
      );
    }
    const payments = (await response.json()) as CompletePaymentResponse;
    console.log("Payment waiting for customer completion :", payments.message);
    return payments;
  } catch (error) {
    console.log("process-payment-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de checker l'etat d'une transaction pour l'utilisateur...
 * @param {string} transaction_id C'est l'id de la transaction personnalisé...
 * @returns {Promise<PaymentResponse | undefined>}
 */
export const checkPayment = async (
  transaction_id: string,
  errorHandler?: WalletErrorHandler
): Promise<PaymentResponse | undefined> => {
  try {
    const response = await notchPayment(METHOD.GET, transaction_id);

    if (!response.ok) {
      throw new Error(
        `Process payment failed: ${response.status} ${await response.text()}`
      );
    }
    const payments = (await response.json()) as PaymentResponse;
    console.log(
      "Payment check-",
      payments.transaction.reference,
      ", state :",
      payments.transaction.status
    );
    return payments;
  } catch (error) {
    console.log("checking-payment-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet d'annuler une transaction pour l'utilisateur...
 * @param {string} transaction_id C'est l'id de la transaction personnalisé...
 * @returns {Promise<CancelResponse | undefined>}
 */
export const cancelPayment = async (
  transaction_id: string,
  errorHandler?: WalletErrorHandler
): Promise<CancelResponse | undefined> => {
  try {
    const response = await notchPayment(METHOD.DELETE, transaction_id);

    if (!response.ok) {
      throw new Error(
        `Process payment failed: ${response.status} ${await response.text()}`
      );
    }
    const payments = response.json() as unknown as CancelResponse;
    console.log(
      "Payment message-",
      payments.code,
      ", state :",
      payments.message
    );
    return payments;
  } catch (error) {
    console.log("canceling-payment-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de créer une transaction pour l'utilisateur...
 * @returns {Promise<PaymentsResponse | undefined>}
 */
export const listPayments = async (
  errorHandler?: WalletErrorHandler
): Promise<PaymentsResponse | undefined> => {
  try {
    const response = await notchPayment(METHOD.GET);

    if (!response.ok) {
      throw new Error(
        `Process payment failed: ${response.status} ${await response.text()}`
      );
    }
    const payments = response.json() as unknown as PaymentsResponse;
    console.log("Payments retrieved:", payments);
    return payments;
  } catch (error) {
    console.log("listing-payment-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

// ----------------------------------------------
// Partie qui gère les transferts
// ----------------------------------------------

/**
 * Cette fonction permet de créer un transfert pour envoyer des fonds chez un utilisateur
 * @param {string} phone C'est le numero de la transaction
 * @param {METHOD_PAYMENT} service C'est le reseau sur lequel on effectue la transaction...
 * @param {number} amount c'est le montant de la transaction...
 * @returns {Promise<PaymentBuildResponse | undefined>}
 */
export const createTransfers = async (
  phone: string,
  service: METHOD_PAYMENT,
  amount: number,
  errorHandler?: WalletErrorHandler
): Promise<TransferResponse | undefined> => {
  try {
    const transfer: TransferResponse =
      await notchpayWithGrant.transfers.initialize({
        amount,
        currency: "XAF",
        description: "Funds acquisition...",
        channel: service,
        beneficiary: {
          phone,
        },
      });

    console.log("Payment created:", transfer);
    return transfer;
  } catch (error) {
    console.log("creating-transfers-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de checker un transfert pour envoyer des fonds chez un utilisateur
 * @param {string} transaction_id C'est l'id de la transaction personnalisé...
 * @returns {Promise<PaymentBuildResponse | undefined>}
 */
export const checkTransfers = async (
  transaction_id: string,
  errorHandler?: WalletErrorHandler
): Promise<TransferResponse | undefined> => {
  try {
    const transfer: TransferResponse =
      await notchpayWithGrant.transfers.findOne(transaction_id);

    console.log("Payment created:", transfer);
    return transfer;
  } catch (error) {
    console.log("checking-transfers-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de lister tout les transferts pour envoyer des fonds chez un utilisateur...
 * @returns {Promise<PaymentBuildResponse | undefined>}
 */
export const listTransfers = async (
  errorHandler?: WalletErrorHandler
): Promise<TransfersResponse | undefined> => {
  try {
    const transfer: TransfersResponse =
      await notchpayWithGrant.transfers.findAll();

    console.log("Payment created:", transfer);
    return transfer;
  } catch (error) {
    console.log("listing-transfers-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};
