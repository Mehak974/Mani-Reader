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

  async trackChapterRead() {
    return this.trackMetric('chaptersRead');
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

  async trackTraffic() {
    return this.trackMetric('traffic');
  }

  async trackSessionTime(ms) {
    return this.trackMetric('totalTimeMs', 0, { totalTimeMs: { increment: BigInt(ms) } });
  }

  /**
   * Get stats for dashboard
   */
  async getDashboardStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // All time stats
    const totalUsers = await prisma.user.count();
    const activeNow = await prisma.user.count({
      where: { lastActiveAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } } // Last 5 mins
    });

    // Current Month Metrics
    const monthStart = new Date(currentYear, currentMonth, 1);
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 0);

    const getMonthData = async (start, end) => {
      return prisma.dailyMetric.aggregate({
        where: { date: { gte: start, lte: end || now } },
        _sum: {
          newUsers: true,
          chaptersRead: true,
          adsWatched: true,
          adImpressions: true,
          revenue: true,
          traffic: true,
          totalTimeMs: true
        }
      });
    };

    const current = await getMonthData(monthStart);
    const previous = await getMonthData(prevMonthStart, prevMonthEnd);

    // Helper to calculate trend
    const getTrend = (curr, prev) => {
      const c = curr || 0;
      const p = prev || 0;
      if (p === 0) return c > 0 ? 'up' : 'neutral';
      return c >= p ? 'up' : 'down';
    };

    return {
      activeNow,
      cards: {
        newUsers: { count: current._sum.newUsers || 0, trend: getTrend(current._sum.newUsers, previous._sum.newUsers) },
        chaptersRead: { count: current._sum.chaptersRead || 0, trend: getTrend(current._sum.chaptersRead, previous._sum.chaptersRead) },
        ads: { count: current._sum.adsWatched || 0, trend: getTrend(current._sum.adsWatched, previous._sum.adsWatched) },
        impressions: { count: current._sum.adImpressions || 0, trend: getTrend(current._sum.adImpressions, previous._sum.adImpressions) },
        revenue: { count: (current._sum.revenue || 0).toFixed(2), trend: getTrend(current._sum.revenue, previous._sum.revenue) },
        traffic: { count: current._sum.traffic || 0, trend: getTrend(current._sum.traffic, previous._sum.traffic) },
        timeStayed: { 
          count: Math.round((Number(current._sum.totalTimeMs || 0n) / 1000 / 60)), // in minutes
          trend: getTrend(Number(current._sum.totalTimeMs || 0n), Number(previous._sum.totalTimeMs || 0n))
        }
      }
    };
  }

  async getGraphData(type = 'monthly') {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (type === 'annually') {
      // Return daily data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const raw = await prisma.dailyMetric.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'asc' }
      });

      return raw.map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        users: d.newUsers,
        chapters: d.chaptersRead,
        ads: d.adsWatched,
        revenue: d.revenue,
        traffic: d.traffic,
        time: Number(d.totalTimeMs / 1000n / 60n)
      }));
    }

    if (type === 'monthly') {
      // Return monthly aggregated data for the current year
      const raw = await prisma.dailyMetric.findMany({
        where: { date: { gte: new Date(currentYear, 0, 1) } },
        orderBy: { date: 'asc' }
      });

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const aggregated = months.map(m => ({ name: m, users: 0, chapters: 0, ads: 0, impressions: 0, revenue: 0, traffic: 0, time: 0 }));
      
      raw.forEach(d => {
        const dDate = new Date(d.date);
        if (dDate.getFullYear() === currentYear) {
          const mIdx = dDate.getMonth();
          aggregated[mIdx].users += d.newUsers;
          aggregated[mIdx].chapters += d.chaptersRead;
          aggregated[mIdx].ads += d.adsWatched;
          aggregated[mIdx].impressions += d.adImpressions;
          aggregated[mIdx].revenue += d.revenue;
          aggregated[mIdx].traffic += d.traffic;
          aggregated[mIdx].time += Number(d.totalTimeMs / 1000n / 60n);
        }
      });
      return aggregated;
    }

    return [];
  }
}

module.exports = new AnalyticsService();
