'use strict';
const router = require('express').Router();
const userState = require('../services/userStateService');
const auth = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(auth);

// POST /api/bookmark
router.post('/', validate(schemas.bookmark), async (req, res) => {
  try {
    const { mangaId, chapterId, page } = req.body;
    const bm = await userState.upsertBookmark(req.user.userId, mangaId, chapterId, page);
    res.status(201).json(bm);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/bookmark
router.get('/', async (req, res) => {
  try {
    const bookmarks = await userState.getBookmarks(req.user.userId);
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bookmark/:mangaId
router.delete('/:mangaId', async (req, res) => {
  try {
    await userState.deleteBookmark(req.user.userId, req.params.mangaId);
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
