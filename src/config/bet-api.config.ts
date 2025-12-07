import { getDateRange } from "../helpers/bet-api.helper";
import {
  ApiFootballCompetitionResponse,
  ApiFootballErrorResponse,
  ApiFootballMatchResponse,
  ApiFootballTeamsResponse,
  MatchModel,
} from "../types/api-bet.type";
import { ApiFootballErrorHandler } from "../types/database.type";

// Set up your secrets
const BASE = "https://api.football-data.org/v4";
const API_KEY = process.env.FOOTBALL_API_KEY!;

// ceci permet de gerer les requetes...
const footballApiRequest = async (endpoint: string = "") => {
  const url = `${BASE}/${endpoint}`;
  console.log("GET / url =>", url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": `${API_KEY}`, // ta clé secrète
    },
  });
  return response;
};

//---------------------------------------
//--------------COMPETITIONS-------------
//---------------------------------------

/**
 * Cette fonction permet de recuperer toutes les competitions...
 * @param {ApiFootballErrorHandler} errorHandler c'est la fonction qui permet de gerer les erreurs...
 * @returns {Promise<ApiFootballCompetitionResponse | null>}
 */
export const getAllCompetitions = async (
  errorHandler?: ApiFootballErrorHandler
): Promise<ApiFootballCompetitionResponse | null> => {
  try {
    const response = await footballApiRequest("competitions");

    if (!response.ok) {
      console.log(
        `Get competitions failed: ${response.status} ${await response.text()}`
      );
      return null;
    }
    const competitions =
      (await response.json()) as ApiFootballCompetitionResponse;
    console.log("Competitions getted:", competitions);
    return competitions;
  } catch (error) {
    console.log("get-competitions-error =>", error);
    errorHandler && errorHandler(error as ApiFootballErrorResponse);
    return null;
  }
};

/**
 * Cette fonction permet de recuperer toutes les equipes d'une compétition...
 * @param {string} competitionId c'est l'id de la competition
 * @param {ApiFootballErrorHandler} errorHandler c'est la fonction qui permet de gerer les erreurs...
 * @returns {Promise<ApiFootballTeamsResponse | null>}
 */
export const getAllTeamsCompetitions = async (
  competitionId: string,
  errorHandler?: ApiFootballErrorHandler
): Promise<ApiFootballTeamsResponse | null> => {
  try {
    const response = await footballApiRequest(
      `competitions/${competitionId}/teams?season=2025`
    );

    if (!response.ok) {
      console.log(
        `Get matchs-competitions failed: ${response.status} ${await response.text()}`
      );
      return null;
    }
    const matches = (await response.json()) as ApiFootballTeamsResponse;
    console.log("Matchs getted:", matches);
    return matches;
  } catch (error) {
    console.log("get-matchs-error =>", error);
    errorHandler && errorHandler(error as ApiFootballErrorResponse);
    return null;
  }
};

/**
 * Cette fonction permet de recuperer tous les matchs d'une compétition...
 * @param {string} competitionId c'est l'id de la competition
 * @param {ApiFootballErrorHandler} errorHandler c'est la fonction qui permet de gerer les erreurs...
 * @returns {Promise<ApiFootballMatchResponse | null>}
 */
export const getAllMatchCompetitions = async (
  competitionId: string,
  errorHandler?: ApiFootballErrorHandler
): Promise<ApiFootballMatchResponse | null> => {
  try {
    const { dateFrom, dateTo } = getDateRange();
    const response = await footballApiRequest(
      `competitions/${competitionId}/matches?season=2025&status=SCHEDULED&dateFrom=${dateFrom}&dateTo=${dateTo}`
    );

    if (!response.ok) {
      console.log(
        `Get matchs-competitions failed: ${response.status} ${await response.text()}`
      );
      return null;
    }
    const matches = (await response.json()) as ApiFootballMatchResponse;
    console.log("Matchs getted:", matches);
    return matches;
  } catch (error) {
    console.log("get-matchs-error =>", error);
    errorHandler && errorHandler(error as ApiFootballErrorResponse);
    return null;
  }
};

/**
 * Cette fonction permet de recuperer tous les details sur un match...
 * @param {string} matchId c'est l'id du match
 * @param {ApiFootballErrorHandler} errorHandler c'est la fonction qui permet de gerer les erreurs...
 * @returns {Promise<MatchModel | null>}
 */
export const getMatchById = async (
  matchId: string,
  errorHandler?: ApiFootballErrorHandler
): Promise<MatchModel | null> => {
  try {
    const response = await footballApiRequest(`matches/${matchId}`);

    if (!response.ok) {
      console.log(
        `Get matchs failed: ${response.status} ${await response.text()}`
      );
      return null;
    }
    const match = (await response.json()) as MatchModel;
    console.log("Matchs getted:", match);
    return match;
  } catch (error) {
    console.log("get-matchs-error =>", error);
    errorHandler && errorHandler(error as ApiFootballErrorResponse);
    return null;
  }
};
