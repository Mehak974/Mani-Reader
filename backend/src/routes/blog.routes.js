'use strict';
const router = require('express').Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// GET /api/blog — retrieve posts list (optionally filter by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const posts = await prisma.blogPost.findMany({
      where: category ? {
        category: {
          name: {
            equals: category,
            mode: 'insensitive'
          }
        }
      } : undefined,
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blog/:slug — retrieve single post
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        entries: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!post) return res.status(404).json({ error: 'Blog post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blog — Create post (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, slug, content, category } = req.body;
    if (!title || !slug || !content || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const formattedCategory = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();
    const dbCategory = await prisma.category.upsert({
      where: { name: formattedCategory },
      update: {},
      create: { name: formattedCategory }
    });
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post = await prisma.blogPost.create({
      data: { 
        title, 
        slug: cleanSlug, 
        content, 
        categoryId: dbCategory.id 
      }
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/blog/:id — Update post (Admin only)
router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, slug, content, category } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) {
      const formattedCategory = category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();
      const dbCategory = await prisma.category.upsert({
        where: { name: formattedCategory },
        update: {},
        create: { name: formattedCategory }
      });
      updateData.categoryId = dbCategory.id;
    }
    if (slug !== undefined) {
      updateData.slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/blog/:id — Delete post (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.blogPost.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blog/:id/entries — Create entry (Admin only)
router.post('/:id/entries', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, slug, content, image, genre } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const entry = await prisma.blogEntry.create({
      data: {
        blogPostId: req.params.id,
        title,
        slug: cleanSlug,
        content,
        description: content,
        image: image || null,
        imageUrl: image || '',
        genre: genre || ''
      }
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/blog/:id/entries/:entryId — Update entry (Admin only)
router.patch('/:id/entries/:entryId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, slug, content, image, genre } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) {
      updateData.content = content;
      updateData.description = content;
    }
    if (image !== undefined) {
      updateData.image = image;
      updateData.imageUrl = image || '';
    }
    if (genre !== undefined) {
      updateData.genre = genre;
    }
    if (slug !== undefined) {
      updateData.slug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const entry = await prisma.blogEntry.update({
      where: { id: req.params.entryId },
      data: updateData
    });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/blog/:id/entries/:entryId — Delete entry (Admin only)
router.delete('/:id/entries/:entryId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.blogEntry.delete({
      where: { id: req.params.entryId }
    });
    res.json({ message: 'Blog entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

