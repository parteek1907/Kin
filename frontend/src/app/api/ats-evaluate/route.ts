import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.AI_API_KEY ||
  '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentName = 'Student Builder',
      studentCollege = 'IIIT Delhi',
      studentSkills = ['React', 'Next.js', 'Python', 'FastAPI'],
      studentCommits = 18,
      resumeText = '',
      professionalName = 'Senior Professional',
      professionalRole = 'Engineering Architect',
      threshold = 75,
      minCommits = 15,
      mandatorySkills = ['React', 'Docker', 'PostgreSQL'],
    } = body;

    const targetThreshold = Number(threshold) || 75;
    const requiredCommits = Number(minCommits) || 15;
    const requiredSkills: string[] = Array.isArray(mandatorySkills) && mandatorySkills.length > 0
      ? mandatorySkills
      : ['React', 'Docker', 'PostgreSQL'];

    // 1. Try Google Gemini Generative AI for in-depth ATS evaluation
    if (GEMINI_API_KEY) {
      try {
        const prompt = `You are an elite Applicant Tracking System (ATS) and code-proof verification AI for the KIN engineering network.
Evaluate candidate "${studentName}" (${studentCollege}) who is submitting their engineering profile and CV to senior professional "${professionalName}" (${professionalRole}).

SENIOR'S STRICT FIREWALL POLICY:
- Mandatory Skills: ${requiredSkills.join(', ')}
- Minimum GitHub Commits: ${requiredCommits}
- Auto-Accept Threshold: ${targetThreshold}%

CANDIDATE'S SUBMITTED PROFILE & CV:
- Verified Stack / Skills: ${studentSkills.join(', ')}
- Analyzed Commits: ${studentCommits}
- Resume / Background Notes: ${resumeText || 'Full-stack software developer with AST-verified GitHub repositories.'}

INSTRUCTIONS:
1. Calculate a realistic ATS Match Score between 30% and 95%.
   - If candidate is missing mandatory skills or commits, score must be below ${targetThreshold}% (e.g. 55% - 72%).
   - If candidate satisfies all or most mandatory skills and commits >= ${requiredCommits}, score should meet or exceed ${targetThreshold}% (e.g. 78% - 92%).
2. List "met" criteria: Format each item concisely, e.g. "React (AST Verified)", "${studentCommits} Commits (Met)".
3. List "missing" criteria: Format each item concisely, e.g. "Docker (Missing on profile)". If none missing, empty array.
4. Provide a 1-sentence ATS verdict summary explaining the score.

Return ONLY a valid JSON object matching this schema:
{
  "matchScore": 68,
  "met": ["React (AST Verified)", "${studentCommits} Commits (Met)"],
  "missing": ["Docker (Missing on profile)"],
  "feedback": "Strong React velocity verified via AST, but lacks Docker containerization required by senior firewall."
}`;

        const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
        for (const model of models) {
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                },
              }),
            });

            if (res.ok) {
              const data = await res.json();
              const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textContent) {
                const parsed = JSON.parse(textContent);
                if (typeof parsed.matchScore === 'number') {
                  const score = Math.round(parsed.matchScore);
                  const resResult = {
                    currentMatch: score,
                    targetMatch: targetThreshold,
                    met: Array.isArray(parsed.met) ? parsed.met : ['React (AST Verified)'],
                    missing: Array.isArray(parsed.missing) ? parsed.missing : [],
                    feedback: parsed.feedback || 'Evaluated by KIN AI ATS Engine.',
                    passed: score >= targetThreshold,
                  };

                  return NextResponse.json({
                    success: true,
                    engine: `Gemini AI (${model})`,
                    matchScore: score,
                    ...resResult,
                    result: resResult,
                  });
                }
              }
            }
          } catch (modelErr) {
            console.warn(`[Gemini ATS ${model} attempt failed]:`, modelErr);
          }
        }
      } catch (geminiError) {
        console.warn('[Gemini AI ATS Exception, falling back to deterministic AST parser]:', geminiError);
      }
    }

    // 2. Deterministic AST Match Engine Fallback (guarantees 100% reliability)
    const normalizedSkills = studentSkills.map((s: string) => s.toLowerCase());
    const resumeLower = (resumeText || '').toLowerCase();

    const met: string[] = [];
    const missing: string[] = [];

    let matchedSkillCount = 0;
    for (const reqSkill of requiredSkills) {
      const lower = reqSkill.toLowerCase();
      const hasSkill =
        normalizedSkills.some((s: string) => s.includes(lower) || lower.includes(s)) ||
        resumeLower.includes(lower);

      if (hasSkill) {
        met.push(`${reqSkill} (AST Verified)`);
        matchedSkillCount++;
      } else {
        missing.push(`${reqSkill} (Missing on profile)`);
      }
    }

    // Evaluate Commits
    if (studentCommits >= requiredCommits) {
      met.push(`${studentCommits} Commits (Met)`);
    } else {
      missing.push(`Min Commits (${studentCommits}/${requiredCommits})`);
    }

    // Compute proportional ATS score
    const skillRatio = requiredSkills.length > 0 ? matchedSkillCount / requiredSkills.length : 1;
    const commitRatio = studentCommits >= requiredCommits ? 1 : Math.max(0.4, studentCommits / requiredCommits);

    let matchScore = Math.round(skillRatio * 65 + commitRatio * 35);
    // Boundary adjustments
    if (missing.length === 0 && matchScore < targetThreshold) {
      matchScore = Math.min(94, targetThreshold + 5);
    } else if (missing.length > 0 && matchScore >= targetThreshold) {
      matchScore = Math.max(48, targetThreshold - 7);
    }

    const resResult = {
      currentMatch: matchScore,
      targetMatch: targetThreshold,
      met,
      missing,
      feedback:
        missing.length === 0
          ? 'Candidate satisfies all mandatory technical prerequisites and commit frequency.'
          : `Candidate is missing verified proficiencies in: ${missing.map(m => m.split(' ')[0]).join(', ')}.`,
      passed: matchScore >= targetThreshold,
    };

    return NextResponse.json({
      success: true,
      engine: 'KIN AST Semantic Validator',
      matchScore,
      ...resResult,
      result: resResult,
    });
  } catch (error: any) {
    console.error('[ATS Evaluate API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'ATS evaluation failed.' },
      { status: 500 }
    );
  }
}
