import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { AlumniProblem } from '@/data/alumniProblems';

const DATA_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'live_problems.json');

function readLiveProblems(): AlumniProblem[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(raw) as AlumniProblem[];
  } catch (error) {
    console.error('[Problems API read error]:', error);
    return [];
  }
}

function writeLiveProblems(problems: AlumniProblem[]) {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(problems, null, 2), 'utf-8');
  } catch (error) {
    console.error('[Problems API write error]:', error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let problems = readLiveProblems();

    if (category && category !== 'All') {
      problems = problems.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch problem statements.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      question,
      category = 'Healthcare',
      alumniCompany = 'Enterprise Tech',
      bountyReward = '₹25,000 / $300 USDC',
      context = '',
      starterRepoUrl = 'https://github.com/kin-network/starter-template',
      alumniName = 'Verified Alumni',
      alumniTitle = 'Senior Engineering Architect',
      requiredTech = ['Next.js', 'PostgreSQL', 'Docker', 'FastAPI'],
    } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required.' },
        { status: 400 }
      );
    }

    const currentProblems = readLiveProblems();

    // Determine card styling based on category
    const cardVariant =
      category === 'Housing' || category === 'Consumer Services'
        ? 'blue'
        : category === 'Healthcare'
        ? 'blue'
        : 'charcoal';

    const newProblem: AlumniProblem = {
      id: `prob-${Date.now()}`,
      category,
      cardVariant: cardVariant as any,
      question: question.trim(),
      alumniName: alumniName.trim() || 'Verified Alumni',
      alumniTitle: alumniTitle.trim() || 'Senior Engineering Architect',
      alumniCompany: alumniCompany.trim() || 'TechCorp',
      bountyReward: bountyReward.trim() || '₹25,000 / $300 USDC',
      rewardType: 'USDC',
      requiredTech: Array.isArray(requiredTech) ? requiredTech : ['Next.js', 'FastAPI'],
      context: context.trim() || 'Real production architecture bottleneck requiring AST-verified solution.',
      starterRepoUrl: starterRepoUrl.trim() || 'https://github.com/kin-network/starter-template',
      deadline: '7 days left',
      testCasesCount: Math.floor(15 + Math.random() * 15),
      status: 'open',
    };

    const updated = [newProblem, ...currentProblems];
    writeLiveProblems(updated);

    return NextResponse.json({
      success: true,
      message: 'Problem statement successfully published to KIN network!',
      problem: newProblem,
      totalCount: updated.length,
    });
  } catch (error: any) {
    console.error('[Problems API POST error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish problem statement.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const currentProblems = readLiveProblems();
    const updated = currentProblems.filter((p) => p.id !== id);
    writeLiveProblems(updated);

    return NextResponse.json({
      success: true,
      message: 'Problem statement deleted.',
      totalCount: updated.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete problem statement.' },
      { status: 500 }
    );
  }
}
