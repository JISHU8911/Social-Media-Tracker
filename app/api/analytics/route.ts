import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession, isPlatformSuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let whereOrg: any = {};
    if (!isPlatformSuperAdmin(session)) {
      if (!session.organizationId) {
        return NextResponse.json({
          summary: {
            totalPosts: 0,
            totalSubmissions: 0,
            totalEmployeesParticipated: 0,
            totalInteractions: 0,
          },
          platformData: [],
          interactionData: [],
          postMetrics: [],
          upcomingEntries: [],
          topContributors: [],
          platformAnalytics: {},
        });
      }
      whereOrg = { organizationId: session.organizationId };
    }

    const totalPosts = await prisma.post.count({ where: whereOrg });

    const submissions = await prisma.submission.findMany({
      where: whereOrg,
      include: {
        post: { select: { title: true, trackingCode: true } },
        designation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Upcoming Calendar Entries (Next 3 entries)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const upcomingEntries = await prisma.calendarEntry.findMany({
      where: {
        ...whereOrg,
        date: { gte: startOfToday },
      },
      orderBy: { date: 'asc' },
      take: 3,
      select: {
        id: true,
        title: true,
        date: true,
        targetTime: true,
        status: true,
      },
    });

    // If less than 3 upcoming entries found by date, fill with most recent entries
    let formattedUpcoming = upcomingEntries.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      targetTime: e.targetTime,
      status: e.status,
    }));

    if (formattedUpcoming.length < 3) {
      const recentCalendarEntries = await prisma.calendarEntry.findMany({
        where: whereOrg,
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          date: true,
          targetTime: true,
          status: true,
        },
      });
      const ids = new Set(formattedUpcoming.map((u) => u.id));
      recentCalendarEntries.forEach((re) => {
        if (formattedUpcoming.length < 3 && !ids.has(re.id)) {
          formattedUpcoming.push({
            id: re.id,
            title: re.title,
            date: re.date,
            targetTime: re.targetTime,
            status: re.status,
          });
        }
      });
    }

    const totalSubmissions = submissions.length;
    const uniqueEmployeesSet = new Set(submissions.map((s) => s.fullName));
    const totalEmployeesParticipated = uniqueEmployeesSet.size;

    let totalInteractions = 0;
    const contributorMap: Record<
      string,
      { name: string; designation: string; interactions: number }
    > = {};

    // Platform interaction counters & trend aggregators
    const platformCounters = {
      Facebook: { interactions: 0, submissionsCount: 0 },
      Instagram: { interactions: 0, submissionsCount: 0 },
      LinkedIn: { interactions: 0, submissionsCount: 0 },
      X: { interactions: 0, submissionsCount: 0 },
      WhatsApp: { interactions: 0, submissionsCount: 0 },
    };

    const actionCounts: Record<string, number> = {
      Like: 0,
      Comment: 0,
      Share: 0,
      Story: 0,
      Repost: 0,
      Reply: 0,
      'Quote Post': 0,
    };

    submissions.forEach((sub) => {
      let fb: string[] = [];
      let ig: string[] = [];
      let li: string[] = [];
      let x: string[] = [];

      try {
        fb = sub.facebookActions ? JSON.parse(sub.facebookActions) : [];
      } catch (e) {}
      try {
        ig = sub.instagramActions ? JSON.parse(sub.instagramActions) : [];
      } catch (e) {}
      try {
        li = sub.linkedinActions ? JSON.parse(sub.linkedinActions) : [];
      } catch (e) {}
      try {
        x = sub.xActions ? JSON.parse(sub.xActions) : [];
      } catch (e) {}

      if (fb.length > 0) {
        platformCounters.Facebook.submissionsCount++;
        platformCounters.Facebook.interactions += fb.length;
      }
      if (ig.length > 0) {
        platformCounters.Instagram.submissionsCount++;
        platformCounters.Instagram.interactions += ig.length;
      }
      if (li.length > 0) {
        platformCounters.LinkedIn.submissionsCount++;
        platformCounters.LinkedIn.interactions += li.length;
      }
      if (x.length > 0) {
        platformCounters.X.submissionsCount++;
        platformCounters.X.interactions += x.length;
      }

      const allActions = [...fb, ...ig, ...li, ...x];
      const subInteractionsCount = allActions.length;
      totalInteractions += subInteractionsCount;

      allActions.forEach((act) => {
        actionCounts[act] = (actionCounts[act] || 0) + 1;
      });

      // Contributor leaderboard aggregation
      const contributorKey = `${sub.fullName.toUpperCase()}__${
        sub.designation?.designationName || 'Member'
      }`;
      if (!contributorMap[contributorKey]) {
        contributorMap[contributorKey] = {
          name: sub.fullName,
          designation: sub.designation?.designationName || 'Member',
          interactions: 0,
        };
      }
      contributorMap[contributorKey].interactions += subInteractionsCount;
    });

    // WhatsApp Broadcast Activity counter (from calendar entries or reminder modals)
    const calendarEntriesWithReminders = await prisma.calendarEntry.count({
      where: whereOrg,
    });
    platformCounters.WhatsApp.interactions = calendarEntriesWithReminders;
    platformCounters.WhatsApp.submissionsCount = calendarEntriesWithReminders;

    // Leaderboard ranking calculation
    const badges = ['🥇', '🥈', '🥉', '🏅', '🏅'];
    const topContributors = Object.values(contributorMap)
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 5)
      .map((item, idx) => ({
        rank: idx + 1,
        badge: badges[idx] || '🏅',
        name: item.name,
        designation: item.designation,
        totalInteractions: item.interactions,
      }));

    const platformData = [
      { name: 'Facebook', count: platformCounters.Facebook.submissionsCount },
      { name: 'Instagram', count: platformCounters.Instagram.submissionsCount },
      { name: 'LinkedIn', count: platformCounters.LinkedIn.submissionsCount },
      { name: 'X (Twitter)', count: platformCounters.X.submissionsCount },
      { name: 'WhatsApp', count: platformCounters.WhatsApp.submissionsCount },
    ];

    const interactionData = Object.entries(actionCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Generate mock/calculated trend activities for each platform
    const platformAnalytics: Record<string, any> = {};
    const platformKeys = ['Facebook', 'Instagram', 'LinkedIn', 'X', 'WhatsApp'];

    platformKeys.forEach((key) => {
      const stats = platformCounters[key as keyof typeof platformCounters] || {
        interactions: 0,
        submissionsCount: 0,
      };

      const participationPercent =
        totalSubmissions > 0
          ? Math.min(100, Math.round((stats.submissionsCount / totalSubmissions) * 100))
          : 0;

      // Sample activity trends
      const dailyActivity = [
        { day: 'Mon', count: Math.round(stats.interactions * 0.1) },
        { day: 'Tue', count: Math.round(stats.interactions * 0.15) },
        { day: 'Wed', count: Math.round(stats.interactions * 0.2) },
        { day: 'Thu', count: Math.round(stats.interactions * 0.25) },
        { day: 'Fri', count: Math.round(stats.interactions * 0.18) },
        { day: 'Sat', count: Math.round(stats.interactions * 0.07) },
        { day: 'Sun', count: Math.round(stats.interactions * 0.05) },
      ];

      const weeklyActivity = [
        { week: 'W1', count: Math.round(stats.interactions * 0.2) },
        { week: 'W2', count: Math.round(stats.interactions * 0.25) },
        { week: 'W3', count: Math.round(stats.interactions * 0.3) },
        { week: 'W4', count: Math.round(stats.interactions * 0.25) },
      ];

      const monthlyActivity = [
        { month: 'Jan', count: Math.round(stats.interactions * 0.1) },
        { month: 'Feb', count: Math.round(stats.interactions * 0.12) },
        { month: 'Mar', count: Math.round(stats.interactions * 0.15) },
        { month: 'Apr', count: Math.round(stats.interactions * 0.18) },
        { month: 'May', count: Math.round(stats.interactions * 0.22) },
        { month: 'Jun', count: Math.round(stats.interactions * 0.23) },
      ];

      platformAnalytics[key] = {
        totalInteractions: stats.interactions,
        participationPercent,
        dailyActivity,
        weeklyActivity,
        monthlyActivity,
      };
    });

    return NextResponse.json({
      summary: {
        totalPosts,
        totalSubmissions,
        totalEmployeesParticipated,
        totalInteractions,
      },
      platformData,
      interactionData,
      upcomingEntries: formattedUpcoming,
      topContributors,
      platformAnalytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        summary: {
          totalPosts: 0,
          totalSubmissions: 0,
          totalEmployeesParticipated: 0,
          totalInteractions: 0,
        },
        platformData: [],
        interactionData: [],
        upcomingEntries: [],
        topContributors: [],
        platformAnalytics: {},
      },
      { status: 200 }
    );
  }
}
