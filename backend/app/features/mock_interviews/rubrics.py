from typing import Dict, Any, List

DEFAULT_RUBRICS: Dict[str, Dict[str, Any]] = {
    "technical_fundamentals": {
        "dimensions": [
            {"name": "conceptual_accuracy", "label": "Conceptual Accuracy", "weight": 0.35, "description": "Correctness and depth of core technical fundamentals"},
            {"name": "reasoning_approach", "label": "Problem Decomposition", "weight": 0.25, "description": "Breaking down technical components logically"},
            {"name": "communication", "label": "Technical Articulation", "weight": 0.20, "description": "Explaining concepts with concise terminology under 90s"},
            {"name": "practical_experience", "label": "Real-World Context", "weight": 0.20, "description": "Relating concepts to production architectures or practical tools"}
        ],
        "default_pass_score": 3.0
    },
    "coding_problem_solving": {
        "dimensions": [
            {"name": "algorithmic_thinking", "label": "Algorithmic Thinking", "weight": 0.35, "description": "Selection of optimal data structures and time/space complexity"},
            {"name": "edge_case_awareness", "label": "Edge Case Awareness", "weight": 0.25, "description": "Identifying boundary conditions and invalid input handling"},
            {"name": "code_structure", "label": "Code Structure & Clarity", "weight": 0.20, "description": "Clean modular pseudocode and variable naming"},
            {"name": "verbal_walkthrough", "label": "Verbal Walkthrough", "weight": 0.20, "description": "Tracing through execution steps clearly"}
        ],
        "default_pass_score": 3.0
    },
    "behavioral": {
        "dimensions": [
            {"name": "star_structure", "label": "STAR Method Structure", "weight": 0.30, "description": "Structured Situation, Task, Action, and Result framing"},
            {"name": "impact_ownership", "label": "Personal Ownership & Impact", "weight": 0.30, "description": "Focusing on 'I' contributions and quantified team outcomes"},
            {"name": "self_awareness", "label": "Conflict Resolution & Learning", "weight": 0.25, "description": "Reflecting on challenges, humility, and takeaways"},
            {"name": "conciseness", "label": "Time Discipline", "weight": 0.15, "description": "Staying crisp and impactful within the 90-second capsule"}
        ],
        "default_pass_score": 3.0
    },
    "communication_clarity": {
        "dimensions": [
            {"name": "clarity_and_pace", "label": "Clarity & Cadence", "weight": 0.35, "description": "Structured pacing, tone, and professional confidence"},
            {"name": "executive_summary", "label": "Bottom-Line-Up-Front (BLUF)", "weight": 0.35, "description": "Answering the core question in the first 15 seconds"},
            {"name": "signal_to_noise", "label": "Signal-to-Noise Ratio", "weight": 0.30, "description": "Eliminating filler phrases and staying strictly on topic"}
        ],
        "default_pass_score": 3.0
    },
    "role_specific": {
        "dimensions": [
            {"name": "domain_depth", "label": "Role & Domain Mastery", "weight": 0.35, "description": "Depth of knowledge in target tech stack or domain"},
            {"name": "tradeoff_analysis", "label": "Architectural Trade-offs", "weight": 0.30, "description": "Understanding pros/cons (e.g. latency vs consistency)"},
            {"name": "industry_best_practices", "label": "Standard Best Practices", "weight": 0.20, "description": "Testing, telemetry, security, or deployment considerations"},
            {"name": "clarity", "label": "Communication", "weight": 0.15, "description": "Clear presentation to a senior peer"}
        ],
        "default_pass_score": 3.0
    },
    "project_portfolio": {
        "dimensions": [
            {"name": "problem_context", "label": "Motivation & Problem Scope", "weight": 0.25, "description": "Why was the project built and what user problem did it solve?"},
            {"name": "technical_contributions", "label": "Personal Technical Contributions", "weight": 0.35, "description": "Specific algorithms, pipelines, or systems designed"},
            {"name": "challenges_overcome", "label": "Pivotal Engineering Challenge", "weight": 0.25, "description": "Deepest bug or architecture pivot encountered and solved"},
            {"name": "lessons_learned", "label": "Retrospective & Next Steps", "weight": 0.15, "description": "What would be done differently with more scale?"}
        ],
        "default_pass_score": 3.0
    }
}


DEFAULT_CURATED_QUESTIONS: List[Dict[str, Any]] = [
    {
        "title": "System Design: Microservices vs Monolith Trade-offs",
        "question_text": "In 90 seconds, walk me through a scenario where you would advise a high-growth startup to remain on a modular monolith rather than prematurely transitioning to microservices.",
        "category": "technical_fundamentals",
        "target_role": "Backend Engineer",
        "experience_level": "entry_level",
        "suggested_duration_seconds": 90,
        "author_type": "system",
        "evaluation_rubric_template": DEFAULT_RUBRICS["technical_fundamentals"],
        "expected_answer_hints": [
            "Mentions operational complexity and distributed tracing overhead",
            "Discusses network latency and data consistency/distributed transactions",
            "Highlights team size and cognitive load"
        ]
    },
    {
        "title": "Algorithmic Efficiency: In-Memory Cache Eviction",
        "question_text": "You need to implement a low-latency LRU cache eviction policy. Explain your chosen data structure combination and why each operation achieves O(1) time complexity.",
        "category": "coding_problem_solving",
        "target_role": "Software Engineer",
        "experience_level": "entry_level",
        "suggested_duration_seconds": 90,
        "author_type": "system",
        "evaluation_rubric_template": DEFAULT_RUBRICS["coding_problem_solving"],
        "expected_answer_hints": [
            "Hash Map for O(1) key lookups",
            "Doubly Linked List for O(1) node removal and insertion at head",
            "Clear explanation of evicting from tail on capacity limit"
        ]
    },
    {
        "title": "Behavioral STAR: Handling Technical Disagreements",
        "question_text": "Tell me about a time you strongly disagreed with a peer or team lead about an architectural or library decision. How did you advocate for your point of view and what was the outcome?",
        "category": "behavioral",
        "target_role": "All Engineering Roles",
        "experience_level": "all",
        "suggested_duration_seconds": 90,
        "author_type": "system",
        "evaluation_rubric_template": DEFAULT_RUBRICS["behavioral"],
        "expected_answer_hints": [
            "Clear STAR structure with specific situation and stakes",
            "Focus on data/benchmarks rather than emotional attachment",
            "Constructive compromise or commitment to team decision"
        ]
    },
    {
        "title": "High-Impact Elevator Pitch: Project Architecture",
        "question_text": "Pitch your most complex academic or open-source software project to an engineering director in under 90 seconds. Cover problem, architecture, hardest bug, and impact.",
        "category": "project_portfolio",
        "target_role": "Full Stack Developer",
        "experience_level": "entry_level",
        "suggested_duration_seconds": 90,
        "author_type": "system",
        "evaluation_rubric_template": DEFAULT_RUBRICS["project_portfolio"],
        "expected_answer_hints": [
            "Concise problem statement in first 15 seconds",
            "Core technology stack and unique architectural design",
            "Concrete metric (e.g. throughput, users, latency, test coverage)"
        ]
    }
]
