/**
 * Manga Routes — Mani Reader Backend
 *
 * All data flows through mangaService → ingestionLayer → mangakatanaScraper
 */

const { Router } = require('express');
const mangaService = require('../services/mangaService');
const { proxyImage } = require('../services/imageProxy');

const router = Router();

// ─────────────────────────────────────────────────────────
// GET /api/manga/search?q=naruto&page=1
// ─────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  const { q, page = 1 } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    const results = await mangaService.search(q.trim(), Number(page));
    return res.json({ results });
  } catch (err) {
    console.error('[Manga] /search error:', err.message);
    return res.status(500).json({ error: 'Failed to search manga.', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/manga/popular?page=1&genre=action
// ─────────────────────────────────────────────────────────
router.get('/popular', async (req, res) => {
  const { page = 1, genre } = req.query;
  try {
    const results = await mangaService.getPopular(Number(page), null, genre || null);
    return res.json({ results });
  } catch (err) {
    console.error('[Manga] /popular error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch popular manga.', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/manga/latest?page=1
// ─────────────────────────────────────────────────────────
router.get('/latest', async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const results = await mangaService.getRecent(Number(page));
    return res.json({ results });
  } catch (err) {
    console.error('[Manga] /latest error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch latest manga.', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/manga/most-read
// ─────────────────────────────────────────────────────────
router.get('/most-read', async (req, res) => {
  try {
    const results = await mangaService.getPopularByScore(20);
    return res.json(results);
  } catch (err) {
    console.error('[Manga] /most-read error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch most-read manga.', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/manga/browse
// ─────────────────────────────────────────────────────────
router.get('/browse', async (req, res) => {
  try {
    const data = await mangaService.browse(req.query);
    return res.json(data);
  } catch (err) {
    console.error('[Manga] /browse error:', err.message);
    return res.status(500).json({ error: 'Failed to browse manga.', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/manga/related/:mangaId
// ─────────────────────────────────────────────────────────
router.get('/related/:mangaId', async (req, res) => {
  try {
    const related = await mangaService.getRelated(req.params.mangaId);
    return res.json(related);
  } catch (err) {
    console.error('[Manga] /related error:', err.message);
    return res.json([]);
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/manga/:mangaId  (info)
// ─────────────────────────────────────────────────────────
router.get('/:mangaId', async (req, res) => {
  try {
    const info = await mangaService.getMangaInfo(req.params.mangaId);
    return res.json({ data: info });
  } catch (err) {
    console.error('[Manga] /:mangaId error:', err.message);
    return res.status(err.status || 500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/manga/:mangaId/chapters
// ─────────────────────────────────────────────────────────
router.get('/:mangaId/chapters', async (req, res) => {
  try {
    const chapters = await mangaService.getChapters(req.params.mangaId);
    return res.json({ chapters });
  } catch (err) {
    console.error('[Manga] /chapters error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch chapters.', detail: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/manga/:mangaId/rate  { score }
// ─────────────────────────────────────────────────────────
router.post('/:mangaId/rate', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  try {
    const rating = await mangaService.rateManga(req.user.id, req.params.mangaId, req.body.score);
    return res.json(rating);
  } catch (err) {
    console.error('[Manga] /rate error:', err.message);
    return res.status(500).json({ error: 'Failed to rate manga.' });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/manga/image-proxy?url=<encoded_url>
// ─────────────────────────────────────────────────────────
router.get('/image-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param required' });
  try {
    const decoded = decodeURIComponent(url);
    await proxyImage(decoded, res);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL or proxy failure', detail: err.message });
  }
});

module.exports = router;

