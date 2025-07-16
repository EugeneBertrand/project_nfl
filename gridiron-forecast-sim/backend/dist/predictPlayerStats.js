"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerStatPredictor = void 0;
const loadDefenseMappings_1 = require("./loadDefenseMappings");
class PlayerStatPredictor {
    constructor() {
        this.playerStats = {};
        this.defenseMappings = {};
        this.playerWeekStats = {};
    }
    async initialize() {
        // Load player stats
        try {
            const statsData = require('../data/player_stats_2024.json');
            this.playerStats = statsData.reduce((acc, player) => {
                acc[player.playerName] = player;
                return acc;
            }, {});
            console.log(`Loaded stats for ${Object.keys(this.playerStats).length} players`);
        }
        catch (error) {
            console.error('Error loading player stats:', error);
            throw error;
        }
        // Load per-week stats
        try {
            this.playerWeekStats = require('../data/player_stats_per_week_2024.json');
            console.log('Loaded per-week stats for players');
        }
        catch (error) {
            console.error('Error loading per-week stats:', error);
            this.playerWeekStats = {};
        }
        // Load defense mappings
        try {
            this.defenseMappings = await (0, loadDefenseMappings_1.loadAllDefenseMappings)();
            console.log('Loaded defense mappings for all positions');
        }
        catch (error) {
            console.error('Error loading defense mappings:', error);
            throw error;
        }
    }
    calculateLeagueAverage(mapping) {
        const values = Object.values(mapping);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    getConfidenceLevel(gamesPlayed) {
        if (gamesPlayed >= 10)
            return "High";
        if (gamesPlayed >= 5)
            return "Medium";
        return "Low";
    }
    predictPlayerStats(playerName, opponent, week) {
        var _a;
        // If week is provided and per-week stats exist, use them
        if (week !== undefined &&
            this.playerWeekStats[playerName] &&
            this.playerWeekStats[playerName][week]) {
            const weekGames = this.playerWeekStats[playerName][week];
            // Aggregate stats for the week
            let totalRushingYards = 0, totalReceivingYards = 0, totalPassingYards = 0;
            let totalRushingTDs = 0, totalReceivingTDs = 0, totalPassingTDs = 0;
            let gamesPlayed = weekGames.length;
            for (const game of weekGames) {
                totalRushingYards += game.rushingYards || 0;
                totalReceivingYards += game.receivingYards || 0;
                totalPassingYards += game.passingYards || 0;
                totalRushingTDs += game.rushingTDs || 0;
                totalReceivingTDs += game.receivingTDs || 0;
                totalPassingTDs += game.passingTDs || 0;
            }
            // Get league averages
            const leagueAvgRushYards = this.calculateLeagueAverage(this.defenseMappings.rb);
            const leagueAvgRecYards = this.calculateLeagueAverage(this.defenseMappings.wr);
            const leagueAvgPassYards = this.calculateLeagueAverage(this.defenseMappings.qb);
            // Get opponent's allowed stats
            const opponentRushAllowed = this.defenseMappings.rb[opponent];
            const opponentRecAllowed = this.defenseMappings.wr[opponent];
            const opponentPassAllowed = this.defenseMappings.qb[opponent];
            if (!opponentRushAllowed || !opponentRecAllowed || !opponentPassAllowed) {
                console.log(`Defense stats not found for opponent: ${opponent}`);
                return null;
            }
            // Calculate adjustment factors
            const rushFactor = opponentRushAllowed / leagueAvgRushYards;
            const recFactor = opponentRecAllowed / leagueAvgRecYards;
            const passFactor = opponentPassAllowed / leagueAvgPassYards;
            // Predict stats using the formula: Player Avg × (Opponent Allowed / League Avg)
            const predictedRushingYards = totalRushingYards * rushFactor;
            const predictedReceivingYards = totalReceivingYards * recFactor;
            const predictedPassingYards = totalPassingYards * passFactor;
            // For TDs, use a similar approach but with more conservative adjustments
            const predictedRushingTDs = totalRushingTDs * Math.min(rushFactor, 1.5);
            const predictedReceivingTDs = totalReceivingTDs * Math.min(recFactor, 1.5);
            const predictedPassingTDs = totalPassingTDs * Math.min(passFactor, 1.5);
            return {
                playerName,
                team: ((_a = this.playerStats[playerName]) === null || _a === void 0 ? void 0 : _a.team) || "Unknown",
                opponent,
                predictedRushingYards: Math.round(predictedRushingYards * 10) / 10,
                predictedReceivingYards: Math.round(predictedReceivingYards * 10) / 10,
                predictedPassingYards: Math.round(predictedPassingYards * 10) / 10,
                predictedRushingTDs: Math.round(predictedRushingTDs * 100) / 100,
                predictedReceivingTDs: Math.round(predictedReceivingTDs * 100) / 100,
                predictedPassingTDs: Math.round(predictedPassingTDs * 100) / 100,
                confidence: this.getConfidenceLevel(gamesPlayed)
            };
        }
        const player = this.playerStats[playerName];
        if (!player) {
            console.log(`Player not found: ${playerName}`);
            return null;
        }
        // Get league averages
        const leagueAvgRushYards = this.calculateLeagueAverage(this.defenseMappings.rb);
        const leagueAvgRecYards = this.calculateLeagueAverage(this.defenseMappings.wr);
        const leagueAvgPassYards = this.calculateLeagueAverage(this.defenseMappings.qb);
        // Get opponent's allowed stats
        const opponentRushAllowed = this.defenseMappings.rb[opponent];
        const opponentRecAllowed = this.defenseMappings.wr[opponent];
        const opponentPassAllowed = this.defenseMappings.qb[opponent];
        if (!opponentRushAllowed || !opponentRecAllowed || !opponentPassAllowed) {
            console.log(`Defense stats not found for opponent: ${opponent}`);
            return null;
        }
        // Calculate adjustment factors
        const rushFactor = opponentRushAllowed / leagueAvgRushYards;
        const recFactor = opponentRecAllowed / leagueAvgRecYards;
        const passFactor = opponentPassAllowed / leagueAvgPassYards;
        // Predict stats using the formula: Player Avg × (Opponent Allowed / League Avg)
        const predictedRushingYards = player.avgRushingYards * rushFactor;
        const predictedReceivingYards = player.avgReceivingYards * recFactor;
        const predictedPassingYards = player.avgPassingYards * passFactor;
        // For TDs, use a similar approach but with more conservative adjustments
        const predictedRushingTDs = player.avgRushingTDs * Math.min(rushFactor, 1.5);
        const predictedReceivingTDs = player.avgReceivingTDs * Math.min(recFactor, 1.5);
        const predictedPassingTDs = player.avgPassingTDs * Math.min(passFactor, 1.5);
        return {
            playerName,
            team: player.team,
            opponent,
            predictedRushingYards: Math.round(predictedRushingYards * 10) / 10,
            predictedReceivingYards: Math.round(predictedReceivingYards * 10) / 10,
            predictedPassingYards: Math.round(predictedPassingYards * 10) / 10,
            predictedRushingTDs: Math.round(predictedRushingTDs * 100) / 100,
            predictedReceivingTDs: Math.round(predictedReceivingTDs * 100) / 100,
            predictedPassingTDs: Math.round(predictedPassingTDs * 100) / 100,
            confidence: this.getConfidenceLevel(player.gamesPlayed)
        };
    }
    searchPlayers(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        for (const player of Object.values(this.playerStats)) {
            if (player.playerName.toLowerCase().includes(lowerQuery)) {
                results.push(player);
            }
        }
        return results.slice(0, 10); // Return top 10 matches
    }
    getAvailableTeams() {
        return Object.keys(this.defenseMappings.rb || {});
    }
    getAllPlayers() {
        return Object.values(this.playerStats);
    }
}
exports.PlayerStatPredictor = PlayerStatPredictor;
// Test function
async function testPrediction() {
    const predictor = new PlayerStatPredictor();
    await predictor.initialize();
    // Test with a few players
    const testCases = [
        { player: "J.Conner", opponent: "Houston Texans" },
        { player: "K.Murray", opponent: "Dallas Cowboys" },
        { player: "J.Cook", opponent: "New England Patriots" }
    ];
    console.log('\n=== Player Stat Predictions ===');
    for (const testCase of testCases) {
        const prediction = predictor.predictPlayerStats(testCase.player, testCase.opponent);
        if (prediction) {
            console.log(`\n${prediction.playerName} vs ${prediction.opponent} (${prediction.confidence} confidence):`);
            console.log(`  Rushing: ${prediction.predictedRushingYards} yds, ${prediction.predictedRushingTDs} TDs`);
            console.log(`  Receiving: ${prediction.predictedReceivingYards} yds, ${prediction.predictedReceivingTDs} TDs`);
            console.log(`  Passing: ${prediction.predictedPassingYards} yds, ${prediction.predictedPassingTDs} TDs`);
        }
    }
    // Show available teams
    console.log('\n=== Available Teams ===');
    const teams = predictor.getAvailableTeams();
    console.log(teams.slice(0, 10).join(', '));
    console.log(`... and ${teams.length - 10} more`);
}
// Run test if called directly
if (require.main === module) {
    testPrediction().catch(console.error);
}
