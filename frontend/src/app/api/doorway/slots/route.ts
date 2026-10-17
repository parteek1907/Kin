import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'live_doorway_slots.json');

export interface DoorwaySlot {
  id: string;
  professionalEmail: string;
  professionalName: string;
  role: string;
  company: string;
  institution?: string;
  specialty: string;
  exp: string;
  rating: string;
  fee: number;
  isAvailable: boolean;
  availableSlots: string[];
  bio?: string;
  updatedAt?: string;
}

function readSlots(): DoorwaySlot[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading live_doorway_slots.json', e);
    return [];
  }
}

function writeSlots(slots: DoorwaySlot[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(slots, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing live_doorway_slots.json', e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('professionalEmail')?.toLowerCase();
    const name = searchParams.get('professionalName')?.toLowerCase();
    const onlyAvailable = searchParams.get('onlyAvailable') === 'true';

    let slots = readSlots();

    // Strictly filter out any mock seeds or student entries - only keep real professional offerings
    slots = slots.filter((s) => {
      const isStudent = s.role && s.role.toLowerCase().includes('student');
      const isMockSeed = s.id === 'doorway-parth' || s.id === 'doorway-sneha' || s.id === 'doorway-vikram';
      return !isStudent && !isMockSeed;
    });

    if (email) {
      slots = slots.filter((s) => s.professionalEmail.toLowerCase() === email);
    } else if (name) {
      slots = slots.filter((s) => s.professionalName.toLowerCase().includes(name));
    } else if (onlyAvailable) {
      slots = slots.filter((s) => s.isAvailable);
    }

    return NextResponse.json({ success: true, slots });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      professionalEmail,
      professionalName,
      role,
      company,
      institution,
      specialty,
      exp,
      fee,
      isAvailable = true,
      availableSlots = [],
      bio = '',
    } = body;

    if (!professionalName) {
      return NextResponse.json({ success: false, error: 'Professional name is required' }, { status: 400 });
    }

    const slots = readSlots();
    const emailKey = (professionalEmail || '').toLowerCase();
    const nameKey = professionalName.toLowerCase();

    // Check if slot already exists for this professional
    const existingIndex = slots.findIndex(
      (s) =>
        (emailKey && s.professionalEmail.toLowerCase() === emailKey) ||
        s.professionalName.toLowerCase() === nameKey
    );

    const effectiveRole = (!role || role.toLowerCase().includes('student'))
      ? 'Senior Technical Leader & Mentor'
      : role;

    const slotPayload: DoorwaySlot = {
      id: existingIndex >= 0 ? slots[existingIndex].id : `doorway-${Date.now()}`,
      professionalEmail: professionalEmail || 'professional@kin.network',
      professionalName,
      role: effectiveRole,
      company: company || institution || 'Global Tech Core',
      institution: institution || 'IIIT Delhi Alumni Network',
      specialty: specialty || 'System Architecture & Scalability Drill',
      exp: exp || '8 yrs exp',
      rating: existingIndex >= 0 ? slots[existingIndex].rating : '5.0 ★',
      fee: Number(fee) || 1000,
      isAvailable: isAvailable !== false,
      availableSlots: availableSlots.length > 0 ? availableSlots : [
        'Saturday, 10:00 AM - 10:20 AM',
        'Saturday, 3:00 PM - 3:20 PM',
        'Sunday, 11:00 AM - 11:20 AM'
      ],
      bio: bio || 'High-leverage, human-verified 20-min consult protected by Kin anti-AI-slop guarantee.',
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      slots[existingIndex] = { ...slots[existingIndex], ...slotPayload };
    } else {
      slots.unshift(slotPayload);
    }

    writeSlots(slots);
    return NextResponse.json({ success: true, slot: slotPayload });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
