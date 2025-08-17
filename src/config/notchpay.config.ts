import {
  NotchPay,
  TransferResponse,
  TransfersResponse,
  PaymentResponse,
  PaymentsResponse,
  CompletePaymentResponse,
} from "notchpay-api";
import { CancelResponse, METHOD_PAYMENT } from "../types/wallet.type";
import { ApiError, WalletErrorHandler } from "../types/database.type";

// Initialize with your secret key
const notchpay = new NotchPay({
  endpoint: "api.notchpay.co",
  publicKey: process.env.NOTCHPAY_PUBLIC_KEY || "",
});

// For endpoints requiring advanced authentication
const notchpayWithGrant = new NotchPay({
  endpoint: "api.notchpay.co",
  publicKey: process.env.NOTCHPAY_PUBLIC_KEY || "",
  secretKey: process.env.NOTCHPAY_PRIVATE_KEY || "",
});

/**
 * Cette fonction permet de créer une transaction pour l'utilisateur...
 * @param {string} email C'email de l'utilisateur
 * @param {string} phone C'est le numero de la transaction
 * @param {number} amount c'est le montant de la transaction...
 * @param {string} transaction_id C'est l'id de la transaction personnalisé...
 * @returns {Promise<PaymentResponse | undefined>}
 */
export const createPayment = async (
  email: string,
  phone: string,
  amount: number,
  transaction_id: string,
  errorHandler?: WalletErrorHandler
): Promise<PaymentResponse | undefined> => {
  try {
    const payment: PaymentResponse = await notchpay.payments.initialize({
      amount,
      currency: "XAF",
      email,
      phone,
      reference: transaction_id,
    });

    console.log("Payment created:", payment);
    return payment;
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
    const paymentLaunchResponse: CompletePaymentResponse =
      await notchpay.payments.complete(transaction_id, {
        channel: service,
        data: {
          phone,
        },
      });

    console.log(
      "Payment waiting for customer completion :",
      paymentLaunchResponse.message
    );
    return paymentLaunchResponse;
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
    const paymentLaunchResponse: PaymentResponse =
      await notchpay.payments.findOne(transaction_id);

    console.log(
      "Payment check-",
      paymentLaunchResponse.transaction.reference,
      ", state :",
      paymentLaunchResponse.transaction.status
    );
    return paymentLaunchResponse;
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
    const paymentLaunchResponse =
      await notchpay.payments.cancel(transaction_id);

    console.log(
      "Payment message-",
      paymentLaunchResponse.code,
      ", state :",
      paymentLaunchResponse.message
    );
    return paymentLaunchResponse;
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
    const payments: PaymentsResponse = await notchpay.payments.findAll();

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
 * @param {string} transaction_id C'est l'id de la transaction personnalisé...
 * @returns {Promise<PaymentBuildResponse | undefined>}
 */
export const createTransfers = async (
  phone: string,
  service: METHOD_PAYMENT,
  amount: number,
  transaction_id: string,
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
        reference: transaction_id,
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
