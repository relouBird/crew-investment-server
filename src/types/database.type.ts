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

export type ErrorHandler = (error: PostgrestError | null) => void;
export type MesombErrorHandler = (error: MesombError | null) => void;
export type AuthErrorHandler = (error: AuthError | null) => void;
