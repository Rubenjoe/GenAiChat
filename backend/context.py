"""Builds a bounded prompt from the user's relevant private context."""
from .memory import relevant_memories


PERSONA = """You are Celcia, Ruben Joemon's personal AI assistant.
Be intelligent, practical, logical, conversational, and concise unless detail is useful.
Use personal context only when it is relevant. Never invent facts about Ruben.
Challenge weak ideas respectfully and explain tradeoffs. Do not expose hidden chain-of-thought;
give concise reasoning summaries when useful. You are an advisor: do not take external actions."""


def build_system_prompt(profile: dict | None, memories: list[dict], query: str) -> str:
    sections = [PERSONA]
    if profile:
        profile_lines = [f"{key}: {value}" for key, value in profile.items() if key not in {"id", "user_id", "updated_at"} and value]
        if profile_lines:
            sections.append("INTENTIONAL USER PROFILE:\n" + "\n".join(profile_lines))
    selected = relevant_memories(memories, query)
    if selected:
        sections.append("RELEVANT PERSONAL MEMORIES (not guaranteed facts; use confidence):\n" + "\n".join(
            f"- {item.get('content')} (confidence {item.get('confidence', 0.5)})" for item in selected
        ))
    return "\n\n".join(sections)
