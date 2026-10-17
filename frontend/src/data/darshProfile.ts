// Ground truth profile extracted from Darsh Ohri's attached CV/Resume
export const DARSH_OHRI_PROFILE = {
  name: 'Darsh Ohri',
  role: 'Full-Stack & AI Software Developer',
  institution: 'B.Tech CSE (Data Science Specialization)',
  email: 'darshohri@gmail.com',
  location: 'Chandigarh, India',
  githubUrl: 'https://github.com/darshohri',
  githubUsername: 'darshohri',
  linkedinUrl: 'https://linkedin.com/in/darshohri',
  portfolioUrl: 'https://darshohri.dev',
  summary:
    'Computer Science & Engineering undergraduate (Data Science specialization) and full-stack developer with 6+ shipped AI-integrated web applications and two technical internships. Proficient in React, Next.js, TypeScript, FastAPI, and LLM integration (Gemini, Groq). 1st place at Plaksha Prayas Tech Hackathon 2026 and winner of the ACM-SIH Ideathon.',
  skills: [
    'Python',
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'FastAPI',
    'Gemini API',
    'Groq API',
    'PostgreSQL',
    'Tailwind CSS',
    'Three.js',
    'Framer Motion',
    'MongoDB',
    'Docker',
    'Git'
  ],
  stats: {
    verifiedBuilders: '1',
    activeCommits: '840+',
    escrowVolume: '$4,200',
    openBounties: 4,
    networkVelocity: 96.5,
    talentRadarMatches: 6,
    autoAcceptedHandshakes: 12
  },
  careerMilestones: [
    {
      id: 'cm-darsh-1',
      role: 'Web Development Intern',
      company: 'LaunchED Global (Remote)',
      duration: 'May 2026 - Jul 2026',
      period: '2026',
      acquiredSkills: ['React', 'Next.js', 'HTML5/CSS3', 'Reusable UI Components', 'Git'],
      keyAchievement:
        'Cut cross-device rendering inconsistencies by 25% across browsers and improved front-end maintainability by 20% by refactoring legacy components into modular reusable UI patterns.',
      verifiedBy: 'LaunchED Global Mentorship Program',
      velocityScore: 94
    },
    {
      id: 'cm-darsh-2',
      role: 'Social Media & Marketing Intern',
      company: 'MAG Insights (Management Analytics Gateway)',
      duration: 'Jan 2026 - Mar 2026',
      period: '2026',
      acquiredSkills: ['Data Analytics', 'Content Production', 'Audience Growth', 'Video Editing'],
      keyAchievement:
        'Increased organic audience engagement by 35% by producing, directing, and editing 10+ short-form video commercials and analytical content.',
      verifiedBy: 'MAG Insights Executive Review',
      velocityScore: 89
    },
    {
      id: 'cm-darsh-3',
      role: 'AI Hackathon Winner & Lead Developer',
      company: 'Plaksha Prayas Tech Hackathon & ACM-SIH',
      duration: '2025 - 2026',
      period: '2025 - 2026',
      acquiredSkills: ['FastAPI', 'Gemini API', 'Groq API', 'Prompt Engineering', 'PostgreSQL'],
      keyAchievement:
        'Won 1st place at Plaksha Prayas Tech Hackathon 2026 and ACM-SIH Ideathon for building and shipping full-stack AI web applications.',
      verifiedBy: 'Hackathon Grand Jury Node',
      velocityScore: 98
    }
  ],
  skillGap: {
    targetRole: 'Full-Stack AI Software Engineer',
    currentSkills: ['React', 'Next.js', 'TypeScript', 'FastAPI', 'Python', 'PostgreSQL', 'Gemini API'],
    requiredSkills: ['vLLM Inference Serving', 'Distributed Systems', 'Docker/Kubernetes', 'Redis Caching'],
    missingSkills: [
      { name: 'Distributed Systems & Microservices', priority: 'HIGH' as const, frequency: 92 },
      { name: 'Docker & Container Orchestration', priority: 'HIGH' as const, frequency: 85 },
      { name: 'Redis / Message Queues', priority: 'MEDIUM' as const, frequency: 72 },
      { name: 'CI/CD Pipeline Automation', priority: 'LOW' as const, frequency: 54 }
    ],
    readinessScore: 82
  },
  bounties: [
    {
      id: 201,
      title: 'Full-Stack Gemini API Streaming Chat Widget in Next.js',
      organization: 'KIN Ecosystem',
      rewardUsdc: 950,
      deadline: '3 days left',
      difficulty: 'MEDIUM' as const,
      category: 'AI & Full-Stack',
      requiredSkills: ['Next.js', 'TypeScript', 'Gemini API', 'Tailwind CSS'],
      submissionsCount: 5,
      status: 'OPEN' as const,
      astVerification: true
    },
    {
      id: 202,
      title: 'FastAPI High-Concurrency Async LLM Proxy',
      organization: 'Groq Cloud Partners',
      rewardUsdc: 1400,
      deadline: '5 days left',
      difficulty: 'HARD' as const,
      category: 'Backend & APIs',
      requiredSkills: ['FastAPI', 'Python', 'AsyncIO', 'Rate Limiting'],
      submissionsCount: 8,
      status: 'OPEN' as const,
      astVerification: true
    },
    {
      id: 203,
      title: 'Responsive Three.js 3D Visualizer Component',
      organization: 'Orbital UI Labs',
      rewardUsdc: 650,
      deadline: '7 days left',
      difficulty: 'EASY' as const,
      category: 'Frontend & Creative',
      requiredSkills: ['React', 'Three.js', 'Framer Motion'],
      submissionsCount: 11,
      status: 'OPEN' as const,
      astVerification: true
    }
  ],
  radarOpportunities: [
    {
      id: 501,
      title: 'Low-Latency LLM Inference & Serving Engineer',
      organization: 'Groq Cloud Infra / Scale AI',
      industry: 'High-Throughput Model Serving',
      type: 'job' as const,
      matchScore: 96,
      transferableBridgeScore: 92,
      stipend: '$140k - $170k / yr',
      location: 'Remote / SF',
      bridgeSkills: ['vLLM Inference', 'AsyncIO Batching', 'Token Streaming', 'LPU Optimization'],
      reasoning: 'You already ship FastAPI async backends with Groq and Gemini APIs. Shifting focus to low-latency model serving, token streaming, and vLLM batching unlocks high-demand AI infrastructure roles.',
      status: 'DISCOVERED' as const
    },
    {
      id: 502,
      title: 'Autonomous Agent & MCP Tooling Architect',
      organization: 'Anthropic Guild / Nexus Agents',
      industry: 'Agentic Infrastructure',
      type: 'job' as const,
      matchScore: 94,
      transferableBridgeScore: 89,
      stipend: '$135k - $165k / yr',
      location: 'Remote',
      bridgeSkills: ['Model Context Protocol (MCP)', 'Multi-Agent Routing', 'Vector Memory', 'Eval Harnesses'],
      reasoning: 'You build full-stack AI web tools; standardizing your function calling into Model Context Protocol (MCP) servers and multi-agent coordination qualifies you for frontier autonomous agent engineering.',
      status: 'DISCOVERED' as const
    },
    {
      id: 503,
      title: 'Generative UI & AI Canvas Engineer',
      organization: 'Cognition / Cursor Partner Guild',
      industry: 'Next-Gen Developer Tools',
      type: 'fellowship' as const,
      matchScore: 92,
      transferableBridgeScore: 88,
      stipend: '$120k - $150k / yr',
      location: 'Remote / NYC',
      bridgeSkills: ['WebSockets Streaming', 'Interactive Canvas', 'AST Diff Viewers', 'Edge Runtime'],
      reasoning: 'Your verified frontend polish in Next.js and Tailwind meets the booming need for interactive generative AI canvases, live code diff visualizers, and real-time streaming interfaces.',
      status: 'DISCOVERED' as const
    },
    {
      id: 504,
      title: 'Distributed Event Queue & Backend Engineer',
      organization: 'Cloudflare / Vercel Edge Partners',
      industry: 'Distributed Systems & Microservices',
      type: 'bounty' as const,
      matchScore: 89,
      transferableBridgeScore: 84,
      stipend: '$125k - $155k / yr',
      location: 'Remote',
      bridgeSkills: ['Redis Streams', 'Distributed Key-Value', 'Docker / K8s', 'gRPC'],
      reasoning: 'Your backend Python and database foundations cleanly bridge into high-concurrency event queues, distributed state management, and edge microservices without changing core stack.',
      status: 'SHORTLISTED' as const
    }
  ]
};
