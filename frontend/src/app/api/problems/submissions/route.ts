import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { CandidateSolutionSubmission } from '@/data/alumniProblems';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'live_submissions.json');

function readLiveSubmissions(): CandidateSolutionSubmission[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(raw) as CandidateSolutionSubmission[];
  } catch (error) {
    console.error('[Submissions API read error]:', error);
    return [];
  }
}

function writeLiveSubmissions(submissions: CandidateSolutionSubmission[]) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(submissions, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Submissions API write error]:', error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get('problemId');

    let submissions = readLiveSubmissions();

    if (problemId) {
      submissions = submissions.filter((s) => s.problemId === problemId);
    }

    return NextResponse.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch candidate submissions.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      problemId,
      problemQuestion,
      studentName = 'Student Builder',
      studentCollege = 'IIIT Delhi',
      studentAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      repoUrl,
      liveDemoUrl,
      approachSummary = '',
      testsPassed = '24/24 tests passed (100%)',
    } = body;

    if (!problemId || !repoUrl) {
      return NextResponse.json(
        { success: false, error: 'Problem ID and GitHub Repository URL are required.' },
        { status: 400 }
      );
    }

    const currentSubmissions = readLiveSubmissions();

    const newSubmission: CandidateSolutionSubmission = {
      id: `sub-${Date.now()}`,
      problemId,
      problemQuestion: problemQuestion || 'Alumni Problem Solution',
      studentName: studentName.trim() || 'Student Builder',
      studentCollege: studentCollege.trim() || 'Engineering Undergraduate',
      studentAvatar,
      repoUrl: repoUrl.trim(),
      liveDemoUrl: liveDemoUrl?.trim() || undefined,
      approachSummary: approachSummary.trim() || 'Implemented core architecture with full test verification.',
      testsPassed: testsPassed || '24/24 tests passed (100%)',
      submittedAt: 'Just now',
      status: 'pending',
    };

    const updated = [newSubmission, ...currentSubmissions];
    writeLiveSubmissions(updated);

    return NextResponse.json({
      success: true,
      message: 'Solution successfully submitted directly to the Alumni Reviewer!',
      submission: newSubmission,
      totalCount: updated.length,
    });
  } catch (error: any) {
    console.error('[Submissions API POST error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit solution.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Submission ID and status are required.' },
        { status: 400 }
      );
    }

    const currentSubmissions = readLiveSubmissions();
    const index = currentSubmissions.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 });
    }

    currentSubmissions[index] = {
      ...currentSubmissions[index],
      status,
    };

    writeLiveSubmissions(currentSubmissions);

    return NextResponse.json({
      success: true,
      message: `Submission marked as ${status}.`,
      submission: currentSubmissions[index],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update submission status.' },
      { status: 500 }
    );
  }
}
