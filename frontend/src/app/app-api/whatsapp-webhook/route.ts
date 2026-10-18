import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // WhatsApp webhook verification handshake
  const searchParams = req.nextUrl.searchParams;
  const hubMode = searchParams.get('hub.mode');
  const hubChallenge = searchParams.get('hub.challenge');
  const hubVerifyToken = searchParams.get('hub.verify_token');

  const expectedToken = process.env.WA_VERIFY_TOKEN || 'kin_campus_secret';
  if (hubMode === 'subscribe' && hubVerifyToken === expectedToken) {
    return new NextResponse(hubChallenge, { status: 200 });
  }

  return NextResponse.json({ status: 'Kin WhatsApp Gateway Live' });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Parse incoming webhook simulation
    const { from, type, text, audioUrl, buttonId } = payload;

    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      sender: from || '+91-98110-CAMPUS',
      actionDispatched: buttonId ? 'vouch_resolution' : type === 'voice' ? 'transcribe_and_route' : 'intent_search',
      status: 'processed'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
