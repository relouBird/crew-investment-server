import { User } from "@supabase/supabase-js";
import { Fetch } from "../database/fetch";
import { DatabaseUser } from "../database/user";
import { AuthErrorHandler, ErrorHandler } from "../types/database.type";
import {
  AuthData,
  Credentials,
  UserRegisterCredentials,
} from "../types/user.type";

export class UserModel {
  protected name: string = "users";
  protected fetch: Fetch;
  protected user: DatabaseUser;

  constructor() {
    this.fetch = new Fetch(this.name);
    this.user = new DatabaseUser(this.name);
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

  /*
  Lire la documentation sur la classe de la base données User
  */
  async create(
    credentials: UserRegisterCredentials,
    errorHandler?: AuthErrorHandler
  ): Promise<null | AuthData> {
    let isError = false;
    const data = this.user.create(credentials, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
    });
    if (!isError) {
      return data;
    }
    return null;
  }

  /*
  Lire la documentation sur la classe de la base données User
  */
  async signIn(
    credentials: Credentials,
    errorHandler?: AuthErrorHandler
  ): Promise<null | AuthData> {
    let isError = false;
    const data = await this.user.signIn(credentials, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
    });
    if (!isError) {
      return data;
    }
    return null;
  }

  /*
  Lire la documentation sur la classe de la bd User
  */
  async get(
    access_token: string,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    let isError = false;
    const data = await this.user.get(access_token, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
    });
    if (!isError) {
      return data;
    }
    return null;
  }

  /*
  Lire la documentation sur la classe de la bd User
  */
  async getByEmail(
    email: string,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    let isError = false;
    const data = await this.user.getUser(email, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
    });
    if (!isError) {
      return data;
    }
    return null;
  }

  async reset(email: string, errorHandler?: AuthErrorHandler) {
    let isError: boolean = false;
    const data = await this.user.resetPassword(email, (error) => {
      errorHandler && errorHandler(error);
      console.log("error-reset-password =>", error?.message);
      isError = true;
    });

    if (!isError) {
      console.log(data);
      return true;
    }
    return false;
  }

  async changePassword(
    credentials: UserRegisterCredentials,
    errorHandler?: AuthErrorHandler
  ) {
    let isError: boolean = false;
    const data = await this.user.changePassword(credentials, (error) => {
      errorHandler && errorHandler(error);
      console.log("error-change-password =>", error?.message);
      isError = true;
    });

    if (isError) {
      return null;
    }
    return data;
  }
}
