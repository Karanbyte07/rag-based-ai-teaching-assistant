import os
import yt_dlp

AUDIO_DIR = "data/audios"


def _apply_optional_cookiefile(ydl_opts: dict) -> dict:
    """
    If cookie file exists, attach it to yt-dlp options.
    This helps bypass YouTube "sign in to confirm you're not a bot" checks on servers.
    """
    cookie_file = os.getenv("YTDLP_COOKIE_FILE", "data/cookies.txt")
    use_cookies = os.getenv("YTDLP_USE_COOKIES", "true").lower() in {"1", "true", "yes"}

    if use_cookies and os.path.isfile(cookie_file):
        ydl_opts["cookiefile"] = cookie_file
        print(f"Using yt-dlp cookie file: {cookie_file}")
    elif use_cookies:
        print(f"yt-dlp cookie file not found at: {cookie_file}")
    else:
        print("yt-dlp cookie usage disabled via YTDLP_USE_COOKIES")

    return ydl_opts


def download_audio(video_url: str) -> dict:
    os.makedirs(AUDIO_DIR, exist_ok=True)

    print(f"Requesting audio stream via yt-dlp for {video_url}...")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(AUDIO_DIR, "%(id)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
        }],
        "extractor_args": {
            "youtube": {
                "player_client": ["android"],
            }
        },
    }
    ydl_opts = _apply_optional_cookiefile(ydl_opts)

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)

    video_id = info["id"]
    audio_path = os.path.join(AUDIO_DIR, f"{video_id}.mp3")

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
        "extract_flat": True,
        "skip_download": True,
    }
    ydl_opts = _apply_optional_cookiefile(ydl_opts)

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)

    entries = info.get("entries", [])
    return [
        f"https://www.youtube.com/watch?v={entry['id']}"
        for entry in entries
        if entry.get("id")
    ]