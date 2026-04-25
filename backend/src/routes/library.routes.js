'use strict';
const router = require('express').Router();
const userState = require('../services/userStateService');
const auth = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// All library routes require auth
router.use(auth);

// POST /api/library — create library
router.post('/', validate(schemas.createLibrary), async (req, res) => {
  try {
    const lib = await userState.createLibrary(req.user.userId, req.body.name);
    res.status(201).json(lib);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Library name already exists' });
    res.status(err.status || 500).json({ error: err.message });
  }
});

// GET /api/library — get all libraries
router.get('/', async (req, res) => {
  try {
    const libs = await userState.getLibraries(req.user.userId);
    res.json(libs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/library/:id
router.delete('/:id', async (req, res) => {
  try {
    await userState.deleteLibrary(req.user.userId, req.params.id);
    res.json({ message: 'Library deleted' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// POST /api/library/:id/add — add manga to library
router.post('/:id/add', validate(schemas.addToLibrary), async (req, res) => {
  try {
    const item = await userState.addToLibrary(req.user.userId, req.params.id, req.body.mangaId);
    res.status(201).json(item);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

// DELETE /api/library/:id/remove?mangaId=
router.delete('/:id/remove', async (req, res) => {
  try {
    const { mangaId } = req.query;
    if (!mangaId) return res.status(400).json({ error: 'mangaId required' });
    await userState.removeFromLibrary(req.user.userId, req.params.id, mangaId);
    res.json({ message: 'Removed from library' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
