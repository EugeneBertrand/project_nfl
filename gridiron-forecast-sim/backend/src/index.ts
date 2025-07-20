import express, { Request, Response } from 'express';
import cors from 'cors';
import DatabaseService from '../database';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['https://playpredictapp.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize database service
const db = new DatabaseService();

console.log('Backend server starting...');
console.log('Server will stay running until you press Ctrl+C');

app.get('/', (req, res) => {
  res.json({ message: 'NFL Analytics Backend is running!' });
});

// Add a simple /api endpoint for debugging
app.get('/api', (req, res) => {
  res.json({ 
    message: 'NFL Analytics API is running!',
    endpoints: [
      '/api/teams',
      '/api/players',
      '/api/predict/player',
      '/api/predict/weekly'
    ]
  });
});

// Helper to normalize player names for flexible matching
function normalizePlayerName(name: string) {
  return (name || '')
    .replace(/\s+/g, '') // remove all spaces
    .replace(/\./g, '')  // remove periods
    .toLowerCase();       // lowercase
}

// Enhanced prediction endpoint that handles own-team matchups
app.get('/api/predict/player', async (req: Request, res: Response) => {
  const { player, opponent, position = "QB", week } = req.query;
  if (!player || !opponent) {
    return res.status(400).json({ error: 'player and opponent are required' });
  }
  const pos = typeof position === 'string' ? position : 'QB';
  const inputWeek = week ? parseInt(week as string, 10) : undefined;

  try {
    // Get player stats from database
    const playerRows = await db.getPlayerStats(player as string, position as string);
    
    if (playerRows.length === 0) {
      return res.json({
        playerName: player,
        opponent,
        position: pos,
        predictedRushingYards: 0,
        predictedPassingYards: 0,
        predictedReceivingYards: 0,
        predictedRushingTDs: 0,
        predictedReceivingTDs: 0,
        predictedPassingTDs: 0,
        gamesAnalyzed: 0,
        note: "No games found for player"
      });
    }

    // Aggregate stats
    let rushingYards = 0, receivingYards = 0, passingYards = 0;
    let rushingTDs = 0, receivingTDs = 0, passingTDs = 0;
    
    for (const row of playerRows) {
      if (row.rushing_yards) rushingYards += row.rushing_yards;
      if (row.receiving_yards) receivingYards += row.receiving_yards;
      if (row.passing_yards) passingYards += row.passing_yards;
      if (row.rush_touchdown) rushingTDs += row.rush_touchdown;
      if (row.pass_touchdown) receivingTDs += row.pass_touchdown;
    }

    res.json({
      playerName: player,
      opponent,
      position: pos,
      predictedRushingYards: Math.round(rushingYards * 100) / 100,
      predictedPassingYards: Math.round(passingYards * 100) / 100,
      predictedReceivingYards: Math.round(receivingYards * 100) / 100,
      predictedRushingTDs: rushingTDs,
      predictedReceivingTDs: receivingTDs,
      predictedPassingTDs: 0, // This would need separate tracking
      gamesAnalyzed: playerRows.length,
      note: `Stats for ${playerRows.length} plays found`
    });

  } catch (error) {
    console.error('Error in player prediction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Weekly prediction endpoint (simplified)
app.get('/api/predict/weekly', async (req: Request, res: Response) => {
  const { player, opponent, position = "QB" } = req.query;
  if (!player || !opponent) {
    return res.status(400).json({ error: 'player and opponent are required' });
  }

  // Fallback: dummy prediction logic with all stats
  return res.json({
    playerName: player,
    opponent: opponent,
    predictedRushingYards: Math.floor(Math.random() * 100),
    predictedReceivingYards: Math.floor(Math.random() * 100),
    predictedPassingYards: Math.floor(Math.random() * 300),
    predictedRushingTDs: Math.random().toFixed(2),
    predictedReceivingTDs: Math.random().toFixed(2),
    predictedPassingTDs: Math.random().toFixed(2),
    confidence: "Medium"
  });
});

// List teams endpoint
app.get('/api/teams', async (req: Request, res: Response) => {
  try {
    const teams = await db.getTeams();
    res.json(teams.sort());
  } catch (error) {
    console.error('Error getting teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List players endpoint
app.get('/api/players', async (req: Request, res: Response) => {
  const { position = "QB" } = req.query;
  const pos = typeof position === 'string' ? position : 'QB';
  
  try {
    const players = await db.getPlayersByPosition(pos);
    res.json({ position: pos, players: players.sort() });
  } catch (error) {
    console.error('Error getting players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
