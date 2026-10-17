import { NextRequest, NextResponse } from 'next/server';
import { SEED_NODES } from '@/data/seedGraph';
import { matchIntentAgainstNodes } from '@/utils/graphAlgorithms';
import { fetchBackend } from '@/lib/backendClient';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string is required' }, { status: 400 });
    }

    // Query backend service via internal binding if configured
    if (process.env.BACKEND_URL) {
      try {
        const backendRes = await fetchBackend('/api/v1/unclaimed-talent-radar/discover?mode=comprehensive', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (backendRes.ok) {
          const backendData = await backendRes.json();
          if (backendData?.items && backendData.items.length > 0) {
            return NextResponse.json({
              success: true,
              query,
              source: 'backend_service',
              count: backendData.items.length,
              matches: backendData.items.slice(0, 5),
            });
          }
        }
      } catch {
        // Gracefully fall back to deterministic local graph matching
      }
    }

    const matches = matchIntentAgainstNodes(query, SEED_NODES);

    return NextResponse.json({
      success: true,
      query,
      source: 'seed_graph',
      count: matches.length,
      matches: matches.slice(0, 5),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

