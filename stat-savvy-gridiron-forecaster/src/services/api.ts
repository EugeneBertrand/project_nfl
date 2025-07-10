import { Player, PredictionRequest, PredictionResponse } from '@/types';

const API_BASE_URL = 'http://localhost:4000/api';

export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new APIError(`HTTP error! status: ${response.status}`, response.status);
  }
  
  const data = await response.json();
  return data;
}

export const apiService = {
  async getPlayers(searchTerm = ''): Promise<Player[]> {
    try {
      // If searchTerm is empty, do not include the query param (fetch all players)
      const url = searchTerm && searchTerm.length > 0
        ? `${API_BASE_URL}/players/search?query=${encodeURIComponent(searchTerm)}`
        : `${API_BASE_URL}/players/search`;
      const response = await fetch(url);
      const players = await handleResponse<any[]>(response);
      return players
        .filter(player => player.playerName && typeof player.playerName === 'string' && player.playerName.trim() !== '')
        .map((player: any) => ({
          id: player.playerName,
          name: player.playerName,
          position: apiService.getPositionFromStats(player),
          team: player.team || player.Team || 'Unknown'
        }));
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Failed to fetch players. Please check your connection.');
    }
  },

  getPositionFromStats(player: any): string {
    if (player.totalPassingYards > 0) return 'QB';
    if (player.totalRushingYards > player.totalReceivingYards) return 'RB';
    if (player.totalReceivingYards > 0) return 'WR';
    return 'Unknown';
  },

  async getTeams(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`);
      return handleResponse<string[]>(response);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Failed to fetch teams. Please check your connection.');
    }
  },

  async predictStats(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      // Always use the exact playerName from the backend
      let url = `${API_BASE_URL}/predict/player?player=${encodeURIComponent(request.playerId)}&opponent=${encodeURIComponent(request.opponentTeam)}`;
      if (request.week) {
        url += `&week=${encodeURIComponent(request.week)}`;
      }
      const response = await fetch(url);
      const data = await handleResponse<any>(response);

      // Use the team from the backend response
      const playerTeam = data.team || 'Unknown';

      return {
        player: {
          id: request.playerId,
          name: request.playerId,
          position: 'Unknown',
          team: playerTeam
        },
        opponent: request.opponentTeam,
        predictions: {
          rushingYards: data.predictedRushingYards || 0,
          receivingYards: data.predictedReceivingYards || 0,
          passingYards: data.predictedPassingYards || 0,
          rushingTouchdowns: data.predictedRushingTDs || 0,
          receivingTouchdowns: data.predictedReceivingTDs || 0,
          passingTouchdowns: data.predictedPassingTDs || 0,
        },
        seasonStats: {
          gamesPlayed: 0, // Not provided by backend
          avgRushingYards: 0,
          avgReceivingYards: 0,
          avgPassingYards: 0,
          totalRushingTouchdowns: 0,
          totalReceivingTouchdowns: 0,
          totalPassingTouchdowns: 0,
        }
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Failed to generate predictions. Please try again.');
    }
  },
};

export async function getPlayerPrediction(player: string, opponent: string) {
  const res = await fetch(
    `${API_BASE_URL}/predict/player?player=${encodeURIComponent(player)}&opponent=${encodeURIComponent(opponent)}`
  );
  if (!res.ok) throw new Error('Failed to fetch prediction');
  return res.json();
}