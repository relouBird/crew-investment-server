import * as BetController from "../controllers/bet-instance.controller";
import express from "express";
import { authenticateUserByAccessToken } from "../helpers/auth.helper";

const BetRouteur = express.Router();

BetRouteur.get(
  "/", 
  authenticateUserByAccessToken, 
  BetController.allBets
);

BetRouteur.get(
  "/matches", 
  authenticateUserByAccessToken, 
  BetController.allMatches
);

BetRouteur.post(
  "/",
  authenticateUserByAccessToken,
  BetController.createBet
);

BetRouteur.get(
  "/:id",
  authenticateUserByAccessToken,
  BetController.getBet
);

BetRouteur.patch(
  "/:id",
  authenticateUserByAccessToken,
  BetController.updateBet
);

BetRouteur.delete(
  "/:id",
  authenticateUserByAccessToken,
  BetController.deleteBet
);

export default BetRouteur;
