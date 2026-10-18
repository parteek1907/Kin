import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const BOOKINGS_FILE = path.join(process.cwd(), 'src', 'data', 'live_doorway_bookings.json');

export interface DoorwayBooking {
  id: string;
  doorwayId: string;
  professionalEmail: string;
  professionalName: string;
  studentName: string;
  studentEmail: string;
  studentCollege: string;
  fee: number;
  slot: string;
  topic: string;
  status: 'confirmed' | 'completed' | 'paid_out';
  bookedAt: string;
}

function readBookings(): DoorwayBooking[] {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading live_doorway_bookings.json', e);
    return [];
  }
}

function writeBookings(bookings: DoorwayBooking[]) {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing live_doorway_bookings.json', e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const professionalEmail = searchParams.get('professionalEmail')?.toLowerCase();
    const professionalName = searchParams.get('professionalName')?.toLowerCase();
    const studentEmail = searchParams.get('studentEmail')?.toLowerCase();

    let bookings = readBookings();

    if (professionalEmail || professionalName) {
      bookings = bookings.filter((b) => {
        const matchesEmail = professionalEmail && b.professionalEmail.toLowerCase() === professionalEmail;
        const matchesName = professionalName && b.professionalName.toLowerCase().includes(professionalName);
        return matchesEmail || matchesName;
      });
    } else if (studentEmail) {
      bookings = bookings.filter((b) => b.studentEmail.toLowerCase() === studentEmail);
    }

    // Calculate real financial metrics for the filtered bookings
    const totalSessions = bookings.length;
    const grossRevenue = bookings.reduce((acc, curr) => acc + (curr.fee || 0), 0);
    const share50 = grossRevenue * 0.5;

    // Only confirmed / completed sessions that have not yet been paid out
    const pendingSettlement = bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((acc, curr) => acc + (curr.fee || 0) * 0.5, 0);

    return NextResponse.json({
      success: true,
      bookings,
      stats: {
        totalSessions,
        grossRevenue,
        share50,
        pendingSettlement,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      doorwayId,
      professionalEmail,
      professionalName,
      studentName,
      studentEmail,
      studentCollege,
      fee,
      slot,
      topic,
    } = body;

    if (!professionalName || !studentName) {
      return NextResponse.json(
        { success: false, error: 'Professional and student names are required' },
        { status: 400 }
      );
    }

    const bookings = readBookings();

    const newBooking: DoorwayBooking = {
      id: `booking-${Date.now()}`,
      doorwayId: doorwayId || `doorway-${Date.now()}`,
      professionalEmail: professionalEmail || 'professional@kin.network',
      professionalName,
      studentName,
      studentEmail: studentEmail || 'student@iiitd.ac.in',
      studentCollege: studentCollege || 'IIIT Delhi',
      fee: Number(fee) || 1000,
      slot: slot || 'Saturday, 3:00 PM - 3:20 PM',
      topic: topic || 'High-leverage architecture and code drill',
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    bookings.unshift(newBooking);
    writeBookings(bookings);

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, professionalEmail, professionalName } = body;

    if (action === 'payout') {
      const bookings = readBookings();
      const emailKey = (professionalEmail || '').toLowerCase();
      const nameKey = (professionalName || '').toLowerCase();

      let paidAmount = 0;
      let count = 0;

      const updated = bookings.map((b) => {
        const matches =
          (emailKey && b.professionalEmail.toLowerCase() === emailKey) ||
          (nameKey && b.professionalName.toLowerCase().includes(nameKey));

        if (matches && (b.status === 'confirmed' || b.status === 'completed')) {
          paidAmount += (b.fee || 0) * 0.5;
          count++;
          return { ...b, status: 'paid_out' as const };
        }
        return b;
      });

      writeBookings(updated);

      return NextResponse.json({
        success: true,
        paidAmount,
        settledSessionsCount: count,
        message: `Settlement of ₹${paidAmount.toLocaleString()} paid out instantly!`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
