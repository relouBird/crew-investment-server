import { Request, Response } from "express";
import { BetModel } from "../models/bet.model";
import { UserBetModel } from "../models/user-bet.model";
import { BetInterfaceModel, UserBetInterfaceModel } from "../types/bet.type";
import { orderBetMatch } from "../helpers/bet-api.helper";

// fonction qui est appelé afin de recuperer tous les paris des utilisateurs...
export const allBets = async (req: Request, res: Response) => {
  const betModel = new UserBetModel();
  const matchModel = new BetModel();
  let matchesData: BetInterfaceModel[] | null = null;
  let isError = false;
  let errorMessage = "";

  const data = await betModel.getAll((error) => {
    isError = true;
    console.log("bets-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  const listMatchToLoad: string[] =
    data && data.length ? data.map((u) => String(u.matchId)) : [];

  if (listMatchToLoad.length) {
    console.log("list-matches ===>", listMatchToLoad.length);
    matchesData = await matchModel.getManyById(listMatchToLoad, (error) => {
      isError = true;
      console.log("matches-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    });

    matchesData = matchesData ? orderBetMatch(matchesData, true) : [];
  }

  if (!isError && data) {
    const dataToReturn: UserBetInterfaceModel[] = [];

    data
      .filter((bet) => !bet.isDelete)
      .forEach((bet) => {
        const match = matchesData?.find((match) => match.id == bet.matchId);
        if (match) {
          dataToReturn.push({
            ...bet,
            match,
          });
        } else {
          dataToReturn.push(bet);
        }
      });
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets Checked...",
        data: dataToReturn ?? [],
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

// fonction qui est appelé afin de recuperer tous les paris des utilisateurs...
export const allMatches = async (req: Request, res: Response) => {
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
        data: orderBetMatch(data) ?? [],
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
  const betModel = new UserBetModel();
  const matchModel = new BetModel();
  const reqBody = req.body as UserBetInterfaceModel; // Ce type...
  let isError = false;
  let errorMessage = "";

  const data = await betModel.create(reqBody, (error) => {
    isError = true;
    console.log("bets-create-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  const match =
    data &&
    (await matchModel.getById(String(data?.matchId), (error) => {
      isError = true;
      console.log("bets-create-error =>", error?.message);
      errorMessage = error?.message ?? "";
    }));

  if (!isError && data && match) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets Created...",
        data: {
          ...data,
          match,
        },
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

// fonction qui est appelé afin de recuperer un pari...
export const getBet = async (req: Request, res: Response) => {
  const betModel = new UserBetModel();
  const matchModel = new BetModel();
  let isError = false;
  const bet_id = req.params.id ?? ""; // Ce type...
  let errorMessage = "";

  console.log("bet-id ===>", bet_id);

  const data = await betModel.getById(bet_id, (error) => {
    isError = true;
    console.log("bets-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  const match =
    data &&
    matchModel.getById(String(data.matchId), (error) => {
      isError = true;
      console.log("matches-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    });

  if (!isError && data) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets getted successfully...",
        data: {
          ...data,
          match,
        },
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
export const deleteBet = async (req: Request, res: Response) => {
  const betModel = new UserBetModel();
  const matchModel = new BetModel();
  let isError = false;
  const bet_id = req.params.id ?? ""; // Ce type...
  let errorMessage = "";

  console.log("bet-id ===>", bet_id);

  const bet_loaded = await betModel.getById(bet_id, (error) => {
    isError = true;
    console.log("bets-getting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  const data =
    bet_loaded &&
    (await betModel.update({ ...bet_loaded, isDelete: true }, (error) => {
      isError = true;
      console.log("bets-deleting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    }));

  const match =
    data &&
    matchModel.getById(String(data.matchId), (error) => {
      isError = true;
      console.log("matches-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    });

  if (!isError && data && match) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets deleted successfully...",
        data: {
          ...data,
          match,
        },
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
  const betModel = new UserBetModel();
  const matchModel = new BetModel();
  let isError = false;
  const bet_id = req.params.id ?? ""; // Ce type...
  const reqBody = req.body as UserBetInterfaceModel; // Ce type...
  let errorMessage = "";

  console.log("bet-id ===>", bet_id);

  const data = await betModel.update({ id: bet_id, ...reqBody }, (error) => {
    isError = true;
    console.log("bets-deleting-error =>", error?.message);
    errorMessage = error?.message ?? "";
  });

  const match =
    data &&
    matchModel.getById(String(data.matchId), (error) => {
      isError = true;
      console.log("matches-getting-error =>", error?.message);
      errorMessage = error?.message ?? "";
    });

  if (!isError && data && match) {
    setTimeout(async () => {
      res.status(200).json({
        message: "Bets Updated successfully...",
        data: {
          ...data,
          match,
        },
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
