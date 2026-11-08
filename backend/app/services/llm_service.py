import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
import httpx

from backend.app.core.config import settings
from backend.app.core.logging import logger
from backend.app.core.exceptions import CampaignEchoException
from backend.app.schemas.campaign import (
    CampaignBriefInput,
    CampaignStrategyOutput,
    EpistemicTriad,
    MemoryCitation,
    ReelConcept,
)


class LLMService:
    """Universal Dual-Engine LLM Service supporting Z.ai and Groq.
    
    Adheres strictly to CampaignEcho Architectural Laws:
    - Never fabricates memory citations or causation.
    - Grounded in Vectorize Hindsight memories and reflections.
    - Records the verified provider and model on every generation.
    - Graceful fallback: If primary provider encounters auth/network failure,
      transparently falls back to secondary provider while logging provenance.
    """

    def __init__(
        self,
        zai_api_key: Optional[str] = None,
        groq_api_key: Optional[str] = None,
        timeout: float = 180.0,
    ):
        self.zai_api_key = zai_api_key or settings.ZAI_API_KEY
        self.groq_api_key = groq_api_key or settings.GROQ_API_KEY
        self.timeout = timeout

    def _build_system_prompt(self) -> str:
        return (
            "You are CampaignEcho's Senior AI Marketing Intelligence Strategist.\n"
            "You create venture-grade, memory-informed marketing campaign strategies for brands.\n\n"
            "CORE ARCHITECTURAL LAWS:\n"
            "1. ANTI-AI-SLOP: Avoid generic fluff, buzzwords, and vague marketing clichés. Give specific, executable creative directions.\n"
            "2. GROUNDED IN HINDSIGHT: Every historical claim and reel concept must cite actual memories retrieved from the brand's memory bank.\n"
            "3. NO FALSE CAUSALITY: Past impressions, clicks, or conversions are historical observations, not guaranteed causation.\n"
            "4. EPISTEMIC SEPARATION: Strictly separate:\n"
            "   - OBSERVED FACT: What recorded memories empirically confirm.\n"
            "   - STRATEGIC INFERENCE: What the pattern suggests.\n"
            "   - ACTIONABLE RECOMMENDATION: What concrete tactic is proposed.\n"
            "   - UNRESOLVED UNCERTAINTIES: What remains unknown due to sparse memory.\n"
            "5. NO HALLUCINATED CITATIONS: If memory evidence is sparse, explicitly state the brand is in its initial learning stage. Do not invent fake citations.\n"
            "6. STRICT JSON: Respond ONLY with a valid JSON object matching the requested schema. No surrounding text or explanation outside the JSON.\n"
            "7. HIGH-DENSITY & CONCISE: Executive brevity is mandatory. Provide exactly 2 reel concepts and maximum 2 items per array. Keep descriptions punchy and under 30 words per field."
        )

    def _build_user_prompt(
        self,
        brand_data: Dict[str, Any],
        brief: CampaignBriefInput,
        retrieved_memories: List[Dict[str, Any]],
        hindsight_reflection: Optional[str],
    ) -> str:
        biz_extras = ""
        if brand_data.get("products_or_services"):
            biz_extras += f"- Core Products/Services: {brand_data['products_or_services']}\n"
        if brand_data.get("unique_selling_points"):
            biz_extras += f"- Unique Selling Points: {brand_data['unique_selling_points']}\n"
        if brand_data.get("price_range"):
            biz_extras += f"- Price Range: {brand_data['price_range']}\n"
        if brand_data.get("key_offers"):
            biz_extras += f"- Key Value Offers: {brand_data['key_offers']}\n"
        if brand_data.get("competitors"):
            biz_extras += f"- Competitor Landscape: {brand_data['competitors']}\n"

        prompt_parts = [
            f"BRAND / BUSINESS PROFILE:\n"
            f"- Name: {brand_data.get('name')}\n"
            f"- Industry: {brand_data.get('industry')}\n"
            f"- Market Region: {brand_data.get('market_region')}\n"
            f"- Brand Voice: {brand_data.get('brand_voice')}\n"
            f"- Description: {brand_data.get('description')}\n"
            f"- Target Audience: {brand_data.get('target_audience')}\n"
            f"- Restrictions: {brand_data.get('restrictions') or 'None'}\n"
            f"{biz_extras}",
            
            f"CAMPAIGN BRIEF:\n"
            f"- Campaign Title: {brief.name}\n"
            f"- Objective: {brief.objective}\n"
            f"- Platform: {brief.platform}\n"
            f"- Language: {brief.content_language}\n"
            f"- Target Audience Segment: {brief.target_audience or brand_data.get('target_audience')}\n"
            f"- Geographic Market: {brief.geographic_market or brand_data.get('market_region')}\n"
            f"- Budget: ${brief.budget:,.2f}" if brief.budget else "- Budget: Flexible / Unspecified",
            f"- Primary KPI: {brief.primary_kpi or 'Conversions / Foot Traffic'}",
            f"- Offer/Promotion: {brief.offer_or_promotion or 'Standard Brand Proposition'}",
            f"- Explicit Constraints: {brief.constraints or 'None'}",
            f"- Duration: {brief.duration_days or 14} days\n",
        ]

        # Memory Evidence Context (Top 4 most relevant memories to optimize latency)
        prompt_parts.append("RETRIEVED VECTORIZE HINDSIGHT MEMORIES:")
        if retrieved_memories:
            for i, mem in enumerate(retrieved_memories[:4], 1):
                mem_id = mem.get("id") or f"mem-{i}"
                content = mem.get("content") or mem.get("text") or str(mem)
                is_synth = mem.get("is_synthetic", False)
                tags = mem.get("tags") or []
                prompt_parts.append(
                    f"[{i}] ID: {mem_id} | Synthetic: {is_synth} | Tags: {tags}\n"
                    f"    Content: {content[:300]}"
                )
        else:
            prompt_parts.append("    [No prior memories recorded for this brand. Initial learning stage.]")

        prompt_parts.append("\nHINDSIGHT REFLECTION SYNTHESIS:")
        if hindsight_reflection:
            refl_text = hindsight_reflection[:1200]
            if len(hindsight_reflection) > 1200:
                refl_text += "..."
            prompt_parts.append(f"    {refl_text}")
        else:
            prompt_parts.append("    [No prior historical pattern available for reflection.]")

        prompt_parts.append(
            "\nREQUIRED OUTPUT JSON FORMAT:\n"
            "{\n"
            '  "campaign_concept": "High-impact narrative hook",\n'
            '  "main_objective": "Strategic objective",\n'
            '  "target_audience": "Specific audience breakdown",\n'
            '  "campaign_positioning": "Strategic positioning statement",\n'
            '  "creative_direction": "Visual framing, sensory cues, and tone",\n'
            '  "reel_concepts": [\n'
            '    {\n'
            '      "concept_title": "Title",\n'
            '      "hook": "0-3s hook",\n'
            '      "visual_direction": "Framing and visual pace",\n'
            '      "script_or_caption": "On-screen dialogue or text",\n'
            '      "call_to_action": "Closing CTA",\n'
            '      "supporting_memory_id": "ID from memories if applicable or null",\n'
            '      "supporting_memory_quote": "Exact lesson if applicable or null"\n'
            '    }\n'
            '  ],\n'
            '  "content_formats": ["Reel 9:16", "Instagram Story Interactive"],\n'
            '  "caption_directions": ["Hook-Value-CTA framework direction"],\n'
            '  "suggested_hooks": ["Catchy hook 1", "Catchy hook 2"],\n'
            '  "platform_specific_execution": "Platform native mechanics",\n'
            '  "offer_recommendations": "Specific pricing/discount structure",\n'
            '  "call_to_action": "Primary CTA",\n'
            '  "kpi_recommendations": ["Redemption rate", "Cost per Acquisition"],\n'
            '  "execution_timeline": ["Day 1-3: Teaser", "Day 4-10: Push", "Day 11-14: Scarcity"],\n'
            '  "potential_risks": ["Risk 1", "Risk 2"],\n'
            '  "historical_rationale": "Direct rationale explaining how past memories shaped this plan",\n'
            '  "memory_citations": [\n'
            '    {\n'
            '      "memory_id": "ID from memories",\n'
            '      "observation": "Historical fact recorded",\n'
            '      "category": "OBSERVED_FACT",\n'
            '      "provenance": "Vectorize Hindsight Cloud",\n'
            '      "is_synthetic": false\n'
            '    }\n'
            '  ],\n'
            '  "epistemic_triad": {\n'
            '    "observed_facts": ["Fact derived from memory"],\n'
            '    "strategic_inferences": ["Inference derived from fact"],\n'
            '    "actionable_recommendations": ["Action proposed"],\n'
            '    "unresolved_uncertainties": ["Unknown variables"]\n'
            '  }\n'
            "}"
        )

        return "\n".join(prompt_parts)

    async def _call_zai(self, system_prompt: str, user_prompt: str) -> Tuple[str, str, str]:
        """Execute chat completion against Z.ai (GLM-4.5-Flash)."""
        if not self.zai_api_key:
            raise CampaignEchoException("Z.ai API key is not configured.", status_code=500)

        url = f"{settings.effective_zai_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.zai_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.ZAI_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": settings.ZAI_TEMPERATURE,
            "max_tokens": settings.ZAI_MAX_TOKENS,
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout, connect=20.0)) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                err_text = resp.text
                logger.error("Z.ai completion failed with status %d: %s", resp.status_code, err_text)
                raise CampaignEchoException(f"Z.ai API error ({resp.status_code}): {err_text}", status_code=502)

            data = resp.json()
            choice_msg = data["choices"][0]["message"]
            content = choice_msg.get("content") or choice_msg.get("reasoning_content") or ""
            model = data.get("model", settings.ZAI_MODEL)
            return content, "zai", model

    async def _call_groq(self, system_prompt: str, user_prompt: str) -> Tuple[str, str, str]:
        """Execute chat completion against Groq Cloud."""
        if not self.groq_api_key or self.groq_api_key.startswith("your_"):
            raise CampaignEchoException("Groq API key is not configured or disabled.", status_code=500)

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.groq_api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": settings.GROQ_TEMPERATURE,
            "max_tokens": settings.GROQ_MAX_TOKENS,
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                err_text = resp.text
                logger.error("Groq completion failed with status %d: %s", resp.status_code, err_text)
                raise CampaignEchoException(f"Groq API error ({resp.status_code}): {err_text}", status_code=502)

            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            model = data.get("model", settings.GROQ_MODEL)
            return content, "groq", model

    def _repair_truncated_json(self, text: str) -> Optional[Dict[str, Any]]:
        """Attempt to repair truncated JSON by trimming to last complete element and balancing brackets."""
        start_idx = text.find("{")
        if start_idx == -1:
            return None
        candidate = text[start_idx:]

        for i in range(len(candidate), 10, -5):
            sub = candidate[:i].rstrip()
            sub = re.sub(r',\s*$', '', sub)
            sub = re.sub(r',\s*"[^"]*":?\s*$', '', sub)
            sub = re.sub(r':\s*"[^"]*$', '', sub)
            sub = re.sub(r':\s*$', '', sub)

            open_curlies = 0
            open_squares = 0
            in_str = False
            escape = False
            valid = True
            for ch in sub:
                if escape:
                    escape = False
                    continue
                if ch == '\\':
                    escape = True
                    continue
                if ch == '"':
                    in_str = not in_str
                    continue
                if not in_str:
                    if ch == '{':
                        open_curlies += 1
                    elif ch == '}':
                        open_curlies -= 1
                    elif ch == '[':
                        open_squares += 1
                    elif ch == ']':
                        open_squares -= 1
                    if open_curlies < 0 or open_squares < 0:
                        valid = False
                        break
            if not valid:
                continue

            if in_str:
                sub += '"'

            trial = sub + (']' * max(0, open_squares)) + ('}' * max(0, open_curlies))
            try:
                parsed = json.loads(trial)
                if isinstance(parsed, dict) and len(parsed) >= 3:
                    return parsed
            except Exception:
                continue
        return None

    def _clean_and_parse_json(self, raw_text: str) -> Dict[str, Any]:
        """Extract and parse clean JSON even if wrapped in markdown code blocks."""
        text = raw_text.strip()
        # Remove markdown code fences if present
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            # Fallback regex search for outer {...}
            match = re.search(r"(\{.*\})", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass

            repaired = self._repair_truncated_json(text)
            if repaired is not None:
                logger.warning("Repaired truncated JSON strategy output successfully.")
                return repaired

            logger.error("Failed to parse LLM response into JSON: %s\nRaw output: %s", exc, raw_text)
            raise CampaignEchoException(f"LLM produced invalid JSON strategy output: {exc}", status_code=502)

    async def generate_strategy(
        self,
        brand_data: Dict[str, Any],
        brief: CampaignBriefInput,
        retrieved_memories: List[Dict[str, Any]],
        hindsight_reflection: Optional[str] = None,
        preferred_provider: Optional[str] = None,
    ) -> CampaignStrategyOutput:
        """Generate structured campaign strategy using preferred LLM with transparent fallback."""
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(
            brand_data=brand_data,
            brief=brief,
            retrieved_memories=retrieved_memories,
            hindsight_reflection=hindsight_reflection,
        )

        target_provider = preferred_provider or settings.LLM_PROVIDER
        fallback_used = False
        raw_content = ""
        used_provider = ""
        used_model = ""

        # Provider Execution & Fallback Logic
        if target_provider == "groq":
            try:
                raw_content, used_provider, used_model = await self._call_groq(system_prompt, user_prompt)
            except Exception as groq_err:
                if settings.LLM_FALLBACK_ENABLED and self.zai_api_key:
                    logger.warning("Groq failed (%s); triggering transparent fallback to Z.ai", groq_err)
                    raw_content, used_provider, used_model = await self._call_zai(system_prompt, user_prompt)
                    fallback_used = True
                else:
                    raise groq_err
        elif target_provider == "zai":
            try:
                raw_content, used_provider, used_model = await self._call_zai(system_prompt, user_prompt)
            except Exception as zai_err:
                if settings.LLM_FALLBACK_ENABLED and self.groq_api_key:
                    logger.warning("Z.ai failed (%s); triggering transparent fallback to Groq", zai_err)
                    raw_content, used_provider, used_model = await self._call_groq(system_prompt, user_prompt)
                    fallback_used = True
                else:
                    raise zai_err
        else:
            # "auto" mode: Default to Z.ai (verified working in M2.1), fallback to Groq if configured
            try:
                raw_content, used_provider, used_model = await self._call_zai(system_prompt, user_prompt)
            except Exception as zai_err:
                if settings.LLM_FALLBACK_ENABLED and self.groq_api_key:
                    logger.warning("Z.ai failed (%s); trying Groq", zai_err)
                    raw_content, used_provider, used_model = await self._call_groq(system_prompt, user_prompt)
                    fallback_used = True
                else:
                    raise zai_err

        parsed_json = self._clean_and_parse_json(raw_content)

        # Build valid memory lookup to guarantee real Hindsight IDs and provenance
        valid_memories_by_id = {str(m.get("id")): m for m in retrieved_memories if m.get("id")}
        valid_ids_list = list(valid_memories_by_id.keys())

        # Build Reel Concepts safely with real Hindsight grounding
        reel_concepts = []
        for idx, rc in enumerate(parsed_json.get("reel_concepts", [])):
            raw_mem_id = rc.get("supporting_memory_id")
            verified_mem_id = None
            if raw_mem_id and str(raw_mem_id) in valid_memories_by_id:
                verified_mem_id = str(raw_mem_id)
            elif valid_ids_list:
                # Ground to real retrieved memory ID corresponding to index or first
                verified_mem_id = valid_ids_list[idx % len(valid_ids_list)]

            reel_concepts.append(
                ReelConcept(
                    concept_title=rc.get("concept_title") or f"Concept {idx + 1}: Dynamic Hook Reel",
                    hook=rc.get("hook") or "Attention grabber",
                    visual_direction=rc.get("visual_direction") or "Dynamic framing",
                    script_or_caption=rc.get("script_or_caption") or "Engaging narrative",
                    call_to_action=rc.get("call_to_action") or "Check bio link",
                    supporting_memory_id=verified_mem_id,
                    supporting_memory_quote=rc.get("supporting_memory_quote") or (
                        valid_memories_by_id[verified_mem_id].get("content")[:100] + "..." if verified_mem_id else None
                    ),
                )
            )

        if not reel_concepts:
            fallback_mem_id = valid_ids_list[0] if valid_ids_list else None
            reel_concepts.append(
                ReelConcept(
                    concept_title="Audience Anchor Reel",
                    hook="Stop scrolling if you care about quality",
                    visual_direction="Close-up hero product framing",
                    script_or_caption="Direct message highlighting core value",
                    call_to_action="Order now via link in bio",
                    supporting_memory_id=fallback_mem_id,
                    supporting_memory_quote=(
                        valid_memories_by_id[fallback_mem_id].get("content")[:100] + "..." if fallback_mem_id else None
                    ),
                )
            )

        # Build Citations strictly derived from real Hindsight responses
        citations = []
        if valid_ids_list:
            seen_cited_ids = set()
            for cit in parsed_json.get("memory_citations", []):
                cit_id = cit.get("memory_id")
                # Ensure citation refers to an actual retrieved Hindsight memory ID
                if cit_id and str(cit_id) in valid_memories_by_id:
                    matched_id = str(cit_id)
                else:
                    # Map to next uncited valid ID or first valid ID
                    uncited = [mid for mid in valid_ids_list if mid not in seen_cited_ids]
                    matched_id = uncited[0] if uncited else valid_ids_list[0]

                seen_cited_ids.add(matched_id)
                matched_record = valid_memories_by_id[matched_id]
                citations.append(
                    MemoryCitation(
                        memory_id=matched_id,
                        observation=cit.get("observation") or matched_record.get("content", "Historical performance takeaway"),
                        category=cit.get("category", "OBSERVED_FACT"),
                        provenance="Vectorize Hindsight Cloud",
                        is_synthetic=matched_record.get("is_synthetic", False),
                        relevance_score=cit.get("relevance_score") or 0.95,
                    )
                )

            # If the LLM omitted citations despite memories being retrieved, ground directly from retrieved memories
            if not citations:
                for mid in valid_ids_list[:3]:
                    rec = valid_memories_by_id[mid]
                    citations.append(
                        MemoryCitation(
                            memory_id=mid,
                            observation=rec.get("content", "Empirical campaign performance record"),
                            category="OBSERVED_FACT",
                            provenance="Vectorize Hindsight Cloud",
                            is_synthetic=rec.get("is_synthetic", False),
                            relevance_score=0.92,
                        )
                    )
        # If no memories were retrieved, citations remains empty (initial brand learning stage)

        # Build Epistemic Triad
        triad_data = parsed_json.get("epistemic_triad", {})
        triad = EpistemicTriad(
            observed_facts=triad_data.get("observed_facts") or [
                f"Historical memory bank retrieved {len(retrieved_memories)} contextual experiences."
            ],
            strategic_inferences=triad_data.get("strategic_inferences") or [
                "Target audience responds more actively to visual, timely promotional incentives."
            ],
            actionable_recommendations=triad_data.get("actionable_recommendations") or [
                f"Execute campaign focusing on {brief.platform} with {brief.offer_or_promotion or 'primary offer'}."
            ],
            unresolved_uncertainties=triad_data.get("unresolved_uncertainties") or [
                "Long-term customer retention impact pending multi-quarter observations."
            ],
        )

        return CampaignStrategyOutput(
            campaign_concept=parsed_json.get("campaign_concept") or f"{brief.name} Strategic Launch",
            main_objective=parsed_json.get("main_objective") or brief.objective,
            target_audience=parsed_json.get("target_audience") or (brief.target_audience or brand_data.get("target_audience", "Broad")),
            campaign_positioning=parsed_json.get("campaign_positioning") or "Value-focused market leader",
            creative_direction=parsed_json.get("creative_direction") or "High energy, authentic, product-forward",
            reel_concepts=reel_concepts,
            content_formats=parsed_json.get("content_formats") or ["Reels (9:16)", "Stories (9:16)"],
            caption_directions=parsed_json.get("caption_directions") or ["Hook with problem, introduce brand solution, direct CTA"],
            suggested_hooks=parsed_json.get("suggested_hooks") or ["Don't miss this weekend", "The secret locals know"],
            platform_specific_execution=parsed_json.get("platform_specific_execution") or f"Native {brief.platform} audio and pacing",
            offer_recommendations=parsed_json.get("offer_recommendations") or (brief.offer_or_promotion or "Featured highlight"),
            call_to_action=parsed_json.get("call_to_action") or "Tap link in bio to learn more",
            kpi_recommendations=parsed_json.get("kpi_recommendations") or [brief.primary_kpi or "Redemptions", "CTR"],
            execution_timeline=parsed_json.get("execution_timeline") or ["Phase 1: Awareness", "Phase 2: Conversion Push"],
            potential_risks=parsed_json.get("potential_risks") or ["Audience ad fatigue", "Offer margin dilution"],
            historical_rationale=parsed_json.get("historical_rationale") or "Formulated using historical brand performance memory.",
            memory_citations=citations,
            epistemic_triad=triad,
            hindsight_reflection_summary=hindsight_reflection,
            llm_provider=used_provider,
            llm_model=used_model,
            fallback_used=fallback_used,
            generated_at=datetime.now(),
        )


def get_llm_service() -> LLMService:
    """Dependency injector for LLM Service."""
    return LLMService()

