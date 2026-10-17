import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { requesterId, targetId, bridgeId, action } = await req.json();

    if (!requesterId || !targetId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // In-memory simulation of 1-tap warm vouch handshake
    const isVouched = action === 'vouch';
    const timestamp = new Date().toISOString();

    const responsePayload = {
      success: true,
      status: isVouched ? 'vouched' : 'declined',
      edgeStatus: isVouched ? 'vouched' : 'tentative',
      edgeColor: isVouched ? '#FACC15' : '#4B5563',
      groupCreated: isVouched,
      groupDetails: isVouched ? {
        channelId: `grp-${Date.now()}`,
        channelName: 'Conduit Warm Intro: Rohan + Dr. Sharma + Parteek',
        participants: [requesterId, bridgeId || 'node-dr-sharma', targetId],
        vouchedAt: timestamp,
        briefingDelivered: true
      } : null
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
