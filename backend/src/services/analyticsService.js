'use strict';
const prisma = require('../lib/prisma');

const REVENUE_WATCH = 0.05;
const REVENUE_CLICK = 0.25;

class AnalyticsService {
  /**
   * Get start of today (midnight)
   */
  getToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Increment a specific metric for today
   */
  async trackMetric(field, amount = 1, extra = {}) {
    try {
      const today = this.getToday();
      
      let revenueAdd = 0;
      if (field === 'adsWatched') revenueAdd = amount * REVENUE_WATCH;
      if (field === 'adsClicked') revenueAdd = amount * REVENUE_CLICK;

      await prisma.dailyMetric.upsert({
        where: { date: today },
        update: {
          [field]: { increment: amount },
          revenue: { increment: revenueAdd },
          ...extra
        },
        create: {
          date: today,
          [field]: amount,
          revenue: revenueAdd,
          ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, v.increment || v]))
        }
      });
    } catch (err) {
      console.error('Analytics tracking failed:', err);
    }
  }

  async trackNewUser() {
    return this.trackMetric('newUsers');
  }

  async trackChapterRead(isGuest = false) {
    return this.trackMetric(isGuest ? 'guestChaptersRead' : 'chaptersRead');
  }

  async trackAdWatch() {
    return this.trackMetric('adsWatched');
  }

  async trackAdClick() {
    return this.trackMetric('adsClicked');
  }

  async trackAdImpression() {
    return this.trackMetric('adImpressions');
  }

  async trackTraffic(isGuest = false) {
    return this.trackMetric(isGuest ? 'guestTraffic' : 'traffic');
  }

  async trackSessionTime(ms) {
    return this.trackMetric('totalTimeMs', 0, { totalTimeMs: { increment: BigInt(ms) } });
  }

  /**
   * Get stats for dashboard
   */
  async getDashboardStats() {
    const today = this.getToday();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // All time stats
    const totalUsers = await prisma.user.count();
    
    // Active Now (Realtime - last 5 mins)
    const activeUsers = await prisma.user.count({
      where: { lastActiveAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } }
    });
    
    // Estimate active guests (from guest activity table if recent)
    const activeGuests = await prisma.guestActivity.count({
      where: { createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } }
    });

    const monthStart = new Date(currentYear, currentMonth, 1);
    const yearStart = new Date(currentYear, 0, 1);

    const getAgg = async (start) => {
      return prisma.dailyMetric.aggregate({
        where: { date: { gte: start } },
        _sum: {
          newUsers: true,
          chaptersRead: true,
          guestChaptersRead: true,
          adsWatched: true,
          revenue: true,
          traffic: true,
          guestTraffic: true,
          totalTimeMs: true
        }
      });
    };

    const todayData = await prisma.dailyMetric.findUnique({ where: { date: today } }) || {};
    const monthData = await getAgg(monthStart);
    const yearData = await getAgg(yearStart);

    return {
      activeNow: activeUsers + activeGuests,
      totalUsers,
      today: {
        newUsers: todayData.newUsers || 0,
        chaptersRead: (todayData.chaptersRead || 0) + (todayData.guestChaptersRead || 0),
        userChapters: todayData.chaptersRead || 0,
        guestChapters: todayData.guestChaptersRead || 0,
        traffic: (todayData.traffic || 0) + (todayData.guestTraffic || 0),
        userTraffic: todayData.traffic || 0,
        guestTraffic: todayData.guestTraffic || 0,
        adsWatched: todayData.adsWatched || 0,
        revenue: (todayData.revenue || 0).toFixed(2),
        timeSpent: Math.round(Number(todayData.totalTimeMs || 0n) / 1000 / 60)
      },
      month: {
        newUsers: monthData._sum.newUsers || 0,
        chaptersRead: (monthData._sum.chaptersRead || 0) + (monthData._sum.guestChaptersRead || 0),
        traffic: (monthData._sum.traffic || 0) + (monthData._sum.guestTraffic || 0),
        adsWatched: monthData._sum.adsWatched || 0,
        revenue: (monthData._sum.revenue || 0).toFixed(2),
        timeSpent: Math.round(Number(monthData._sum.totalTimeMs || 0n) / 1000 / 60)
      },
      year: {
        newUsers: yearData._sum.newUsers || 0,
        chaptersRead: (yearData._sum.chaptersRead || 0) + (yearData._sum.guestChaptersRead || 0),
        traffic: (yearData._sum.traffic || 0) + (yearData._sum.guestTraffic || 0),
        adsWatched: yearData._sum.adsWatched || 0,
        revenue: (yearData._sum.revenue || 0).toFixed(2),
        timeSpent: Math.round(Number(yearData._sum.totalTimeMs || 0n) / 1000 / 60)
      }
    };
  }

  async getGraphData(type = 'today') {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (type === 'today') {
      // For "Today", we'd ideally want hourly data, but let's return last 24h of daily metrics for now or just today
      const raw = await prisma.dailyMetric.findMany({
        where: { date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Last 7 days for "Daily" view
        orderBy: { date: 'asc' }
      });
      return raw.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        users: d.newUsers,
        chapters: (d.chaptersRead || 0) + (d.guestChaptersRead || 0),
        revenue: d.revenue,
        traffic: (d.traffic || 0) + (d.guestTraffic || 0)
      }));
    }

    if (type === 'monthly') {
      const raw = await prisma.dailyMetric.findMany({
        where: { date: { gte: new Date(currentYear, 0, 1) } },
        orderBy: { date: 'asc' }
      });
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const aggregated = months.map(m => ({ name: m, users: 0, chapters: 0, revenue: 0, traffic: 0 }));
      raw.forEach(d => {
        const mIdx = new Date(d.date).getMonth();
        aggregated[mIdx].users += d.newUsers;
        aggregated[mIdx].chapters += (d.chaptersRead || 0) + (d.guestChaptersRead || 0);
        aggregated[mIdx].revenue += d.revenue;
        aggregated[mIdx].traffic += (d.traffic || 0) + (d.guestTraffic || 0);
      });
      return aggregated;
    }

    if (type === 'yearly') {
       // Return yearly data for last 5 years
       const aggregated = [];
       for(let i=4; i>=0; i--) {
          const year = currentYear - i;
          const data = await prisma.dailyMetric.aggregate({
            where: { date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
            _sum: { newUsers: true, chaptersRead: true, guestChaptersRead: true, revenue: true, traffic: true, guestTraffic: true }
          });
          aggregated.push({
            name: year.toString(),
            users: data._sum.newUsers || 0,
            chapters: (data._sum.chaptersRead || 0) + (data._sum.guestChaptersRead || 0),
            revenue: data._sum.revenue || 0,
            traffic: (data._sum.traffic || 0) + (data._sum.guestTraffic || 0)
          });
       }
       return aggregated;
    }

    return [];
  }
}

module.exports = new AnalyticsService();
