import { AuthError, PostgrestError } from "@supabase/supabase-js";

export interface MesombError {
  detail: string;
  code:
    | "subscriber-internal-error"
    | "subscriber-insufficient-balance"
    | "subscriber-not-found"
    | "invalid-amount"
    | "subscriber-invalid-max-amount"
    | "subscriber-invalid-secret-code"
    | "subscriber-timeout"
    | "subscriber-withdrawal-failed"
    | "subscriber-invalid-min-amount"
    | "subscriber-invalid-length"
    | "subscriber-limit-reached"
    | "generic-error"
    | "unknown-issue"
    | "provider-second-number-not-found"
    | "provider-application-problem";
  support: string;
}

export type ApiError = {
  status: number; // code HTTP : 400, 401, 404, 500...
  code: string; // code interne ex: "invalid_currency", "auth_failed"
  message: string; // description lisible de l’erreur
  details?: Record<string, any>; // infos optionnelles (ex: champ en erreur)
};

export type ErrorHandler = (error: PostgrestError | null) => void;
export type MesombErrorHandler = (error: MesombError | null) => void;
export type AuthErrorHandler = (error: AuthError | null) => void;
export type WalletErrorHandler = (error: ApiError) => void;
