import { CampusNode, TrustEdge, IntentCapsule } from '@/types';

export const SEED_NODES: CampusNode[] = [
  // --- FLAGSHIP STUDENTS (Team Entropy & Peers) ---
  {
    id: 'node-parteek',
    name: 'Parteek Garg',
    handle: '@parteekgarg',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Lead Systems & ML Builder',
    department: 'B.Tech CS & Data Science',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2025,
    statusBadge: 'Active Sprint Seeking',
    bio: 'Distributed consensus, deterministic RAG pipelines, and offline-first cryptographically verified ledgers.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 842,
      verifiedImpactScore: 97,
      topLanguages: ['TypeScript', 'Python', 'Rust', 'Go'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Deterministic RAG', 'Offline-First Sync', 'IndexedDB Ledger', 'Cryptographic Proofs', 'pgvector'],
      githubUsername: 'parteekgarg',
      repos: [
        {
          name: 'ziro-offline-fintech',
          url: 'https://github.com/parteekgarg/ziro-offline-fintech',
          description: 'Zero-connectivity peer-to-peer cryptographic payment rail using IndexedDB transaction journals and WebCrypto ECDSA.',
          languages: { TypeScript: 64200, Rust: 38100, HTML: 2400 },
          commitsCount: 318,
          recentCommitHash: 'a8f921c',
          recentCommitMessage: 'Implemented IndexedDB cryptographic ledger sync with zero-connectivity fallback & deterministic replay',
          verifiedAt: '2026-09-28T10:14:00Z',
          impactScore: 98,
          citations: [
            'Commit #a8f921c: "Implemented IndexedDB cryptographic ledger sync with zero-connectivity fallback"',
            'src/sync/ledger-store.ts: L142-L189: "Deterministic sequence numbering with SHA-256 state tree digest"',
            'Zero-form verification: 14 test vectors passing across edge partition simulator'
          ],
          isGithubVerified: true
        },
        {
          name: 'veralon-rag-engine',
          url: 'https://github.com/parteekgarg/veralon-rag-engine',
          description: 'Production hallucination-resistant retrieval engine with AST-level code chunking and multi-tenant pgvector indexing.',
          languages: { Python: 89400, TypeScript: 28000 },
          commitsCount: 264,
          recentCommitHash: 'd38210e',
          recentCommitMessage: 'Add cosine reranking pipeline with bge-large-en and deterministic entity attribution',
          verifiedAt: '2026-10-02T16:30:00Z',
          impactScore: 96,
          citations: [
            'src/retrieval/rerank.py: "Hybrid BM25 + dense vector fusion with dynamic threshold gating"',
            'Evaluated on 4,000 engineering queries with 0.94 NDCG@10'
          ],
          isGithubVerified: true
        },
        {
          name: 'lumiere-clinical-id',
          url: 'https://github.com/parteekgarg/lumiere-clinical-id',
          description: 'High-throughput deterministic entity resolution and medical record privacy preserving graph.',
          languages: { Python: 52100, Go: 31200 },
          commitsCount: 142,
          recentCommitHash: 'f4912ab',
          recentCommitMessage: 'Implement probabilistic Fellegi-Sunter record linkage with locality-sensitive hashing',
          verifiedAt: '2026-08-14T11:20:00Z',
          impactScore: 93,
          citations: ['Paper accepted at IEEE HealthCom 2026 with Dr. S. Sharma'],
          isGithubVerified: true
        },
        {
          name: 'chargeflow-ev',
          url: 'https://github.com/parteekgarg/chargeflow-ev',
          description: 'Decentralized smart contract state machine for campus EV charging slot reservations.',
          languages: { Solidity: 18400, TypeScript: 24500 },
          commitsCount: 118,
          recentCommitHash: 'e12948b',
          recentCommitMessage: 'Add gas-optimized queue settlement',
          verifiedAt: '2026-07-19T08:10:00Z',
          impactScore: 89,
          citations: ['Deployed on campus testnet with 140 daily unique EV sessions'],
          isGithubVerified: true
        }
      ],
      papers: [
        {
          title: 'Deterministic State Synchronization for Offline-First Edge Architectures in Intermittent Networks',
          conference: 'IEEE Transactions on Distributed Systems (Under Review)',
          year: 2026,
          citationsCount: 14,
          abstract: 'We present a conflict-free replicated data structure leveraging Merkle-directed acyclic graphs over IndexedDB for zero-latency transaction capture in sub-100kbps networks.'
        }
      ]
    }
  },
  {
    id: 'node-nipun',
    name: 'Nipun Dhiman',
    handle: '@nipundhiman',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    role: 'Computer Vision & Multimodal Engineer',
    department: 'B.Tech CS & Applied AI',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2025,
    statusBadge: 'Research Fellow',
    bio: 'PyTorch deep vision models, multimodal document OCR parsing, and low-latency WebRTC streaming agents.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 670,
      verifiedImpactScore: 94,
      topLanguages: ['Python', 'C++', 'TypeScript'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Multimodal OCR', 'PyTorch ViT', 'Voice WebRTC', 'FastAPI', 'ONNX Runtime'],
      githubUsername: 'nipundhiman',
      repos: [
        {
          name: 'multimodal-vision-ocr',
          url: 'https://github.com/nipundhiman/multimodal-vision-ocr',
          description: 'End-to-end vision transformer pipeline for dense table parsing and hierarchical key-value extraction.',
          languages: { Python: 78900, 'C++': 34200 },
          commitsCount: 284,
          recentCommitHash: 'c7720fa',
          recentCommitMessage: 'Optimize TensorRT quantized kernel for 14ms sub-second inference on edge devices',
          verifiedAt: '2026-10-08T14:15:00Z',
          impactScore: 95,
          citations: [
            'src/models/vision_transformer.py: "Custom spatial positional encoding for skew-invariant document geometry"',
            'Achieved 97.8% F1 score on complex financial balance sheets'
          ],
          isGithubVerified: true
        },
        {
          name: 'voice-webhook-agent',
          url: 'https://github.com/nipundhiman/voice-webhook-agent',
          description: 'Ultra-low-latency bidirectional voice pipeline integrating Whisper turbo and open LLMs over WebSockets.',
          languages: { Python: 45000, TypeScript: 22000 },
          commitsCount: 198,
          recentCommitHash: 'b1938fa',
          recentCommitMessage: 'Cut end-to-end speech turnaround latency to 280ms using speculative sentence streaming',
          verifiedAt: '2026-09-22T09:40:00Z',
          impactScore: 92,
          citations: ['Live demonstration at Campus Tech Fest 2026'],
          isGithubVerified: true
        }
      ],
      papers: [
        {
          title: 'Quantized Spatial Transformers for Real-Time Multimodal OCR on Constrained Hardware',
          conference: 'CVPR Workshop on Document Intelligence',
          year: 2025,
          citationsCount: 22,
          abstract: 'A 4-bit INT4 quantized Vision Transformer pipeline capable of resolving dense nested financial tabular hierarchies in real-time.'
        }
      ]
    }
  },
  {
    id: 'node-darsh',
    name: 'Darsh Ohri',
    handle: '@darshohri',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Graph Visualization & Frontend Systems Architect',
    department: 'B.Tech CS & Human-Centered Design',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2025,
    statusBadge: 'Lead UI/UX Architect',
    bio: 'WebGL & Canvas force-directed graph engines, fluid micro-interactions, dark mode design systems.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 712,
      verifiedImpactScore: 95,
      topLanguages: ['TypeScript', 'GLSL', 'JavaScript', 'CSS'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Interactive Canvas', 'Force-Directed Physics', 'Tailwind Systems', 'Framer Motion', 'State Machines'],
      githubUsername: 'darshohri',
      repos: [
        {
          name: 'conduit-force-graph-ui',
          url: 'https://github.com/darshohri/conduit-force-graph-ui',
          description: 'Zero-SSR-crash interactive 60fps force physics canvas with neon particle pulse propagation.',
          languages: { TypeScript: 61000, GLSL: 12000 },
          commitsCount: 290,
          recentCommitHash: 'e45902d',
          recentCommitMessage: 'Optimize spatial hash grid for 1,000+ interactive nodes without GC frame drops',
          verifiedAt: '2026-10-15T18:00:00Z',
          impactScore: 96,
          citations: [
            'src/graph/canvas-engine.ts: "Spatial partition grid with quadtree acceleration and multi-hop path raycasting"',
            'Benchmark: 60 FPS verified on mobile Chromium and Safari WebKit'
          ],
          isGithubVerified: true
        },
        {
          name: 'finwise-interactive-ux',
          url: 'https://github.com/darshohri/finwise-interactive-ux',
          description: 'Fintech transaction timeline visualizer with instant optimistic updates and animated currency charts.',
          languages: { TypeScript: 48000 },
          commitsCount: 165,
          recentCommitHash: 'c29014a',
          recentCommitMessage: 'Add tactile micro-haptic simulation and dark glassmorphic styling',
          verifiedAt: '2026-08-30T12:00:00Z',
          impactScore: 91,
          citations: ['Featured in IIITD Design Showcase 2026'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-aditya',
    name: 'Aditya Tanwar',
    handle: '@adityatanwar',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'PWA & Spatial AR Engineer',
    department: 'B.Tech CS & Systems',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2025,
    statusBadge: 'Full Stack Hacker',
    bio: 'Offline-first progressive web apps, encrypted QR credentials, WebXR campus indoor navigation.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 590,
      verifiedImpactScore: 92,
      topLanguages: ['TypeScript', 'Rust', 'WebAssembly'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Offline PWA', 'Service Workers', 'WebXR', 'Geospatial Mesh', 'Zero-Knowledge QR'],
      githubUsername: 'adityatanwar',
      repos: [
        {
          name: 'offline-pwa-sync',
          url: 'https://github.com/adityatanwar/offline-pwa-sync',
          description: 'ServiceWorker background sync engine with zero-data-loss SQLite-Wasm local persistence.',
          languages: { TypeScript: 53000, WebAssembly: 21000 },
          commitsCount: 220,
          recentCommitHash: 'f78119b',
          recentCommitMessage: 'Implement two-phase commit over BroadcastChannel API for multi-tab consistency',
          verifiedAt: '2026-09-12T11:45:00Z',
          impactScore: 93,
          citations: ['Benchmarked with 50,000 offline mutations during simulated power outage'],
          isGithubVerified: true
        },
        {
          name: 'campus-event-route-ar',
          url: 'https://github.com/adityatanwar/campus-event-route-ar',
          description: 'Markerless WebXR indoor navigation using SLAM feature points and campus floor plan vectors.',
          languages: { TypeScript: 42000, Rust: 19000 },
          commitsCount: 175,
          recentCommitHash: 'a39210c',
          recentCommitMessage: 'Add drift-compensated visual inertial odometry bridge',
          verifiedAt: '2026-07-25T15:20:00Z',
          impactScore: 90,
          citations: ['Tested with 600 campus visitors during Open House 2026'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-ananya',
    name: 'Ananya Iyer',
    handle: '@ananyaiyer',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'NLP & Knowledge Graph Researcher',
    department: 'M.Tech AI & Language Technology',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2025,
    statusBadge: 'Graduate Researcher',
    bio: 'Entity disambiguation, temporal knowledge graphs, and LLM reasoning benchmarks.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 430,
      verifiedImpactScore: 89,
      topLanguages: ['Python', 'Cypher', 'TypeScript'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Neo4j', 'Knowledge Graphs', 'Entity Disambiguation', 'LangChain', 'FastAPI'],
      repos: [
        {
          name: 'graph-entity-linker',
          url: 'https://github.com/ananyaiyer/graph-entity-linker',
          description: 'Zero-shot entity resolution over Wikidata and campus academic databases.',
          languages: { Python: 65000 },
          commitsCount: 160,
          recentCommitHash: 'b44198c',
          recentCommitMessage: 'Incorporate graph neural network link predictor for edge validation',
          verifiedAt: '2026-09-01T10:00:00Z',
          impactScore: 88,
          citations: ['Under peer review at EMNLP 2026 with Prof. Aradhana Verma'],
          isGithubVerified: true
        }
      ],
      papers: [
        {
          title: 'Cross-Domain Entity Disambiguation via Temporal Knowledge Graphs in Academic Repositories',
          conference: 'ACL Student Research Workshop',
          year: 2025,
          citationsCount: 9,
          abstract: 'Technique to map uncurated engineering artifacts to canonical ontological knowledge nodes.'
        }
      ]
    }
  },
  {
    id: 'node-kabir',
    name: 'Kabir Sengupta',
    handle: '@kabirsengupta',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'Embedded Robotics & ROS2 Hacker',
    department: 'B.Tech ECE & Robotics',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2026,
    statusBadge: 'Hardware Lab Lead',
    bio: 'ROS2 micro-controllers, LiDAR SLAM, RTOS motor controls, and CAN bus telemetry.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 480,
      verifiedImpactScore: 88,
      topLanguages: ['C++', 'Rust', 'Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['ROS2', 'RTOS', 'CAN Bus', 'LiDAR SLAM', 'C++20'],
      repos: [
        {
          name: 'campus-rover-nav2',
          url: 'https://github.com/kabirsengupta/campus-rover-nav2',
          description: 'Autonomous delivery rover stack running on NVIDIA Jetson Orin Nano with 3D LiDAR SLAM.',
          languages: { 'C++': 82000, Python: 24000 },
          commitsCount: 240,
          recentCommitHash: 'd91823a',
          recentCommitMessage: 'Optimize costmap generator for dynamic human pedestrian obstacle avoidance',
          verifiedAt: '2026-09-18T14:30:00Z',
          impactScore: 91,
          citations: ['Tested across 12km of autonomous campus outdoor pathways'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-meera',
    name: 'Meera Nambiar',
    handle: '@meeranambiar',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Distributed Systems & Database Intern',
    department: 'B.Tech CS & Systems',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2026,
    statusBadge: 'Open Source Contributor',
    bio: 'LSM-tree storage engines, Raft consensus implementations, and eBPF network observability.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 530,
      verifiedImpactScore: 90,
      topLanguages: ['Go', 'Rust', 'C'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Raft Consensus', 'LSM-Trees', 'eBPF', 'FastAPI', 'Linux Kernel'],
      repos: [
        {
          name: 'pebble-raft-kv',
          url: 'https://github.com/meeranambiar/pebble-raft-kv',
          description: 'High-throughput linearizable key-value store with CockroachDB Pebble storage engine.',
          languages: { Go: 74000 },
          commitsCount: 180,
          recentCommitHash: 'c90192b',
          recentCommitMessage: 'Add pipelined log replication and snapshot compaction',
          verifiedAt: '2026-08-20T17:00:00Z',
          impactScore: 92,
          citations: ['Sustained 48,000 write ops/sec on 5-node cluster'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-tanya',
    name: 'Tanya Saxena',
    handle: '@tanyasaxena',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    role: 'Cybersecurity & Cryptography Specialist',
    department: 'B.Tech InfoSec',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2025,
    statusBadge: 'CTF Team Captain',
    bio: 'Zero-knowledge snarks, post-quantum cryptography, and smart contract protocol auditing.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 410,
      verifiedImpactScore: 89,
      topLanguages: ['Rust', 'Solidity', 'Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['ZK-SNARKs', 'Circom', 'Smart Contract Auditing', 'ECDSA', 'Formal Verification'],
      repos: [
        {
          name: 'zk-campus-attest',
          url: 'https://github.com/tanyasaxena/zk-campus-attest',
          description: 'Anonymous credential proof system for student voting and club membership without exposing roll numbers.',
          languages: { Rust: 51000, Circom: 22000 },
          commitsCount: 140,
          recentCommitHash: 'e11234c',
          recentCommitMessage: 'Optimize Groth16 verification circuit to 1,200 constraints',
          verifiedAt: '2026-07-30T16:00:00Z',
          impactScore: 91,
          citations: ['Audited by campus CyberSec research faculty'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-aarav',
    name: 'Aarav Chawla',
    handle: '@aaravchawla',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    role: 'Full Stack & Web3 Developer',
    department: 'B.Tech CS',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2027,
    statusBadge: 'Hackathon Enthusiast',
    bio: 'Next.js 15, Tailwind, Supabase, Solidity, and decentralised identity proofs.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 320,
      verifiedImpactScore: 82,
      topLanguages: ['TypeScript', 'Solidity'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Next.js', 'React', 'Tailwind', 'Web3Auth'],
      repos: [
        {
          name: 'campus-swap-dex',
          url: 'https://github.com/aaravchawla/campus-swap-dex',
          description: 'Peer-to-peer campus marketplace with escrow contracts and QR settlements.',
          languages: { TypeScript: 38000 },
          commitsCount: 95,
          recentCommitHash: 'a91283d',
          recentCommitMessage: 'Refactor mobile navigation and wallet modal',
          verifiedAt: '2026-09-05T13:00:00Z',
          impactScore: 81,
          citations: ['1st Place at Campus Web3 Sprint 2026'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-diya',
    name: 'Diya Kulkarni',
    handle: '@diyakulkarni',
    persona: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Healthcare AI & Signal Processing Engineer',
    department: 'B.Tech AI & Health Informatics',
    institution: 'IIIT Delhi / Engineering Campus',
    gradYear: 2026,
    statusBadge: 'Clinical AI Scholar',
    bio: 'ECG time-series transformers, medical image segmentation, and edge clinical diagnostic tools.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 460,
      verifiedImpactScore: 87,
      topLanguages: ['Python', 'Julia', 'C++'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Time-Series Transformers', 'PyTorch', 'DICOM Processing', 'Signal Processing'],
      repos: [
        {
          name: 'ecg-arrhythmia-edge',
          url: 'https://github.com/diyakulkarni/ecg-arrhythmia-edge',
          description: 'Real-time 12-lead ECG anomaly classification for wearable Holter monitors using 1D convolutional residual networks.',
          languages: { Python: 59000 },
          commitsCount: 170,
          recentCommitHash: 'c44129b',
          recentCommitMessage: 'Improve specificity on premature ventricular contractions to 98.4%',
          verifiedAt: '2026-09-15T10:30:00Z',
          impactScore: 88,
          citations: ['Validated against PhysioNet MIT-BIH Arrhythmia Database'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },

  // --- FACULTY RESEARCHERS & PROFESSORS ---
  {
    id: 'node-dr-sharma',
    name: 'Dr. Sanjeev Sharma',
    handle: '@drsharma_lab',
    persona: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'Professor & Head, Distributed Systems & Cryptography Lab',
    department: 'Dept. of Computer Science & Engineering',
    institution: 'IIIT Delhi / Engineering Campus',
    statusBadge: 'IEEE Fellow & Lab Director',
    bio: 'Advisor to 22 PhDs and 12 alumni unicorn tech leads. Research in Byzantine fault tolerance, zero-knowledge ledgers, and edge storage.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 1240,
      verifiedImpactScore: 99,
      topLanguages: ['C++', 'Rust', 'Go', 'Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Byzantine Consensus', 'Distributed Ledgers', 'Edge Computing', 'Cryptographic Proofs', 'Formal Methods'],
      repos: [
        {
          name: 'bft-consensus-benchmarks',
          url: 'https://github.com/drsharma-lab/bft-consensus-benchmarks',
          description: 'Rigorous benchmark framework comparing PBFT, Raft, HotStuff, and Narwhal-Tusk under network partitions.',
          languages: { 'C++': 120000, Python: 40000 },
          commitsCount: 410,
          recentCommitHash: 'f882190',
          recentCommitMessage: 'Add asynchronous pipeline latency simulation for 10,000 geo-distributed validator nodes',
          verifiedAt: '2026-10-01T09:00:00Z',
          impactScore: 99,
          citations: ['Cited in 45 IEEE and ACM transactions'],
          isGithubVerified: true
        }
      ],
      papers: [
        {
          title: 'Asynchronous State Machine Replication with Sub-Second Finality in Partitioned Edge Networks',
          conference: 'ACM SOSP 2025',
          year: 2025,
          citationsCount: 148,
          abstract: 'A novel consensus pipeline guaranteeing liveness and zero safety violation under arbitrary Byzantine partitions.'
        },
        {
          title: 'Deterministic State Synchronization for Offline-First Edge Architectures in Intermittent Networks',
          conference: 'IEEE Transactions on Distributed Systems',
          year: 2026,
          citationsCount: 14,
          abstract: 'Co-authored with student Parteek Garg.'
        }
      ]
    }
  },
  {
    id: 'node-prof-verma',
    name: 'Prof. Aradhana Verma',
    handle: '@prof_averma',
    persona: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Associate Professor, Multimodal NLP & Information Retrieval',
    department: 'Dept. of Data Science & AI',
    institution: 'IIIT Delhi / Engineering Campus',
    statusBadge: 'Principal Investigator (AI Mission)',
    bio: 'Directs the Campus Multimodal RAG & Knowledge Graph Laboratory. Industry co-advisor with Google DeepMind and Microsoft Research.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 890,
      verifiedImpactScore: 96,
      topLanguages: ['Python', 'PyTorch', 'C++'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Information Retrieval', 'RAG Pipelines', 'Vector Indexing', 'Multimodal LLMs', 'Citation Grounding'],
      repos: [
        {
          name: 'grounded-rag-eval',
          url: 'https://github.com/averma-lab/grounded-rag-eval',
          description: 'Deterministic evaluation harness for hallucination rate in enterprise RAG systems.',
          languages: { Python: 89000 },
          commitsCount: 320,
          recentCommitHash: 'e39120c',
          recentCommitMessage: 'Release benchmark dataset containing 10,000 audited enterprise medical and financial filings',
          verifiedAt: '2026-09-29T11:00:00Z',
          impactScore: 97,
          citations: ['Industry standard benchmark adopted by 4 campus startup spinouts'],
          isGithubVerified: true
        }
      ],
      papers: [
        {
          title: 'Citation-Grounded Retrieval Augmented Generation with Entity Verification',
          conference: 'NeurIPS 2025',
          year: 2025,
          citationsCount: 86,
          abstract: 'A framework enforcing verifiable source attribution in dense retrieval embeddings.'
        }
      ]
    }
  },
  {
    id: 'node-dr-mukherjee',
    name: 'Dr. Debabrata Mukherjee',
    handle: '@dmukherjee_geo',
    persona: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Professor, Spatial Computing & Geospatial Vision',
    department: 'Dept. of Computer Science & Geomatics',
    institution: 'IIIT Delhi / Engineering Campus',
    statusBadge: 'DST Geospatial Chair',
    bio: 'Pioneered 3D point-cloud registration for Indian smart cities. Former thesis advisor to Vikramaditya Singhania (Omnispatial).',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 620,
      verifiedImpactScore: 93,
      topLanguages: ['C++', 'Python', 'OpenGL'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Geospatial SLAM', 'Point Clouds', '3D Gaussian Splatting', 'AR Systems'],
      repos: [
        {
          name: 'geospatial-pointcloud-registration',
          url: 'https://github.com/dmukherjee/geospatial-pointcloud-registration',
          description: 'High-speed GPU ICP algorithm for millimeter-accurate urban digital twins.',
          languages: { 'C++': 98000 },
          commitsCount: 210,
          recentCommitHash: 'b90123a',
          recentCommitMessage: 'Incorporate octree adaptive level of detail rendering',
          verifiedAt: '2026-08-11T12:00:00Z',
          impactScore: 94,
          citations: ['Used in municipal digital twin pilots in Delhi NCR'],
          isGithubVerified: true
        }
      ],
      papers: [
        {
          title: 'Real-Time Point Cloud Alignment on Embedded AR Systems for GPS-Denied Urban Canyons',
          conference: 'IEEE ISMAR 2024',
          year: 2024,
          citationsCount: 64,
          abstract: 'Robust indoor and outdoor localization without cellular triangulation.'
        }
      ]
    }
  },
  {
    id: 'node-dr-bhatia',
    name: 'Dr. Priya Bhatia',
    handle: '@pbhatia_hardware',
    persona: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Assistant Professor, Edge AI & Embedded Systems',
    department: 'Dept. of ECE & VLSI',
    institution: 'IIIT Delhi / Engineering Campus',
    statusBadge: 'IEEE Senior Member',
    bio: 'Ultra-low power neural network accelerators on FPGA and RISC-V architectures.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 540,
      verifiedImpactScore: 91,
      topLanguages: ['SystemVerilog', 'C++', 'Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['RISC-V', 'FPGA Accelerators', 'Edge AI', 'Quantization'],
      repos: [
        {
          name: 'riscv-tinyml-core',
          url: 'https://github.com/pbhatia/riscv-tinyml-core',
          description: 'Open-source 32-bit RISC-V core with custom SIMD vector extensions for 1-bit neural networks.',
          languages: { SystemVerilog: 85000, 'C++': 32000 },
          commitsCount: 185,
          recentCommitHash: 'd19024f',
          recentCommitMessage: 'Tape-out ready GDSII layout for 28nm node',
          verifiedAt: '2026-07-12T14:00:00Z',
          impactScore: 92,
          citations: ['Tape-out supported by India Semiconductor Mission'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-dr-kaur',
    name: 'Dr. Harpreet Kaur',
    handle: '@dr_kaur_research',
    persona: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    role: 'Dean of Academic Research & Industry Linkages',
    department: 'Deanery of Sponsored Research',
    institution: 'IIIT Delhi / Engineering Campus',
    statusBadge: 'Dean of Research',
    bio: 'Oversees 40 Cr+ in industry research grants and alumni tech spinouts. Institutional mentor to Code2Career Innovation Studio.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 310,
      verifiedImpactScore: 92,
      topLanguages: ['Python', 'R'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Research Governance', 'Technology Transfer', 'Patent Portfolios', 'Industry Sponsorships'],
      repos: [],
      papers: [
        {
          title: 'Bridging Academic IP to Unicorn Commercialization: A 10-Year University Cohort Analysis',
          conference: 'Nature Biotechnology Tech Transfer Review',
          year: 2025,
          citationsCount: 38,
          abstract: 'Empirical model on warm multi-hop routing between faculty advisors and alumni venture founders.'
        }
      ]
    }
  },

  // --- ALUMNI FOUNDERS & UNICORN TECH LEADERS ---
  {
    id: 'node-rohan',
    name: 'Rohan Mehta',
    handle: '@rohan_nexapay',
    persona: 'founder',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'Founder & CEO, NexaPay (YC W22)',
    department: 'B.Tech CS (Alumnus Class of 2019)',
    institution: 'NexaPay Technologies / IIITD Alum',
    gradYear: 2019,
    statusBadge: 'YC Alumnus & Seed Founder',
    bio: 'Building India’s fastest offline-first merchant payment protocol. Raised $4.2M from Y Combinator and Peak XV. Mentored by Dr. Sanjeev Sharma.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 980,
      verifiedImpactScore: 98,
      topLanguages: ['Go', 'TypeScript', 'Rust'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Fintech Infrastructure', 'High-Throughput Settlement', 'WebCrypto', 'Offline Ledgers', 'Seed Scaling'],
      repos: [
        {
          name: 'nexapay-core-ledger',
          url: 'https://github.com/nexapay/nexapay-core-ledger',
          description: 'Distributed double-entry accounting ledger engine handling 12,000 TPS with zero ledger drift.',
          languages: { Go: 145000, TypeScript: 32000 },
          commitsCount: 520,
          recentCommitHash: 'f92100a',
          recentCommitMessage: 'Optimize optimistic locking over PostgreSQL partition tables',
          verifiedAt: '2026-10-10T12:00:00Z',
          impactScore: 98,
          citations: ['Powers 450,000 active retail merchants across Tier 2 and Tier 3 India'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-vikram',
    name: 'Vikramaditya Singhania',
    handle: '@vikram_omni',
    persona: 'founder',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    role: 'Founder & CTO, Omnispatial AR',
    department: 'B.Tech CS (Alumnus Class of 2018)',
    institution: 'Omnispatial AR / IIITD Alum',
    gradYear: 2018,
    statusBadge: 'Venture-Backed Founder',
    bio: 'Spatial computing for industrial warehouses. Seed funded ($2.8M). Former graduate student of Dr. Debabrata Mukherjee.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 840,
      verifiedImpactScore: 95,
      topLanguages: ['C++', 'Rust', 'Swift', 'GLSL'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Spatial Computing', 'WebXR', 'Visual Odometry', 'Industrial Digital Twins'],
      repos: [
        {
          name: 'omni-spatial-engine',
          url: 'https://github.com/omnispatial/omni-spatial-engine',
          description: 'Sub-centimeter spatial anchoring engine using commodity phone camera feeds and WebAssembly.',
          languages: { 'C++': 110000, Rust: 45000 },
          commitsCount: 390,
          recentCommitHash: 'd88190c',
          recentCommitMessage: 'Integrate real-time meshing over WebGPU',
          verifiedAt: '2026-09-19T15:00:00Z',
          impactScore: 95,
          citations: ['Deployed in 18 fulfillment centers across North India'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-sneha',
    name: 'Sneha Reddy',
    handle: '@snehareddy_core',
    persona: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    role: 'Staff Engineer (Payments Core)',
    department: 'B.Tech CS (Alumna Class of 2020)',
    institution: 'Razorpay / IIITD Alumna',
    gradYear: 2020,
    statusBadge: 'Core Protocols Lead',
    bio: 'Architecting UPI 2.0 multi-bank routing layers and offline tokenized card vaults. Active mentor in campus Code2Career sessions.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 760,
      verifiedImpactScore: 95,
      topLanguages: ['Go', 'Java', 'Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['UPI Infrastructure', 'Idempotency', 'Distributed Transactions', 'Zero-Downtime Migration'],
      repos: [
        {
          name: 'idempotent-payment-router',
          url: 'https://github.com/snehareddy/idempotent-payment-router',
          description: 'Strictly linearizable distributed lock and deduplication proxy for payment gateways.',
          languages: { Go: 78000 },
          commitsCount: 290,
          recentCommitHash: 'e71239c',
          recentCommitMessage: 'Eliminate Redis lock starvation using leasing algorithms',
          verifiedAt: '2026-09-14T17:00:00Z',
          impactScore: 96,
          citations: ['Processing $40M daily volume with 99.999% availability'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-kunal',
    name: 'Kunal Bhasin',
    handle: '@kunal_scale',
    persona: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    role: 'VP Engineering (Scalable Systems)',
    department: 'B.Tech CS (Alumnus Class of 2017)',
    institution: 'CRED / IIITD Alumnus',
    gradYear: 2017,
    statusBadge: 'Unicorn Tech Leader',
    bio: 'Scaled high-traffic microservices to 10M+ MAU. Champion of engineering excellence and campus talent pipelines.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 910,
      verifiedImpactScore: 96,
      topLanguages: ['Java', 'Go', 'Rust'],
      veralonEmbeddingsCalculated: true,
      specializations: ['High Concurrency', 'Event-Driven Architecture', 'Kafka Pipelines', 'Fintech Security'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-aayush',
    name: 'Aayush Goyal',
    handle: '@aayush_zerodha',
    persona: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    role: 'Tech Lead (Order Execution)',
    department: 'B.Tech CS (Alumnus Class of 2019)',
    institution: 'Zerodha / IIITD Alumnus',
    gradYear: 2019,
    statusBadge: 'Kite Architecture Lead',
    bio: 'Microsecond order routing and ticker streaming. Believer in FOSS software, zero-bloat web development, and local-first architecture.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 890,
      verifiedImpactScore: 97,
      topLanguages: ['Go', 'C', 'Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Zero-Bloat Systems', 'WebSockets', 'Order Matching', 'Kernel Tuning'],
      repos: [
        {
          name: 'fast-ticker-stream',
          url: 'https://github.com/aayushgoyal/fast-ticker-stream',
          description: 'Zero-allocation binary WebSocket ticker multiplexer handling 250,000 concurrent market data connections.',
          languages: { Go: 92000, C: 21000 },
          commitsCount: 310,
          recentCommitHash: 'c88123a',
          recentCommitMessage: 'Drop memory footprint to 18KB per concurrent connection',
          verifiedAt: '2026-09-02T16:00:00Z',
          impactScore: 97,
          citations: ['Production core component for high-frequency retail execution'],
          isGithubVerified: true
        }
      ],
      papers: []
    }
  },
  {
    id: 'node-priyanka',
    name: 'Priyanka Rao',
    handle: '@priyanka_dm',
    persona: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Research Scientist',
    department: 'B.Tech CS & Applied Math (Alumna Class of 2020)',
    institution: 'Google DeepMind / IIITD Alumna',
    gradYear: 2020,
    statusBadge: 'DeepMind AI Researcher',
    bio: 'Post-training reasoning models, mathematical formal verification, and retrieval grounding. Co-author with Prof. Aradhana Verma.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 640,
      verifiedImpactScore: 97,
      topLanguages: ['Python', 'JAX', 'C++'],
      veralonEmbeddingsCalculated: true,
      specializations: ['JAX', 'Reasoning LLMs', 'Formal Verification', 'Math Proof Search', 'RAG Evaluation'],
      repos: [
        {
          name: 'lean4-proof-search',
          url: 'https://github.com/priyankarao/lean4-proof-search',
          description: 'Monte Carlo Tree Search policy network for automated theorem proving in Lean 4.',
          languages: { Python: 84000, Lean: 45000 },
          commitsCount: 220,
          recentCommitHash: 'a77192b',
          recentCommitMessage: 'Verify 35 Olympiad algebra lemmas with zero human hints',
          verifiedAt: '2026-10-04T18:00:00Z',
          impactScore: 98,
          citations: ['Presented at ICLR 2026 Spotlight'],
          isGithubVerified: true
        }
      ],
      papers: [
        {
          title: 'Automated Proof Synthesis with Step-Level Grounding in Formal Interactive Theorem Provers',
          conference: 'ICLR 2026',
          year: 2026,
          citationsCount: 52,
          abstract: 'Step-level attribution prevents synthetic hallucinatory steps in formal reasoning chains.'
        }
      ]
    }
  },
  {
    id: 'node-devansh',
    name: 'Devansh Mittal',
    handle: '@devansh_synth',
    persona: 'founder',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Founder & CEO, Synthetix Health AI',
    department: 'B.Tech CS & Bioinformatics (Alumnus Class of 2021)',
    institution: 'Synthetix AI / IIITD Alum',
    gradYear: 2021,
    statusBadge: 'HealthTech Founder',
    bio: 'HIPAA-compliant generative clinical summarization. Seed funded ($1.9M). Active student project recruiter.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 580,
      verifiedImpactScore: 92,
      topLanguages: ['Python', 'Rust', 'TypeScript'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Clinical NLP', 'FHIR Protocols', 'Entity Disambiguation', 'Health AI'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-ishaan',
    name: 'Ishaan Deshmukh',
    handle: '@ishaan_infra',
    persona: 'alumni',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'Principal Infrastructure Architect',
    department: 'B.Tech CS (Alumnus Class of 2016)',
    institution: 'Stripe Global Infra / IIITD Alumnus',
    gradYear: 2016,
    statusBadge: 'Principal Infra Architect',
    bio: 'Distributed storage, CockroachDB internals, and zero-trust mesh routing across 40 global cloud zones.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 1120,
      verifiedImpactScore: 98,
      topLanguages: ['Go', 'Rust', 'C'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Multi-Cloud Mesh', 'CockroachDB', 'Zero-Trust', 'High Availability'],
      repos: [],
      papers: []
    }
  },

  // --- RECRUITERS & VENTURE TALENT PARTNERS ---
  {
    id: 'node-sarah',
    name: 'Sarah Jenkins',
    handle: '@sarah_stripe_talent',
    persona: 'recruiter',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Director of Technical Talent (APAC)',
    department: 'Global Engineering Recruiting',
    institution: 'Stripe APAC / University Partnerships',
    statusBadge: 'Hiring Principal Systems Talent',
    bio: 'Recruiting high-caliber distributed systems, consensus, and database engine builders directly via proof-of-work.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 95,
      verifiedImpactScore: 84,
      topLanguages: ['Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Systems Hiring', 'Proof-of-Work Auditing', 'Engineering Talent'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-amitabh',
    name: 'Amitabh Roy',
    handle: '@amitabh_peakxv',
    persona: 'recruiter',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    role: 'Head of University Talent & Labs',
    department: 'Venture Talent & Ecosystem',
    institution: 'Peak XV Partners (formerly Sequoia India)',
    statusBadge: 'Venture Talent Lead',
    bio: 'Matching early-stage seed portfolio founders with top 1% engineering builders with verified repository commits.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 110,
      verifiedImpactScore: 86,
      topLanguages: ['Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Venture Scouting', 'Seed Portfolios', 'Founder Matches', 'Warm Intros'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-neha',
    name: 'Neha Kapoor',
    handle: '@neha_databricks',
    persona: 'recruiter',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Staff Technical Recruiter (AI Systems)',
    department: 'AI & Data Infrastructure Recruiting',
    institution: 'Databricks AI Labs',
    statusBadge: 'Databricks AI Talent',
    bio: 'Hiring PyTorch, vector database, and high-performance kernel engineers for next-gen lakehouse AI.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 60,
      verifiedImpactScore: 80,
      topLanguages: [],
      veralonEmbeddingsCalculated: true,
      specializations: ['AI Systems', 'Lakehouse Talent', 'FastAPI & RAG'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-mark',
    name: 'Mark Vance',
    handle: '@mark_antler',
    persona: 'recruiter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'VP Engineering Talent',
    department: 'Early Stage Founder Programs',
    institution: 'Antler Global Incubator',
    statusBadge: 'Founding Engineer Scout',
    bio: 'Placing founding engineers at Day 0 tech startups backed by institutional venture capital.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 45,
      verifiedImpactScore: 78,
      topLanguages: [],
      veralonEmbeddingsCalculated: true,
      specializations: ['Founding Engineers', 'Early Stage Hires'],
      repos: [],
      papers: []
    }
  },

  // --- INSTITUTIONAL NODES & LAB CONSORTIUMS ---
  {
    id: 'node-c2c',
    name: 'Code2Career Innovation Studio',
    handle: '@code2career_hub',
    persona: 'institution',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    role: 'Flagship Campus Venture & Build Studio',
    department: 'Deanery of Innovation & Student Enterprise',
    institution: 'IIIT Delhi Campus Incubator',
    statusBadge: 'Campus Build Studio',
    bio: 'Bridging classroom knowledge to production proof-of-work through weekend build sprints and alumni mentorship.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 3400,
      verifiedImpactScore: 98,
      topLanguages: ['TypeScript', 'Python', 'Rust'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Build Sprints', 'Venture Incubation', 'Alumni Mentorship', 'Proof-of-Work Verification'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-tbi',
    name: 'Technology Business Incubator (TBI)',
    handle: '@iiitd_tbi',
    persona: 'institution',
    avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
    role: 'DST-Supported Tech Business Incubator',
    department: 'Govt. of India DST Co-Funded Hub',
    institution: 'IIITD Innovation Center',
    statusBadge: 'DST Tech Incubator',
    bio: 'Providing seed capital, patent funding, and corporate connections to deep-tech university spinoffs.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 1400,
      verifiedImpactScore: 95,
      topLanguages: ['Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Seed Grants', 'Patent Filing', 'Deep-Tech Commercialization'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-dsc',
    name: 'Distributed Systems & AI Research Consortium',
    handle: '@ds_consortium',
    persona: 'institution',
    avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&auto=format&fit=crop&q=80',
    role: 'Inter-Departmental High-Performance Lab',
    department: 'Center for Applied Distributed Computing',
    institution: 'IIIT Delhi Research Core',
    statusBadge: 'Tier-1 Research Lab',
    bio: 'State-of-the-art compute cluster with 64x NVIDIA H100 GPUs for multimodal training and edge consensus experiments.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 2800,
      verifiedImpactScore: 99,
      topLanguages: ['C++', 'Python', 'CUDA'],
      veralonEmbeddingsCalculated: true,
      specializations: ['H100 GPU Cluster', 'Multi-Node BFT', 'Distributed Checkpointing'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-alumni-cell',
    name: 'Global Alumni & Endowment Directorate',
    handle: '@iiitd_alumni',
    persona: 'institution',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
    role: 'University Alumni Affairs Directorate',
    department: 'Office of External Relations & Endowment',
    institution: 'IIIT Delhi Directorate',
    statusBadge: 'Official Alumni Directorate',
    bio: 'Connecting 8,500+ global alumni across Silicon Valley, Bengaluru, London, and Singapore with university research and students.',
    phoneBridged: true,
    proofOfWork: {
      totalCommits: 520,
      verifiedImpactScore: 94,
      topLanguages: [],
      veralonEmbeddingsCalculated: true,
      specializations: ['Endowment Funds', 'Global Chapters', 'Alumni Mentorship'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-placement-cell',
    name: 'Corporate Immersion & Placement Cell',
    handle: '@iiitd_placement',
    persona: 'institution',
    avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80',
    role: 'Industry Partnership Directorate',
    department: 'Career Services & Strategic Placement',
    institution: 'IIIT Delhi Directorate',
    statusBadge: 'Career Services',
    bio: 'Facilitating zero-form warm routing and direct hiring based on verified engineering proof-of-work.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 400,
      verifiedImpactScore: 91,
      topLanguages: [],
      veralonEmbeddingsCalculated: true,
      specializations: ['Campus Hiring', 'Executive Relations', 'Work-Integrated Learning'],
      repos: [],
      papers: []
    }
  },
  {
    id: 'node-ieee-student',
    name: 'IEEE Computer Society Student Branch',
    handle: '@ieee_iiitd',
    persona: 'institution',
    avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=150&auto=format&fit=crop&q=80',
    role: 'Technical Society & Hackathon Host',
    department: 'Student Technical Activities Council',
    institution: 'IIIT Delhi IEEE Chapter',
    statusBadge: 'Student Society',
    bio: 'Host of HackIIITD, research paper reading circles, and peer code reviews.',
    phoneBridged: false,
    proofOfWork: {
      totalCommits: 900,
      verifiedImpactScore: 90,
      topLanguages: ['TypeScript', 'Python'],
      veralonEmbeddingsCalculated: true,
      specializations: ['Hackathons', 'Paper Reading Groups', 'Peer Audits'],
      repos: [],
      papers: []
    }
  }
];

export const SEED_EDGES: TrustEdge[] = [
  // --- FLAGSHIP WARM TRUST PATH (Rohan Mehta <-> Dr. Sanjeev Sharma <-> Parteek Garg) ---
  {
    id: 'edge-rohan-sharma',
    source: 'node-rohan',
    target: 'node-dr-sharma',
    relationship: '2019 B.Tech Thesis Advisee & Seed Research Collaborator',
    weight: 0.96,
    status: 'vouched',
    vouchedAt: '2026-04-12T10:00:00Z',
    bridgeNotes: 'Dr. Sharma advised Rohan Mehta on distributed transaction logs during his undergraduate thesis.'
  },
  {
    id: 'edge-sharma-parteek',
    source: 'node-dr-sharma',
    target: 'node-parteek',
    relationship: 'Research Lab Lead & Co-Author (Offline Distributed Sync)',
    weight: 0.94,
    status: 'verified',
    vouchedAt: '2026-09-10T14:30:00Z',
    bridgeNotes: 'Parteek has conducted 2 semesters of direct laboratory research on deterministic consensus under Dr. Sharma.'
  },

  // --- RESEARCH LAB CO-AUTHORING & ADVISORY PATHS ---
  {
    id: 'edge-verma-priyanka',
    source: 'node-prof-verma',
    target: 'node-priyanka',
    relationship: 'Graduate Research Advisee & NeurIPS Co-Author',
    weight: 0.95,
    status: 'vouched',
    vouchedAt: '2026-05-18T11:00:00Z',
    bridgeNotes: 'Priyanka was supervised by Prof. Verma before joining DeepMind Research.'
  },
  {
    id: 'edge-verma-ananya',
    source: 'node-prof-verma',
    target: 'node-ananya',
    relationship: 'M.Tech Thesis Advisor (Knowledge Graphs & NLP)',
    weight: 0.91,
    status: 'verified',
    bridgeNotes: 'Supervising Ananya on cross-domain entity resolution.'
  },
  {
    id: 'edge-verma-parteek',
    source: 'node-prof-verma',
    target: 'node-parteek',
    relationship: 'RAG Pipeline Evaluator (Veralon Benchmark Evaluation)',
    weight: 0.89,
    status: 'verified',
    bridgeNotes: 'Prof. Verma verified Parteek’s veralon-rag-engine on 4,000 academic domain queries.'
  },
  {
    id: 'edge-mukherjee-vikram',
    source: 'node-dr-mukherjee',
    target: 'node-vikram',
    relationship: 'Spatial Vision Thesis Advisor & Seed Incubator Mentor',
    weight: 0.95,
    status: 'vouched',
    vouchedAt: '2026-03-20T09:00:00Z',
    bridgeNotes: 'Dr. Mukherjee incubated Omnispatial inside the campus Geomatics lab.'
  },
  {
    id: 'edge-mukherjee-aditya',
    source: 'node-dr-mukherjee',
    target: 'node-aditya',
    relationship: 'Indoor SLAM Research Supervisor',
    weight: 0.90,
    status: 'verified',
    bridgeNotes: 'Aditya built the WebXR campus positioning system under Dr. Mukherjee.'
  },
  {
    id: 'edge-bhatia-kabir',
    source: 'node-dr-bhatia',
    target: 'node-kabir',
    relationship: 'Robotics Hardware Lab Advisor',
    weight: 0.92,
    status: 'verified',
    bridgeNotes: 'Supervises Kabir on autonomous rover micro-controllers.'
  },

  // --- PEER TEAM ENTROPY & BUILDER EDGES ---
  {
    id: 'edge-parteek-darsh',
    source: 'node-parteek',
    target: 'node-darsh',
    relationship: 'Flagship Hackathon Teammates (Team Entropy) & Co-Authors',
    weight: 0.98,
    status: 'vouched',
    vouchedAt: '2026-08-01T12:00:00Z',
    bridgeNotes: 'Built Conduit and Finwise together; shared 140+ pair programming sessions.'
  },
  {
    id: 'edge-parteek-nipun',
    source: 'node-parteek',
    target: 'node-nipun',
    relationship: 'Co-Founders (Ziro Core & Multimodal Pipeline)',
    weight: 0.97,
    status: 'vouched',
    vouchedAt: '2026-08-10T15:00:00Z',
    bridgeNotes: 'Co-architects on offline fintech and vision webhook integrations.'
  },
  {
    id: 'edge-parteek-aditya',
    source: 'node-parteek',
    target: 'node-aditya',
    relationship: 'PWA & Decentralized Identity Collaborators',
    weight: 0.94,
    status: 'vouched',
    vouchedAt: '2026-07-15T18:00:00Z',
    bridgeNotes: 'Paired on local-first PWA sync and cryptographic QR credential issuance.'
  },
  {
    id: 'edge-nipun-darsh',
    source: 'node-nipun',
    target: 'node-darsh',
    relationship: 'Computer Vision UI & Spatial UX Collaborators',
    weight: 0.93,
    status: 'verified'
  },
  {
    id: 'edge-nipun-diya',
    source: 'node-nipun',
    target: 'node-diya',
    relationship: 'Multimodal Healthcare Vision Project Collaborators',
    weight: 0.86,
    status: 'verified'
  },
  {
    id: 'edge-darsh-aditya',
    source: 'node-darsh',
    target: 'node-aditya',
    relationship: 'WebXR Interface & Canvas Visualizer Teammates',
    weight: 0.92,
    status: 'verified'
  },
  {
    id: 'edge-parteek-meera',
    source: 'node-parteek',
    target: 'node-meera',
    relationship: 'Distributed Consensus & Storage Engine Peers',
    weight: 0.88,
    status: 'verified'
  },
  {
    id: 'edge-parteek-tanya',
    source: 'node-parteek',
    target: 'node-tanya',
    relationship: 'Cryptographic Protocol Auditing Partners',
    weight: 0.90,
    status: 'verified'
  },

  // --- ALUMNI TO ALUMNI / INDUSTRY COHORT EDGES ---
  {
    id: 'edge-rohan-sneha',
    source: 'node-rohan',
    target: 'node-sneha',
    relationship: 'Fintech Alumni Working Group & UPI Interoperability Leads',
    weight: 0.94,
    status: 'vouched'
  },
  {
    id: 'edge-rohan-kunal',
    source: 'node-rohan',
    target: 'node-kunal',
    relationship: 'Seed Round Angel Syndicate & FinTech Scaling Mentorship',
    weight: 0.91,
    status: 'vouched'
  },
  {
    id: 'edge-sneha-aayush',
    source: 'node-sneha',
    target: 'node-aayush',
    relationship: 'B.Tech Batchmates & High-Throughput Microservice Mentors',
    weight: 0.92,
    status: 'vouched'
  },
  {
    id: 'edge-rohan-aayush',
    source: 'node-rohan',
    target: 'node-aayush',
    relationship: 'Local-First Architecture Research Discussion Circle',
    weight: 0.89,
    status: 'verified'
  },
  {
    id: 'edge-vikram-ishaan',
    source: 'node-vikram',
    target: 'node-ishaan',
    relationship: 'Global Infra Architecture Advisors',
    weight: 0.87,
    status: 'verified'
  },
  {
    id: 'edge-priyanka-rohan',
    source: 'node-priyanka',
    target: 'node-rohan',
    relationship: 'Campus Research Alumni Fellows',
    weight: 0.88,
    status: 'verified'
  },
  {
    id: 'edge-devansh-parteek',
    source: 'node-devansh',
    target: 'node-parteek',
    relationship: 'Clinical Entity Resolution Pipeline Reviewer',
    weight: 0.85,
    status: 'verified'
  },

  // --- RECRUITER TO ALUMNI / CAMPUS EDGES ---
  {
    id: 'edge-sarah-ishaan',
    source: 'node-sarah',
    target: 'node-ishaan',
    relationship: 'Senior Infra Talent Partner',
    weight: 0.95,
    status: 'vouched'
  },
  {
    id: 'edge-amitabh-rohan',
    source: 'node-amitabh',
    target: 'node-rohan',
    relationship: 'Peak XV Seed Portfolio Lead & Founder Sponsor',
    weight: 0.97,
    status: 'vouched'
  },
  {
    id: 'edge-amitabh-vikram',
    source: 'node-amitabh',
    target: 'node-vikram',
    relationship: 'Deep-Tech Early Stage Portfolio Mentor',
    weight: 0.92,
    status: 'vouched'
  },
  {
    id: 'edge-neha-priyanka',
    source: 'node-neha',
    target: 'node-priyanka',
    relationship: 'AI Research Advisory Liaison',
    weight: 0.88,
    status: 'verified'
  },
  {
    id: 'edge-sarah-dr-sharma',
    source: 'node-sarah',
    target: 'node-dr-sharma',
    relationship: 'Stripe University Systems Fellowship Sponsor',
    weight: 0.93,
    status: 'verified'
  },

  // --- INSTITUTIONAL ANCHOR EDGES ---
  {
    id: 'edge-c2c-parteek',
    source: 'node-c2c',
    target: 'node-parteek',
    relationship: 'Flagship Build Fellow & Sprint Lead',
    weight: 0.98,
    status: 'vouched'
  },
  {
    id: 'edge-c2c-darsh',
    source: 'node-c2c',
    target: 'node-darsh',
    relationship: 'Design Systems Lead Fellow',
    weight: 0.97,
    status: 'vouched'
  },
  {
    id: 'edge-c2c-rohan',
    source: 'node-c2c',
    target: 'node-rohan',
    relationship: 'EIR (Entrepreneur-in-Residence) & Seed Angel',
    weight: 0.96,
    status: 'vouched'
  },
  {
    id: 'edge-c2c-dr-kaur',
    source: 'node-c2c',
    target: 'node-dr-kaur',
    relationship: 'Executive University Sponsorship & Governance',
    weight: 0.99,
    status: 'vouched'
  },
  {
    id: 'edge-tbi-rohan',
    source: 'node-tbi',
    target: 'node-rohan',
    relationship: 'Incubated Startup Graduate',
    weight: 0.94,
    status: 'vouched'
  },
  {
    id: 'edge-tbi-vikram',
    source: 'node-tbi',
    target: 'node-vikram',
    relationship: 'Deep Tech Grant Recipient',
    weight: 0.92,
    status: 'vouched'
  },
  {
    id: 'edge-dsc-sharma',
    source: 'node-dsc',
    target: 'node-dr-sharma',
    relationship: 'Consortium Laboratory Director',
    weight: 0.99,
    status: 'vouched'
  },
  {
    id: 'edge-dsc-verma',
    source: 'node-dsc',
    target: 'node-prof-verma',
    relationship: 'Principal AI Investigator',
    weight: 0.98,
    status: 'vouched'
  },
  {
    id: 'edge-alumni-rohan',
    source: 'node-alumni-cell',
    target: 'node-rohan',
    relationship: 'Alumni Council Representative (YC Cohort)',
    weight: 0.95,
    status: 'vouched'
  },
  {
    id: 'edge-alumni-sneha',
    source: 'node-alumni-cell',
    target: 'node-sneha',
    relationship: 'Bangalore Chapter Secretary',
    weight: 0.93,
    status: 'vouched'
  },
  {
    id: 'edge-placement-parteek',
    source: 'node-placement-cell',
    target: 'node-parteek',
    relationship: 'Verified Top-1% Systems Talent Registry',
    weight: 0.91,
    status: 'verified'
  },
  {
    id: 'edge-ieee-parteek',
    source: 'node-ieee-student',
    target: 'node-parteek',
    relationship: 'Technical Committee Chair',
    weight: 0.94,
    status: 'vouched'
  },
  {
    id: 'edge-ieee-nipun',
    source: 'node-ieee-student',
    target: 'node-nipun',
    relationship: 'AI Research Track Lead',
    weight: 0.92,
    status: 'verified'
  },
  {
    id: 'edge-ieee-darsh',
    source: 'node-ieee-student',
    target: 'node-darsh',
    relationship: 'Hackathon Design Director',
    weight: 0.93,
    status: 'verified'
  },
  {
    id: 'edge-ieee-kabir',
    source: 'node-ieee-student',
    target: 'node-kabir',
    relationship: 'Robotics Workshop Lead',
    weight: 0.88,
    status: 'verified'
  },
  {
    id: 'edge-dr-sharma-meera',
    source: 'node-dr-sharma',
    target: 'node-meera',
    relationship: 'Undergraduate Research Advisee (Raft Consensus)',
    weight: 0.91,
    status: 'verified'
  },
  {
    id: 'edge-dr-sharma-tanya',
    source: 'node-dr-sharma',
    target: 'node-tanya',
    relationship: 'Cryptographic Protocol Advisor',
    weight: 0.92,
    status: 'verified'
  },
  {
    id: 'edge-prof-verma-nipun',
    source: 'node-prof-verma',
    target: 'node-nipun',
    relationship: 'Multimodal OCR Research Advisor',
    weight: 0.93,
    status: 'verified'
  },
  {
    id: 'edge-rohan-darsh',
    source: 'node-rohan',
    target: 'node-darsh',
    relationship: 'Design System Advisory Reviewer',
    weight: 0.86,
    status: 'verified'
  },
  {
    id: 'edge-vikram-darsh',
    source: 'node-vikram',
    target: 'node-darsh',
    relationship: 'WebGL / Canvas Performance Mentorship',
    weight: 0.87,
    status: 'verified'
  },
  {
    id: 'edge-sarah-parteek',
    source: 'node-sarah',
    target: 'node-parteek',
    relationship: 'Tentative Talent Pipeline (Awaiting Warm Vouch)',
    weight: 0.65,
    status: 'tentative'
  },
  {
    id: 'edge-amitabh-parteek',
    source: 'node-amitabh',
    target: 'node-parteek',
    relationship: 'Venture Scout Pipeline (Awaiting Founder Intro)',
    weight: 0.70,
    status: 'tentative'
  }
];

export const SEED_INTENTS: IntentCapsule[] = [
  {
    id: 'intent-founder-fintech',
    authorId: 'node-rohan',
    authorName: 'Rohan Mehta',
    authorRole: 'Founder @ NexaPay (YC W22)',
    authorPersona: 'founder',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    category: 'Fintech',
    query: 'Fintech seed startup seeking student with offline-first sync + WebCrypto commits for paid 6-week sprint.',
    compensation: '₹1,20,000 / month + Equity Grant',
    duration: '6-Week Core Protocol Sprint',
    createdAt: '2026-10-16T18:00:00Z',
    expiresIn: '42h remaining',
    status: 'active',
    topMatchIds: ['node-parteek', 'node-aditya', 'node-meera'],
    evidenceList: [
      {
        nodeId: 'node-parteek',
        score: 96.4,
        repo: 'ziro-offline-fintech',
        commitHash: 'a8f921c',
        quote: 'Commit #a8f921c: "Implemented IndexedDB cryptographic ledger sync with zero-connectivity fallback & deterministic replay"'
      },
      {
        nodeId: 'node-aditya',
        score: 91.2,
        repo: 'offline-pwa-sync',
        commitHash: 'f78119b',
        quote: 'Commit #f78119b: "Two-phase commit over BroadcastChannel with SQLite-Wasm local persistence"'
      },
      {
        nodeId: 'node-meera',
        score: 87.5,
        repo: 'pebble-raft-kv',
        commitHash: 'c90192b',
        quote: 'Commit #c90192b: "High-throughput linearizable key-value store with CockroachDB Pebble engine"'
      }
    ]
  },
  {
    id: 'intent-faculty-rag',
    authorId: 'node-prof-verma',
    authorName: 'Prof. Aradhana Verma',
    authorRole: 'Director, Multimodal NLP Lab',
    authorPersona: 'faculty',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    category: 'AI / RAG',
    query: 'Seeking 2 undergrad researchers with PyTorch multimodal OCR + RAG pipelines & an industry alumnus co-advisor.',
    compensation: 'Funded Research Fellowship + Co-authorship at NeurIPS 2027',
    duration: '2 Semesters',
    createdAt: '2026-10-17T08:00:00Z',
    expiresIn: '47h remaining',
    status: 'active',
    topMatchIds: ['node-nipun', 'node-parteek', 'node-ananya'],
    evidenceList: [
      {
        nodeId: 'node-nipun',
        score: 97.8,
        repo: 'multimodal-vision-ocr',
        commitHash: 'c7720fa',
        quote: 'Commit #c7720fa: "TensorRT quantized Vision Transformer with 97.8% F1 on dense tabular hierarchies"'
      },
      {
        nodeId: 'node-parteek',
        score: 94.6,
        repo: 'veralon-rag-engine',
        commitHash: 'd38210e',
        quote: 'Commit #d38210e: "Hybrid BM25 + dense vector fusion with dynamic threshold gating & pgvector indexing"'
      },
      {
        nodeId: 'node-ananya',
        score: 89.1,
        repo: 'graph-entity-linker',
        commitHash: 'b44198c',
        quote: 'Commit #b44198c: "Zero-shot entity resolution over Wikidata and academic domain graphs"'
      }
    ]
  },
  {
    id: 'intent-recruiter-systems',
    authorId: 'node-sarah',
    authorName: 'Sarah Jenkins',
    authorRole: 'Director of Technical Talent @ Stripe',
    authorPersona: 'recruiter',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    category: 'Systems',
    query: 'Hiring systems engineer with real FastAPI, pgvector, and deterministic entity resolution production repos.',
    compensation: '$180,000 - $220,000 + Stock Options',
    duration: 'Full-Time Core Infrastructure',
    createdAt: '2026-10-15T12:00:00Z',
    expiresIn: '18h remaining',
    status: 'active',
    topMatchIds: ['node-parteek', 'node-sneha', 'node-meera'],
    evidenceList: [
      {
        nodeId: 'node-parteek',
        score: 95.8,
        repo: 'lumiere-clinical-id',
        commitHash: 'f4912ab',
        quote: 'Commit #f4912ab: "Probabilistic Fellegi-Sunter record linkage with locality-sensitive hashing"'
      },
      {
        nodeId: 'node-sneha',
        score: 94.2,
        repo: 'idempotent-payment-router',
        commitHash: 'e71239c',
        quote: 'Commit #e71239c: "Strictly linearizable distributed lock proxy handling $40M daily volume"'
      },
      {
        nodeId: 'node-meera',
        score: 88.0,
        repo: 'pebble-raft-kv',
        commitHash: 'c90192b',
        quote: 'Commit #c90192b: "Pipelined log replication and snapshot compaction over Pebble storage engine"'
      }
    ]
  },
  {
    id: 'intent-student-ar',
    authorId: 'node-aditya',
    authorName: 'Aditya Tanwar',
    authorRole: 'Undergrad Builder @ Team Entropy',
    authorPersona: 'student',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    category: 'Spatial Computing',
    query: 'Built an AR campus routing prototype; seeking 15-min architecture review from an alumnus in geospatial/AR systems.',
    compensation: 'Architecture Critique & Mutual Mentorship',
    duration: '15-min Warm Handshake',
    createdAt: '2026-10-16T22:00:00Z',
    expiresIn: '36h remaining',
    status: 'active',
    topMatchIds: ['node-vikram', 'node-dr-mukherjee', 'node-darsh'],
    evidenceList: [
      {
        nodeId: 'node-vikram',
        score: 98.2,
        repo: 'omni-spatial-engine',
        commitHash: 'd88190c',
        quote: 'Commit #d88190c: "Sub-centimeter spatial anchoring engine using camera feeds and WebAssembly in production"'
      },
      {
        nodeId: 'node-dr-mukherjee',
        score: 94.0,
        repo: 'geospatial-pointcloud-registration',
        commitHash: 'b90123a',
        quote: 'Commit #b90123a: "Real-time point cloud alignment on embedded AR systems for GPS-denied urban canyons"'
      },
      {
        nodeId: 'node-darsh',
        score: 91.5,
        repo: 'conduit-force-graph-ui',
        commitHash: 'e45902d',
        quote: 'Commit #e45902d: "Spatial partition grid with quadtree acceleration and multi-hop path raycasting"'
      }
    ]
  }
];
