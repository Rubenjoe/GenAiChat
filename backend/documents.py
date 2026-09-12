"""User-scoped document validation, extraction, chunking, and lexical retrieval."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
import re

from fastapi import HTTPException, UploadFile

MAX_UPLOAD_BYTES = 8 * 1024 * 1024
TEXT_EXTENSIONS = {
    ".txt", ".md", ".markdown", ".csv", ".json", ".py", ".js", ".ts", ".tsx",
    ".jsx", ".html", ".css", ".sql", ".yaml", ".yml", ".xml", ".java", ".go",
    ".rs", ".c", ".cpp", ".h", ".sh", ".ps1", ".log",
}
SUPPORTED_EXTENSIONS = TEXT_EXTENSIONS | {".pdf", ".docx"}
WORD_PATTERN = re.compile(r"[a-zA-Z0-9]{3,}")


def _safe_name(filename: str | None) -> str:
    name = Path(filename or "").name.strip()
    if not name or len(name) > 200:
        raise HTTPException(status_code=400, detail={"error": "document_error", "message": "Please choose a valid file name."})
    return name


async def extract_upload(upload: UploadFile) -> tuple[str, str, int, str]:
    """Read a bounded file and return ``(name, extension, size, extracted_text)``."""
    name = _safe_name(upload.filename)
    suffix = Path(name).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=415, detail={"error": "document_error", "message": "This file type isn't supported."})
    payload = await upload.read(MAX_UPLOAD_BYTES + 1)
    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail={"error": "document_error", "message": "This file is too large. The limit is 8 MB."})
    if not payload:
        raise HTTPException(status_code=400, detail={"error": "document_error", "message": "This file is empty."})
    try:
        if suffix == ".pdf":
            if not payload.startswith(b"%PDF-"):
                raise ValueError("invalid PDF signature")
            from pypdf import PdfReader
            text = "\n".join(page.extract_text() or "" for page in PdfReader(BytesIO(payload)).pages)
        elif suffix == ".docx":
            if not payload.startswith(b"PK"):
                raise ValueError("invalid DOCX signature")
            from docx import Document
            text = "\n".join(paragraph.text for paragraph in Document(BytesIO(payload)).paragraphs)
        else:
            text = payload.decode("utf-8-sig")
    except (ImportError, UnicodeDecodeError, ValueError, OSError) as exc:
        raise HTTPException(status_code=422, detail={"error": "document_error", "message": "I couldn't extract text from this file."}) from exc
    text = text.replace("\x00", "").strip()
    if not text:
        raise HTTPException(status_code=422, detail={"error": "document_error", "message": "I couldn't extract readable text from this file."})
    return name, suffix.lstrip("."), len(payload), text


def chunk_text(text: str, size: int = 1800, overlap: int = 180) -> list[str]:
    """Make bounded, overlapping chunks while favouring paragraph boundaries."""
    compact = re.sub(r"\r\n?", "\n", text).strip()
    chunks: list[str] = []
    start = 0
    while start < len(compact):
        end = min(len(compact), start + size)
        if end < len(compact):
            boundary = max(compact.rfind("\n", start + size // 2, end), compact.rfind(" ", start + size // 2, end))
            if boundary > start:
                end = boundary
        piece = compact[start:end].strip()
        if piece:
            chunks.append(piece)
        if end >= len(compact):
            break
        start = max(end - overlap, start + 1)
    return chunks


def relevant_chunks(chunks: list[dict], query: str, limit: int = 5) -> list[dict]:
    terms = {word.lower() for word in WORD_PATTERN.findall(query)}
    scored = []
    for chunk in chunks:
        content = str(chunk.get("content", ""))
        words = {word.lower() for word in WORD_PATTERN.findall(content)}
        score = len(terms & words)
        if score:
            scored.append((score, chunk))
    return [chunk for _, chunk in sorted(scored, key=lambda item: item[0], reverse=True)[:limit]]
