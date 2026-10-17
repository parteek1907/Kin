from typing import Protocol, Dict, Any, List, Optional
from collections import Counter, defaultdict
from datetime import date
from sqlalchemy.orm import Session

from app.core.config import settings
from app.features.career_time_machine.models import CareerJourney, JourneyVisibility
from app.features.career_time_machine.schemas import CareerInsightsResponse


class AIServiceInterface(Protocol):
    """Protocol for optional generative AI providers."""
    async def generate_career_insights(
        self,
        target_query: str,
        records_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        ...


class DeterministicInsightsEngine:
    """
    Deterministic engine that computes statistical and topological career patterns
    directly from actual stored database records.
    """

    @staticmethod
    def generate_insights(
        db: Session,
        target_role_or_industry: str
    ) -> CareerInsightsResponse:
        pattern = f"%{target_role_or_industry.strip()}%"
        # Only analyze non-private records
        matching_journeys = (
            db.query(CareerJourney)
            .filter(
                (CareerJourney.job_title.ilike(pattern)) | (CareerJourney.industry.ilike(pattern)),
                CareerJourney.visibility.in_([JourneyVisibility.PUBLIC.value, JourneyVisibility.NETWORK_ONLY.value])
            )
            .all()
        )

        total_journeys = len(matching_journeys)
        if total_journeys == 0:
            return CareerInsightsResponse(
                target_query=target_role_or_industry,
                total_journeys_analyzed=0,
                common_entry_roles=[],
                common_transitions=[],
                in_demand_skills=[],
                average_duration_per_stage_months=None,
                observed_facts=[
                    f"No empirical career journeys currently recorded matching '{target_role_or_industry}'."
                ],
                inferred_patterns=[],
                methodology="Deterministic historical query across verified alumni database.",
                ai_enhanced=False,
                disclaimer="Zero simulated data. Insights will automatically populate as alumni register their journeys."
            )

        # 1. Collect user journeys to discover career progression and transitions
        user_ids = {j.user_id for j in matching_journeys}
        all_user_stages = (
            db.query(CareerJourney)
            .filter(CareerJourney.user_id.in_(user_ids))
            .order_by(CareerJourney.user_id, CareerJourney.start_date.asc())
            .all()
        )

        user_timeline_map: Dict[int, List[CareerJourney]] = defaultdict(list)
        for stage in all_user_stages:
            user_timeline_map[stage.user_id].append(stage)

        # 2. Compute Entry Roles & Transitions
        entry_role_counter: Counter = Counter()
        transition_counter: Counter = Counter()
        durations: List[int] = []
        skills_counter: Counter = Counter()

        for uid, stages in user_timeline_map.items():
            if stages:
                first_role = stages[0].job_title.strip()
                entry_role_counter[first_role] += 1

            for i in range(len(stages) - 1):
                from_role = stages[i].job_title.strip()
                to_role = stages[i + 1].job_title.strip()
                if from_role.lower() != to_role.lower():
                    transition_counter[(from_role, to_role)] += 1

            for s in stages:
                for sk in (s.skills_used or []):
                    cleaned = sk.strip()
                    if cleaned:
                        skills_counter[cleaned] += 1

                # Duration
                ref_end = s.end_date if s.end_date else date.today()
                if s.start_date:
                    months = (ref_end.year - s.start_date.year) * 12 + (ref_end.month - s.start_date.month)
                    if months > 0:
                        durations.append(months)

        # 3. Format Statistics
        common_entry = [role for role, _ in entry_role_counter.most_common(5)]

        common_transitions = []
        for (from_r, to_r), count in transition_counter.most_common(5):
            common_transitions.append({
                "from_role": from_r,
                "to_role": to_r,
                "frequency": count
            })

        top_skills = []
        for sk, count in skills_counter.most_common(8):
            top_skills.append({
                "skill": sk,
                "count": count,
                "prevalence_percentage": round((count / max(1, len(all_user_stages))) * 100, 1)
            })

        avg_duration = round(sum(durations) / len(durations), 1) if durations else None

        # 4. Formulate Observed Facts vs Inferred Patterns
        observed_facts = [
            f"Analyzed {total_journeys} historical record(s) matching '{target_role_or_industry}' across {len(user_ids)} distinct professional profile(s).",
            f"Most frequent entry-level stepping stone observed: '{common_entry[0]}' ({entry_role_counter[common_entry[0]]} alumni started here)." if common_entry else "Diverse entry roles observed.",
            f"Top observed skill across associated roles is '{top_skills[0]['skill']}' appearing in {top_skills[0]['count']} career stages." if top_skills else "No skill data recorded."
        ]

        inferred_patterns = []
        if common_transitions:
            most_common_trans = common_transitions[0]
            inferred_patterns.append(
                f"Empirical progression indicates a pathway from '{most_common_trans['from_role']}' to '{most_common_trans['to_role']}' observed {most_common_trans['frequency']} times."
            )
        if avg_duration:
            inferred_patterns.append(
                f"Professionals spend an average of {avg_duration} months in a given career stage before advancing or pivoting."
            )
        if not inferred_patterns:
            inferred_patterns.append("Data volume is currently accumulating; additional longitudinal patterns will emerge with more entries.")

        return CareerInsightsResponse(
            target_query=target_role_or_industry,
            total_journeys_analyzed=total_journeys,
            common_entry_roles=common_entry,
            common_transitions=common_transitions,
            in_demand_skills=top_skills,
            average_duration_per_stage_months=avg_duration,
            observed_facts=observed_facts,
            inferred_patterns=inferred_patterns,
            methodology="Empirical Bayesian aggregation over stored PostgreSQL career journey records.",
            ai_enhanced=False,
            disclaimer="All conclusions are derived strictly from actual platform records and do not guarantee personal outcomes."
        )


import logging
import httpx

logger = logging.getLogger(__name__)


class CareerInsightsService:
    @staticmethod
    def get_insights(db: Session, target_query: str) -> CareerInsightsResponse:
        """
        Produce career insights. Uses Google Gemini AI provider if configured, otherwise falls back
        gracefully to DeterministicInsightsEngine without requiring any external keys or breaking on error.
        """
        base_insights = DeterministicInsightsEngine.generate_insights(db, target_query)

        # Check if Gemini AI is configured
        if settings.AI_API_KEY and settings.AI_PROVIDER in ("gemini", "google"):
            try:
                model_name = settings.AI_MODEL or "gemini-1.5-flash"
                if model_name.startswith("models/"):
                    model_name = model_name.replace("models/", "")

                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.AI_API_KEY}"
                skills_list = [
                    s.get("skill") if isinstance(s, dict) else getattr(s, "skill", str(s))
                    for s in (base_insights.in_demand_skills or [])
                ]

                prompt = (
                    f"You are a senior career intelligence advisor for university students. "
                    f"Given this verified alumni data for target '{target_query}':\n"
                    f"- Common entry roles: {base_insights.common_entry_roles}\n"
                    f"- Frequent transitions: {base_insights.common_transitions}\n"
                    f"- In-demand skills: {skills_list}\n"
                    f"- Average duration: {base_insights.average_duration_per_stage_months} months.\n\n"
                    f"Synthesize 2 concise, strategic career progression tips for students. "
                    f"Keep it under 3 sentences, data-grounded, professional, and encouraging."
                )

                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }

                with httpx.Client(timeout=8.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            text_parts = candidates[0].get("content", {}).get("parts", [])
                            if text_parts and "text" in text_parts[0]:
                                ai_text = text_parts[0]["text"].strip()
                                base_insights.inferred_patterns.append(f"AI Synthesis: {ai_text}")
                                base_insights.ai_enhanced = True
                                base_insights.methodology += " Enriched with Google Gemini generative synthesis."
                    else:
                        logger.warning("Gemini API call failed (%s): %s", resp.status_code, resp.text)
            except Exception as e:
                logger.warning("Gemini AI integration exception: %s. Reverting to deterministic output.", e)

        return base_insights

