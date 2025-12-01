import { BetModel } from "../models/bet.model";
import { BetInterfaceModel } from "../types/bet.type";
import { UserBetModel } from "../models/user-bet.model";


// Ceci permet de recuperer tout les matches active et les de les controler
export const betChecker = async () => {
  const betModel = new BetModel();
  const userBetModel = new UserBetModel();

  let betsList: string[] = []; // List des paris qui viennent de finir
  let betsListEnded: BetInterfaceModel[] = []; // List des paris qui viennent de finir
  let isUpdateBetError: boolean = false;

  // Load d'abord tous les paris ouvert
  const allActiveBets = await betModel.getManyActiveState((error) => {
    console.log("bets-getting-error =>", error?.message);
  });

  // On recupere d'abord la liste des model qui devrait etre cloturé...
  if (allActiveBets && allActiveBets.length) {
    betsListEnded = allActiveBets.filter((u) => {
      let now = new Date();
      let endDate = new Date(u.end_at);
      return now > endDate;
    });
    betsList = betsListEnded.map((bet) => String(bet.id));
  }

  // ceci sert à finir avec les paris à cloturer
  betsListEnded.forEach(async (bet) => {
    await betModel.update(
      { ...bet, isEnded: true, isActive: false },
      (error) => {
        isUpdateBetError = true;
        console.log("bets-ending-error =>", error?.message);
      }
    );
  });

  const usersBets =
    betsList &&
    !isUpdateBetError &&
    (await userBetModel.getBetsByIdListMatch(betsList, (error) => {
      console.log("bets-instance-getting-error =>", error?.message);
    }));

  if (usersBets && usersBets.length) {
    for (let i = 0; i < usersBets.length; i++) {
      const activeBet = usersBets[i];
      let win =
        activeBet.prediction ===
        allActiveBets?.find((u) => u.id == activeBet.matchId)?.winner;
      userBetModel.update({ ...activeBet, win }, (error) => {
        console.log("bets-instance-update-error =>", error?.message);
      });
    }
  }

  // Logs pour savoir où nous sommes...
  console.log("id-matches-list ===>", betsList);
  console.log(
    "id-bets-list ===>",
    usersBets?.map((bet) => bet.id)
  );
};