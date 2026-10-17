import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface MilestoneItem {
  id: string;
  period: string;
  role: string;
  comp: string;
  hurdles: string;
  skills?: string[];
  createdAt?: string;
}

const MILESTONES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'live_career_milestones.json');

function readMilestones(): Record<string, MilestoneItem[]> {
  try {
    if (!fs.existsSync(MILESTONES_FILE_PATH)) {
      fs.writeFileSync(MILESTONES_FILE_PATH, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const raw = fs.readFileSync(MILESTONES_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Career Milestones Read Error]:', err);
    return {};
  }
}

function writeMilestones(data: Record<string, MilestoneItem[]>) {
  try {
    const dir = path.dirname(MILESTONES_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(MILESTONES_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Career Milestones Write Error]:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail')?.toLowerCase();
    const name = searchParams.get('name')?.toLowerCase();
    const all = readMilestones();

    let milestones: MilestoneItem[] = [];

    if (userEmail && all[userEmail]) {
      milestones = all[userEmail];
    } else if (name) {
      // Find by name in keys or fallback
      const foundKey = Object.keys(all).find((k) => k.toLowerCase().includes(name) || name.includes(k.toLowerCase()));
      if (foundKey && all[foundKey]) {
        milestones = all[foundKey];
      }
    }

    if (!milestones || milestones.length === 0) {
      // Fallback to default
      milestones = all['default'] || [];
    }

    return NextResponse.json({
      success: true,
      milestones,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userEmail = 'default',
      period = '2024 - Present',
      role,
      comp,
      hurdles = 'Solved core architecture and concurrency bottlenecks.',
      skills = [],
    } = body;

    if (!role || !comp) {
      return NextResponse.json(
        { success: false, error: 'Role and company/organization are required.' },
        { status: 400 }
      );
    }

    const key = (userEmail || 'default').toLowerCase();
    const all = readMilestones();
    const userMilestones = all[key] || [];

    const newMilestone: MilestoneItem = {
      id: `cm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      period,
      role,
      comp,
      hurdles,
      skills: Array.isArray(skills) ? skills : [],
      createdAt: new Date().toISOString(),
    };

    userMilestones.unshift(newMilestone);
    all[key] = userMilestones;
    writeMilestones(all);

    return NextResponse.json({
      success: true,
      message: 'Career milestone published successfully!',
      milestone: newMilestone,
      milestones: userMilestones,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save milestone' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userEmail = (searchParams.get('userEmail') || 'default').toLowerCase();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Milestone ID required.' }, { status: 400 });
    }

    const all = readMilestones();
    if (all[userEmail]) {
      all[userEmail] = all[userEmail].filter((m) => m.id !== id);
      writeMilestones(all);
    }

    return NextResponse.json({
      success: true,
      message: 'Milestone removed.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
