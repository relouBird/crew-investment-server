// Partie pari simplement parlant
export interface BetTeamType {
  name: string;
  crest: string;
  tla: string;
}

export interface BetInterfaceModel {
  id?: number | string;
  score: string;
  winner: string;
  homeTeam: BetTeamType;
  awayTeam: BetTeamType;
  isActive: boolean;
  isEnded: boolean;
  start_at: string;
  end_at: string;
  winPercentage: number;
  lossPercentage: number;
  created_at?: string;
}

export interface BetInterfaceModelDatabase {
  id?: number | string;
  score: string;
  winner: string;
  homeTeam: string;
  awayTeam: string;
  start_at: string;
  end_at: string;
  winPercentage: number;
  lossPercentage: number;
  created_at?: string;
  isActive: boolean;
  isEnded: boolean;
}

export interface UserBetInterfaceModel {
  id?: string;
  uid: string;
  matchId: string | number;
  match?: BetInterfaceModel;
  prediction: string;
  win?: boolean;
  potentialGain: number;
  potentialLoss: number;
  isDelete: boolean;
  created_at?: string;
}
