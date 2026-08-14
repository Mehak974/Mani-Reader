const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const r = await axios.get('https://www.manganato.gg/manga/the-second-eunuch-regains-his-manhood', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(r.data);
  
  console.log('=== Chapter links on detail page ===');
  const chapterLinks = $('a[href*="chapter-"]');
  console.log('Total chapter links:', chapterLinks.length);
  
  chapterLinks.each((i, el) => {
    if (i < 5) {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      console.log(`Chapter ${i+1}: ${text} - ${href}`);
    }
  });
  
  console.log('\n=== Looking for chapter list container ===');
  $('.chapter-list, .chapters-list, #chapter-list, .list-chapter, .chapter_item').each((i, el) => {
    console.log(`Found: ${el.tagName}.${el.attribs.class || ''}`);
    console.log($(el).html()?.substring(0, 300));
  });
}

test().catch(e => console.error(e.message));
