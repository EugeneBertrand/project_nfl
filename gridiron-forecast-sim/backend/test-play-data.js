const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Test script to verify play-by-play data
async function testPlayData() {
  const filePath = path.join(__dirname, 'data/play_by_play_2024.csv');
  
  console.log('=== Testing Play-by-Play Data ===\n');
  
  // Test 1: Check file exists and size
  try {
    const stats = fs.statSync(filePath);
    console.log(`✅ File exists: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.log('❌ File not found:', filePath);
    return;
  }
  
  // Test 2: Check first few rows
  const sampleRows = [];
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (sampleRows.length < 5) {
          sampleRows.push(row);
        }
      })
      .on('end', resolve);
  });
  
  console.log('\n=== Sample Data ===');
  sampleRows.forEach((row, i) => {
    console.log(`Row ${i + 1}:`);
    console.log(`  Passer: ${row.passer_player_name || 'N/A'}`);
    console.log(`  Rusher: ${row.rusher_player_name || 'N/A'}`);
    console.log(`  Receiver: ${row.receiver_player_name || 'N/A'}`);
    console.log(`  Rushing Yards: ${row.rushing_yards || 'N/A'}`);
    console.log(`  Receiving Yards: ${row.receiving_yards || 'N/A'}`);
    console.log(`  Passing Yards: ${row.passing_yards || 'N/A'}`);
    console.log(`  Touchdown: ${row.touchdown || 'N/A'}`);
    console.log(`  Rush Attempt: ${row.rush_attempt || 'N/A'}`);
    console.log(`  Pass Attempt: ${row.pass_attempt || 'N/A'}`);
    console.log(`  Complete Pass: ${row.complete_pass || 'N/A'}`);
    console.log('');
  });
  
  // Test 3: Find specific players
  const testPlayers = ['K.Murray', 'J.Conner', 'J.Cook'];
  const playerStats = {};
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        testPlayers.forEach(player => {
          if (!playerStats[player]) playerStats[player] = { rushes: 0, passes: 0, receptions: 0, tds: 0 };
          
          if (row.rusher_player_name === player) {
            playerStats[player].rushes++;
            if (row.touchdown === '1') playerStats[player].tds++;
          }
          if (row.passer_player_name === player) {
            playerStats[player].passes++;
          }
          if (row.receiver_player_name === player) {
            playerStats[player].receptions++;
            if (row.touchdown === '1') playerStats[player].tds++;
          }
        });
      })
      .on('end', resolve);
  });
  
  console.log('=== Player Statistics ===');
  Object.entries(playerStats).forEach(([player, stats]) => {
    console.log(`${player}:`);
    console.log(`  Rush attempts: ${stats.rushes}`);
    console.log(`  Pass attempts: ${stats.passes}`);
    console.log(`  Receptions: ${stats.receptions}`);
    console.log(`  Touchdowns: ${stats.tds}`);
    console.log('');
  });
  
  // Test 4: Check for specific opponent matchups
  console.log('=== Testing Opponent Matchups ===');
  const testMatchup = { player: 'K.Murray', opponent: 'BUF' };
  let matchupCount = 0;
  let totalYards = 0;
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.passer_player_name === testMatchup.player && row.defteam === testMatchup.opponent) {
          matchupCount++;
          totalYards += parseFloat(row.passing_yards) || 0;
        }
      })
      .on('end', resolve);
  });
  
  console.log(`${testMatchup.player} vs ${testMatchup.opponent}:`);
  console.log(`  Plays found: ${matchupCount}`);
  console.log(`  Total passing yards: ${totalYards}`);
  console.log(`  Average per play: ${matchupCount > 0 ? (totalYards / matchupCount).toFixed(2) : 0}`);
}

testPlayData().catch(console.error); 