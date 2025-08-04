import { PostgrestError, User } from "@supabase/supabase-js";
import {
  collectFromUserAccount,
  refundToUserAccountFromTransactionId,
  sendFundsToUserAccount,
} from "../config/wallet.config";
import { Create } from "../database/create";
import { Fetch } from "../database/fetch";
import { Update } from "../database/update";
import {
  ErrorHandler,
  MesombError,
  MesombErrorHandler,
} from "../types/database.type";
import { RefillWalletType, UserWalletType } from "../types/wallet.type";

export class WalletModel {
  protected name: string = "wallets";
  protected fetch: Fetch;
  protected createClass: Create;
  protected updateClass: Update;

  constructor() {
    this.fetch = new Fetch(this.name);
    this.createClass = new Create(this.name);
    this.updateClass = new Update(this.name);
  }

  async getAll(errorHandler?: ErrorHandler): Promise<null | UserWalletType[]> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAll((error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserWalletType[];

    if (isError) {
      return null;
    }
    return data;
  }

  async create(
    walletForm: Partial<UserWalletType>,
    errorHandler?: ErrorHandler
  ): Promise<UserWalletType | null> {
    let isError: boolean = false;
    const data = (await this.createClass.upsert(walletForm, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserWalletType;

    if (isError) {
      return null;
    }
    return data;
  }

  async update(
    walletForm: UserWalletType,
    errorHandler?: ErrorHandler
  ): Promise<UserWalletType | null> {
    let isError: boolean = false;
    const data = (await this.updateClass.UpdateById(
      String(walletForm.id),
      walletForm,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as UserWalletType;

    if (isError) {
      return null;
    }
    return data;
  }

  async refill(
    transaction_id: string,
    toRefill: RefillWalletType,
    errorHandler?: MesombErrorHandler
  ) {
    try {
      const data = await collectFromUserAccount(
        toRefill.transaction_number,
        toRefill.amount,
        toRefill.service,
        transaction_id
      );

      return data;
    } catch (error) {
      errorHandler && errorHandler(error as MesombError);
    }
  }

  async withdraw(
    transaction_id: string,
    toRefill: RefillWalletType,
    errorHandler?: MesombErrorHandler
  ) {
    try {
      const data = await sendFundsToUserAccount(
        toRefill.transaction_number,
        toRefill.amount,
        toRefill.service,
        transaction_id
      );

      return data;
    } catch (error) {
      errorHandler && errorHandler(error as MesombError);
    }
  }

  async refund(transaction_id: string, errorHandler?: MesombErrorHandler) {
    try {
      const data = await refundToUserAccountFromTransactionId(transaction_id);

      return data;
    } catch (error) {
      errorHandler && errorHandler(error as MesombError);
    }
  }
  async finalizeRefill(
    toRefill: RefillWalletType,
    errorHandler?: ErrorHandler
  ) {}

  async finalizeWithdraw(
    toRefill: RefillWalletType,
    errorHandler?: ErrorHandler
  ) {}

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

  async getByUid(uid: string, errorHandler?: ErrorHandler) {
    let isError: boolean = false;
    const data = (await this.fetch.GetByUid(uid, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserWalletType;

    if (isError) {
      return null;
    }

    return data;
  }
}
