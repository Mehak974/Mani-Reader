'use strict';
/**
 * USER STATE SERVICE
 *
 * Owns: libraries, bookmarks, history, reading progress.
 * This is the stable dataset — all writes are authoritative.
 */

const prisma = require('../lib/prisma');

// ── Libraries ─────────────────────────────────────────────────────────────────

async function createLibrary(userId, name) {
  return prisma.library.create({ data: { userId, name } });
}

async function getLibraries(userId) {
  return prisma.library.findMany({
    where: { userId },
    include: { items: { include: { manga: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function deleteLibrary(userId, libraryId) {
  const lib = await prisma.library.findFirst({ where: { id: libraryId, userId } });
  if (!lib) throw Object.assign(new Error('Library not found'), { status: 404 });
  return prisma.library.delete({ where: { id: libraryId } });
}

async function addToLibrary(userId, libraryId, mangaId) {
  const lib = await prisma.library.findFirst({ where: { id: libraryId, userId } });
  if (!lib) throw Object.assign(new Error('Library not found'), { status: 404 });
  return prisma.libraryItem.upsert({
    where: { libraryId_mangaId: { libraryId, mangaId } },
    update: {},
    create: { libraryId, mangaId },
  });
}

async function removeFromLibrary(userId, libraryId, mangaId) {
  const lib = await prisma.library.findFirst({ where: { id: libraryId, userId } });
  if (!lib) throw Object.assign(new Error('Library not found'), { status: 404 });
  return prisma.libraryItem.delete({
    where: { libraryId_mangaId: { libraryId, mangaId } },
  });
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

async function upsertBookmark(userId, mangaId, chapterId, page) {
  return prisma.bookmark.upsert({
    where: { userId_mangaId: { userId, mangaId } },
    update: { chapterId, page },
    create: { userId, mangaId, chapterId, page },
  });
}

async function getBookmarks(userId) {
  return prisma.bookmark.findMany({
    where: { userId },
    include: { manga: true, chapter: true },
    orderBy: { updatedAt: 'desc' },
  });
}

async function deleteBookmark(userId, mangaId) {
  return prisma.bookmark.deleteMany({ where: { userId, mangaId } });
}

// ── History ───────────────────────────────────────────────────────────────────

async function addHistory(userId, mangaId, chapterId, page) {
  if (!userId) return { guest: true };

  // Delete existing history for this manga to ensure only the latest read chapter/page is kept
  await prisma.history.deleteMany({
    where: { userId, mangaId }
  });
  return prisma.history.create({ data: { userId, mangaId, chapterId, page } });
}

async function getHistory(userId, skip = 0, take = 50) {
  return prisma.history.findMany({
    where: { userId },
    include: { manga: true, chapter: true },
    orderBy: { timestamp: 'desc' },
    skip,
    take,
  });
}

async function clearHistory(userId) {
  return prisma.history.deleteMany({ where: { userId } });
}

// ── Progress ──────────────────────────────────────────────────────────────────

async function updatePopularity(mangaId, userId, guestId = null) {
  try {
    let isNewUser = false;
    
    if (userId) {
      // 1. Check if user has read any other chapter of this manga before this one
      const readCount = await prisma.progress.count({
        where: { userId, mangaId, isRead: true }
      });
      // If readCount is 1, it means THIS is the first chapter they've read (since this is called after the update)
      isNewUser = readCount === 1;
    } else if (guestId) {
      // Check if this guest has read this manga before
      try {
        await prisma.guestActivity.create({
          data: { mangaId, guestId }
        });
        isNewUser = true; // Created successfully means it's a new unique guest for this manga
      } catch (err) {
        // P2002 is unique constraint violation (already exists)
        if (err.code !== 'P2002') {
          console.error('[Popularity] Guest activity tracking failed:', err.message);
        }
      }
    }

    // 2. Get manga info for total chapters
    const manga = await prisma.manga.findUnique({
      where: { id: mangaId },
      select: { chapters: { select: { id: true } } }
    });
    const totalChapters = manga?.chapters?.length || 0;

    // 3. Update Popularity
    const pop = await prisma.popularity.findUnique({ where: { mangaId } });
    
    const newReadChapters = (pop?.totalReadChapters || 0) + 1;
    const newUniqueUsers = (pop?.uniqueUsersCount || 0) + (isNewUser ? 1 : 0);
    
    // Formula: (totalChapters * uniqueUsers) / totalReadChapters
    let score = 0;
    if (newReadChapters > 0) {
      score = (totalChapters * newUniqueUsers) / newReadChapters;
    }

    await prisma.popularity.upsert({
      where: { mangaId },
      update: {
        totalReadChapters: newReadChapters,
        uniqueUsersCount: newUniqueUsers,
        totalChapters: totalChapters,
        score: score
      },
      create: {
        mangaId,
        totalReadChapters: newReadChapters,
        uniqueUsersCount: newUniqueUsers,
        totalChapters: totalChapters,
        score: score
      }
    });
  } catch (err) {
    console.error('[Popularity] Failed to update:', err.message);
  }
}

async function upsertProgress(userId, mangaId, chapterId, page, isRead = false, guestId = null) {
  let isNewRead = false;
  
  if (!userId) {
    // Guest read: skip progress saving but update popularity if it's a NEW "read" event
    if (isRead && guestId) {
      try {
        await prisma.guestChapterRead.create({
          data: { chapterId, guestId }
        });
        isNewRead = true;

        await prisma.manga.update({
          where: { id: mangaId },
          data: { readCount: { increment: 1 } }
        }).catch(() => {});
        
        await updatePopularity(mangaId, null, guestId);
        
        const analyticsService = require('./analyticsService');
        analyticsService.trackChapterRead(true).catch(() => {});
      } catch (err) {
        // P2002 is unique constraint violation (already read this chapter)
        if (err.code !== 'P2002') {
          console.error('[Progress] Guest read tracking failed:', err.message);
        }
      }
    }
    return { guest: true, isRead, isNewRead };
  }

  const existing = await prisma.progress.findUnique({
    where: { userId_chapterId: { userId, chapterId } }
  });

  const wasAlreadyRead = existing?.isRead || false;

  const result = await prisma.progress.upsert({
    where: { userId_chapterId: { userId, chapterId } },
    update: { page, isRead, mangaId },
    create: { userId, mangaId, chapterId, page, isRead },
  });

  // If newly marked as read
  if (isRead && !wasAlreadyRead) {
    isNewRead = true;
    await prisma.manga.update({
      where: { id: mangaId },
      data: { readCount: { increment: 1 } }
    }).catch(() => {});

    // Update the new Popularity entity
    await updatePopularity(mangaId, userId);

    const analyticsService = require('./analyticsService');
    analyticsService.trackChapterRead(false).catch(() => {});
  }

  return { ...result, isNewRead };
}

async function getProgressForManga(userId, mangaId) {
  return prisma.progress.findMany({
    where: { userId, mangaId },
    orderBy: { updatedAt: 'desc' },
  });
}

async function getLastProgress(userId, mangaId) {
  return prisma.progress.findFirst({
    where: { userId, mangaId },
    orderBy: { updatedAt: 'desc' },
    include: { chapter: true },
  });
}

module.exports = {
  createLibrary, getLibraries, deleteLibrary, addToLibrary, removeFromLibrary,
  upsertBookmark, getBookmarks, deleteBookmark,
  addHistory, getHistory, clearHistory,
  upsertProgress, getProgressForManga, getLastProgress,
  updatePopularity,
};
