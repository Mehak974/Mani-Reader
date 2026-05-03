const ingestion = require('../backend/src/services/ingestionLayer');

async function test() {
  try {
    const query = 'Mary Psycho';
    console.log(`Searching for: ${query}`);
    const results = await ingestion.searchManga(query);
    console.log('Results:', JSON.stringify(results.data.results, null, 2));
    
    const query2 = 'Secret Class';
    console.log(`Searching for: ${query2}`);
    const results2 = await ingestion.searchManga(query2);
    console.log('Results 2:', JSON.stringify(results2.data.results, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
