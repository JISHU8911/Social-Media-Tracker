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
          platformData: [
            { name: 'Facebook', count: 0 },
            { name: 'Instagram', count: 0 },
            { name: 'LinkedIn', count: 0 },
            { name: 'X (Twitter)', count: 0 },
          ],
          interactionData: [],
          postMetrics: [],
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
    });

    const postsWithCounts = await prisma.post.findMany({
      where: whereOrg,
      select: {
        id: true,
        title: true,
        trackingCode: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalSubmissions = submissions.length;
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

    const platformData = [
      { name: 'Facebook', count: facebookSubmissions },
      { name: 'Instagram', count: instagramSubmissions },
      { name: 'LinkedIn', count: linkedinSubmissions },
      { name: 'X (Twitter)', count: xSubmissions },
    ];

    const interactionData = Object.entries(actionCounts).map(([name, count]) => ({
      name,
      count,
    }));

    const postMetrics = postsWithCounts.map((p) => ({
      title: p.title.length > 25 ? p.title.substring(0, 25) + '...' : p.title,
      submissions: p._count?.submissions || 0,
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
    return NextResponse.json(
      {
        summary: {
          totalPosts: 0,
          totalSubmissions: 0,
          totalEmployeesParticipated: 0,
          totalInteractions: 0,
        },
        platformData: [
          { name: 'Facebook', count: 0 },
          { name: 'Instagram', count: 0 },
          { name: 'LinkedIn', count: 0 },
          { name: 'X (Twitter)', count: 0 },
        ],
        interactionData: [],
        postMetrics: [],
      },
      { status: 200 }
    );
  }
}
