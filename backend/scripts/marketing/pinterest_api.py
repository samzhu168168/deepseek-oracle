"""Pinterest API client — create pins programmatically.

Usage:
  from marketing.pinterest_api import PinterestClient
  client = PinterestClient(access_token="...")
  boards = client.list_boards()
  pin = client.create_pin(board_id="...", title="...", description="...", image_path="...")
"""

from __future__ import annotations

import json
import mimetypes
import os
from pathlib import Path

import requests

PINTEREST_API = "https://api.pinterest.com/v5"


class PinterestError(Exception):
    """Raised on Pinterest API errors."""


class PinterestClient:
    """Thin wrapper around Pinterest API v5."""

    def __init__(self, access_token: str):
        self.access_token = access_token
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {access_token}",
        })

    def _request(self, method: str, path: str, **kwargs) -> dict:
        url = f"{PINTEREST_API}{path}"
        r = self.session.request(method, url, **kwargs)
        if r.status_code in (200, 201):
            return r.json()
        raise PinterestError(
            f"[{r.status_code}] {path}: {r.text}"
        )

    # ── Boards ──

    def list_boards(self) -> list[dict]:
        """List all boards the token has access to."""
        data = self._request("GET", "/boards", params={"page_size": 25})
        items = data.get("items", [])
        # Handle pagination if needed
        bookmark = data.get("bookmark")
        while bookmark:
            data = self._request("GET", "/boards", params={"page_size": 25, "bookmark": bookmark})
            items.extend(data.get("items", []))
            bookmark = data.get("bookmark")
        return items

    def find_board(self, name: str) -> dict | None:
        """Find a board by name (case-insensitive)."""
        for board in self.list_boards():
            if board.get("name", "").lower() == name.lower():
                return board
        return None

    def create_board(self, name: str, description: str = "") -> dict:
        """Create a new board."""
        return self._request("POST", "/boards", json={
            "name": name,
            "description": description,
            "privacy": "PUBLIC",
        })

    # ── Pins ──

    def create_pin(
        self,
        board_id: str,
        title: str,
        description: str,
        image_path: str | Path,
        alt_text: str | None = None,
        link: str | None = None,
    ) -> dict:
        """Create a pin with an image.

        Uses the multipart upload approach (image file + JSON data).
        """
        path = Path(image_path)
        if not path.exists():
            raise PinterestError(f"Image not found: {path}")

        # Determine media type
        mime = mimetypes.guess_type(str(path))[0] or "image/png"
        alt_text = alt_text or title

        with open(path, "rb") as f:
            files = {"image": (path.name, f, mime)}
            data = {
                "board_id": board_id,
                "title": title[:100],  # Pinterest max 100 chars
                "description": description[:500],  # Pinterest max 500 chars
                "alt_text": alt_text[:500],
            }
            if link:
                data["link"] = link

            r = self.session.post(
                f"{PINTEREST_API}/pins",
                files=files,
                data=data,
            )

        if r.status_code in (200, 201):
            return r.json()
        raise PinterestError(f"[{r.status_code}] create_pin: {r.text}")

    # ── User info ──

    def get_user_info(self) -> dict:
        """Get authenticated user info."""
        return self._request("GET", "/user_account")


# ── CLI helpers ──


def load_config() -> tuple[str, str]:
    """Load access_token and default board_id from environment."""
    token = os.getenv("PINTEREST_ACCESS_TOKEN", "")
    board_id = os.getenv("PINTEREST_BOARD_ID", "")
    if not token:
        print("✗ PINTEREST_ACCESS_TOKEN not set in .env")
        print("  Add to backend/.env: PINTEREST_ACCESS_TOKEN=your_token")
        raise SystemExit(1)
    return token, board_id


def cli_list_boards():
    """List all boards (used for initial setup)."""
    token, _ = load_config()
    client = PinterestClient(token)
    boards = client.list_boards()
    print(f"\nFound {len(boards)} boards:\n")
    for b in boards:
        print(f"  {b['id']}  |  {b['name']}  |  {b.get('description', '')[:60]}")
    print("\nSet your board ID in .env:")
    print("  PINTEREST_BOARD_ID=your_board_id_here")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--list-boards":
        cli_list_boards()
    else:
        print("Usage: python -m marketing.pinterest_api --list-boards")
