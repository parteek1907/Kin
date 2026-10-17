from typing import List, Set, Dict, Any, Tuple
from app.features.qualification_connections.models import ConnectionPolicy
from app.features.qualification_connections.schemas import EvaluationResult
from app.models.user import User


class PolicyEvaluator:
    @staticmethod
    def _normalize_string(val: str) -> str:
        return val.strip().lower() if val else ""

    @staticmethod
    def _extract_candidate_skills(candidate: User) -> Set[str]:
        skills = set()
        if candidate.profile and candidate.profile.skills:
            for s in candidate.profile.skills:
                if isinstance(s, str) and s.strip():
                    skills.add(PolicyEvaluator._normalize_string(s))

        # Also aggregate skills from candidate's career journeys
        if hasattr(candidate, "career_journeys") and candidate.career_journeys:
            for j in candidate.career_journeys:
                for s in (j.skills_used or []):
                    if isinstance(s, str) and s.strip():
                        skills.add(PolicyEvaluator._normalize_string(s))

        return skills

    @staticmethod
    def _extract_candidate_projects(candidate: User) -> List[str]:
        projects = []
        if hasattr(candidate, "career_journeys") and candidate.career_journeys:
            for j in candidate.career_journeys:
                for p in (j.projects_or_achievements or []):
                    if isinstance(p, str) and p.strip():
                        projects.append(p.strip())
        return projects

    @staticmethod
    def _extract_candidate_industries(candidate: User) -> Set[str]:
        industries = set()
        if candidate.profile and candidate.profile.industry:
            industries.add(PolicyEvaluator._normalize_string(candidate.profile.industry))

        if hasattr(candidate, "career_journeys") and candidate.career_journeys:
            for j in candidate.career_journeys:
                if j.industry:
                    industries.add(PolicyEvaluator._normalize_string(j.industry))

        return industries

    @staticmethod
    def _extract_candidate_education(candidate: User) -> List[str]:
        edu_entries = []
        if candidate.profile and candidate.profile.education:
            for edu in candidate.profile.education:
                if isinstance(edu, str) and edu.strip():
                    edu_entries.append(edu.strip())
                elif isinstance(edu, dict):
                    combined = " ".join([str(v) for v in edu.values() if v])
                    if combined.strip():
                        edu_entries.append(combined.strip())
        return edu_entries

    @classmethod
    def evaluate(
        cls,
        policy: ConnectionPolicy,
        candidate: User
    ) -> EvaluationResult:
        """
        Deterministic, rule-based evaluation of a candidate profile against a recipient's policy.
        Never hallucinates. Missing data is explicitly marked as missing and does not count as satisfied.
        """
        criteria_satisfied: List[str] = []
        criteria_not_satisfied: List[str] = []
        missing_information: List[str] = []

        candidate_skills = cls._extract_candidate_skills(candidate)
        candidate_projects = cls._extract_candidate_projects(candidate)
        candidate_industries = cls._extract_candidate_industries(candidate)
        candidate_education = cls._extract_candidate_education(candidate)
        candidate_experience = candidate.profile.years_of_experience if candidate.profile else 0.0

        # 1. EVALUATE REQUIRED SKILLS (Mandatory)
        required_skills = policy.required_skills or []
        req_matched = 0
        if required_skills:
            if not candidate_skills:
                missing_information.append("Candidate has not listed any skills on their profile.")
                for req in required_skills:
                    criteria_not_satisfied.append(f"Required skill '{req}' is missing.")
            else:
                for req in required_skills:
                    norm_req = cls._normalize_string(req)
                    # Check exact or substring match in candidate skills
                    if any(norm_req in sk or sk in norm_req for sk in candidate_skills):
                        req_matched += 1
                        criteria_satisfied.append(f"Required skill '{req}' verified.")
                    else:
                        criteria_not_satisfied.append(f"Required skill '{req}' not found.")

        # 2. EVALUATE PREFERRED SKILLS (Non-mandatory booster)
        preferred_skills = policy.preferred_skills or []
        pref_matched = 0
        if preferred_skills and candidate_skills:
            for pref in preferred_skills:
                norm_pref = cls._normalize_string(pref)
                if any(norm_pref in sk or sk in norm_pref for sk in candidate_skills):
                    pref_matched += 1
                    criteria_satisfied.append(f"Preferred skill '{pref}' matched (+bonus).")

        # 3. EVALUATE RELEVANT INDUSTRIES / DOMAINS (Non-mandatory booster)
        relevant_industries = policy.relevant_industries or []
        ind_matched = False
        if relevant_industries:
            if not candidate_industries:
                missing_information.append("Industry or domain preference not specified on candidate profile.")
            else:
                for ind in relevant_industries:
                    norm_ind = cls._normalize_string(ind)
                    if any(norm_ind in ci or ci in norm_ind for ci in candidate_industries):
                        ind_matched = True
                        criteria_satisfied.append(f"Domain alignment verified: '{ind}'.")
                        break
                if not ind_matched:
                    criteria_not_satisfied.append("Candidate does not operate in preferred industry domains.")

        # 4. EVALUATE MINIMUM PROJECT COUNT (Mandatory if > 0)
        min_projects = policy.min_project_count or 0
        project_count = len(candidate_projects)
        if min_projects > 0:
            if project_count == 0:
                missing_information.append("Candidate has no documented projects in career journey records.")
                criteria_not_satisfied.append(f"Requires at least {min_projects} project(s); 0 found.")
            elif project_count >= min_projects:
                criteria_satisfied.append(f"Project criterion met: {project_count} project(s) documented (minimum: {min_projects}).")
            else:
                criteria_not_satisfied.append(f"Insufficient projects: found {project_count}, requires {min_projects}.")

        # 5. EVALUATE MINIMUM YEARS EXPERIENCE (Mandatory if > 0)
        min_exp = policy.min_years_experience or 0.0
        if min_exp > 0.0:
            if candidate.profile is None or (candidate_experience == 0.0 and not candidate_projects):
                missing_information.append("Experience history not specified on profile.")
                criteria_not_satisfied.append(f"Requires at least {min_exp} years experience; 0.0 recorded.")
            elif candidate_experience >= min_exp:
                criteria_satisfied.append(f"Experience criterion met: {candidate_experience} years (minimum: {min_exp}).")
            else:
                criteria_not_satisfied.append(f"Insufficient experience: {candidate_experience} years (requires {min_exp}).")

        # 6. EVALUATE QUALIFICATIONS (Mandatory if specified)
        qualification_reqs = policy.qualification_requirements or []
        if qualification_reqs:
            if not candidate_education:
                missing_information.append("Candidate has no education history recorded on profile.")
                criteria_not_satisfied.append(f"Requires qualifications {qualification_reqs}; none provided.")
            else:
                qual_matched = False
                for req_q in qualification_reqs:
                    norm_q = cls._normalize_string(req_q)
                    if any(norm_q in cls._normalize_string(edu) for edu in candidate_education):
                        qual_matched = True
                        criteria_satisfied.append(f"Qualification verified: '{req_q}'.")
                        break
                if not qual_matched:
                    criteria_not_satisfied.append(f"Required qualifications ({', '.join(qualification_reqs)}) not observed in education history.")

        # 7. COMPUTE MATCH SCORE (0.0 to 100.0)
        score = 0.0
        # Required skills: 50%
        if required_skills:
            score += (req_matched / len(required_skills)) * 50.0
        else:
            score += 50.0  # If no required skills, baseline satisfied

        # Preferred skills: 20%
        if preferred_skills:
            score += (pref_matched / len(preferred_skills)) * 20.0
        else:
            score += 10.0

        # Project & Experience: 20%
        proj_exp_pts = 0.0
        if min_projects > 0:
            proj_exp_pts += 10.0 if project_count >= min_projects else (min(project_count, min_projects) / min_projects) * 10.0
        else:
            proj_exp_pts += 10.0

        if min_exp > 0.0:
            proj_exp_pts += 10.0 if candidate_experience >= min_exp else (min(candidate_experience, min_exp) / min_exp) * 10.0
        else:
            proj_exp_pts += 10.0
        score += proj_exp_pts

        # Domain alignment: 10%
        if ind_matched or not relevant_industries:
            score += 10.0

        final_score = round(min(100.0, max(0.0, score)), 1)

        # 8. DETERMINE STATUS & AUTO-ACCEPTANCE ELIGIBILITY
        all_mandatory_passed = len(criteria_not_satisfied) == 0

        if all_mandatory_passed and len(missing_information) == 0:
            eligibility_status = "qualified"
            if policy.is_active and policy.auto_accept_enabled:
                auto_accept_eligible = True
                manual_review_required = False
            else:
                auto_accept_eligible = False
                manual_review_required = True
        elif missing_information and not criteria_not_satisfied:
            eligibility_status = "insufficient_data"
            auto_accept_eligible = False
            manual_review_required = True
        else:
            eligibility_status = "not_qualified"
            auto_accept_eligible = False
            manual_review_required = True

        # 9. GENERATE DETAILED EXPLANATION
        explanation_lines = [
            f"Policy Evaluation for '{policy.policy_name}' (Score: {final_score}/100.0):",
            f"- Status: {eligibility_status.upper()}",
        ]
        if auto_accept_eligible:
            explanation_lines.append("- Decision: Automatically accepted (all mandatory criteria satisfied and recipient explicitly enabled auto-acceptance).")
        elif all_mandatory_passed and not policy.auto_accept_enabled:
            explanation_lines.append("- Decision: Qualified for connection, but queued for manual review because the recipient has not enabled automatic acceptance.")
        elif not policy.is_active:
            explanation_lines.append("- Decision: Policy is currently inactive; queued for manual review.")
        else:
            explanation_lines.append("- Decision: Queued for manual review. Mandatory criteria or portfolio requirements are not fully satisfied.")

        if criteria_not_satisfied:
            explanation_lines.append(f"- Gaps: {'; '.join(criteria_not_satisfied)}")
        if missing_information:
            explanation_lines.append(f"- Missing Information: {'; '.join(missing_information)}")

        return EvaluationResult(
            policy_id=policy.id,
            policy_name=policy.policy_name,
            evaluator_user_id=policy.user_id,
            candidate_user_id=candidate.id,
            eligibility_status=eligibility_status,
            auto_accept_eligible=auto_accept_eligible,
            manual_review_required=manual_review_required,
            match_score=final_score,
            criteria_satisfied=criteria_satisfied,
            criteria_not_satisfied=criteria_not_satisfied,
            missing_information=missing_information,
            explanation="\n".join(explanation_lines),
        )
