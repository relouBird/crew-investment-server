import { Create } from "../database/create";
import { Delete } from "../database/delete";
import { Fetch } from "../database/fetch";
import { Update } from "../database/update";
import { BetInterfaceModel } from "../types/bet.type";
import { ApiFootballErrorHandler, ErrorHandler } from "../types/database.type";
import {
  getAllCompetitions,
  getAllMatchCompetitions,
  getAllTeamsCompetitions,
  getMatchById,
} from "../config/bet-api.config";
import {
  ApiFootballCompetitionResponse,
  ApiFootballMatchResponse,
  ApiFootballTeamsResponse,
  CompetitionModel,
  MatchModel,
  TeamModel,
} from "../types/api-bet.type";

export class BetModel {
  protected name: string = "bets";
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
  ): Promise<null | BetInterfaceModel[]> {
    let isError: boolean = false;
    const data = (await this.fetch.GetAll((error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as BetInterfaceModel[];

    if (isError) {
      return null;
    }
    return data;
  }

  async create(
    walletForm: Partial<BetInterfaceModel>,
    errorHandler?: ErrorHandler
  ): Promise<BetInterfaceModel | null> {
    let isError: boolean = false;
    const data = (await this.createClass.upsert(walletForm, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as BetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async update(
    walletForm: BetInterfaceModel,
    errorHandler?: ErrorHandler
  ): Promise<BetInterfaceModel | null> {
    let isError: boolean = false;
    const data = (await this.updateClass.UpdateById(
      String((walletForm as any).id),
      walletForm,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as BetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async delete(
    user_id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | BetInterfaceModel> {
    let isError: boolean = false;
    const data = (await this.deleteClass.DeleteByUid(user_id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as BetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async getById(
    id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | BetInterfaceModel> {
    let isError: boolean = false;
    const data = (await this.fetch.GetById(id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as BetInterfaceModel;

    if (isError) {
      return null;
    }
    return data;
  }

  async getAllCompetitions(
    errorHandler?: ApiFootballErrorHandler
  ): Promise<null | CompetitionModel[]> {
    let isError = false;
    const datas = (await getAllCompetitions((error) => {
      isError = true;
      errorHandler && errorHandler(error);
    })) as ApiFootballCompetitionResponse;

    if (!isError) {
      return datas.competitions;
    }
    return null;
  }

  async getAllMatchCompetitions(
    id: string,
    errorHandler?: ApiFootballErrorHandler
  ): Promise<null | MatchModel[]> {
    let isError = false;
    const datas = (await getAllMatchCompetitions(id, (error) => {
      isError = true;
      errorHandler && errorHandler(error);
    })) as ApiFootballMatchResponse;

    if (!isError) {
      return datas.matches;
    }
    return null;
  }

  async getAllTeamCompetitions(
    id: string,
    errorHandler?: ApiFootballErrorHandler
  ): Promise<null | TeamModel[]> {
    let isError = false;
    const datas = (await getAllTeamsCompetitions(id, (error) => {
      isError = true;
      errorHandler && errorHandler(error);
    })) as ApiFootballTeamsResponse;

    if (!isError) {
      return datas.teams;
    }
    return null;
  }

  async getMatchById(
    id: string,
    errorHandler?: ApiFootballErrorHandler
  ): Promise<null | MatchModel> {
    let isError = false;
    const datas = (await getMatchById(id, (error) => {
      isError = true;
      errorHandler && errorHandler(error);
    })) as MatchModel;

    if (!isError) {
      return datas;
    }
    return null;
  }
}
