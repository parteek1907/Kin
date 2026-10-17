"""
Transferable Skill Graph Module for Unclaimed Talent Radar.

Provides a deterministic, configurable registry of canonical skills, aliases,
associated domains, transferable skill relationships, relationship explanations,
confidence values, and explicit relationship boundary limits.
"""

from typing import Dict, List, Optional, Set, Any
from dataclasses import dataclass, field


@dataclass(frozen=True)
class TransferableEdge:
    """Represents a directional transferable relationship from a source skill to a related domain or skill."""
    source_skill: str
    target_skill_or_domain: str
    related_domain: str
    confidence: float
    reason: str
    limits: str


@dataclass
class SkillNode:
    """Represents a canonical skill in the knowledge graph."""
    canonical_name: str
    aliases: Set[str] = field(default_factory=set)
    associated_domains: List[str] = field(default_factory=list)
    related_skills: List[str] = field(default_factory=list)
    transferable_edges: List[TransferableEdge] = field(default_factory=list)


@dataclass
class TransferableMatch:
    """Represents an empirical match between a user skill and a target requirement."""
    user_skill: str
    required_skill: str
    related_domain: str
    confidence: float
    reason: str
    limits: str


class TransferableSkillGraph:
    """
    Deterministic, configurable registry of skills, domains, and transferable relationships.
    Expandable and decoupled from external AI APIs.
    """

    def __init__(self):
        self._nodes: Dict[str, SkillNode] = {}
        self._alias_map: Dict[str, str] = {}
        self._domain_index: Dict[str, Set[str]] = {}
        self._initialize_graph()

    def register_skill(
        self,
        canonical_name: str,
        aliases: Optional[List[str]] = None,
        associated_domains: Optional[List[str]] = None,
        related_skills: Optional[List[str]] = None,
    ) -> SkillNode:
        """Register a canonical skill with its aliases and domains."""
        key = canonical_name.strip().title()
        node = self._nodes.get(key)
        if not node:
            node = SkillNode(
                canonical_name=canonical_name.strip(),
                aliases={canonical_name.strip().lower()},
                associated_domains=associated_domains or [],
                related_skills=related_skills or [],
                transferable_edges=[],
            )
            self._nodes[key] = node
        else:
            if associated_domains:
                for d in associated_domains:
                    if d not in node.associated_domains:
                        node.associated_domains.append(d)
            if related_skills:
                for r in related_skills:
                    if r not in node.related_skills:
                        node.related_skills.append(r)

        # Index canonical
        self._alias_map[canonical_name.strip().lower()] = node.canonical_name

        # Index aliases
        if aliases:
            for alias in aliases:
                norm_alias = alias.strip().lower()
                node.aliases.add(norm_alias)
                self._alias_map[norm_alias] = node.canonical_name

        # Index domains
        for domain in node.associated_domains:
            norm_dom = domain.strip().title()
            if norm_dom not in self._domain_index:
                self._domain_index[norm_dom] = set()
            self._domain_index[norm_dom].add(node.canonical_name)

        return node

    def add_transferable_edge(
        self,
        source_skill: str,
        target_skill_or_domain: str,
        related_domain: str,
        confidence: float,
        reason: str,
        limits: str,
    ) -> None:
        """Add an explainable transferable relationship with bounds."""
        canonical_source = self.normalize_skill(source_skill)
        node = self._nodes.get(canonical_source.title())
        if not node:
            node = self.register_skill(canonical_source)

        edge = TransferableEdge(
            source_skill=canonical_source,
            target_skill_or_domain=target_skill_or_domain.strip(),
            related_domain=related_domain.strip(),
            confidence=max(0.0, min(1.0, float(confidence))),
            reason=reason.strip(),
            limits=limits.strip(),
        )
        node.transferable_edges.append(edge)

    def normalize_skill(self, skill_name: str) -> str:
        """Resolve a raw skill string or alias to its canonical name."""
        if not skill_name:
            return ""
        cleaned = skill_name.strip().lower()
        if cleaned in self._alias_map:
            return self._alias_map[cleaned]
        # Return cleanly capitalized string if not registered in alias dictionary
        return skill_name.strip().title()

    def get_skill_node(self, skill_name: str) -> Optional[SkillNode]:
        """Retrieve the SkillNode for a canonical skill or alias."""
        canonical = self.normalize_skill(skill_name)
        return self._nodes.get(canonical.title())

    def get_transferable_edges(self, skill_name: str) -> List[TransferableEdge]:
        """Get all outbound transferable relationships for a skill."""
        node = self.get_skill_node(skill_name)
        return node.transferable_edges if node else []

    def get_all_canonical_skills(self) -> List[str]:
        """Return list of all canonical skill names."""
        return sorted([node.canonical_name for node in self._nodes.values()])

    def get_all_domains(self) -> List[str]:
        """Return list of all indexed domains."""
        return sorted(list(self._domain_index.keys()))

    def get_domain_skills(self, domain: str) -> List[str]:
        """Return all skills associated with a domain."""
        norm_dom = domain.strip().title()
        return sorted(list(self._domain_index.get(norm_dom, set())))

    def find_transferable_matches(
        self,
        user_skills: List[str],
        required_skills: List[str],
    ) -> List[TransferableMatch]:
        """
        Evaluate user skills against opportunity required skills to discover
        valid, explainable transferable bridges.
        """
        matches: List[TransferableMatch] = []
        normalized_user_skills = {self.normalize_skill(s) for s in user_skills if s}
        normalized_required_skills = {self.normalize_skill(r) for r in required_skills if r}

        # Track satisfied requirements to prevent redundant duplicate matches
        satisfied_requirements: Set[str] = set()

        for u_skill in normalized_user_skills:
            edges = self.get_transferable_edges(u_skill)
            for edge in edges:
                norm_target = self.normalize_skill(edge.target_skill_or_domain)
                # Check if target requirement matches edge target directly or by domain relevance
                for req in normalized_required_skills:
                    if req in satisfied_requirements:
                        continue

                    # Direct target match
                    is_match = (
                        norm_target.lower() == req.lower()
                        or edge.target_skill_or_domain.lower() in req.lower()
                        or req.lower() in edge.target_skill_or_domain.lower()
                    )

                    # Or the requirement belongs to the related domain of this edge
                    if not is_match:
                        req_node = self.get_skill_node(req)
                        if req_node and edge.related_domain in req_node.associated_domains:
                            is_match = True

                    if is_match and norm_target.lower() != u_skill.lower():
                        matches.append(
                            TransferableMatch(
                                user_skill=u_skill,
                                required_skill=req,
                                related_domain=edge.related_domain,
                                confidence=edge.confidence,
                                reason=edge.reason,
                                limits=edge.limits,
                            )
                        )
                        satisfied_requirements.add(req)

        return matches

    def get_skill_map(
        self,
        skill: Optional[str] = None,
        domain: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Produce a structured skill map for visualization and inspection.
        Filters by skill or domain if provided.
        """
        nodes_result = []
        edges_result = []

        target_nodes = list(self._nodes.values())
        if skill:
            canonical = self.normalize_skill(skill)
            node = self.get_skill_node(canonical)
            target_nodes = [node] if node else []
        elif domain:
            dom_skills = self.get_domain_skills(domain)
            target_nodes = [self._nodes[s.title()] for s in dom_skills if s.title() in self._nodes]

        for node in target_nodes:
            nodes_result.append({
                "canonical_name": node.canonical_name,
                "aliases": sorted(list(node.aliases)),
                "associated_domains": node.associated_domains,
                "related_skills": node.related_skills,
                "outbound_transferable_count": len(node.transferable_edges),
            })
            for edge in node.transferable_edges:
                edges_result.append({
                    "source_skill": edge.source_skill,
                    "target_skill_or_domain": edge.target_skill_or_domain,
                    "related_domain": edge.related_domain,
                    "confidence": edge.confidence,
                    "reason": edge.reason,
                    "limits": edge.limits,
                })

        return {
            "queried_skill": skill,
            "queried_domain": domain,
            "total_skills": len(nodes_result),
            "total_relationships": len(edges_result),
            "skills": nodes_result,
            "transferable_edges": edges_result,
        }

    def _initialize_graph(self) -> None:
        """Seed the registry with representative, deterministic cross-industry bridges."""

        # 1. Computer Vision
        self.register_skill(
            canonical_name="Computer Vision",
            aliases=["cv", "opencv", "computer-vision", "cv2", "image processing", "vision"],
            associated_domains=[
                "Artificial Intelligence",
                "Robotics",
                "Autonomous Vehicles",
                "Healthcare & Medical Imaging",
                "Aerospace & Geospatial",
                "Industrial Automation",
            ],
            related_skills=["Python", "Deep Learning", "NumPy", "PyTorch", "Image Segmentation", "Object Detection"],
        )
        self.add_transferable_edge(
            source_skill="Computer Vision",
            target_skill_or_domain="Autonomous Vehicle Perception",
            related_domain="Autonomous Vehicles",
            confidence=0.88,
            reason="Both domains rely on feature extraction, semantic segmentation, and 3D bounding box detection across camera sensor feeds.",
            limits="Does not imply expertise in vehicle kinematics, CAN bus protocols, or hard real-time ISO 26262 automotive safety standards.",
        )
        self.add_transferable_edge(
            source_skill="Computer Vision",
            target_skill_or_domain="Medical Image Analysis",
            related_domain="Healthcare & Medical Imaging",
            confidence=0.82,
            reason="Medical MRI, CT, and histological scans require convolutional feature extraction, cell segmentation, and anomaly detection identical to general CV pipelines.",
            limits="Does not convey clinical diagnostic qualifications, DICOM PACS integration experience, or FDA/HIPAA regulatory compliance expertise.",
        )
        self.add_transferable_edge(
            source_skill="Computer Vision",
            target_skill_or_domain="Satellite Image Analysis",
            related_domain="Aerospace & Geospatial",
            confidence=0.84,
            reason="Processing multi-spectral Earth observation satellite imagery utilizes tiling, cloud masking, and spatial segmentation derived from core computer vision foundations.",
            limits="Does not include orbital mechanics, radar interferometry (InSAR), or GIS geospatial projection pipelines.",
        )
        self.add_transferable_edge(
            source_skill="Computer Vision",
            target_skill_or_domain="Industrial Visual Inspection",
            related_domain="Industrial Automation",
            confidence=0.86,
            reason="Assembly line quality assurance uses edge camera streams to detect surface fractures, dimensional defects, and assembly orientation.",
            limits="Does not imply familiarity with factory programmable logic controllers (PLCs) or rugged industrial fieldbus systems.",
        )
        self.add_transferable_edge(
            source_skill="Computer Vision",
            target_skill_or_domain="Robotics Perception",
            related_domain="Robotics",
            confidence=0.87,
            reason="Robot navigation and pick-and-place manipulation depend on RGB-D depth mapping and visual SLAM pipelines.",
            limits="Does not imply expertise in robotic arm inverse kinematics, motor drivers, or trajectory optimization.",
        )

        # 2. Python
        self.register_skill(
            canonical_name="Python",
            aliases=["py", "python3", "python script", "cpython"],
            associated_domains=[
                "Software Engineering",
                "Data Science",
                "Machine Learning",
                "Robotics",
                "Scientific Computing",
                "Information Technology",
            ],
            related_skills=["NumPy", "Pandas", "FastAPI", "AsyncIO", "PyTest", "Scikit-Learn"],
        )
        self.add_transferable_edge(
            source_skill="Python",
            target_skill_or_domain="Data Science",
            related_domain="Data Science",
            confidence=0.90,
            reason="Python is the industry-standard lingua franca for tabular manipulation, exploratory analysis, and data transformation.",
            limits="Python scripting alone does not certify advanced mathematical statistics, causal inference, or big data warehouse architecture.",
        )
        self.add_transferable_edge(
            source_skill="Python",
            target_skill_or_domain="Machine Learning",
            related_domain="Artificial Intelligence",
            confidence=0.85,
            reason="Deep learning frameworks (PyTorch, TensorFlow) and ML model development pipelines are overwhelmingly implemented via Python APIs.",
            limits="Does not substitute for foundational knowledge in loss optimization, gradient dynamics, or distributed training clusters.",
        )
        self.add_transferable_edge(
            source_skill="Python",
            target_skill_or_domain="Robotics Tooling",
            related_domain="Robotics",
            confidence=0.75,
            reason="Modern robotics middleware such as ROS 2 (rclpy) utilizes Python for orchestration nodes, trajectory scripting, and simulation bridges.",
            limits="Python proficiency does not imply low-level real-time C++ firmware, hardware micro-controller drivers, or RTOS compliance.",
        )
        self.add_transferable_edge(
            source_skill="Python",
            target_skill_or_domain="Scientific Computing",
            related_domain="Scientific Research",
            confidence=0.82,
            reason="NumPy, SciPy, and SymPy provide numerical array manipulation and linear algebra solvers used across physical sciences.",
            limits="Does not provide domain-specific knowledge in physics, bio-molecular dynamics, or computational fluid mechanics.",
        )

        # 3. Machine Learning
        self.register_skill(
            canonical_name="Machine Learning",
            aliases=["ml", "deep learning", "statistical learning", "predictive modeling"],
            associated_domains=[
                "Artificial Intelligence",
                "Fintech",
                "Healthcare & Medical Imaging",
                "Industrial Automation",
                "E-Commerce & Media",
            ],
            related_skills=["Python", "PyTorch", "Scikit-Learn", "Feature Engineering", "Data Modeling"],
        )
        self.add_transferable_edge(
            source_skill="Machine Learning",
            target_skill_or_domain="Quantitative Trading Models",
            related_domain="Fintech",
            confidence=0.78,
            reason="Time-series forecasting, feature selection, and regularization techniques apply directly to market statistical arbitrage models.",
            limits="Does not grant market micro-structure knowledge, SEC compliance expertise, or high-frequency tick data feed architecture.",
        )
        self.add_transferable_edge(
            source_skill="Machine Learning",
            target_skill_or_domain="Predictive Maintenance",
            related_domain="Industrial Automation",
            confidence=0.84,
            reason="Vibration sensor telemetry and industrial machinery failure forecasting leverage anomaly detection and time-series clustering.",
            limits="Does not imply mechanical tribology or hardware sensor installation expertise.",
        )
        self.add_transferable_edge(
            source_skill="Machine Learning",
            target_skill_or_domain="Drug Discovery Informatics",
            related_domain="Healthcare & Medical Imaging",
            confidence=0.76,
            reason="Graph neural networks and molecular fingerprint representations use standard deep learning graph representations.",
            limits="Does not substitute for organic biochemistry or pharmacology laboratory validation.",
        )

        # 4. Natural Language Processing (NLP)
        self.register_skill(
            canonical_name="Natural Language Processing",
            aliases=["nlp", "text processing", "computational linguistics", "llm", "transformers"],
            associated_domains=[
                "Artificial Intelligence",
                "LegalTech",
                "Healthcare Informatics",
                "Customer Experience",
                "Information Retrieval",
            ],
            related_skills=["Python", "HuggingFace", "Tokenization", "Vector Embeddings", "RAG"],
        )
        self.add_transferable_edge(
            source_skill="Natural Language Processing",
            target_skill_or_domain="LegalTech Contract Analysis",
            related_domain="LegalTech",
            confidence=0.83,
            reason="Named entity recognition, clause extraction, and semantic search directly power automated contract due-diligence.",
            limits="Does not qualify for legal counsel, bar admission, or statutory jurisdictional interpretation.",
        )
        self.add_transferable_edge(
            source_skill="Natural Language Processing",
            target_skill_or_domain="Biomedical Text Mining",
            related_domain="Healthcare Informatics",
            confidence=0.81,
            reason="Extracting gene-disease associations and clinical trial outcomes from medical literature uses standard BioBERT token tagging.",
            limits="Does not substitute for medical pathology or clinical diagnosis.",
        )

        # 5. Distributed Systems
        self.register_skill(
            canonical_name="Distributed Systems",
            aliases=["distributed computing", "microservices", "cloud architecture", "high availability"],
            associated_domains=[
                "Software Engineering",
                "Fintech",
                "Telecommunications",
                "Cloud Infrastructure",
            ],
            related_skills=["Go", "Kubernetes", "Kafka", "gRPC", "Docker", "Consensus Protocols"],
        )
        self.add_transferable_edge(
            source_skill="Distributed Systems",
            target_skill_or_domain="High-Frequency Fintech Infrastructure",
            related_domain="Fintech",
            confidence=0.85,
            reason="Low-latency event messaging, idempotent order queues, and leader-election protocols mirror distributed system primitives.",
            limits="Does not imply financial asset valuation or options derivative pricing knowledge.",
        )
        self.add_transferable_edge(
            source_skill="Distributed Systems",
            target_skill_or_domain="Telecom Core Networks",
            related_domain="Telecommunications",
            confidence=0.80,
            reason="5G packet routing and virtualized network functions (VNF) share core multi-node partitioning and load-balancing principles.",
            limits="Does not cover RF antenna engineering or wireless propagation physics.",
        )

        # 6. Embedded Systems & C++
        self.register_skill(
            canonical_name="Embedded Systems",
            aliases=["embedded c", "microcontrollers", "firmware", "rtos", "arm cortex"],
            associated_domains=[
                "Hardware Engineering",
                "Automotive",
                "Aerospace",
                "Medical Devices",
                "Robotics",
            ],
            related_skills=["C", "C++", "Device Drivers", "CAN Bus", "SPI/I2C", "FreeRTOS"],
        )
        self.add_transferable_edge(
            source_skill="Embedded Systems",
            target_skill_or_domain="Automotive ECU Firmware",
            related_domain="Automotive",
            confidence=0.88,
            reason="Interrupt servicing, microsecond timing routines, and hardware memory registers translate directly to automotive engine and body controllers.",
            limits="Does not certify AUTOSAR architecture compliance or ISO 26262 ASIL safety lifecycle auditing.",
        )
        self.add_transferable_edge(
            source_skill="Embedded Systems",
            target_skill_or_domain="Medical Device Firmware",
            related_domain="Medical Devices",
            confidence=0.84,
            reason="Precision analog-to-digital sensor sampling and real-time task scheduling apply to patient monitor device controllers.",
            limits="Does not imply FDA Class II/III medical device documentation or IEC 62304 software safety compliance.",
        )

        # 7. Robotics & ROS 2
        self.register_skill(
            canonical_name="Robotics",
            aliases=["ros", "ros2", "robotics perception", "motion planning", "slam"],
            associated_domains=[
                "Robotics",
                "Autonomous Vehicles",
                "Industrial Automation",
                "Aerospace",
            ],
            related_skills=["Python", "C++", "ROS 2", "Gazebo", "Kinematics", "URDF"],
        )
        self.add_transferable_edge(
            source_skill="Robotics",
            target_skill_or_domain="Autonomous Vehicle Perception",
            related_domain="Autonomous Vehicles",
            confidence=0.91,
            reason="Point cloud filtering, transform trees (TF2), and sensor fusion algorithms are shared between mobile robots and autonomous shuttles.",
            limits="Does not cover highway automotive safety compliance or high-speed vehicle dynamic modeling.",
        )
        self.add_transferable_edge(
            source_skill="Robotics",
            target_skill_or_domain="Warehouse Automation",
            related_domain="Industrial Automation",
            confidence=0.90,
            reason="Automated guided vehicles (AGVs) in logistics warehouses use topological navigation and obstacle avoidance identical to mobile robotics.",
            limits="Does not cover warehouse management ERP software or inventory supply chain accounting.",
        )

        # 8. SQL & Database Engineering
        self.register_skill(
            canonical_name="SQL",
            aliases=["postgresql", "relational database", "mysql", "database design"],
            associated_domains=[
                "Software Engineering",
                "Healthcare Informatics",
                "Fintech",
                "Analytics & BI",
            ],
            related_skills=["PostgreSQL", "Query Optimization", "Data Modeling", "ETL"],
        )
        self.add_transferable_edge(
            source_skill="SQL",
            target_skill_or_domain="Healthcare Informatics",
            related_domain="Healthcare Informatics",
            confidence=0.85,
            reason="Electronic Health Record (EHR) schemas and clinical data warehouses rely heavily on relational modeling, indexing, and transactional integrity.",
            limits="Does not grant medical terminology (SNOMED, ICD-10) fluency or HIPAA auditing certification.",
        )
        self.add_transferable_edge(
            source_skill="SQL",
            target_skill_or_domain="Financial Risk Modeling",
            related_domain="Fintech",
            confidence=0.83,
            reason="Reconciling multi-currency ledger accounts and fraud tracking relies on strict relational constraints and window analytical functions.",
            limits="Does not imply actuarial risk certification or Basel III banking regulatory compliance.",
        )


# Singleton graph instance for platform-wide deterministic discovery
skill_graph = TransferableSkillGraph()
