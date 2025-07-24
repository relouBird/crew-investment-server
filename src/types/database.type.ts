import { AuthError, PostgrestError } from "@supabase/supabase-js";

export type ErrorHandler = (error: PostgrestError | null) => void;
export type AuthErrorHandler = (error: AuthError | null) => void;