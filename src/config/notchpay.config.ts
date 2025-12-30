import {
  TransferResponse,
  TransfersResponse,
  PaymentResponse,
  PaymentsResponse,
  CompletePaymentResponse,
  InitializePaymentPayload,
  CompletePaymentPayload,
} from "notchpay-api";
import {
  beneficiariesResponse,
  beneficiaryResponse,
  CancelResponse,
  InitializeBeneficiaryPayload,
  InitializeSimpleTransferPayload,
  InitializeTransferPayload,
  METHOD_PAYMENT,
  METHOD_REQUEST,
} from "../types/wallet.type";
import { ApiError, WalletErrorHandler } from "../types/database.type";

// Set up your secrets
const BASE = "https://api.notchpay.co";
// const PUBLIC_KEY = process.env.NOTCHPAY_PUBLIC_KEY_PROD!;
// const PRIVATE_KEY = process.env.NOTCHPAY_PRIVATE_KEY_PROD!;
const PUBLIC_KEY = process.env.NOTCHPAY_PUBLIC_KEY_PROD!;
const PRIVATE_KEY = process.env.NOTCHPAY_PRIVATE_KEY_PROD!;

const METHOD: Record<string, METHOD_REQUEST> = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

// ceci permet de gerer les depots...
const notchPayment = async (
  method: METHOD_REQUEST,
  endpoint: string = "",
  payload?: InitializePaymentPayload | CompletePaymentPayload
) => {
  const url = `${BASE}/payments/${encodeURIComponent(endpoint)}`;
  console.log(method, "/ url =>", url);
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
  payload?: InitializeTransferPayload| InitializeSimpleTransferPayload
) => {
  const url = `${BASE}/transfers/${encodeURIComponent(endpoint)}`;
  console.log(method, "/ url =>", url);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `${PUBLIC_KEY}`,
      "X-Grant": PRIVATE_KEY,
    },
    body: payload && JSON.stringify(payload),
  });
  return response;
};

// ceci permet de gerer ceux qui recoivent...
const notchBeneficiary = async (
  method: METHOD_REQUEST,
  endpoint: string = "",
  payload?: InitializeBeneficiaryPayload
) => {
  const url = `${BASE}/beneficiaries/${encodeURIComponent(endpoint)}`;
  console.log(method, "/ url =>", url);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `${PUBLIC_KEY}`,
      "X-Grant": PRIVATE_KEY,
    },
    body: payload && JSON.stringify(payload),
  });
  return response;
};

//---------------------------------------
//--------------PAYMENTS-----------------
//---------------------------------------

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

// ----------------------------------------------
// Partie qui gère les transferts
// ----------------------------------------------

/**
 * Cette fonction permet de créer un transfert pour envoyer des fonds chez un utilisateur
 * @param {string} recipient_id C'est le numero de la transaction
 * @param {number} amount C'est le montant à retirer
 * @param {WalletErrorHandler | undefined} errorHandler C'est la fonction qui permet de gerer la suite en cas d'erreur...
 * @returns {Promise<TransferResponse | undefined>}
 */
