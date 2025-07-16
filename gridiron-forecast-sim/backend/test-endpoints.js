const fetch = require('node-fetch');

const endpoints = [
  { path: 'players', expectedFields: ['play_id', 'game_id', 'home_team'] },
  { path: 'defensewr', expectedFields: ['Receiving', 'Fantasy'] },
  { path: 'defenseqb', expectedFields: ['Passing', 'Rushing', 'Fantasy'] },
  { path: 'defenserb', expectedFields: ['Rushing', 'Receiving', 'Fantasy'] },
  { path: 'defensete', expectedFields: ['Receiving', 'Fantasy'] },
];

const BASE_URL = 'http://localhost:4000';

async function testEndpoint({ path, expectedFields }) {
  try {
    const res = await fetch(`${BASE_URL}/${path}`);
    if (!res.ok) {
      console.error(`❌ ${path}: HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.error(`❌ ${path}: Response is not an array`);
      return;
    }
    if (data.length === 0) {
      console.error(`❌ ${path}: Array is empty`);
      return;
    }
    const first = data[0];
    const missingFields = expectedFields.filter(f => !(f in first));
    if (missingFields.length > 0) {
      console.error(`❌ ${path}: Missing fields in first item: ${missingFields.join(', ')}`);
    } else {
      console.log(`✅ ${path}: Returned ${data.length} items, all expected fields present`);
    }
  } catch (err) {
    console.error(`❌ ${path}:`, err.message);
  }
}

(async () => {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
})(); 