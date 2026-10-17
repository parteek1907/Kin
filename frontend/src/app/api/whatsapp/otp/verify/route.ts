import { NextRequest, NextResponse } from 'next/server';
import { verifyPhoneOtp } from '@/lib/whatsapp/otp';
import { checkRateLimit } from '@/lib/whatsapp/security';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateLimit = checkRateLimit(`otp_verify_${ip}`, 15, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please retry in ${rateLimit.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { phone, code, userId } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone number and 6-digit code are required.' }, { status: 400 });
    }

    const result = await verifyPhoneOtp(phone, code, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 400 });
  }
}
