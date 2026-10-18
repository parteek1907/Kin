import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface OutreachApplication {
  id: string;
  studentEmail: string;
  studentName: string;
  studentCollege: string;
  professionalName: string;
  professionalRole: string;
  professionalCompany?: string;
  professionalAvatar?: string;
  policy: string;
  targetMatch: number;
  currentMatch: number;
  met: string[];
  missing: string[];
  atsFeedback?: string;
  submittedAt: string;
  status: 'evaluated' | 'in_manual_queue' | 'connected' | 'declined';
  manualNote?: string;
  evaluatedAt: string;
}

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'live_outreach_applications.json');

function readApplications(): OutreachApplication[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[Outreach Read Error]:', err);
    return [];
  }
}

function writeApplications(apps: OutreachApplication[]) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Outreach Write Error]:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'student' | 'manual_queue'
    const studentEmail = searchParams.get('studentEmail');
    const professionalName = searchParams.get('professionalName');

    const allApps = readApplications();

    if (type === 'manual_queue') {
      // Returns items in the professional's manual triage queue
      const queue = allApps.filter((a) => {
        if (a.status !== 'in_manual_queue') return false;
        if (professionalName && professionalName !== 'all') {
          return a.professionalName.toLowerCase() === professionalName.toLowerCase();
        }
        return true;
      });

      return NextResponse.json({
        success: true,
        count: queue.length,
        queue: queue.map((a) => ({
          id: a.id,
          name: a.studentName,
          college: a.studentCollege,
          match: a.currentMatch,
          missing: a.missing.join(', ') || 'None',
          note: a.manualNote || 'Candidate submitted to manual triage queue.',
          studentEmail: a.studentEmail,
          professionalName: a.professionalName,
        })),
      });
    }

    // Default: return student's evaluated outreach list (Image 1)
    let filtered = allApps;
    if (studentEmail) {
      filtered = filtered.filter(
        (a) => a.studentEmail.toLowerCase() === studentEmail.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      applications: filtered,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch outreach applications.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentEmail = 'builder@kin.network',
      studentName = 'Student Builder',
      studentCollege = 'IIIT Delhi',
      professionalName,
      professionalRole = 'Staff Engineer',
      professionalCompany = 'Global Tech',
      professionalAvatar,
      policy,
      targetMatch = 75,
      currentMatch = 60,
      met = [],
      missing = [],
      atsFeedback = '',
      manualNote,
      action = 'create', // 'create' | 'submit_manual_queue' | 'instant_connect'
    } = body;

    if (!professionalName) {
      return NextResponse.json(
        { success: false, error: 'Professional name is required.' },
        { status: 400 }
      );
    }

    const allApps = readApplications();

    // Check if an existing application exists between this student & professional
    const existingIndex = allApps.findIndex(
      (a) =>
        a.professionalName.toLowerCase() === professionalName.toLowerCase() &&
        a.studentEmail.toLowerCase() === studentEmail.toLowerCase()
    );

    let targetApp: OutreachApplication;

    if (action === 'submit_manual_queue') {
      if (existingIndex !== -1) {
        allApps[existingIndex].status = 'in_manual_queue';
        allApps[existingIndex].manualNote = manualNote || 'Candidate requested review.';
        targetApp = allApps[existingIndex];
      } else {
        targetApp = {
          id: `outreach-${Date.now()}`,
          studentEmail,
          studentName,
          studentCollege,
          professionalName,
          professionalRole,
          professionalCompany,
          professionalAvatar,
          policy:
            policy ||
            `Requires ≥ ${targetMatch}% match, ${mandatorySkillsSummary(met, missing)}, and min commits.`,
          targetMatch: Number(targetMatch),
          currentMatch: Number(currentMatch),
          met,
          missing,
          atsFeedback,
          submittedAt: 'Just now',
          status: 'in_manual_queue',
          manualNote: manualNote || 'Candidate requested review.',
          evaluatedAt: new Date().toISOString(),
        };
        allApps.unshift(targetApp);
      }
    } else if (action === 'instant_connect') {
      if (existingIndex !== -1) {
        allApps[existingIndex].status = 'connected';
        targetApp = allApps[existingIndex];
      } else {
        targetApp = {
          id: `outreach-${Date.now()}`,
          studentEmail,
          studentName,
          studentCollege,
          professionalName,
          professionalRole,
          professionalCompany,
          professionalAvatar,
          policy: policy || `Requires ≥ ${targetMatch}% match.`,
          targetMatch: Number(targetMatch),
          currentMatch: Number(currentMatch),
          met,
          missing,
          atsFeedback,
          submittedAt: 'Just now',
          status: 'connected',
          evaluatedAt: new Date().toISOString(),
        };
        allApps.unshift(targetApp);
      }
    } else {
      // Default: create / update evaluated application
      const newApp: OutreachApplication = {
        id: existingIndex !== -1 ? allApps[existingIndex].id : `outreach-${Date.now()}`,
        studentEmail,
        studentName,
        studentCollege,
        professionalName,
        professionalRole,
        professionalCompany,
        professionalAvatar,
        policy:
          policy ||
          `Requires ≥ ${targetMatch}% match, ${mandatorySkillsSummary(met, missing)}, and min commits.`,
        targetMatch: Number(targetMatch),
        currentMatch: Number(currentMatch),
        met,
        missing,
        atsFeedback,
        submittedAt: 'Just now',
        status: 'evaluated',
        evaluatedAt: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        allApps[existingIndex] = newApp;
      } else {
        allApps.unshift(newApp);
      }
      targetApp = newApp;
    }

    writeApplications(allApps);

    return NextResponse.json({
      success: true,
      message: 'Outreach application updated successfully!',
      application: targetApp,
      totalCount: allApps.length,
    });
  } catch (error: any) {
    console.error('[Outreach POST error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit outreach application.' },
      { status: 500 }
    );
  }
}

function mandatorySkillsSummary(met: string[], missing: string[]): string {
  const all = [...met, ...missing].map((s) => s.replace(/ \(.*\)/, '')).filter(Boolean);
  return Array.from(new Set(all)).slice(0, 3).join(', ') || 'React, Docker';
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body; // action: 'approve' | 'decline'

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'ID and action required.' }, { status: 400 });
    }

    const allApps = readApplications();
    const index = allApps.findIndex((a) => a.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    if (action === 'approve') {
      allApps[index].status = 'connected';
    } else {
      allApps[index].status = 'declined';
    }

    writeApplications(allApps);

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Connected with candidate!' : 'Declined candidate request.',
      application: allApps[index],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update outreach application.' },
      { status: 500 }
    );
  }
}
