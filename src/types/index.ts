export interface OtpFormType {
  email: string;
  state?: "register" | "login" | "reset";
  otp: string;
}

export interface OtpType extends OtpFormType {
  created_at: string;
}

export interface UserVerificationCredentials extends OtpFormType {
  password: string;
}
