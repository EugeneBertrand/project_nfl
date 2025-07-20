import { Player, PredictionRequest, PredictionResponse } from '@/types';

const API_BASE_URL = 'http://64.23.225.112:4000/api';

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
      // Get players by position (QB, RB, WR, TE)
      const positions = ['QB', 'RB', 'WR', 'TE'];
      const allPlayers: Player[] = [];
      
      for (const position of positions) {
        const url = `${API_BASE_URL}/players?position=${position}`;
        const response = await fetch(url);
        const data = await handleResponse<any>(response);
        
        if (data.players && Array.isArray(data.players)) {
          const positionPlayers = data.players
            .filter((playerName: string) => 
              !searchTerm || playerName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((playerName: string) => ({
              id: playerName,
              name: playerName,
              position: position
            }));
          
          allPlayers.push(...positionPlayers);
        }
      }
      
      // Deduplicate by name, prefer position priority: QB > RB > WR > TE
      const positionPriority = { QB: 1, RB: 2, WR: 3, TE: 4 };
      const playerMap = new Map();
      for (const player of allPlayers) {
        if (
          !playerMap.has(player.name) ||
          positionPriority[player.position] < positionPriority[playerMap.get(player.name).position]
        ) {
          playerMap.set(player.name, player);
        }
      }
      return Array.from(playerMap.values());
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('Failed to fetch players. Please check your connection.');
    }
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

      // Map backend response to frontend format
      return {
        player: {
          id: request.playerId,
          name: data.playerName || request.playerId,
          position: data.position || 'Unknown',
          team: 'Unknown' // Backend doesn't provide team info
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
          gamesPlayed: data.gamesAnalyzed || 0,
          avgRushingYards: data.predictedRushingYards || 0,
          avgReceivingYards: data.predictedReceivingYards || 0,
          avgPassingYards: data.predictedPassingYards || 0,
          totalRushingTouchdowns: data.predictedRushingTDs || 0,
          totalReceivingTouchdowns: data.predictedReceivingTDs || 0,
          totalPassingTouchdowns: data.predictedPassingTDs || 0,
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