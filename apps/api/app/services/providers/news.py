from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Protocol


@dataclass(frozen=True)
class NewsResult:
    items: list[dict[str, Any]]
    status: str
    source: str
    fetched_at: str
    error: str | None = None


class NewsProvider(Protocol):
    async def updates(self, park_id: str | None = None) -> NewsResult:
        """Return only verified provider items with explicit availability."""


class OfficialFeedNewsProvider:
    def __init__(self, enabled: bool) -> None:
        self.enabled = enabled

    async def updates(self, park_id: str | None = None) -> NewsResult:
        fetched_at = datetime.now(timezone.utc).isoformat()
        if not self.enabled:
            return NewsResult(
                [],
                "UNAVAILABLE",
                "official_park_feed",
                fetched_at,
                "No legitimate news provider configured",
            )
        # A feed URL must be configured and validated before this provider is enabled.
        return NewsResult(
            [],
            "UNAVAILABLE",
            "official_park_feed",
            fetched_at,
            "Official feed integration is not configured",
        )


news_provider = OfficialFeedNewsProvider(False)
