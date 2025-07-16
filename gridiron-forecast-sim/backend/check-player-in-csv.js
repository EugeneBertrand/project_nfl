const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const filePath = path.join(__dirname, 'data/play_by_play_2024.csv');
const playerNames = ['A.Dalton', 'Andy Dalton']; // Add any name variants you want to check

let passerCount = 0;
let rusherCount = 0;
let receiverCount = 0;

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    if (playerNames.includes(row.passer_player_name)) passerCount++;
    if (playerNames.includes(row.rusher_player_name)) rusherCount++;
    if (playerNames.includes(row.receiver_player_name)) receiverCount++;
  })
  .on('end', () => {
    console.log('Andy Dalton stats in play_by_play_2024.csv:');
    console.log(`  As Passer:   ${passerCount}`);
    console.log(`  As Rusher:   ${rusherCount}`);
    console.log(`  As Receiver: ${receiverCount}`);
    if (passerCount + rusherCount + receiverCount === 0) {
      console.log('No plays found for Andy Dalton.');
    }
  }); 