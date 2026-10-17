"""
Explainable Recommendations and Learning Path Generator for Unclaimed Talent Radar.

Provides transparent reasoning grounded in stored profile evidence,
deterministic learning path suggestions for missing skills,
and an AI-ready interface for future LLM enhancements without external dependencies.
"""

from typing import List, Dict, Any, Optional, Protocol
from app.features.unclaimed_talent_radar.models import Opportunity
from app.features.unclaimed_talent_radar.matching import MatchingEvaluationResult, UserEvidenceProfile
from app.features.unclaimed_talent_radar.schemas import (
    LearningPathSuggestion,
    EligibilityStatus,
    MatchType,
)


class RadarAIExplanationInterface(Protocol):
    """Protocol for optional generative AI explanation providers."""
    async def enhance_explanation(
        self,
        recommendation_context: Dict[str, Any],
    ) -> List[str]:
        ...


class DeterministicExplanationEngine:
    """
    Deterministic explanation engine.
    Constructs factual reasons and practical learning paths directly from
    empirical matching signals, profile evidence, and skill graph relationships.
    """

    # Deterministic preparation paths for common cross-industry skill bridges
    LEARNING_GUIDES: Dict[str, Dict[str, str]] = {
        "ros 2": {
            "suggested_action": "Explore ROS 2 rclpy node architecture, publishers, subscribers, and launch files via simulation in Gazebo.",
            "addressed_gap": "Bridges Python/C++ skills into modular robotics perception and node communication standards.",
        },
        "autonomous vehicle perception": {
            "suggested_action": "Complete a 3D LiDAR point-cloud clustering and camera-radar sensor fusion benchmark project.",
            "addressed_gap": "Satisfies autonomous drive perception pipeline requirements for dynamic obstacle detection.",
        },
        "medical image analysis": {
            "suggested_action": "Study DICOM scan formats, 3D U-Net voxel segmentation, and MONAI open-source biomedical pipelines.",
            "addressed_gap": "Adapts general convolutional computer vision to clinical MRI/CT scan volumetric data.",
        },
        "satellite image analysis": {
            "suggested_action": "Practice reading multi-spectral GeoTIFF files with Rasterio and running land-use segmentation models.",
            "addressed_gap": "Fulfills remote sensing requirements for satellite orbit telemetry and geospatial indexing.",
        },
        "industrial visual inspection": {
            "suggested_action": "Build an edge defect detection script with OpenCV and ONNX Runtime for high-throughput video streams.",
            "addressed_gap": "Provides hands-on experience with assembly-line anomaly detection and frame latency constraints.",
        },
        "docker": {
            "suggested_action": "Containerize a microservice backend with a multi-stage Dockerfile and configure docker-compose services.",
            "addressed_gap": "Satisfies containerized deployment and reproducible runtime requirements.",
        },
        "kubernetes": {
            "suggested_action": "Deploy pod manifests, services, and ingress controllers on a local minikube cluster.",
            "addressed_gap": "Addresses container orchestration and cluster scaling requirements.",
        },
        "pytorch": {
            "suggested_action": "Implement a custom PyTorch nn.Module, custom Dataset, and training loop with gradient accumulation.",
            "addressed_gap": "Deepens practical deep learning model development and tensor optimization skills.",
        },
        "fastapi": {
            "suggested_action": "Build a typed async REST service with Pydantic validation, dependency injection, and JWT auth.",
            "addressed_gap": "Fulfills modern asynchronous Python backend API development requirements.",
        },
    }

    @classmethod
    def generate_reasons(
        cls,
        user_evidence: UserEvidenceProfile,
        opportunity: Opportunity,
        eval_result: MatchingEvaluationResult,
    ) -> List[str]:
        """
        Synthesize transparent, factual bullet points explaining why the opportunity
        was recommended.
        """
        reasons: List[str] = []

        # 1. Direct Skills Reason
        if eval_result.matched_skills:
            skills_str = ", ".join(eval_result.matched_skills)
            reasons.append(
                f"Directly matches {len(eval_result.matched_skills)} required skill(s): {skills_str}."
            )

        # 2. Project Evidence Reason
        if eval_result.evidence_breakdown.get("project_evidence_score", 0) >= 60.0:
            reasons.append(
                "Demonstrated relevant project evidence in documented historical achievements."
            )

        # 3. Transferable Skills Reasons
        for ts in eval_result.transferable_skills:
            reasons.append(
                f"Transferable skill connection: '{ts.user_skill}' is applicable to '{ts.related_domain}' - {ts.reason}"
            )

        # 4. Cross-Industry Opportunity Reason
        if eval_result.match_type == MatchType.ADJACENT_INDUSTRY:
            user_ind = user_evidence.primary_industry or "your primary domain"
            reasons.append(
                f"Opportunity is in the '{opportunity.industry}' sector, an adjacent industry offering cross-domain mobility beyond {user_ind}."
            )
        elif eval_result.match_type == MatchType.EXPLORATORY:
            reasons.append(
                f"Exploratory discovery: connects your technical foundation with emerging roles in '{opportunity.industry}'."
            )

        # 5. Experience Alignment Reason
        if eval_result.evidence_breakdown.get("experience_compatibility_score", 0) >= 85.0:
            reasons.append(
                f"Experience level is well-matched for this {opportunity.experience_level} role."
            )

        # 6. Eligibility Reason
        if eval_result.eligibility_status == EligibilityStatus.ELIGIBLE:
            reasons.append("Satisfies all explicitly specified eligibility criteria.")
        elif eval_result.eligibility_status == EligibilityStatus.UNKNOWN:
            reasons.append(f"Eligibility note: {eval_result.eligibility_details}")

        # Fallback if list is empty
        if not reasons:
            reasons.append(
                f"Recommended based on general profile alignment with {opportunity.organization} in {opportunity.industry}."
            )

        return reasons

    @classmethod
    def generate_learning_suggestions(
        cls,
        user_evidence: UserEvidenceProfile,
        opportunity: Opportunity,
        eval_result: MatchingEvaluationResult,
    ) -> List[LearningPathSuggestion]:
        """
        Generate deterministic preparation suggestions for missing required skills.
        """
        suggestions: List[LearningPathSuggestion] = []
        user_skill_names = {s.canonical_name.lower() for s in user_evidence.skills}

        # Check stored opportunity resources first
        stored_resources = opportunity.learning_resources or []

        for missing in eval_result.missing_skills:
            norm_missing = missing.strip().lower()
            guide = cls.LEARNING_GUIDES.get(norm_missing)

            # Determine potential user anchor skill
            anchor: Optional[str] = None
            if "python" in user_skill_names:
                anchor = "Python"
            elif user_skill_names:
                anchor = list(user_skill_names)[0].title()

            if guide:
                action = guide["suggested_action"]
                gap = guide["addressed_gap"]
            else:
                action = f"Complete introductory tutorials and build a small demonstration project focusing on {missing}."
                gap = f"Fulfills the {missing} requirement specified for this {opportunity.title} position."

            # Collect relevant stored resources
            matching_resources = [
                res for res in stored_resources
                if str(res.get("skill", "")).lower() == norm_missing or missing.lower() in str(res).lower()
            ]

            suggestions.append(
                LearningPathSuggestion(
                    missing_skill=missing,
                    anchor_skill=anchor,
                    suggested_action=action,
                    addressed_gap=gap,
                    platform_resources=matching_resources,
                    disclaimer="Preparation suggestions are deterministic learning guides and do not guarantee hiring or admission.",
                )
            )

        return suggestions
