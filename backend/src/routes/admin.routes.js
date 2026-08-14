'use strict';
const router = require('express').Router();
const prisma = require('../lib/prisma');
const adminMiddleware = require('../middleware/admin');
const analyticsService = require('../services/analyticsService');

// All routes require ADMIN role
router.use(adminMiddleware);

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/graph-data?type=monthly
router.get('/graph-data', async (req, res) => {
  try {
    const data = await analyticsService.getGraphData(req.query.type);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {

    const totalUsers = await prisma.user.count();
    const totalLibraries = await prisma.library.count();
    const totalReadCounts = await prisma.manga.aggregate({
      _sum: { readCount: true }
    });
    const totalChaptersRead = await prisma.progress.count({
      where: { isRead: true }
    });
    const totalMessages = await prisma.contactMessage.count();
    
    res.json({
      totalUsers,
      totalLibraries,
      totalReads: totalReadCounts._sum.readCount || 0,
      totalChaptersRead,
      totalMessages
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/top-readers
router.get('/top-readers', async (req, res) => {
  try {
    const readers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        pagesViewed: true,
        _count: {
          select: { progress: { where: { isRead: true } } }
        }
      },
      orderBy: [
        { progress: { _count: 'desc' } },
        { pagesViewed: 'desc' }
      ],
      take: 20
    });

    const results = readers.map(r => ({
      id: r.id,
      email: r.email,
      chaptersRead: r._count.progress,
      pagesViewed: r.pagesViewed
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', async (req, res) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, email: true, role: true, isVip: true, 
        adsWatched: true, adsClicked: true, timeSpent: true, createdAt: true
        // FIX #2: password hash intentionally excluded — admins have no reason to see it
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        ratings: { include: { manga: { select: { title: true } } } },
        history: { 
          include: { manga: { select: { title: true, genres: true } } },
          orderBy: { timestamp: 'desc' },
          take: 50
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Calculate top genres
    const genreCounts = {};
    user.history.forEach(h => {
      h.manga.genres.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Most read manga
    const mangaCounts = {};
    user.history.forEach(h => {
      mangaCounts[h.manga.title] = (mangaCounts[h.manga.title] || 0) + 1;
    });
    const mostRead = Object.entries(mangaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));

    const totalChaptersRead = await prisma.progress.count({
      where: { userId: req.params.id, isRead: true }
    });

    res.json({
      ...user,
      stats: {
        topGenres,
        mostRead,
        totalRatings: user.ratings.length,
        totalChaptersRead
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/vip
router.patch('/users/:id/vip', async (req, res) => {
  try {
    const { isVip } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isVip }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'TOGGLE_VIP',
        target: user.email,
        details: `Set to ${isVip}`
      }
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/ban
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned }
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
        target: user.email
      }
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/search-analytics
router.get('/search-analytics', async (req, res) => {
  try {
    const keywords = await prisma.searchKeyword.findMany({
      orderBy: { count: 'desc' },
      take: 10
    });
    res.json(keywords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/ad-stats
router.get('/ad-stats', async (req, res) => {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      last7Days.push(d);
    }

    const metrics = await prisma.dailyMetric.findMany({
      where: { date: { in: last7Days } },
      orderBy: { date: 'asc' }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const results = last7Days.map(date => {
      const dayName = days[date.getDay()];
      const m = metrics.find(item => item.date.getTime() === date.getTime());
      return {
        name: dayName,
        impressions: m ? m.traffic : 0, // Using traffic as a proxy for impressions
        clicks: m ? m.adsClicked : 0,
        revenue: m ? m.revenue.toFixed(2) : "0.00"
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/announcements
router.post('/announcements', async (req, res) => {
  try {
    const { message } = req.body;
    const ann = await prisma.announcement.create({ data: { message } });
    
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'BROADCAST',
        details: `Message: ${message}`
      }
    });

    res.json(ann);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/manga
router.get('/manga', async (req, res) => {
  try {
    const mangas = await prisma.manga.findMany({
      include: {
        _count: {
          select: { 
            bookmarks: true,
            ratings: true,
            chapters: true
          }
        },
        ratings: {
          select: { score: true }
        },
        popularity: {
          select: { uniqueUsersCount: true }
        }
      },
      orderBy: { readCount: 'desc' },
      take: 50
    });

    const results = mangas.map(m => {
      const avg = m.ratings.length > 0 
        ? (m.ratings.reduce((acc, r) => acc + r.score, 0) / m.ratings.length).toFixed(1)
        : '0.0';
      
      const collectionCount = m._count.bookmarks;
      
      return {
        id: m.id,
        title: m.title,
        readCount: m.readCount,
        collectionCount,
        averageRating: avg,
        ratingsCount: m._count.ratings,
        chapterCount: m._count.chapters,
        uniqueUsers: m.popularity?.uniqueUsersCount || 0
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/messages/:id/reply
router.patch('/messages/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    const msg = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { reply }
    });
    
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'REPLY_MESSAGE',
        target: msg.email,
        details: reply.substring(0, 100)
      }
    });
    
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });
    
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'DELETE_USER',
        target: user.email
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/banned-ips
router.get('/banned-ips', async (req, res) => {
  try {
    const ips = await prisma.bannedIp.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(ips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/banned-ips
router.post('/banned-ips', async (req, res) => {
  try {
    const { ip, reason } = req.body;
    const banned = await prisma.bannedIp.create({ data: { ip, reason } });
    
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'IP_BAN',
        target: ip,
        details: reason
      }
    });
    
    res.json(banned);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/banned-ips/:ip
router.delete('/banned-ips/:ip', async (req, res) => {
  try {
    await prisma.bannedIp.delete({ where: { ip: req.params.ip } });
    
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'IP_UNBAN',
        target: req.params.ip
      }
    });
    
    res.json({ message: 'IP unbanned' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/manga/:id/hide
router.patch('/manga/:id/hide', async (req, res) => {
  try {
    const { isHidden } = req.body;
    const manga = await prisma.manga.update({
      where: { id: req.params.id },
      data: { isHidden }
    });
    
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: isHidden ? 'HIDE_MANGA' : 'SHOW_MANGA',
        target: manga.title
      }
    });
    
    res.json(manga);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (req.params.id === req.user.userId) return res.status(400).json({ error: 'Cannot change your own role' });
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });
    
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'CHANGE_ROLE',
        target: user.email,
        details: `To ${role}`
      }
    });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const map = {};
    settings.forEach(s => {
      map[s.key] = s.value === 'true' ? true : s.value === 'false' ? false : s.value;
    });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/settings
router.patch('/settings', async (req, res) => {
  try {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }
    
    await prisma.auditLog.create({
      data: {
        adminId: req.user.userId,
        action: 'UPDATE_SETTINGS',
        details: JSON.stringify(settings)
      }
    });
    
    res.json({ message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/guest-users
router.get('/guest-users', async (req, res) => {
  try {

    const guests = await prisma.guestUser.findMany({
      orderBy: { lastActive: 'desc' },
      take: 200
    });
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
