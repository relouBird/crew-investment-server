import { checkPayment, checkTransfers } from "../config/notchpay.config";
import { PaymentResponse, TransferResponse } from "notchpay-api";
import { Create } from "../database/create";
import { Fetch } from "../database/fetch";
import { Update } from "../database/update";
import {
  GenerateFailEmail,
  GenerateThanksEmail,
} from "../helpers/utils.helper";
import { ErrorHandler, WalletErrorHandler } from "../types/database.type";
import {
  TransactionState,
  UserWalletTransaction,
  UserWalletType,
} from "../types/wallet.type";
import { Delete } from "../database/delete";

export class TransactionModel {
  protected name: string = "wallets-transactions";
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
    transactionForm: UserWalletTransaction,
    errorHandler?: ErrorHandler
  ): Promise<UserWalletTransaction | null> {
    let isError: boolean = false;
    const data = (await this.updateClass.UpdateById(
      String(transactionForm.id),
      transactionForm,
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

      //   console.log("Email envoyé:", data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async failConfirmationMail(email: string, transaction_id: string) {
    try {

      //   console.log("Email envoyé:", data);
    } catch (error) {
      console.error("Erreur:", error);
    }
  }

  async checkPayment(
    transaction_id: string,
    errorHandler?: WalletErrorHandler
  ) {
    let isError: boolean = false;
    const data = await checkPayment(transaction_id, (error) => {
      isError = true;
      errorHandler && errorHandler(error);
    });

    if (data && !isError) return data;
    return null;
  }

  async checkTransfer(
    transaction_id: string,
    errorHandler?: WalletErrorHandler
  ) {
    let isError: boolean = false;
    const data = await checkTransfers(transaction_id, (error) => {
      isError = true;
      errorHandler && errorHandler(error);
    });

    if (data && !isError) return data;
    return null;
  }

  async checkListPayment(
    transaction_id_list: string[],
    errorHandler?: WalletErrorHandler
  ) {
    const paymentsResponseList: PaymentResponse[] = [];
    for (let i = 0; i < transaction_id_list.length; i++) {
      let transaction_id = transaction_id_list[i];
      let isError: boolean = false;
      const data = await checkPayment(transaction_id, (error) => {
        isError = true;
        errorHandler && errorHandler(error);
      });

      if (data && !isError) paymentsResponseList.push(data);
    }

    return paymentsResponseList;
  }

  async checkListTransfers(
    transaction_id_list: string[],
    errorHandler?: WalletErrorHandler
  ) {
    const transfersResponseList: TransferResponse[] = [];
    for (let i = 0; i < transaction_id_list.length; i++) {
      let transaction_id = transaction_id_list[i];
      let isError: boolean = false;
      const data = await checkTransfers(transaction_id, (error) => {
        isError = true;
        errorHandler && errorHandler(error);
      });

      if (data && !isError) transfersResponseList.push(data);
    }

    return transfersResponseList;
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

  async delete(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | UserWalletType> {
    let isError: boolean = false;
    const data = (await this.deleteClass.DeleteById(id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserWalletType;

    if (isError) {
      return null;
    }
    return data;
  }

  async getManyByState(
    state: TransactionState,
    errorHandler?: ErrorHandler
  ): Promise<UserWalletTransaction[] | null> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAllByParameter(
      "status",
      state,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as UserWalletTransaction[];

    if (isError) {
      return null;
    }

    return data;
  }

  async getManyByUuid(
    user_id: string,
    errorHandler?: ErrorHandler
  ): Promise<UserWalletTransaction[] | null> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAllByParameter(
      "creator_id",
      user_id,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as UserWalletTransaction[];

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
