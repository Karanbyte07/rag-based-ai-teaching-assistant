import os
import yt_dlp

AUDIO_DIR = "data/audios"

# URL of the bgutil PO token provider server.
# In Docker Compose this is set to http://bgutil:4416 via env var.
# Falls back to localhost for local development.
_BGUTIL_URL = os.getenv("BGUTIL_HTTP_BASE_URL", "http://localhost:4416")


def _pot_extractor_args() -> dict:
    """
    Returns the extractor_args needed to route yt-dlp's PO token
    requests to the bgutil HTTP provider server.
    """
    return {
        "extractor_args": {
            "youtubepot-bgutilhttp": {
                "base_url": [_BGUTIL_URL],
            },
        },
    }


def download_audio(video_url: str) -> dict:
    os.makedirs(AUDIO_DIR, exist_ok=True)

    print(f"Requesting audio stream via yt-dlp for {video_url}...")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(AUDIO_DIR, "%(id)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        # Avoid postprocessing so we keep the raw audio file
        "postprocessors": [],
        **_pot_extractor_args(),
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)

    video_id = info["id"]
    ext = info.get("ext", "m4a")
    audio_path = os.path.join(AUDIO_DIR, f"{video_id}.{ext}")

    print(f"Downloaded audio to {audio_path}")

    return {
        "video_id": video_id,
        "title": info.get("title", video_id),
        "duration": info.get("duration", 0),
        "audio_path": audio_path,
    }


def extract_playlist_urls(playlist_url: str) -> list[str]:
    print(f"Extracting playlist via yt-dlp for {playlist_url}...")

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": True,   # don't download, just list entries
        "skip_download": True,
        **_pot_extractor_args(),
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)

    entries = info.get("entries", [])
    return [
        f"https://www.youtube.com/watch?v={entry['id']}"
        for entry in entries
        if entry.get("id")
    ]

