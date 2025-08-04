export type PAYMENT_METHOD = "MTN" | "ORANGE";

export interface TransactionType {
  pk: string;
  status: "SUCCESS" | "FAILED" | "PENDING"; // selon tes cas possibles
  type: "COLLECT" | "PAYMENT" | "TRANSFER"; // adapte selon tes types possibles
  amount: number;
  fees: number;
  b_party: string;
  message: string;
  service: PAYMENT_METHOD; // adapte selon les services possibles
  reference: string;
  ts: string; // ou Date si tu veux parser la date
  direction: 1 | -1;
  country: "CM" | string;
  currency: string;
  trxamount: number;
  fin_trx_id: string;
  name: string;
}

export interface UserWalletType {
  id: number;
  uid: string;
  funds: number;
  created_at: string;
}

export interface RefillWalletType {
  transaction_number: string;
  service: PAYMENT_METHOD;
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
