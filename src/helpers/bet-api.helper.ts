import { BetInterfaceModel } from "../types/bet.type";

export function getDateRange() {
  const today = new Date();
  const nextWeek = new Date();

  // Ajouter 7 jours
  nextWeek.setDate(today.getDate() + 7);

  // Fonction utilitaire pour formater
  const format = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return {
    dateFrom: format(today),
    dateTo: format(nextWeek),
  };
}

export function orderBetMatch(betMatches: BetInterfaceModel[], get?: boolean) {
  let matches: BetInterfaceModel[] = [];

  betMatches.forEach((match) => {
    if (match.isActive && !match.isEnded) {
      matches.push({
        ...match,
        score: "",
        winner: "",
      });
    } else {
      if (get) {
        matches.push(match);
      }
    }
  });

  return matches;
}

export function orderOneBetMatch(betMatches: BetInterfaceModel) {
  if (betMatches.isActive && !betMatches.isEnded) {
    return {
      ...betMatches,
      score: "",
      winner: "",
    };
  } else {
    return betMatches;
  }
}
