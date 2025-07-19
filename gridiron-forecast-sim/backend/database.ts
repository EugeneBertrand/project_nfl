import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

class DatabaseService {
  private db: any = null;

  async initialize() {
    this.db = await open({
      filename: './nfl_data.db',
      driver: sqlite3.Database
    });
  }

  async getPlayerStats(playerName: string, position: string) {
    if (!this.db) await this.initialize();
    
    const query = `
      SELECT * FROM player_stats 
      WHERE player_name = ? AND position = ?
      ORDER BY week ASC
    `;
    
    return await this.db.all(query, [playerName, position]);
  }

  async getPlayerStatsByWeek(playerName: string, position: string, week: number) {
    if (!this.db) await this.initialize();
    
    const query = `
      SELECT * FROM player_stats 
      WHERE player_name = ? AND position = ? AND week = ?
    `;
    
    return await this.db.get(query, [playerName, position, week]);
  }

  async getAllPlayers() {
    if (!this.db) await this.initialize();
    
    const query = `
      SELECT DISTINCT player_name, position 
      FROM player_stats 
      ORDER BY position, player_name
    `;
    
    return await this.db.all(query);
  }

  async getPlayersByPosition(position: string) {
    if (!this.db) await this.initialize();
    
    const query = `
      SELECT DISTINCT player_name 
      FROM player_stats 
      WHERE position = ?
      ORDER BY player_name
    `;
    
    return await this.db.all(query, [position]);
  }
}

export default DatabaseService;
