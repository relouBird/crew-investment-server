import { User, Session, Subscription } from "@supabase/supabase-js";

export type AuthData = {
  user: User;
  session: Session;
};

export type SubscriptionObject = {
  subscription: Subscription;
};

export interface Credentials {
  email: string;
  password: string;
}

export interface UserRegisterCredentials extends Credentials {
  password_confirmation: string;
}

export interface changeUserPasswordType {
  password: string;
  new_password: string;
  confirm_new_password: string;
}
