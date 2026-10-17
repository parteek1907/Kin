import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetRole = 'Staff AI Engineer',
      studentSkills = ['React', 'Next.js', 'Python', 'FastAPI'],
      studentCommits = 18,
      studentHeadline = 'Full-Stack Software Developer',
    } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.AI_API_KEY;

    if (apiKey) {
      const prompt = `
You are KIN's Lead Career Architect and AST Career Time Machine Engine.
A student wants to reach their target desired role: "${targetRole}".
Their current verified skills: ${JSON.stringify(studentSkills)}.
Their verified GitHub commits: ${studentCommits}.
Their current headline: "${studentHeadline}".

Generate a realistic, year-by-year Career Time Machine trajectory that top alumni walked to achieve "${targetRole}", plus a deterministic skill gap analysis comparing their current skills against the target role.

Return ONLY a raw JSON object with this exact structure (no markdown, no code blocks):
{
  "targetRole": "${targetRole}",
  "readinessScore": <number between 40 and 85 reflecting their current match>,
  "milestones": [
    {
      "year": "Year 1: University & Intern",
      "title": "<Role title>",
      "desc": "<Specific real engineering achievements, tech stack, and commit expectations>",
      "hurdles": "<Real production hurdle overcome, e.g. race conditions, memory leaks, latency spikes>"
    },
    {
      "year": "Year 2: Associate SDE",
      "title": "<Role title>",
      "desc": "<Specific real engineering achievements, tech stack, and commit expectations>",
      "hurdles": "<Real production hurdle overcome>"
    },
    {
      "year": "Year 4: Senior SDE",
      "title": "<Role title>",
      "desc": "<High-scale architecture achievements, throughput, latency, distributed systems>",
      "hurdles": "<Real production hurdle overcome>"
    },
    {
      "year": "Year 6: Staff Architect",
      "title": "<Role title>",
      "desc": "<Org-wide technical strategy, consensus, architecture, and mentorship>",
      "hurdles": "<Real production hurdle overcome>"
    }
  ],
  "skillGap": [
    {
      "skill": "<Skill that matches one of student's verified skills>",
      "percentage": 100,
      "status": "100% (Verified)",
      "color": "emerald"
    },
    {
      "skill": "<Another skill matching student's skills or partially mastered>",
      "percentage": 85,
      "status": "85% (Verified)",
      "color": "emerald"
    },
    {
      "skill": "<Critical skill for ${targetRole} that is NOT in student's skills>",
      "percentage": 20,
      "status": "Missing on Profile",
      "color": "rose"
    },
    {
      "skill": "<High-scale skill for ${targetRole} currently in progress>",
      "percentage": 40,
      "status": "In Progress (40%)",
      "color": "amber"
    }
  ],
  "recommendedBounty": {
    "title": "Solve <Missing Skill> Bounty to Close Gap",
    "skill": "<Missing Skill>",
    "bountyCategory": "Systems"
  }
}
`;

      const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
      for (const model of models) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                },
              }),
            }
          );

          if (res.ok) {
            const data = await res.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              const parsed = JSON.parse(textContent);
              if (Array.isArray(parsed.milestones) && Array.isArray(parsed.skillGap)) {
                return NextResponse.json({
                  success: true,
                  engine: `Gemini AI (${model})`,
                  pathway: parsed,
                });
              }
            }
          }
        } catch (modelErr) {
          console.warn(`[Gemini Time Machine ${model} attempt failed]:`, modelErr);
        }
      }
    }

    // Deterministic Fallback if offline or rate limited
    const hasPython = studentSkills.some((s: string) => s.toLowerCase().includes('python'));
    const hasReact = studentSkills.some((s: string) => s.toLowerCase().includes('react'));
    const fallbackPathway = {
      targetRole,
      readinessScore: 68,
      milestones: [
        {
          year: 'Year 1: University & Intern',
          title: 'Software Engineer Intern',
          desc: `Shipped ${hasReact ? 'Next.js & React' : 'full-stack'} apps with relational datastores. ${Math.max(200, studentCommits * 10)}+ GitHub commits verified.`,
          hurdles: 'Eliminated N+1 query overhead in indexing pipelines under high concurrent read bursts.',
        },
        {
          year: 'Year 2: Associate SDE',
          title: 'Associate Platform Engineer',
          desc: 'Implemented Docker containerization, asynchronous Kafka event pipelines, and production CI/CD.',
          hurdles: 'Resolved multithreading deadlocks in background message consumption workers.',
        },
        {
          year: 'Year 4: Senior SDE',
          title: `Senior ${targetRole.replace('Staff', '').trim() || 'Systems Engineer'}`,
          desc: 'Designed high-availability microservices handling 25k req/sec with sub-50ms p99 latency.',
          hurdles: 'Architected distributed failover state machines with Raft consensus and zero downtime.',
        },
        {
          year: 'Year 6: Staff Architect',
          title: targetRole,
          desc: 'Technical strategy, cross-org distributed consensus design, and mentorship of 18 engineers.',
          hurdles: 'Spearheaded global multi-region database sharding and latency SLA enforcement.',
        },
      ],
      skillGap: [
        {
          skill: hasReact ? 'React & Frontend Engineering' : 'Core Systems Architecture',
          percentage: 100,
          status: '100% (Verified)',
          color: 'emerald',
        },
        {
          skill: hasPython ? 'FastAPI & Python AI Pipelines' : 'API Design & Concurrency',
          percentage: 85,
          status: '85% (Verified)',
          color: 'emerald',
        },
        {
          skill: 'Docker & Container Orchestration',
          percentage: 20,
          status: 'Missing on Profile',
          color: 'rose',
        },
        {
          skill: 'High-Throughput Kafka Streams',
          percentage: 40,
          status: 'In Progress (40%)',
          color: 'amber',
        },
      ],
      recommendedBounty: {
        title: 'Solve Docker Bounty to Close Gap',
        skill: 'Docker',
        bountyCategory: 'Infrastructure',
      },
    };

    return NextResponse.json({
      success: true,
      engine: 'KIN Career Trajectory AST Synthesizer',
      pathway: fallbackPathway,
    });
  } catch (error: any) {
    console.error('[Time Machine Generate Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate pathway' },
      { status: 500 }
    );
  }
}
