"""Conservative personal-memory extraction, retrieval, and follow-up policy."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
import re
from typing import Iterable

SECRET_PATTERN = re.compile(r"(api[_ -]?key|password|passwd|secret|token|private key|authorization|service.role)\s*[:=]", re.IGNORECASE)
MEMORY_CUES = re.compile(r"\b(i am|i'm|i feel|i've been|my goal|i want to|i prefer|i like|i dislike|i'm working on|i am working on|i study|i'm studying|i committed|i promise|remember that|i'm worried|i am worried|i'm stressed|i am stressed)\b", re.IGNORECASE)
RESOLVED_CUES = re.compile(r"\b(finished|complete(?:d)?|resolved|over now|no longer|fixed|better now)\b", re.IGNORECASE)
URGENT_TECHNICAL_CUES = re.compile(r"\b(error|bug|debug|broken|exception|stack trace|production|urgent|outage)\b", re.IGNORECASE)
WORD_PATTERN = re.compile(r"[a-zA-Z0-9]{3,}")


def _words(text: str) -> set[str]:
    return {word.lower() for word in WORD_PATTERN.findall(text)}


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def should_remember(text: str) -> bool:
    return bool(text.strip()) and len(text.strip()) >= 12 and not SECRET_PATTERN.search(text) and bool(MEMORY_CUES.search(text) or RESOLVED_CUES.search(text))


def extract_candidate(text: str) -> dict | None:
    """Return meaningful, non-secret life context without trying to remember everything."""
    if not should_remember(text):
        return None
    lowered = text.lower()
    if any(cue in lowered for cue in ("stressed", "anxious", "worried", "overwhelmed", "burned out", "feel ")):
        category, importance = "emotional_context", 0.78
    elif any(cue in lowered for cue in ("working on", "been dealing", "lately", "going through")):
        category, importance = "ongoing_situation", 0.7
    elif any(cue in lowered for cue in ("goal", "want to", "planning to")):
        category, importance = "goal", 0.68
    elif any(cue in lowered for cue in ("prefer", "like", "dislike")):
        category, importance = "preference", 0.6
    elif any(cue in lowered for cue in ("committed", "promise", "i will")):
        category, importance = "commitment", 0.7
    else:
        category, importance = "event", 0.58
    status = "resolved" if RESOLVED_CUES.search(text) else "active"
    return {"content": text.strip(), "category": category, "importance": importance, "confidence": 0.75, "status": status, "last_discussed_at": _iso_now(), "follow_up_eligible": category in {"ongoing_situation", "emotional_context", "concern", "commitment"} and status == "active"}


def relevant_memories(memories: Iterable[dict], query: str, limit: int = 6) -> list[dict]:
    terms = _words(query)
    scored = []
    for memory in memories:
        if memory.get("status") in {"resolved", "outdated"}:
            continue
        content = str(memory.get("content", ""))
        overlap = len(terms & _words(content))
        score = overlap + float(memory.get("importance") or 0) * 0.25
        if score > 0:
            scored.append((score, memory))
    return [item for _, item in sorted(scored, key=lambda pair: pair[0], reverse=True)[:limit]]


def matching_memory(memories: Iterable[dict], candidate: dict) -> dict | None:
    """Find existing context likely to be an update rather than a duplicate."""
    candidate_words = _words(candidate["content"])
    best, best_score = None, 0.0
    for memory in memories:
        overlap = len(candidate_words & _words(str(memory.get("content", ""))))
        score = overlap + (0.75 if memory.get("category") == candidate.get("category") else 0)
        minimum = 1 if candidate.get("status") == "resolved" else 2
        if score > best_score and score >= minimum:
            best, best_score = memory, score
    return best


def choose_follow_up(memories: Iterable[dict], message: str) -> dict | None:
    """Return one safe, non-intrusive follow-up candidate, or ``None``."""
    if URGENT_TECHNICAL_CUES.search(message):
        return None
    now = datetime.now(timezone.utc)
    best, best_score = None, 0.0
    for memory in memories:
        if not memory.get("follow_up_eligible") or memory.get("status", "active") != "active":
            continue
        try:
            last_follow_up = datetime.fromisoformat(str(memory.get("last_follow_up_at", "")).replace("Z", "+00:00"))
            if last_follow_up > now - timedelta(days=10):
                continue
        except ValueError:
            pass
        try:
            last_discussed = datetime.fromisoformat(str(memory.get("last_discussed_at") or memory.get("updated_at")).replace("Z", "+00:00"))
            age_days = max(0, (now - last_discussed).days)
        except (TypeError, ValueError):
            age_days = 30
        recency = 1.0 if 2 <= age_days <= 21 else 0.35 if age_days <= 45 else 0.1
        relevance = len(_words(message) & _words(str(memory.get("content", "")))) * 0.2
        score = float(memory.get("importance") or 0.5) * recency + relevance
        if score > best_score and score >= 0.5:
            best, best_score = memory, score
    return best
