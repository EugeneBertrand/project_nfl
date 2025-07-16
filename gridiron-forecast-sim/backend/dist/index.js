"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Placeholder in-memory data
let playerStats = [];
// Load weekly player stats
let playerStatsPerWeek = {};
try {
    playerStatsPerWeek = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../data/player_stats_per_week_2024.json'), 'utf8'));
}
catch (err) {
    console.error('Failed to load weekly stats:', err);
}
// Load player stats from CSV (adjust path as needed)
function loadPlayerStatsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs_1.default.createReadStream(filePath)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
}
// Endpoint to get teams
app.get('/api/teams', (req, res) => {
    // Example: extract unique teams from playerStats
    const teams = Array.from(new Set(playerStats.map(row => row.defteam))).filter(Boolean);
    res.json(teams);
});
// Endpoint to search players
app.get('/api/players/search', (req, res) => {
    const { query } = req.query;
    if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'query parameter is required' });
    }
    const q = query.toLowerCase();
    const players = Array.from(new Set(playerStats
        .filter(row => ((row.rusher_player_name && row.rusher_player_name.toLowerCase().includes(q)) ||
        (row.receiver_player_name && row.receiver_player_name.toLowerCase().includes(q)) ||
        (row.passer_player_name && row.passer_player_name.toLowerCase().includes(q))))
        .map(row => row.rusher_player_name || row.receiver_player_name || row.passer_player_name)
        .filter(name => name && name !== 'NA') // Filter out NA and falsy before Set
    )).map(playerName => ({ playerName }));
    res.json(players);
});
// Endpoint to predict player stats
app.get('/api/predict/player', (req, res) => {
    const { player, opponent } = req.query;
    if (!player || !opponent) {
        return res.status(400).json({ error: 'player and opponent are required' });
    }
    // Dummy prediction logic for demonstration
    res.json({
        playerName: player,
        opponent: opponent,
        predictedRushingYards: Math.floor(Math.random() * 100),
        predictedReceivingYards: Math.floor(Math.random() * 100),
        predictedPassingYards: Math.floor(Math.random() * 300),
        predictedRushingTDs: Math.random().toFixed(2),
        predictedReceivingTDs: Math.random().toFixed(2),
        predictedPassingTDs: Math.random().toFixed(2),
        confidence: "High"
    });
});
// Endpoint for weekly player prediction
app.get('/api/predict/player/week', (req, res) => {
    var _a;
    const { player, opponent, week } = req.query;
    if (!player || !opponent || !week) {
        return res.status(400).json({ error: 'player, opponent, and week are required' });
    }
    const playerKey = player.toString();
    const weekKey = week.toString();
    const stats = (_a = playerStatsPerWeek[playerKey]) === null || _a === void 0 ? void 0 : _a[weekKey];
    if (stats) {
        return res.json(stats);
    }
    // If no stats for this week, try to average across all weeks for this player
    const allWeeks = playerStatsPerWeek[playerKey];
    if (allWeeks) {
        const weekStats = Object.values(allWeeks);
        if (weekStats.length > 0) {
            // Average numeric fields
            const avgStats = {};
            const keys = Object.keys(weekStats[0]);
            for (const key of keys) {
                const nums = weekStats.map(s => parseFloat(s[key])).filter(v => !isNaN(v));
                if (nums.length > 0) {
                    avgStats[key] = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
                }
                else {
                    avgStats[key] = null;
                }
            }
            return res.json(avgStats);
        }
    }
    // Fallback: dummy prediction logic
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
// Endpoint to get all player stats
app.get('/players', async (req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../data/play_by_play_2024.csv');
        const data = await loadPlayerStatsFromCSV(filePath);
        res.json(data.slice(0, 100)); // Only return first 100 rows
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to load player stats' });
    }
});
// Endpoint to get defense WR data
app.get('/defensewr', async (req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../data/defensewr.csv');
        const data = await loadPlayerStatsFromCSV(filePath);
        res.json(data.slice(0, 100)); // Only return first 100 rows
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to load defense WR data' });
    }
});
// Endpoint to get defense QB data
app.get('/defenseqb', async (req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../data/defenseqb.csv');
        const data = await loadPlayerStatsFromCSV(filePath);
        res.json(data.slice(0, 100)); // Only return first 100 rows
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to load defense QB data' });
    }
});
// Endpoint to get defense RB data
app.get('/defenserb', async (req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../data/defenserb.csv');
        const data = await loadPlayerStatsFromCSV(filePath);
        res.json(data.slice(0, 100)); // Only return first 100 rows
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to load defense RB data' });
    }
});
// Endpoint to get defense TE data
app.get('/defensete', async (req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../data/defensete.csv');
        const data = await loadPlayerStatsFromCSV(filePath);
        res.json(data.slice(0, 100)); // Only return first 100 rows
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to load defense TE data' });
    }
});
async function printCSVPreview(label, filePath) {
    try {
        const data = await loadPlayerStatsFromCSV(filePath);
        console.log(`\n=== Preview of ${label} (${filePath}) ===`);
        console.log(data.slice(0, 3));
    }
    catch (err) {
        console.error(`Error loading ${label} from ${filePath}:`, err);
    }
}
// Load data and start server
async function startServer() {
    try {
        // Adjust the path to your CSV file as needed
        const playerPath = path_1.default.join(__dirname, '../data/play_by_play_2024.csv');
        const wrPath = path_1.default.join(__dirname, '../data/defensewr.csv');
        const qbPath = path_1.default.join(__dirname, '../data/defenseqb.csv');
        const rbPath = path_1.default.join(__dirname, '../data/defenserb.csv');
        const tePath = path_1.default.join(__dirname, '../data/defensete.csv');
        // Print previews
        await printCSVPreview('Players', playerPath);
        await printCSVPreview('Defense WR', wrPath);
        await printCSVPreview('Defense QB', qbPath);
        await printCSVPreview('Defense RB', rbPath);
        await printCSVPreview('Defense TE', tePath);
        playerStats = await loadPlayerStatsFromCSV(playerPath);
        app.listen(PORT, () => {
            console.log(`Backend server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('Failed to load player stats:', err);
    }
}
startServer();
