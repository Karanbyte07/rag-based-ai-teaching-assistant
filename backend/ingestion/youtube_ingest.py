import os
import yt_dlp

AUDIO_DIR = "data/audios"
COOKIES_PATH = "data/cookies.txt"


def _ydl_opts_base() -> dict:
    opts = {"quiet": True, "noplaylist": True}
    if os.path.exists(COOKIES_PATH):
        opts["cookiefile"] = COOKIES_PATH
    return opts


def download_audio(video_url: str) -> dict:
    os.makedirs(AUDIO_DIR, exist_ok=True)

    opts = {
        **_ydl_opts_base(),
        "format": "worstaudio/bestaudio",
        "outtmpl": os.path.join(AUDIO_DIR, "%(id)s.%(ext)s"),
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
        }],
    }

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(video_url, download=True)

    return {
        "video_id": info["id"],
        "title": info["title"],
        "duration": info.get("duration", 0),
        "audio_path": os.path.join(AUDIO_DIR, f"{info['id']}.mp3"),
    }


def extract_playlist_urls(playlist_url: str) -> list[str]:
    opts = {"extract_flat": True, "quiet": True}
    if os.path.exists(COOKIES_PATH):
        opts["cookiefile"] = COOKIES_PATH

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)

    return [entry["url"] for entry in info["entries"]]