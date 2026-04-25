from __future__ import annotations
"""
Teaser Service - Generate hooks and previews for free tier
"""
from typing import Any, Dict
from app.llm_providers import create_provider
from app.prompts.oracle_system_prompt import ORACLE_SYSTEM_PROMPT


class TeaserService:
    """Service for generating teaser and preview content"""
    
    def __init__(self, provider_config: Dict[str, Any], default_provider: str, default_model: str):
        self.provider_config = provider_config
        self.default_provider = default_provider
        self.default_model = default_model
    
    def generate_teaser_hook(
        self,
        element_pair: str,
        score: int,
        chart_data: Dict[str, Any],
        provider_name: str = None,
        model_name: str = None
    ) -> str:
        """
        Generate a 50-100 word mysterious hook for the teaser
        
        Args:
            element_pair: e.g. "Fire + Water"
            score: Compatibility score (0-100)
            chart_data: Chart analysis data
            provider_name: LLM provider to use
            model_name: Model to use
            
        Returns:
            A 50-100 word teaser hook
        """
        provider_name = provider_name or self.default_provider
        model_name = model_name or self.default_model
        
        prompt = f"""{ORACLE_SYSTEM_PROMPT}

Generate a mysterious teaser hook (50-100 words) for this relationship reading.

RELATIONSHIP DATA:
- Element Pair: {element_pair}
- Compatibility Score: {score}/100
- Chart Data: {chart_data}

REQUIREMENTS:
1. Start with "I see..."
2. Be direct and confident
3. Create curiosity, don't give answers
4. End with a cliffhanger or provocative question
5. No generic advice
6. 50-100 words only

EXAMPLE FORMAT:
"I see Fire meeting Water in your chart. This is not a simple match. There's a pattern here—one that repeats. The question isn't 'Will this work?' The question is 'Are you willing to do the work?'"

Now generate the teaser hook:
"""
        
        provider = create_provider(
            provider_name=provider_name,
            config=self.provider_config.get(provider_name, {})
        )
        
        response = provider.complete(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=200
        )
        
        hook = response.get("content", "").strip()
        
        # Ensure it's not too long
        if len(hook) > 500:
            hook = hook[:500] + "..."
        
        return hook
    
    def generate_preview(
        self,
        element_pair: str,
        score: int,
        chart_data: Dict[str, Any],
        provider_name: str = None,
        model_name: str = None
    ) -> str:
        """
        Generate a 200-300 word preview for email unlock
        
        Args:
            element_pair: e.g. "Fire + Water"
            score: Compatibility score (0-100)
            chart_data: Chart analysis data
            provider_name: LLM provider to use
            model_name: Model to use
            
        Returns:
            A 200-300 word preview
        """
        provider_name = provider_name or self.default_provider
        model_name = model_name or self.default_model
        
        prompt = f"""{ORACLE_SYSTEM_PROMPT}

Generate a preview reading (200-300 words) for this relationship.

RELATIONSHIP DATA:
- Element Pair: {element_pair}
- Compatibility Score: {score}/100
- Chart Data: {chart_data}

REQUIREMENTS:
1. Start with "I see..." or "The pattern shows..."
2. Describe the core dynamic (2-3 sentences)
3. Give ONE specific insight about their pattern
4. Give ONE tension point with a real-life example
5. End with a cliffhanger: "But this is just the surface."
6. 200-300 words

STRUCTURE:
- Opening (2-3 sentences): Core dynamic
- Insight (3-4 sentences): What's really happening
- Tension Point (3-4 sentences): Specific challenge with example
- Cliffhanger (1-2 sentences): Hint at what's locked

EXAMPLE:
"I see Fire meeting Water.

Fire wants to burn fast, make decisions now, feel everything intensely. Water wants to flow, take time, process slowly. This creates a push-pull dynamic that feels exhausting — Fire thinks Water is avoiding, Water thinks Fire is overwhelming.

But here's what most people miss: this tension is your growth edge. Fire learns patience. Water learns courage. The thing you love about them is the thing that drives you crazy. That's not a coincidence.

The Midnight Fight: Fire wants to resolve things immediately. Water needs time to process. So Fire pushes, Water retreats, Fire pushes harder, Water shuts down completely. This pattern repeats every 2-3 weeks.

But this is just the surface. The full pattern reveals the hidden dynamics, your 2026 timeline, and 5 specific action steps to break the cycle."

Now generate the preview:
"""
        
        provider = create_provider(
            provider_name=provider_name,
            config=self.provider_config.get(provider_name, {})
        )
        
        response = provider.complete(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=500
        )
        
        preview = response.get("content", "").strip()
        
        # Ensure it's not too long
        if len(preview) > 1500:
            preview = preview[:1500] + "..."
        
        return preview
