import {
  createPayment,
  completePayment,
  listPayments,
  createTransfers,
  createBeneficiary,
  listTransfers,
} from "../config/notchpay.config";
import { Create } from "../database/create";
import { Fetch } from "../database/fetch";
import { Update } from "../database/update";
import { Delete } from "../database/delete";
import { ErrorHandler, WalletErrorHandler } from "../types/database.type";
import { METHOD_PAYMENT, RefillWalletType, UserWalletType } from "../types/wallet.type";
import {
  PaymentResponse,
  PaymentsResponse,
  TransfersResponse,
} from "notchpay-api";

export class WalletModel {
  protected name: string = "wallets";
  protected fetch: Fetch;
  protected createClass: Create;
  protected updateClass: Update;
  protected deleteClass: Delete;

  constructor() {
    this.fetch = new Fetch(this.name);
    this.createClass = new Create(this.name);
    this.updateClass = new Update(this.name);
    this.deleteClass = new Delete(this.name);
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

  async delete(
    user_id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | UserWalletType> {
    let isError: boolean = false;
    const data = (await this.deleteClass.DeleteByUid(user_id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserWalletType;

    if (isError) {
      return null;
    }
    return data;
  }

  async refill(
    email: string,
    toRefill: RefillWalletType,
    errorHandler?: WalletErrorHandler
  ) {
    let isError = false;
    const dataBuild = (await createPayment(
      email,
      toRefill.transaction_number,
      toRefill.amount,
      (error) => {
        isError = true;
        errorHandler && errorHandler(error);
      }
    )) as PaymentResponse;

    if (!isError) {
      setTimeout(async () => {
        await completePayment(
          dataBuild.transaction.reference,
          toRefill.service,
          toRefill.transaction_number,
          (error) => {
            isError = true;
            errorHandler && errorHandler(error);
          }
        );
      }, 5000);
      return dataBuild;
    }
    return undefined;
  }

  async withdraw(
    beneficiary_id: string,
    amount: number,
    errorHandler?: WalletErrorHandler
  ) {
    let isError = false;
    const data = await createTransfers(beneficiary_id, amount, (error) => {
      isError = true;
      errorHandler && errorHandler(error);
    });
    if (!isError) {
      return data;
    }
    return undefined;
  }

  async createBeneficiary(
    name: string,
    email: string,
    phone: string,
    method : METHOD_PAYMENT,
    errorHandler?: WalletErrorHandler
  ) {
    let isError = false;
    const data = await createBeneficiary(name, email, phone,method, (error) => {
      isError = true;
      errorHandler && errorHandler(error);
    });
    if (!isError) {
      return data;
    }
    return undefined;
  }

  async refillList(errorHandler?: WalletErrorHandler) {
    let isError = false;
    const dataBuild = (await listPayments((error) => {
      isError = true;
      errorHandler && errorHandler(error);
    })) as PaymentsResponse;

    if (!isError) return dataBuild;
    return undefined;
  }

  async withdrawList(errorHandler?: WalletErrorHandler) {
    let isError = false;
    const dataBuild = (await listTransfers((error) => {
      isError = true;
      errorHandler && errorHandler(error);
    })) as TransfersResponse;

    if (!isError) return dataBuild;
    return undefined;
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
