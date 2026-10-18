import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { messages = [], userProfile = {}, activeTab = 'overview' } = body;

    const role = userProfile.role || 'student';
    const name = userProfile.name || 'Verified Builder';
    const skills = Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : 'Next.js, React, TypeScript, Python';
    const institution = userProfile.institution || 'IIIT Delhi';
    const targetRole = userProfile.targetRole || (role === 'student' ? 'Senior AI Engineer' : 'Staff Systems Architect');

    const systemPrompt = `You are Kin, the friendly, brilliant, and energetic AI Mascot & Career Copilot of the KIN platform (kin-path.vercel.app).
KIN is a Living Career Engine and Verified Alumni-Student Skill Network built for ambitious builders and university talent.

YOUR PERSONALITY & TONE:
- Enthusiastic, concise, highly knowledgeable, and welcoming.
- Use occasional mascot flair and emojis (✨, 🚀, 💡, 🎯, 👋).
- Keep answers tight (2 to 4 crisp paragraphs or bullet points). Never write overly long walls of text.
- If asked about navigating or finding things, guide them accurately to the right tab or button.

ACTIVE USER CONTEXT:
- Name: ${name}
- Network Role: ${role === 'student' ? 'Student / Verified Builder' : 'Alumnus / Industry Mentor'}
- Institution: ${institution}
- Current Verified Skills: ${skills}
- Target Role Aspirations: ${targetRole}
- Current Active Tab: ${activeTab}

PLATFORM KNOWLEDGE BASE:
1. Talent Radar (tab='radar'): Matches candidates directly with alumni hiring or mentoring based on verified skills and code commits. Notable alumni in network: Aditya Sharma (Senior Systems & AI Engineer, IIITD '22 alumnus), Parth Arora (DeepMind Researcher), Darsh (Distributed Systems & AI).
2. Career Time Machine (tab='time-machine'): Simulates year-by-year career trajectory, milestones, and pinpoint skill gap analysis for reaching target roles.
3. 20-Minute Doorway (tab='doorway'): High-trust 20-minute focused mentoring or mock interview slots with verified alumni.
4. Skill Bounties (tab='bounties'): Real-world code bounties with escrow rewards and proof-of-work payouts.
5. Kin Pulses (tab='pulses'): Vertical video stream where alumni share real engineering hurdle stories, system design hacks, and interview walkthroughs.
6. Network Directory & Messaging (tab='community' & bottom-right floating inbox): Direct peer-to-peer real-time chat with members and automatic double opt-in WhatsApp introductions.
7. Guided Platform Tour: Users can click the "🗺️ Take Platform Tour" button right at the top of the chat or ask you to show them around!

Answer the user's prompt directly, helpfully, and enthusiastically.`;

    let assistantResponse = '';
    let usedProvider = 'groq';

    // 1. Try Groq fast inference
    if (GROQ_API_KEY) {
      const groqModels = ['openai/gpt-oss-20b', 'openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
      for (const model of groqModels) {
        try {
          const chatMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: String(m.content || '')
            }))
          ];

          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: chatMessages,
              temperature: 0.7,
              max_tokens: 600
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content;
            if (text) {
              assistantResponse = text;
              usedProvider = `groq:${model}`;
              break;
            }
          }
        } catch (err) {
          console.warn(`Groq ${model} attempt failed:`, err);
        }
      }
    }

    // 2. Fallback to Gemini if Groq did not return
    if (!assistantResponse && GEMINI_API_KEY) {
      try {
        const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];
        for (const gModel of geminiModels) {
          const lastUserMsg = messages[messages.length - 1]?.content || 'Hello Kin!';
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: `${systemPrompt}\n\nUser Question:\n${lastUserMsg}` }
                    ]
                  }
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 600
                }
              })
            }
          );

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              assistantResponse = text;
              usedProvider = `gemini:${gModel}`;
              break;
            }
          }
        }
      } catch (gemErr) {
        console.warn('Gemini fallback error:', gemErr);
      }
    }

    // 3. Deterministic Heuristic Fallback if both offline or unconfigured
    if (!assistantResponse) {
      const lastMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
      if (lastMsg.includes('tour') || lastMsg.includes('guide') || lastMsg.includes('how to use')) {
        assistantResponse = `👋 Welcome to KIN! You can click the **"🗺️ Take Platform Tour"** button right at the top of this window for an interactive walkthrough, or explore key tabs:\n\n• **Talent Radar:** Matches your verified GitHub skills with alumni hiring.\n• **Career Time Machine:** Shows milestone roadmaps and skill gaps for ${targetRole}.\n• **Kin Pulses:** Watch video insights and engineering war stories from verified alumni!\n\nWhat would you like to explore first?`;
      } else if (lastMsg.includes('aditya') || lastMsg.includes('alumni')) {
        assistantResponse = `🎯 **Aditya Sharma** is an IIIT Delhi '22 alumnus and Senior Systems & AI Engineer. In KIN, you can view his profile in the **Members Directory**, check your CV match score against his requirements, or send him a direct message using the bottom-right floating inbox!`;
      } else if (lastMsg.includes('skill') || lastMsg.includes('gap') || lastMsg.includes('learn')) {
        assistantResponse = `📊 Based on your current verified skills (${skills}), the top skills in demand across the alumni network for **${targetRole}** are **Distributed Systems, Vector Search, and vLLM Batching**. You can visit the **Career Time Machine** tab to generate your custom progression plan!`;
      } else {
        assistantResponse = `✨ Hey ${name}! I'm Kin, your AI Career Copilot. I can help you find matching alumni, analyze your skill gaps for **${targetRole}**, prepare for Doorway interviews, or guide you through the platform. What's on your mind today?`;
      }
      usedProvider = 'heuristic-fallback';
    }

    return NextResponse.json({
      success: true,
      provider: usedProvider,
      message: assistantResponse
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Kin chat processing failed',
        message: 'Oops! I had a momentary hiccup. Ask me again and I will help you out right away! ✨'
      },
      { status: 500 }
    );
  }
}
