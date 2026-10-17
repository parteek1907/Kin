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
      title: 'Generative AI Applications Engineer',
      organization: 'Scale AI / Nexa Labs',
      industry: 'Applied Artificial Intelligence',
      type: 'job' as const,
      matchScore: 96,
      transferableBridgeScore: 92,
      bridgeSkills: ['FastAPI', 'LLM Integration', 'Next.js', 'Prompt Engineering'],
      reasoning: 'Your shipped AI applications with Gemini and Groq directly match production AI workflow requirements.',
      status: 'DISCOVERED' as const
    },
    {
      id: 502,
      title: 'Full-Stack Developer (AI Products)',
      organization: 'Veridian Health Robotics',
      industry: 'HealthTech & Automation',
      type: 'fellowship' as const,
      matchScore: 91,
      transferableBridgeScore: 88,
      bridgeSkills: ['React', 'Python', 'RESTful APIs', 'PostgreSQL'],
      reasoning: 'Your front-end refactoring and modular UI experience cleanly bridge to medical workflow interfaces.',
      status: 'DISCOVERED' as const
    },
    {
      id: 503,
      title: 'Autonomous Agent Backend Engineer',
      organization: 'HyperScale AI',
      industry: 'Autonomous Systems & Agents',
      type: 'bounty' as const,
      matchScore: 89,
      transferableBridgeScore: 85,
      bridgeSkills: ['FastAPI', 'Data Science', 'Async Python'],
      reasoning: 'Your hackathon-winning AI pipeline architectures transfer directly to autonomous agent orchestrators.',
      status: 'SHORTLISTED' as const
    }
  ]
};
