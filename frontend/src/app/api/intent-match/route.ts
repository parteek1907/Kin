import { NextRequest, NextResponse } from 'next/server';
import { SEED_NODES } from '@/data/seedGraph';
import { matchIntentAgainstNodes } from '@/utils/graphAlgorithms';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query string is required' }, { status: 400 });
    }

    const matches = matchIntentAgainstNodes(query, SEED_NODES);

    return NextResponse.json({
      success: true,
      query,
      count: matches.length,
      matches: matches.slice(0, 5)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
