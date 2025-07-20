import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors({
  origin: [
    'https://playpredictapp.vercel.app',
    'https://playpredictapp-nsa8y3awk-eugenebertrands-projects.vercel.app',
    'http://localhost:5173', 
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Simple startup - no data loading at all
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

// --- Preload and cache all data at server startup ---
const playByPlayPath = path.join(__dirname, '../data/play_by_play_2024.csv');
let allPlays: any[] = [];
let allPlayersByPosition: { [key: string]: Set<string> } = { QB: new Set(), RB: new Set(), WR: new Set(), TE: new Set() };
let allTeams: Set<string> = new Set();

function isPlayerName(value: string) {
  if (!value || value === 'NA' || value === '0') return false;
  if (value.startsWith('00-') || /^\d+$/.test(value)) return false;
  return /[A-Za-z]/.test(value);
}

function preloadData(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const plays: any[] = [];
    const playersByPosition: { [key: string]: Set<string> } = { QB: new Set(), RB: new Set(), WR: new Set(), TE: new Set() };
    const teams: Set<string> = new Set();
    fs.createReadStream(playByPlayPath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        plays.push(row);
        // Players
        if (isPlayerName(row.passer_player_name)) playersByPosition.QB.add(row.passer_player_name.replace(/"/g, ''));
        if (isPlayerName(row.rusher_player_name)) playersByPosition.RB.add(row.rusher_player_name.replace(/"/g, ''));
        if (isPlayerName(row.receiver_player_name)) playersByPosition.WR.add(row.receiver_player_name.replace(/"/g, ''));
        if (isPlayerName(row.receiver_player_name)) playersByPosition.TE.add(row.receiver_player_name.replace(/"/g, ''));
        // Teams
        if (row.defteam && row.defteam !== 'NA') teams.add(row.defteam.replace(/"/g, ''));
        if (row.posteam && row.posteam !== 'NA') teams.add(row.posteam.replace(/"/g, ''));
      })
      .on('end', () => {
        allPlays = plays;
        allPlayersByPosition = playersByPosition;
        allTeams = teams;
        console.log('Preloaded', plays.length, 'plays,',
          Array.from(playersByPosition.QB).length, 'QBs,',
          Array.from(playersByPosition.RB).length, 'RBs,',
          Array.from(playersByPosition.WR).length, 'WRs,',
          Array.from(playersByPosition.TE).length, 'TEs,',
          teams.size, 'teams');
        resolve();
      })
      .on('error', (err) => reject(err));
  });
}

// Call preload on startup
preloadData().then(() => {
  console.log('All NFL data loaded and cached in memory.');
}).catch((err) => {
  console.error('Failed to preload data:', err);
  process.exit(1);
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

  // Helper to check for player name
  const isPlayerName = (value: string) => {
    if (!value || value === 'NA' || value === '0') return false;
    if (value.startsWith('00-') || /^\d+$/.test(value)) return false;
    return /[A-Za-z]/.test(value);
  };

  // Normalize the input player name once
  const normalizedInputPlayer = normalizePlayerName(player as string);

  // Helper to extract week from row (if present)
  function getWeek(row: any) {
    return row.week ? parseInt(row.week, 10) : undefined;
  }

  // Helper to aggregate stats from a list of rows
  function aggregateStats(rows: any[], playerName: string) {
    let rushingYards = 0, receivingYards = 0, passingYards = 0;
    let rushingTDs = 0, receivingTDs = 0, passingTDs = 0;
    const normalizedPlayer = normalizePlayerName(playerName);
    for (const row of rows) {
      if (row.rusher_player_name && normalizePlayerName(row.rusher_player_name) === normalizedPlayer && row.rushing_yards && row.rushing_yards !== 'NA') {
        rushingYards += parseFloat(row.rushing_yards) || 0;
        if (row.rush_touchdown && (row.rush_touchdown === '1' || row.rush_touchdown === 1)) rushingTDs += 1;
      }
      if (row.receiver_player_name && normalizePlayerName(row.receiver_player_name) === normalizedPlayer && row.receiving_yards && row.receiving_yards !== 'NA') {
        receivingYards += parseFloat(row.receiving_yards) || 0;
        if (row.pass_touchdown && (row.pass_touchdown === '1' || row.pass_touchdown === 1)) receivingTDs += 1;
      }
      if (row.passer_player_name && normalizePlayerName(row.passer_player_name) === normalizedPlayer && row.passing_yards && row.passing_yards !== 'NA') {
        passingYards += parseFloat(row.passing_yards) || 0;
        if (row.pass_touchdown && (row.pass_touchdown === '1' || row.pass_touchdown === 1)) passingTDs += 1;
      }
    }
    return { rushingYards, receivingYards, passingYards, rushingTDs, receivingTDs, passingTDs };
  }

  // Use preloaded allPlays array instead of reading the CSV file
  const allRows: any[] = allPlays;

  // Filter for this player (any role)
  const playerRows = allRows.filter(row => {
    const isRusher = isPlayerName(row.rusher_player_name) && normalizePlayerName(row.rusher_player_name) === normalizedInputPlayer;
    const isPasser = isPlayerName(row.passer_player_name) && normalizePlayerName(row.passer_player_name) === normalizedInputPlayer;
    const isReceiver = isPlayerName(row.receiver_player_name) && normalizePlayerName(row.receiver_player_name) === normalizedInputPlayer;
    return isRusher || isPasser || isReceiver;
  });

  let filteredRows: any[] = [];
  let usedWeek = inputWeek;

  // 1. Try player+week+opponent
  if (inputWeek !== undefined) {
    filteredRows = playerRows.filter(row => getWeek(row) === inputWeek && row.defteam === opponent);
  }

  // 2. If none, try player+week (any opponent)
  if (filteredRows.length === 0 && inputWeek !== undefined) {
    filteredRows = playerRows.filter(row => getWeek(row) === inputWeek);
  }

  // 3. If still none, try previous weeks (decrement week)
  let weekToTry = inputWeek;
  while (filteredRows.length === 0 && weekToTry && weekToTry > 1) {
    weekToTry--;
    filteredRows = playerRows.filter(row => getWeek(row) === weekToTry && row.defteam === opponent);
    if (filteredRows.length === 0) {
      filteredRows = playerRows.filter(row => getWeek(row) === weekToTry);
    }
    usedWeek = weekToTry;
  }

  // 4. If still none, use similar team logic (as before)
  if (filteredRows.length === 0) {
    // Use similar team logic (reuse your existing code here)
    // For simplicity, fallback to all playerRows for now
    filteredRows = playerRows;
  }

  // 5. If still none, use season average (all plays for player)
  // (already handled by previous step)

  // If still no data, return zeros
  if (filteredRows.length === 0) {
    return res.json({
      playerName: player,
      opponent,
      position: pos,
      predictedRushingYards: 0,
      predictedPassingYards: 0,
      predictedReceivingYards: 0,
      predictedTouchdowns: 0,
      note: "No games found for player"
    });
  }

  // Aggregate stats
  const stats = aggregateStats(filteredRows, player as string);
  res.json({
    playerName: player,
    opponent,
    position: pos,
    predictedRushingYards: Math.round(stats.rushingYards * 100) / 100,
    predictedPassingYards: Math.round(stats.passingYards * 100) / 100,
    predictedReceivingYards: Math.round(stats.receivingYards * 100) / 100,
    predictedRushingTDs: stats.rushingTDs,
    predictedReceivingTDs: stats.receivingTDs,
    predictedPassingTDs: stats.passingTDs,
    gamesAnalyzed: filteredRows.length,
    note: `Stats for week ${usedWeek || inputWeek || 'N/A'} (fallback logic may apply)`
  });
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
  res.json(Array.from(allTeams).sort());
});

// List players endpoint
app.get('/api/players', async (req: Request, res: Response) => {
  const { position = "QB" } = req.query;
  const pos = typeof position === 'string' ? position : 'QB';
  const players = allPlayersByPosition[pos] ? Array.from(allPlayersByPosition[pos]).sort() : [];
  res.json({ position: pos, players });
});

// Start the server and keep it running
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});
