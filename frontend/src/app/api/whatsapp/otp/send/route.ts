import { NextRequest, NextResponse } from 'next/server';
import { requestPhoneOtp } from '@/lib/whatsapp/otp';
import { checkRateLimit } from '@/lib/whatsapp/security';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateLimit = checkRateLimit(`otp_send_${ip}`, 10, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please retry in ${rateLimit.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { phone, userId } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const result = await requestPhoneOtp(phone, userId, ip);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 400 });
  }
}
