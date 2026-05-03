const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://mangakatana.com';

async function testSearch(query) {
  try {
    const res = await axios.get(`${BASE_URL}/`, {
      params: {
        search: query,
        search_by: 'm_name'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    const $ = cheerio.load(res.data);
    const results = [];
    $('#book_list .item').each((i, el) => {
      results.push($(el).find('.title a').text().trim());
    });
    console.log(`Query: ${query}`);
    console.log(`Results:`, results);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

testSearch('Mary Psycho');
testSearch('Secret Class');
