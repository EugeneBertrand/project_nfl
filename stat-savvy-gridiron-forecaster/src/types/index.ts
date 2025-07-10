export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
}

export interface PredictionRequest {
  playerId: string;
  opponentTeam: string;
  week?: string;
}

export interface Predictions {
  rushingYards: number;
  receivingYards: number;
  passingYards: number;
  rushingTouchdowns: number;
  receivingTouchdowns: number;
  passingTouchdowns: number;
}

export interface SeasonStats {
  gamesPlayed: number;
  avgRushingYards: number;
  avgReceivingYards: number;
  avgPassingYards: number;
  totalRushingTouchdowns: number;
  totalReceivingTouchdowns: number;
  totalPassingTouchdowns: number;
}

export interface PredictionResponse {
  player: Player;
  opponent: string;
  predictions: Predictions;
  seasonStats: SeasonStats;
}