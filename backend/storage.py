"""Small Supabase REST repository.

Keeping the integration HTTP-based avoids importing a privileged client at
module import time and works in Vercel's Python runtime.
"""
from datetime import datetime, timezone
import logging
from typing import Any

import requests

from .config import SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL

logger = logging.getLogger(__name__)


class StorageError(RuntimeError):
    pass


class SupabaseStore:
    def __init__(self) -> None:
        if not SUPABASE_URL or not (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY):
            raise StorageError("Supabase is not configured")
        self.base_url = SUPABASE_URL.rstrip("/")
        # User-scoped requests use the anon key plus the user's JWT so RLS is
        # active. The service role remains available for future server jobs.
        self.key = SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY

    def _request(self, method: str, table: str, *, user_token: str | None = None,
                 params: dict[str, str] | None = None, body: Any = None) -> Any:
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {user_token or self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        response = requests.request(
            method, f"{self.base_url}/rest/v1/{table}",
            headers=headers, params=params, json=body, timeout=12,
        )
        if not response.ok:
            logger.error("Supabase %s failed with status %s", method, response.status_code)
            raise StorageError("Database request failed")
        if not response.content:
            return []
        return response.json()

    def select(self, table: str, user_id: str, *, user_token: str,
               query: dict[str, str] | None = None, limit: int = 50) -> list[dict]:
        params = {"user_id": f"eq.{user_id}", "limit": str(limit)}
        params.update(query or {})
        return self._request("GET", table, user_token=user_token, params=params)

    def insert(self, table: str, values: dict, *, user_token: str) -> dict:
        rows = self._request("POST", table, user_token=user_token, body=values)
        return rows[0] if rows else values

    def upsert(self, table: str, values: dict, *, user_token: str) -> dict:
        headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {user_token or self.key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=representation",
        }
        response = requests.post(
            f"{self.base_url}/rest/v1/{table}", headers=headers,
            params={"on_conflict": "user_id"}, json=values, timeout=12,
        )
        if not response.ok:
            logger.error("Supabase upsert failed with status %s", response.status_code)
            raise StorageError("Database request failed")
        rows = response.json() if response.content else []
        return rows[0] if rows else values

    def update(self, table: str, record_id: str, user_id: str, values: dict,
               *, user_token: str) -> dict:
        rows = self._request(
            "PATCH", table, user_token=user_token,
            params={"id": f"eq.{record_id}", "user_id": f"eq.{user_id}"},
            body={**values, "updated_at": datetime.now(timezone.utc).isoformat()},
        )
        return rows[0] if rows else values

    def delete(self, table: str, record_id: str, user_id: str, *, user_token: str) -> None:
        self._request(
            "DELETE", table, user_token=user_token,
            params={"id": f"eq.{record_id}", "user_id": f"eq.{user_id}"},
        )


_store: SupabaseStore | None = None


def get_store() -> SupabaseStore:
    global _store
    if _store is None:
        _store = SupabaseStore()
    return _store