export const createTransfers = async (
  recipient_id: string,
  amount: number,
  errorHandler?: WalletErrorHandler
): Promise<TransferResponse | undefined> => {
  try {
    const payload: InitializeTransferPayload = {
      amount,
      currency: "XAF",
      beneficiary: recipient_id,
      channel: "cm.mobile",
      description: "Payment for services",
    };

    console.log("PAYMENT-PAYLOAD ==>", payload);

    const response = await notchTransfer(METHOD.POST, "", payload);

    if (!response.ok) {
      throw new Error(
        `Process transfer failed: ${response.status} ${await response.text()}`
      );
    }
    const transfer = (await response.json()) as TransferResponse;
    console.log("Transfer created:", transfer);
    return transfer;
  } catch (error) {
    console.log("creating-transfers-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de créer un transfert pour envoyer des fonds chez un utilisateur
 * @param {string} name C'est le nom du bénéficiaire...
 * @param {string} phone C'est le numero de téléphone du bénéficiaire...
 * @param {number} amount C'est le montant à retirer
 * @param {WalletErrorHandler | undefined} errorHandler C'est la fonction qui permet de gerer la suite en cas d'erreur...
 * @returns {Promise<TransferResponse | undefined>}
 */
export const simpleCreateTransfers = async (
  name: string,
  phone: string,
  amount: number,
  errorHandler?: WalletErrorHandler
): Promise<TransferResponse | undefined> => {
  try {
    const payload: InitializeSimpleTransferPayload = {
      description: "MANUAL_CASHOUT",
      amount,
      currency: "XAF",
      channel: "cm.mobile",
      recipient: {
        account_number: phone.replace("+", ""),
        country: "CM",
        name,
      },
    };

    console.log("SIMPLE-PAYMENT-PAYLOAD ==>", payload);

    const response = await notchTransfer(METHOD.POST, "", payload);

    if (!response.ok) {
      throw new Error(
        `Process transfer failed: ${response.status} ${await response.text()}`
      );
    }
    const transfer = (await response.json()) as TransferResponse;
    console.log("Transfer created:", transfer);
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
    const response = await notchTransfer(METHOD.GET, transaction_id);

    if (!response.ok) {
      throw new Error(
        `Process transfer failed: ${response.status} ${await response.text()}`
      );
    }
    const transfer = (await response.json()) as TransferResponse;
    console.log("Transfer checked:", transfer);
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
    const response = await notchTransfer(METHOD.GET, "");

    if (!response.ok) {
      throw new Error(
        `Process transfer failed: ${response.status} ${await response.text()}`
      );
    }
    const transfer = (await response.json()) as TransfersResponse;
    console.log("Transfers listed :", transfer);
    return transfer;
  } catch (error) {
    console.log("listing-transfers-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

//---------------------------------------
//-----------BENEFICIARY-----------------
//---------------------------------------

/**
 * Cette fonction permet de lister tout les beneficiaires pour envoyer des fonds chez un utilisateur...
 * @returns {Promise<PaymentBuildResponse | undefined>}
 */
export const listBeneficiaries = async (
  errorHandler?: WalletErrorHandler
): Promise<beneficiariesResponse | undefined> => {
  try {
    const response = await notchBeneficiary(METHOD.GET, "");

    if (!response.ok) {
      throw new Error(
        `Process beneficiary failed: ${
          response.status
        } ${await response.text()}`
      );
    }
    const beneficiary = (await response.json()) as beneficiariesResponse;
    console.log("Beneficiaries listed :", beneficiary);
    return beneficiary;
  } catch (error) {
    console.log("listing-beneficiary-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de recuperer un beneficiaire par son id.
 * @param {string} transaction_id C'est l'id de la transaction personnalisé...
 * @returns {Promise<PaymentBuildResponse | undefined>}
 */
export const getBeneficiary = async (
  transaction_id: string,
  errorHandler?: WalletErrorHandler
): Promise<beneficiaryResponse | undefined> => {
  try {
    const response = await notchBeneficiary(METHOD.GET, transaction_id);

    if (!response.ok) {
      throw new Error(
        `Process beneficiary failed: ${
          response.status
        } ${await response.text()}`
      );
    }
    const transfer = (await response.json()) as beneficiaryResponse;
    console.log("Beneficiary checked:", transfer);
    return transfer;
  } catch (error) {
    console.log("checking-beneficiary-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de mettre à jour un beneficiaire par son id.
 * @param {string} beneficiary_id C'est l'id de la transaction personnalisé...
 * @param {string} name C'est le nom de l'utilisateur...
 * @param {string} email C'est l'email de l'utilisateur...
 * @param {string} phone C'est le numero de telephone de l'utilisateur...
 * @returns {Promise<PaymentBuildResponse | undefined>}
 */
export const updateBeneficiary = async (
  beneficiary_id: string,
  name: string,
  email: string,
  phone: string,
  errorHandler?: WalletErrorHandler
): Promise<beneficiaryResponse | undefined> => {
  try {
    const payload: InitializeBeneficiaryPayload = {
      channel: "cm.mobile",
      name,
      email,
      account_number: phone.replace("+", ""),
      country: "CM",
      description: `Create Beneficiary: ${name}`,
    };
    const response = await notchBeneficiary(
      METHOD.PUT,
      beneficiary_id,
      payload
    );

    if (!response.ok) {
      throw new Error(
        `Process beneficiary failed: ${
          response.status
        } ${await response.text()}`
      );
    }
    const transfer = (await response.json()) as beneficiaryResponse;
    console.log("Beneficiary checked:", transfer);
    return transfer;
  } catch (error) {
    console.log("checking-beneficiary-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};

/**
 * Cette fonction permet de mettre à jour un beneficiaire par son id.
 * @param {string} name C'est le nom de l'utilisateur...
 * @param {string} email C'est l'email de l'utilisateur...
 * @param {string} phone C'est le numero de telephone de l'utilisateur...
 * @returns {Promise<PaymentBuildResponse | undefined>}
 */
export const createBeneficiary = async (
  name: string,
  email: string,
  phone: string,
  method: string,
  errorHandler?: WalletErrorHandler
): Promise<beneficiaryResponse | undefined> => {
  try {
    const payload: InitializeBeneficiaryPayload = {
      channel: method || "cm.mobile",
      name,
      email,
      account_number: phone.replace("+", ""),
      description: `Create Beneficiary: ${name}`,
      country: "CM",
    };

    console.log("BENEFICIARY-PAYLOAD =>", payload);

    const response = await notchBeneficiary(METHOD.POST, "", payload);

    if (!response.ok) {
      throw new Error(
        `Process beneficiary failed: ${
          response.status
        } ${await response.text()}`
      );
    }
    const beneficiary = (await response.json()) as beneficiaryResponse;
    console.log("Beneficiary created:", beneficiary);
    return beneficiary;
  } catch (error) {
    console.log("creating-beneficiary-error =>", error);
    errorHandler && errorHandler(error as ApiError);
    return undefined;
  }
};
