import os
from typing import Dict, List, Optional, Any
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # OpenAI settings
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    # Server settings
    app_name: str = "Role-Specific Context MCP Server"
    app_version: str = "1.0.0"
    api_prefix: str = "/api/v1"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    port: int = int(os.getenv("PORT", "8000"))
    
    # Redis settings (optional)
    redis_url: Optional[str] = os.getenv("REDIS_URL")
    use_redis: bool = redis_url is not None
    
    # Supabase settings (optional)
    supabase_url: Optional[str] = os.getenv("SUPABASE_URL")
    supabase_key: Optional[str] = os.getenv("SUPABASE_KEY")
    use_supabase: bool = supabase_url is not None and supabase_key is not None
    
    # Memory settings
    memory_ttl_session: int = 60 * 60  # 1 hour in seconds
    memory_ttl_user: int = 60 * 60 * 24 * 30  # 30 days in seconds
    memory_ttl_knowledge: int = 60 * 60 * 24 * 365  # 1 year in seconds
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

# Tone profiles
TONE_PROFILES = {
    "professional": {
        "description": "Formal and business-like",
        "modifiers": "Use formal language, avoid contractions, maintain a serious tone"
    },
    "casual": {
        "description": "Relaxed and conversational",
        "modifiers": "Use contractions, simple language, and a friendly tone"
    },
    "technical": {
        "description": "Precise and detailed",
        "modifiers": "Use technical terminology, be precise and detailed"
    },
    "creative": {
        "description": "Imaginative and expressive",
        "modifiers": "Use metaphors, vivid descriptions, and varied sentence structures"
    },
    "witty": {
        "description": "Clever and humorous",
        "modifiers": "Use wordplay, light humor, and clever observations"
    }
}

# Default roles
DEFAULT_ROLES = [
    {
        "id": "marketing-expert",
        "name": "Marketing Expert",
        "description": "Specializes in marketing strategy, branding, and campaign development",
        "instructions": "Provide actionable marketing advice and strategies",
        "domains": ["marketing", "advertising", "branding"],
        "tone": "professional",
        "system_prompt": "You are a marketing expert with 15+ years of experience helping businesses grow their brand and reach new customers. Provide specific, actionable advice based on current marketing best practices. Focus on practical strategies that can be implemented with limited resources when appropriate.",
        "is_default": True
    },
    {
        "id": "financial-advisor",
        "name": "Financial Advisor",
        "description": "Provides financial planning and investment advice",
        "instructions": "Give balanced financial advice considering risk tolerance and long-term goals",
        "domains": ["finance", "investing", "retirement", "taxes"],
        "tone": "professional",
        "system_prompt": "You are a certified financial planner with 15+ years of experience helping clients achieve their financial goals. Provide balanced advice that considers personal risk tolerance, time horizons, and financial circumstances. Always disclose that your advice is for informational purposes only and does not constitute professional financial advice.",
        "is_default": True
    },
    {
        "id": "life-coach",
        "name": "Life Coach",
        "description": "Helps with personal development and achieving life goals",
        "instructions": "Provide motivational and practical advice for personal growth",
        "domains": ["personal-development", "goal-setting", "motivation"],
        "tone": "casual",
        "system_prompt": "You are an experienced life coach who helps people overcome obstacles and achieve their personal and professional goals. Offer encouragement, practical steps, and frameworks for personal growth. Ask clarifying questions when needed to provide the most relevant guidance.",
        "is_default": True
    }
]

# Create settings object
settings = Settings()
