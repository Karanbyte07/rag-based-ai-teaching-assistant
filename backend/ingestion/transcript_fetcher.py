import re
import requests
# pyrefly: ignore [missing-import]
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(url: str) -> str:
    """Extract YouTube 11-character video ID from various URL formats."""
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:embed\/|v\/|shorts\/)([0-9A-Za-z_-]{11})',
        r'youtu\.be\/([0-9A-Za-z_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    if len(url.strip()) == 11:
        return url.strip()
    raise ValueError(f"Could not extract video ID from URL: {url}")


def get_video_title(video_id: str) -> str:
    """Fetch video title using public oEmbed API — zero authentication, never blocked."""
    try:
        url = f"https://www.youtube.com/watch?v={video_id}"
        resp = requests.get(
            f"https://www.youtube.com/oembed?url={url}&format=json",
            timeout=10,
        )
        if resp.status_code == 200:
            return resp.json().get("title", video_id)
    except Exception as e:
        print(f"[transcript_fetcher] Could not fetch oEmbed title: {e}")
    return video_id


def fetch_youtube_transcript(video_url: str) -> dict:
    """
    Fetches transcript directly from YouTube's timedtext API.
    Works seamlessly across all versions of youtube-transcript-api.
    Returns:
        {
            "video_id": str,
            "title": str,
            "segments": [{"text": str, "start": float, "end": float}, ...]
        }
    """
    video_id = extract_video_id(video_url)
    print(f"[transcript_fetcher] Extracted video ID: {video_id} from '{video_url}'")
    
    title = get_video_title(video_id)
    print(f"[transcript_fetcher] Retrieved title: '{title}'")

    print(f"[transcript_fetcher] Attempting direct transcript fetch for {video_id}...")

    raw_snippets = None
    ytt = YouTubeTranscriptApi()

    # Priority 1: Try fetching preferred languages directly
    preferred_langs = ['en', 'hi', 'en-IN', 'hi-Latn', 'en-US', 'en-GB']
    try:
        print(f"[transcript_fetcher] Checking preferred languages: {preferred_langs}")
        if hasattr(ytt, 'fetch'):
            fetched = ytt.fetch(video_id, languages=preferred_langs)
            raw_snippets = getattr(fetched, 'snippets', fetched)
        elif hasattr(YouTubeTranscriptApi, 'get_transcript'):
            raw_snippets = YouTubeTranscriptApi.get_transcript(video_id, languages=preferred_langs)
        if raw_snippets:
            print(f"[transcript_fetcher] Direct language match found ({len(raw_snippets)} raw items)")
    except Exception as e:
        print(f"[transcript_fetcher] Direct language match not found: {e}")

    # Priority 2: Use list() to iterate through available transcripts
    if not raw_snippets:
        try:
            print(f"[transcript_fetcher] Querying available transcript list from YouTube...")
            if hasattr(ytt, 'list'):
                transcript_list = list(ytt.list(video_id))
            elif hasattr(YouTubeTranscriptApi, 'list_transcripts'):
                transcript_list = list(YouTubeTranscriptApi.list_transcripts(video_id))
            else:
                transcript_list = []

            if transcript_list:
                print(f"[transcript_fetcher] Found {len(transcript_list)} available transcript track(s)")
                # Pick the first available transcript
                target_transcript = transcript_list[0]
                # If Hindi/English is available in the list, prefer it
                for t in transcript_list:
                    lang_code = getattr(t, 'language_code', '')
                    if lang_code in preferred_langs:
                        target_transcript = t
                        print(f"[transcript_fetcher] Selected preferred transcript track: '{lang_code}'")
                        break
                else:
                    target_lang = getattr(target_transcript, 'language_code', 'unknown')
                    print(f"[transcript_fetcher] Using fallback transcript track: '{target_lang}'")

                fetched = target_transcript.fetch()
                raw_snippets = getattr(fetched, 'snippets', fetched)
            else:
                print(f"[transcript_fetcher] No transcript tracks returned in list.")
        except Exception as e:
            print(f"[transcript_fetcher] Transcript listing error: {e}")

    if not raw_snippets:
        raise RuntimeError(f"No transcripts found for YouTube video {video_id}")

    segments = []
    for item in raw_snippets:
        # Support both object attributes (.text, .start) and dictionary keys (['text'], ['start'])
        if isinstance(item, dict):
            text = item.get("text", "").strip()
            start = round(float(item.get("start", 0)), 2)
            duration = float(item.get("duration", 0))
        else:
            text = getattr(item, "text", "").strip()
            start = round(float(getattr(item, "start", 0)), 2)
            duration = float(getattr(item, "duration", 0))

        if not text:
            continue
        end = round(start + duration, 2)
        segments.append({
            "text": text,
            "start": start,
            "end": end,
        })

    first_start = segments[0]['start'] if segments else 0
    last_end = segments[-1]['end'] if segments else 0
    print(f"[transcript_fetcher] [SUCCESS] Fetched {len(segments)} segments (Time range: {first_start}s to {last_end}s)")
    return {
        "video_id": video_id,
        "title": title,
        "segments": segments,
    }
