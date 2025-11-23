import { Request, Response } from "express";
import { User } from "@supabase/supabase-js";
import { BetModel } from "../models/bet.model";
import { BetInterfaceModel } from "../types/bet.type";

// fonction qui est appelé afin de recuperer tous les paris des utilisateurs...
export const allBets = async (req: Request, res: Response) => {
  const betModel = new BetModel();
  let isError = false;
  let errorMessage = "";

  const data = await betModel.getAll((error) => {
    isError = true;
    console.log("bets-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets Checked...",
        data: data ?? [],
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Bets To Check Found...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé afin de creer un pari...
export const createBet = async (req: Request, res: Response) => {
  const betModel = new BetModel();
  const reqBody = req.body as BetInterfaceModel; // Ce type...
  let isError = false;
  let errorMessage = "";

  const data = await betModel.create(reqBody, (error) => {
    isError = true;
    console.log("bets-create-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets Created...",
        data,
      });
    }, 2000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "Something where wrong when creating bet...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé afin de supprimer un pari...
export const deleteBet = async (req: Request, res: Response) => {
  const betModel = new BetModel();
  let isError = false;
  const bet_id = req.params.id ?? ""; // Ce type...
  let errorMessage = "";

  console.log("bet-id ===>", bet_id);

  const data = await betModel.delete(bet_id, (error) => {
    isError = true;
    console.log("bets-deleting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets deleted successfully...",
        data,
      });
    }, 2000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "Error when deleting bet...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé afin de supprimer un pari...
export const updateBet = async (req: Request, res: Response) => {
  const betModel = new BetModel();
  let isError = false;
  const bet_id = req.params.id ?? ""; // Ce type...
  const reqBody = req.body as BetInterfaceModel; // Ce type...
  let errorMessage = "";

  console.log("bet-id ===>", bet_id);

  const data = await betModel.update({ id: bet_id, ...reqBody }, (error) => {
    isError = true;
    console.log("bets-deleting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets Updated successfully...",
        data,
      });
    }, 2000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "Error when updating bet...",
        details: errorMessage,
      });
    }, 1000);
  }
};

/*
 Partie externe au systeme venant d'une api tier permettant de recuperer les matchs equipes et competitions...
*/

// fonction qui est appelé afin de recuperer toutes les competitions...
export const getAllCompetitions = async (req: Request, res: Response) => {
  const betModel = new BetModel();
  let isError = false;
  let errorMessage = "";

  const data = await betModel.getAllCompetitions((error) => {
    isError = true;
    console.log("competitions-getting-error =>", error?.error);
    errorMessage = error?.error ?? "";
  });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "All Competitions Checked...",
        data,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Competitions To Check Found...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé afin de recuperer tous les matchs d'une competition...
export const getAllMatchCompetitions = async (req: Request, res: Response) => {
  const betModel = new BetModel();
  let isError = false;
  let errorMessage = "";
  let competitionId = req.params.id ?? "";

  const data = await betModel.getAllMatchCompetitions(
    competitionId,
    (error) => {
      isError = true;
      console.log("competitions-matches-getting-error =>", error?.error);
      errorMessage = error?.error ?? "";
    }
  );

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "All Matchs Checked...",
        data,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Competitions To Check Found...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé afin de recuperer toutes les equipes d'une competition...
export const getAllTeamCompetitions = async (req: Request, res: Response) => {
  const betModel = new BetModel();
  let isError = false;
  let errorMessage = "";
  let competitionId = req.params.id ?? "";

  const data = await betModel.getAllTeamCompetitions(competitionId, (error) => {
    isError = true;
    console.log("competitions-teams-getting-error =>", error?.error);
    errorMessage = error?.error ?? "";
  });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "All Teams Checked...",
        data,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Competitions To Check Found...",
        details: errorMessage,
      });
    }, 1000);
  }
};

// fonction qui est appelé afin de recuperer tous les details d'un match...
export const getMatch = async (req: Request, res: Response) => {
  const betModel = new BetModel();
  let isError = false;
  let errorMessage = "";
  let matchId = req.params.id ?? "";

  const data = await betModel.getMatchById(matchId, (error) => {
    isError = true;
    console.log("match-getting-error =>", error?.error);
    errorMessage = error?.error ?? "";
  });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Match Checked...",
        data,
      });
    }, 1000);
  } else {
    setTimeout(async () => {
      res.status(404).json({
        message: "No Match To Check Found...",
        details: errorMessage,
      });
    }, 1000);
  }
};
