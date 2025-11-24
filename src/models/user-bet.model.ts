import { Create } from "../database/create";
import { Delete } from "../database/delete";
import { Fetch } from "../database/fetch";
import { Update } from "../database/update";
import { UserBetInterfaceModel } from "../types/bet.type";
import { ErrorHandler } from "../types/database.type";

export class UserBetModel {
  protected name: string = "user-bets";
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
  ): Promise<null | UserBetInterfaceModel[]> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAll((error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserBetInterfaceModel[];

    if (!isError) {
      return data;
    }
    return null;
  }

  async create(
    betForm: UserBetInterfaceModel,
    errorHandler?: ErrorHandler
  ): Promise<UserBetInterfaceModel | null> {
    let isError: boolean = false;
    const data = (await this.createClass.upsert(betForm, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserBetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async update(
    betForm: UserBetInterfaceModel,
    errorHandler?: ErrorHandler
  ): Promise<UserBetInterfaceModel | null> {
    let isError: boolean = false;
    const data = (await this.updateClass.UpdateById(
      String(betForm.id),
      betForm,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as UserBetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async delete(
    user_id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | UserBetInterfaceModel> {
    let isError: boolean = false;
    const data = (await this.deleteClass.DeleteById(user_id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserBetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async getById(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | UserBetInterfaceModel> {
    let isError: boolean = false;
    const data = (await this.fetch.GetById(id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserBetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async getByUid(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | UserBetInterfaceModel> {
    let isError: boolean = false;
    const data = (await this.fetch.GetByUid(id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as UserBetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }
}
