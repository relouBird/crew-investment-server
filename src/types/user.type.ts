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

