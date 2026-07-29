import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalPosts = await prisma.post.count();
    const submissions = await prisma.submission.findMany({
      include: {
        post: { select: { title: true, trackingCode: true } },
        designation: true,
      },
    });

    const totalSubmissions = submissions.length;

    // Unique employees (by full name)
    const uniqueEmployeesSet = new Set(submissions.map((s) => s.fullName));
    const totalEmployeesParticipated = uniqueEmployeesSet.size;

    let totalInteractions = 0;
    let facebookSubmissions = 0;
    let instagramSubmissions = 0;
    let linkedinSubmissions = 0;
    let xSubmissions = 0;

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
      const fb: string[] = sub.facebookActions ? JSON.parse(sub.facebookActions) : [];
      const ig: string[] = sub.instagramActions ? JSON.parse(sub.instagramActions) : [];
      const li: string[] = sub.linkedinActions ? JSON.parse(sub.linkedinActions) : [];
      const x: string[] = sub.xActions ? JSON.parse(sub.xActions) : [];

      if (fb.length > 0) facebookSubmissions++;
      if (ig.length > 0) instagramSubmissions++;
      if (li.length > 0) linkedinSubmissions++;
      if (x.length > 0) xSubmissions++;

      const allActions = [...fb, ...ig, ...li, ...x];
      totalInteractions += allActions.length;

      allActions.forEach((act) => {
        if (actionCounts[act] !== undefined) {
          actionCounts[act]++;
        } else {
          actionCounts[act] = 1;
        }
      });
    });

    // Breakdown per platform
    const platformData = [
      { name: 'Facebook', count: facebookSubmissions },
      { name: 'Instagram', count: instagramSubmissions },
      { name: 'LinkedIn', count: linkedinSubmissions },
      { name: 'X (Twitter)', count: xSubmissions },
    ];

    // Breakdown per interaction type
    const interactionData = Object.entries(actionCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Post participation breakdown
    const postsWithCounts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        trackingCode: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const postMetrics = postsWithCounts.map((p) => ({
      title: p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title,
      submissions: p._count.submissions,
    }));

    return NextResponse.json({
      summary: {
        totalPosts,
        totalSubmissions,
        totalEmployeesParticipated,
        totalInteractions,
      },
      platformData,
      interactionData,
      postMetrics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
