import * as BetController from "../controllers/bet.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const AdminBetRouteur = express.Router();

AdminBetRouteur.get(
  "/", 
  authenticateUserByAccessToken, 
  BetController.allBets
);

AdminBetRouteur.post(
  "/",
  authenticateUserByAccessToken,
  BetController.createBet
);

AdminBetRouteur.patch(
  "/:id",
  authenticateUserByAccessToken,
  BetController.updateBet
);

AdminBetRouteur.delete(
  "/:id",
  authenticateUserByAccessToken,
  BetController.deleteBet
);

AdminBetRouteur.get(
  "/competitions",
  authenticateUserByAccessToken,
  BetController.getAllCompetitions
);

AdminBetRouteur.get(
  "/competitions/:id/matches",
  authenticateUserByAccessToken,
  BetController.getAllMatchCompetitions
);

AdminBetRouteur.get(
  "/competitions/:id/teams",
  authenticateUserByAccessToken,
  BetController.getAllTeamCompetitions
);

AdminBetRouteur.get(
  "/matches/:id",
  authenticateUserByAccessToken,
  BetController.getMatch
);

export default AdminBetRouteur;
