"""Safe, conservative long-term memory extraction and retrieval."""
import re
from typing import Iterable

SECRET_PATTERN = re.compile(
    r"(api[_ -]?key|password|passwd|secret|token|private key|authorization)\s*[:=]",
    re.IGNORECASE,
)
MEMORY_CUES = re.compile(
    r"\b(i am|i'm|my goal|i want to|i prefer|i like|i dislike|i'm working on|"
    r"i am working on|i study|i'm studying|remember that|forget that)\b",
    re.IGNORECASE,
)


def should_remember(text: str) -> bool:
    return bool(text.strip()) and len(text) >= 12 and not SECRET_PATTERN.search(text) and bool(MEMORY_CUES.search(text))


def extract_candidate(text: str) -> dict | None:
    if not should_remember(text):
        return None
    lowered = text.lower()
    category = "goal" if "goal" in lowered or "want to" in lowered else "preference" if "prefer" in lowered or "like" in lowered else "context"
    return {"content": text.strip(), "category": category, "importance": 0.65, "confidence": 0.75}


def relevant_memories(memories: Iterable[dict], query: str, limit: int = 6) -> list[dict]:
    terms = {word.lower() for word in re.findall(r"[a-zA-Z0-9]{3,}", query)}
    scored = []
    for memory in memories:
        content = str(memory.get("content", ""))
        overlap = len(terms & {word.lower() for word in re.findall(r"[a-zA-Z0-9]{3,}", content)})
        score = overlap + float(memory.get("importance") or 0) * 0.25
        if score > 0:
            scored.append((score, memory))
    return [item for _, item in sorted(scored, key=lambda pair: pair[0], reverse=True)[:limit]]
