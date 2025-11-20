import { GoTrueAdminApi, User, UserMetadata } from "@supabase/supabase-js";
import SupabaseConfig from "../config/database.config";
import { AuthErrorHandler } from "../types/database.type";

import {
  AuthData,
  Credentials,
  SignInCredentials,
  SubscriptionObject,
  USER_STATUS,
  USER_TYPE,
  UserRegisterCredentials,
  UserSimpleCredentials,
} from "../types/user.type";
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";

export class DatabaseUser {
  protected name: string = "";
  protected auth: SupabaseAuthClient;
  protected auth_admin: GoTrueAdminApi;

  /**
   * @param {string} table_name - ceci est le nom de la table...
   */
  constructor(table_name: string) {
    this.auth = SupabaseConfig.auth;
    this.auth_admin = SupabaseConfig.auth.admin;
    this.name = table_name;
  }

  /**
   * Cette fonction permet d'attendre selon un contexte et effectuer une fonction
   */
  async waitChangeState(
    callback: () => Promise<void>
  ): Promise<SubscriptionObject> {
    const { data } = this.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        await callback();
      }
    });
    return data;
  }

  /**
   * Cette fonction permet de recuperer un utilisateur en fonction de access token
   * @param {string} access_token
   * @param {AuthErrorHandler | undefined} errorHandler
   * @returns {Promise<null | User>}
   */
  async get(
    access_token: string,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    const {
      data: { user },
      error,
    } = await this.auth.getUser(access_token);

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return user;
  }

  /**
   * Cette fonction permet de recuperer un user en fonction de son Email...
   * @param {string} email - L'email de l'utilisateur....
   * @param {AuthErrorHandler | undefined} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | User>}
   */
  async getUser(
    email: string,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    const {
      data: { users },
      error,
    } = await this.auth_admin.listUsers();

    if (error) {
      errorHandler && errorHandler(error);
      console.log("get-user-error =>", error.message);
      return null;
    } else {
      let dataToReturn: User | null = null;
      for (let i = 0; i < users.length; i++) {
        let partialUser = users[i];
        if (partialUser.email == email) {
          dataToReturn = partialUser;
        }
      }
      return dataToReturn;
    }
  }

  /**
   * Cette fonction permet de creer un Utilisateur
   * @param {UserLoginCredentials} credentials - ce sont les données de l'utilisateurs
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | AuthData>}
   */
  async create(
    credentials: UserRegisterCredentials,
    errorHandler?: AuthErrorHandler
  ): Promise<null | AuthData> {
    const rand = Math.round(Math.random() * 100000);
    const { data, error } = await this.auth_admin.createUser({
      email: credentials.email,
      password: credentials.password,
      user_metadata: {
        firstName: "User",
        lastName: rand,
        generatedId: "USR" + rand,
        email: credentials.email,
        phone: "",
        type: credentials.type,
        status: USER_STATUS.AWAITING,
        country: "",
        notifications: {
          email: true,
          push: true,
          betResults: true,
          promotions: false,
        },
        twoFactorEnabled: false,
      },
      email_confirm: true,
      phone_confirm: true,
    });

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data as AuthData;
  }

  /**
   * Cette Fonction permet de se connecter à un utilisateur
   * @param {SignInCredentials} credentials - ce sont les données de l'utilisateurs
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | AuthData>}
   */
  async signIn(
    credentials: SignInCredentials,
    errorHandler?: AuthErrorHandler
  ): Promise<null | AuthData> {
    const { data, error: signInError } = await this.auth.signInWithPassword({
      email: credentials.email ?? "default@gmail.com",
      password: credentials.password,
    });

    let user = await this.getUser(credentials.email ?? "default@gmail.com");

    const { data: userData, error: updateError } =
      await this.auth_admin.updateUserById(user?.id ?? "", {
        user_metadata: {
          status: USER_STATUS.ACTIVE,
        },
      });

    if (signInError || updateError) {
      errorHandler && errorHandler(signInError ?? updateError);
      return null;
    }

    return data as AuthData;
  }

  /**
   * Cette Fonction permet de se connecter à un utilisateur
   * @param {SignInCredentials} credentials - ce sont les données de l'utilisateurs
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {boolean}
   */
  async signOut(
    email: string,
    token: string,
    errorHandler?: AuthErrorHandler
  ): Promise<boolean> {
    let user = await this.getUser(email ?? "default@gmail.com");

    const { error: signInError } = await this.auth_admin.signOut(token);

    const { error: updateError } = await this.auth_admin.updateUserById(
      user?.id ?? "",
      {
        user_metadata: {
          status: USER_STATUS.INACTIVE,
        },
      }
    );

    if (signInError || updateError) {
      errorHandler && errorHandler(signInError ?? updateError);
      return false;
    }

    return true;
  }

  /**
   * Cette Fonction permet de reset le password d'un utilisateur
   * @param {string} email - c'est l'email de l'utilisateur qu'on souhaite modifier...
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | Object>}
   */
  async resetPassword(
    email: string,
    errorHandler?: AuthErrorHandler
  ): Promise<null | object> {
    const { data, error } = await this.auth.resetPasswordForEmail(email);

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }
    return data;
  }

  /**
   * Cette Fonction permet de set la session en cours..
   * @param {Object} sessionInfos - ce sont les informations liées au token...
   */
  async setSession(sessionInfos: {
    access_token: string;
    refresh_token: string;
  }) {
    await this.auth.setSession(sessionInfos);
  }

  /**
   * Cette Fonction permet de changer le password d'un utilisateur
   * @param {UserRegisterCredentials} credentials - Le nouveau mot de passe de l'utilisateur....
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | User>}
   */
  async changePassword(
    credentials: UserRegisterCredentials,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    let user = await this.getUser(credentials.email);
    const { data, error } = await this.auth_admin.updateUserById(
      user?.id ?? "",
      {
        password: credentials.password,
      }
    );
    if (error) {
      console.log(
        "There was an error updating your password =>",
        error.message
      );
      errorHandler && errorHandler(error);
      return null;
    }

    console.log("Password updated successfully =>", data);
    return data.user;
  }

  /**
   * Cette Fonction permet de mettre à jour les données d'un utilisateur
   * @param {UserMetadata} user_data - Les meta données de l'utilisateur....
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | User>}
   */
  async updateUserData(
    user_data: UserMetadata,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    let user = await this.getUser(user_data.email as string);
    const { data, error } = await this.auth_admin.updateUserById(
      user?.id ?? "",
      {
        phone: user_data.phone && user_data.phone != "" && user_data.phone,
        user_metadata: { ...user_data },
      }
    );
    if (error) {
      console.log(
        "There was an error updating your password =>",
        error.message
      );
      errorHandler && errorHandler(error);
      return null;
    }

    console.log("Password updated successfully =>", data);
    return data.user;
  }

  /**
   * Cette Fonction permet de mettre à jour les données d'un utilisateur
   * @param {string} email - L'email de l'utilisateur....
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | User>}
   */
  async delete(
    email: string,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    let user = await this.getUser(email);
    const { data, error } = await this.auth_admin.deleteUser(user?.id ?? "");
    if (error) {
      console.log(
        "There was an error updating your password =>",
        error.message
      );
      errorHandler && errorHandler(error);
      return null;
    }

    console.log("Password updated successfully =>", data);
    return data.user;
  }

  /// --------------------------------------------------------------------------------------------
  /// ------------------Cette partie concerne les actions en tant que admin-----------------------
  /// --------------------------------------------------------------------------------------------

  /**
   * Cette fonction permet de recuperer les Utilisateurs comme Admin
   * @param {UserLoginCredentials} credentials - ce sont les données de l'utilisateurs
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<[] | User[]>}
   */
  async getAllAsAdmin(errorHandler?: AuthErrorHandler): Promise<[] | User[]> {
    const {
      data: { users },
      error,
    } = await this.auth_admin.listUsers();

    if (error) {
      errorHandler && errorHandler(error);
      return [];
    }

    return users;
  }

  /**
   * Cette fonction permet de recuperer un Utilisateur comme Admin
   * @param {string} id - c'est l'identifiant de l'utilisateurs
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | User>}
   */
  async getUserAsAdmin(
    id: string,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    const { data, error } = await this.auth_admin.getUserById(id);

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data.user;
  }

  /**
   * Cette fonction permet de creer un Utilisateur comme Admin
   * @param {UserLoginCredentials} credentials - ce sont les données de l'utilisateurs
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | AuthData>}
   */
  async createAsAdmin(
    credentials: UserSimpleCredentials,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    const rand = Math.round(Math.random() * 100000);
    const { data, error } = await this.auth_admin.createUser({
      email: credentials.email,
      password: credentials.firstName + credentials.lastName + "@123",
      user_metadata: {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        generatedId: "USR" + rand,
        email: credentials.email,
        phone: credentials.phone,
        type: USER_TYPE.GUEST,
        status: USER_STATUS.AWAITING,
        country: "",
        notifications: {
          email: true,
          push: true,
          betResults: true,
          promotions: false,
        },
        twoFactorEnabled: false,
      },
      email_confirm: true,
      phone_confirm: true,
    });

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }

    return data.user;
  }

  /**
   * Cette fonction permet de mettre à jour un Utilisateur comme Admin
   * @param {UserSimpleCredentials} credentials - ce sont les données de l'utilisateurs
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | AuthData>}
   */
  async updateAsAdmin(
    credentials: UserSimpleCredentials,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    const { data, error } = await this.auth_admin.updateUserById(
      credentials.id ?? "",
      {
        password: credentials.firstName + credentials.lastName + "@123",
        user_metadata: {
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          phone: credentials.phone,
        },
      }
    );

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }
    return data.user;
  }

  /**
   * Cette fonction permet de supprimer un Utilisateur comme Admin
   * @param {string} uid - ce sont les données de l'utilisateurs
   * @param {AuthErrorHandler} errorHandler  - ceci est la fonction qui prend en parametre l'erreur et qui permet de la gerer
   * @returns {Promise<null | User>}
   */
  async deleteAsAdmin(
    uid: string,
    errorHandler?: AuthErrorHandler
  ): Promise<null | User> {
    const { data, error } = await this.auth_admin.deleteUser(uid);

    if (error) {
      errorHandler && errorHandler(error);
      return null;
    }
    return data.user;
  }
}
