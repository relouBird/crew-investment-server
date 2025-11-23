import { Create } from "../database/create";
import { Delete } from "../database/delete";
import { Fetch } from "../database/fetch";
import { Update } from "../database/update";
import {
  BetInterfaceModel,
  BetInterfaceModelDatabase,
} from "../types/bet.type";
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
    })) as BetInterfaceModelDatabase[];

    if (!isError) {
      let datas: BetInterfaceModel[] = [];
      data.forEach((bet) => {
        datas.push({
          ...bet,
          homeTeam: JSON.parse(bet.homeTeam),
          awayTeam: JSON.parse(bet.awayTeam),
        });
      });

      return datas;
    }
    return null;
  }

  async create(
    betForm: BetInterfaceModel,
    errorHandler?: ErrorHandler
  ): Promise<BetInterfaceModel | null> {
    let isError: boolean = false;
    let betToCreate: BetInterfaceModelDatabase = {
      ...betForm,
      homeTeam: JSON.stringify(betForm.homeTeam),
      awayTeam: JSON.stringify(betForm.awayTeam),
    };
    const data = (await this.createClass.upsert(betToCreate, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as BetInterfaceModelDatabase;

    if (isError) {
      return null;
    }
    return {
      ...data,
      homeTeam: JSON.parse(data.homeTeam),
      awayTeam: JSON.parse(data.awayTeam),
    };
  }

  async update(
    betForm: BetInterfaceModel,
    errorHandler?: ErrorHandler
  ): Promise<BetInterfaceModel | null> {
    let isError: boolean = false;
    let betData: BetInterfaceModelDatabase = {
      ...betForm,
      homeTeam: JSON.stringify(betForm.homeTeam),
      awayTeam: JSON.stringify(betForm.awayTeam),
    };
    const data = (await this.updateClass.UpdateById(
      String(betData.id),
      betData,
      (error) => {
        errorHandler && errorHandler(error);
        isError = true;
        console.log(`${this.name}-error => ${error}`);
      }
    )) as BetInterfaceModelDatabase;

    if (isError) {
      return null;
    }
    return {
      ...data,
      homeTeam: JSON.parse(data.homeTeam),
      awayTeam: JSON.parse(data.awayTeam),
    };
  }

  async delete(
    user_id: string,
    errorHandler?: ErrorHandler
  ): Promise<null | BetInterfaceModel> {
    let isError: boolean = false;
    const data = (await this.deleteClass.DeleteById(user_id, (error) => {
      errorHandler && errorHandler(error);
      isError = true;
      console.log(`${this.name}-error => ${error}`);
    })) as BetInterfaceModelDatabase;

    if (isError) {
      return null;
    }
    return {
      ...data,
      homeTeam: JSON.parse(data.homeTeam),
      awayTeam: JSON.parse(data.awayTeam),
    };
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
    })) as BetInterfaceModelDatabase;

    if (isError) {
      return null;
    }
    return {
      ...data,
      homeTeam: JSON.parse(data.homeTeam),
      awayTeam: JSON.parse(data.awayTeam),
    };
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
