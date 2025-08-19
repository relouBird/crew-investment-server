export interface UserWalletType {
  id: number;
  uid: string;
  funds: number;
  created_at: string;
}

export interface RefillWalletType {
  transaction_number: string;
  service: METHOD_PAYMENT;
  amount: number;
}

export interface UserWalletTransaction {
  id: number;
  transaction_id: string;
  creator_id: string;
  amount: number;
  type: "deposit" | "withdrawal" | "transfer";
  status: "done" | "pending" | "failed";
  created_at: string | Date;
}

export type TransactionState = "done" | "pending" | "failed";

//------------------------------------------------------
//---------------------NOTCH pAY------------------------
//------------------------------------------------------

export type METHOD_PAYMENT = "cm.mtn" | "cm.orange";

export interface CancelResponse {
  code: number;
  message: string;
}

// Typage pour les methodes
export type METHOD_REQUEST = "GET" | "POST" | "PUT" | "DELETE";
