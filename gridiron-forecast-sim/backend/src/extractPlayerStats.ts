// Type definitions for player stats
export interface PlayerSeasonStats {
  playerName: string;
  team: string;
  position: string;
  gamesPlayed: number;
  avgRushingYards: number;
  avgReceivingYards: number;
  avgPassingYards: number;
  avgRushingTDs: number;
  avgReceivingTDs: number;
  avgPassingTDs: number;
}

export interface PlayerGameStats {
  week: number;
  opponent: string;
  rushingYards?: number;
  receivingYards?: number;
  passingYards?: number;
  rushingTDs?: number;
  receivingTDs?: number;
  passingTDs?: number;
} 