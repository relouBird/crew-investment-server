import { PostgrestError } from "@supabase/supabase-js";
import { gmail_transporter, transporter } from "../config/email.config";
import { collectFromUserAccount } from "../config/wallet.config";
import { Create } from "../database/create";
import { Fetch } from "../database/fetch";
import { Update } from "../database/update";
import {
  GenerateFailEmail,
  GenerateThanksEmail,
} from "../helpers/utils.helper";
import { UserVerificationCredentials } from "../types";
import { ErrorHandler } from "../types/database.type";
import {
  RefillWalletType,
  UserWalletTransaction,
  UserWalletType,
} from "../types/wallet.type";

export class TransactionModel {
  protected name: string = "wallets-transactions";
  protected fetch: Fetch;
  protected createClass: Create;
  protected updateClass: Update;

  constructor() {
    this.fetch = new Fetch(this.name);
    this.createClass = new Create(this.name);
    this.updateClass = new Update(this.name);
  }

  async getAll(
    errorHandler?: ErrorHandler
  ): Promise<null | UserWalletTransaction[]> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAll((error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserWalletTransaction[];

    if (isError) {
      return null;
    }
    return data;
  }

  async create(
    transactionForm: Partial<UserWalletTransaction>,
    errorHandler?: ErrorHandler
  ): Promise<UserWalletTransaction | null> {
    let isError: boolean = false;
    const data = (await this.createClass.upsert(transactionForm, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserWalletTransaction;

    if (isError) {
      return null;
    }
    return data;
  }

  async update(
    walletForm: UserWalletTransaction,
    errorHandler?: ErrorHandler
  ): Promise<UserWalletTransaction | null> {
    let isError: boolean = false;
    const data = (await this.updateClass.UpdateById(
      String(walletForm.id),
      walletForm,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as UserWalletTransaction;

    if (isError) {
      return null;
    }
    return data;
  }

  async thanksConfirmationMail(
    funds_added: number,
    email: string,
    transaction_id: string
  ) {
    try {
      // Envoyer l’email OTP EN DEVVVVV
      await transporter.sendMail({
        from: "noreply@investia.com",
        to: email,
        subject: "Compte Rechargé avec Succès...",
        html: GenerateThanksEmail(funds_added, transaction_id)
      });

      //   // Envoyer l’email OTP EN PROD AVEC GMAIL
      //   const data = await gmail_transporter.sendMail({
      //     from: "noreply@investia.com",
      //     to: email,
      //     subject: "Compte Rechargé avec Succès...",
      //     html: GenerateThanksEmail(funds_added, transaction_id, true),
      //   });

      //   console.log("Email envoyé:", data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async failConfirmationMail(email: string, transaction_id: string) {
    try {
      // Envoyer l’email OTP EN DEVVVVV
      await transporter.sendMail({
        from: "noreply@investia.com",
        to: email,
        subject: "Echec de la transaction...",
        html: GenerateFailEmail(transaction_id, false),
      });

        // // Envoyer l’email OTP EN DEVVVVV
        // const data = await gmail_transporter.sendMail({
        //   from: "noreply@investia.com",
        //   to: email,
        //   subject: "Echec de la transaction...",
        //   html: GenerateFailEmail(transaction_id, true),
        // });

      //   console.log("Email envoyé:", data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async getById(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | UserWalletType> {
    let isError: boolean = false;
    const data = (await this.fetch.GetById(id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserWalletType;

    if (isError) {
      return null;
    }
    return data;
  }

  async getByTransactionID(
    uid: string,
    errorHandler?: ErrorHandler
  ): Promise<UserWalletTransaction | null> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAllByParameter(
      "transaction_id",
      uid,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as UserWalletTransaction[];

    if (isError) {
      return null;
    }

    return data[0];
  }
}
