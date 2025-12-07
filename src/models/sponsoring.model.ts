import { Create } from "../database/create";
import { Delete } from "../database/delete";
import { Fetch } from "../database/fetch";
import { Update } from "../database/update";
import { ErrorHandler } from "../types/database.type";
import { SponsoringInterfaceModel } from "../types/sponsoring.type";

export class SponsoringModel {
  protected name: string = "sponsoring";
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
  ): Promise<null | SponsoringInterfaceModel[]> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAll((error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as SponsoringInterfaceModel[];

    if (!isError) {
      return data;
    }
    return null;
  }

  async create(
    betForm: SponsoringInterfaceModel,
    errorHandler?: ErrorHandler
  ): Promise<SponsoringInterfaceModel | null> {
    let isError: boolean = false;
    const data = (await this.createClass.upsert(betForm, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as SponsoringInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async update(
    betForm: SponsoringInterfaceModel,
    errorHandler?: ErrorHandler
  ): Promise<SponsoringInterfaceModel | null> {
    let isError: boolean = false;
    const data = (await this.updateClass.UpdateById(
      String(betForm.id),
      betForm,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as SponsoringInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async delete(
    user_id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | SponsoringInterfaceModel> {
    let isError: boolean = false;
    const data = (await this.deleteClass.DeleteById(user_id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as SponsoringInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async getById(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | SponsoringInterfaceModel> {
    let isError: boolean = false;
    const data = (await this.fetch.GetById(id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as SponsoringInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async getBySponsorId(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | SponsoringInterfaceModel[]> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAllByParameter("sponsor_id", id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as SponsoringInterfaceModel[];

    if (isError) {
      return null;
    }
    return data;
  }
}
