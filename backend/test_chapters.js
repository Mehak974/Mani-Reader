const mangaService = require('./src/services/mangaService');

async function run() {
  try {
    const mangaId = 'yancha-gal-no-anjou-san.20542';
    console.log('Fetching info for', mangaId);
    const results = await mangaService.getMangaInfo(mangaId);
    console.log('Manga Info title:', results.title);
    console.log('Fetching chapters...');
    const chapters = await mangaService.getChapters(mangaId);
    console.log('Chapters found:', chapters.length);
    if (chapters.length > 0) {
      console.log('First chapter:', chapters[0]);
    }
  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    process.exit(0);
  }
}

run();
