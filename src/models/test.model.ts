import { Create } from "../database/create";
import { Fetch } from "../database/fetch";
import { ErrorHandler } from "../types/database.type";

export class TestModel {
  protected name: string = "test";
  protected fetch: Fetch;

  constructor() {
    this.fetch = new Fetch(this.name);
  }

  async getAll(errorHandler?: ErrorHandler): Promise<null | any[]> {
    let isError: boolean = false;
    const data = await this.fetch.GetAll((error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    });

    if (isError) {
      return null;
    }
    return data;
  }

  async getById(id: string, errorHandler?: ErrorHandler): Promise<null | any> {
    let isError: boolean = false;
    const data = await this.fetch.GetById(id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    });

    if (isError) {
      return null;
    }
    return data;
  }
}
