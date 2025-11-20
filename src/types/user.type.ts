import {
  User,
  Session,
  Subscription,
  UserMetadata,
} from "@supabase/supabase-js";

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
  type: string;
}

export interface SignInCredentials {
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

export interface UserSimpleCredentials {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: typeof USER_TYPE;
  country: string;
  password?: string;
}

export interface UserMetadataExtend extends UserMetadata {
  [key: string]: any;
  balance: number;
  totalInvested: number;
  profitLoss: number;
}

export interface UserInvest extends User {
  user_metadata: UserMetadataExtend;
}

export const USER_TYPE = {
  ADMIN: "admin",
  GUEST: "guest",
};

export enum USER_STATUS {
  ACTIVE = "Actif",
  INACTIVE = "Inactif",
  SUSPEND = "Suspendu",
  AWAITING = "En attente",
}
