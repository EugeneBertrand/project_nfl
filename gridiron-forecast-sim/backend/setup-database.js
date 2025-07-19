const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csvParser = require('csv-parser');

// Create database
const db = new sqlite3.Database('./nfl_data.db');

// Create table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS plays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    play_id TEXT,
    game_id TEXT,
    week INTEGER,
    posteam TEXT,
    defteam TEXT,
    passer_player_name TEXT,
    rusher_player_name TEXT,
    receiver_player_name TEXT,
    rushing_yards REAL,
    receiving_yards REAL,
    passing_yards REAL,
    rush_touchdown INTEGER,
    pass_touchdown INTEGER,
    play_type TEXT
  )`);

  console.log('Table created. Importing data...');
  
  // Import CSV data
  const plays = [];
  fs.createReadStream('./data/play_by_play_2024.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      plays.push([
        row.play_id,
        row.game_id,
        parseInt(row.week) || null,
        row.posteam,
        row.defteam,
        row.passer_player_name,
        row.rusher_player_name,
        row.receiver_player_name,
        parseFloat(row.rushing_yards) || null,
        parseFloat(row.receiving_yards) || null,
        parseFloat(row.passing_yards) || null,
        row.rush_touchdown === '1' ? 1 : 0,
        row.pass_touchdown === '1' ? 1 : 0,
        row.play_type
      ]);
    })
    .on('end', () => {
      console.log(`Imported ${plays.length} plays`);
      
      // Insert data in batches
      const stmt = db.prepare(`INSERT INTO plays (
        play_id, game_id, week, posteam, defteam, 
        passer_player_name, rusher_player_name, receiver_player_name,
        rushing_yards, receiving_yards, passing_yards,
        rush_touchdown, pass_touchdown, play_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      plays.forEach(play => stmt.run(play));
      stmt.finalize(() => {
        console.log('Database setup complete!');
        db.close();
      });
    });
});
