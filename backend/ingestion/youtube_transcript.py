import os
import json
import re
from urllib.parse import urlparse, parse_qs

from youtube_transcript_api import YouTubeTranscriptApi


TRANSCRIPTS_DIR = "data/transcripts"


def extract_video_id(video_url: str) -> str:
    """Extract YouTube video id from common URL variants."""
    parsed = urlparse(video_url)

    if parsed.netloc in {"youtu.be", "www.youtu.be"}:
        return parsed.path.lstrip("/")

    if parsed.netloc in {"youtube.com", "www.youtube.com", "m.youtube.com"}:
        qs = parse_qs(parsed.query)
        if "v" in qs and qs["v"]:
            return qs["v"][0]

        # Handles /shorts/<id> and /embed/<id>
        match = re.match(r"^/(shorts|embed)/([^/?#]+)", parsed.path)
        if match:
            return match.group(2)

    raise ValueError(f"Could not extract video ID from URL: {video_url}")


def fetch_transcript_segments(video_url: str) -> dict:
    """
    Fetch transcript from YouTube Transcript API and convert to whisper-like segments:
    [{"start": float, "end": float, "text": str}, ...]
    """
    video_id = extract_video_id(video_url)

    # Priority order can be overridden, e.g. "en,hi"
    lang_pref = os.getenv("YOUTUBE_TRANSCRIPT_LANGUAGES", "en").split(",")
    languages = [lang.strip() for lang in lang_pref if lang.strip()]

    transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=languages)

    segments = []
    for item in transcript:
        start = float(item.get("start", 0.0))
        duration = float(item.get("duration", 0.0))
        end = start + duration
        text = (item.get("text") or "").strip()
        if not text:
            continue
        segments.append({"start": start, "end": end, "text": text})

    if not segments:
        raise RuntimeError("Transcript API returned no usable transcript segments")

    os.makedirs(TRANSCRIPTS_DIR, exist_ok=True)
    transcript_path = os.path.join(TRANSCRIPTS_DIR, f"{video_id}.json")

    with open(transcript_path, "w", encoding="utf-8") as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)

    return {
        "video_id": video_id,
        "title": video_id,
        "duration": segments[-1]["end"],
        "segments": segments,
        "transcript_path": transcript_path,
        "source": "youtube_transcript_api",
    }
