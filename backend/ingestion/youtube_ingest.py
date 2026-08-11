import os
import yt_dlp

AUDIO_DIR = "data/audios"
COOKIES_PATH = "data/cookies.txt"


def download_audio(video_url: str) -> dict:
    os.makedirs(AUDIO_DIR, exist_ok=True)

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(AUDIO_DIR, "%(id)s.%(ext)s"),
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
        }],
        "quiet": True,
        "noplaylist": True,
    }

    if os.path.exists(COOKIES_PATH):
        ydl_opts["cookiefile"] = COOKIES_PATH

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)

    return {
        "video_id": info["id"],
        "title": info["title"],
        "duration": info["duration"],
        "audio_path": os.path.join(AUDIO_DIR, f"{info['id']}.mp3"),
    }


def extract_playlist_urls(playlist_url: str) -> list[str]:
    ydl_opts = {"extract_flat": True, "quiet": True}

    if os.path.exists(COOKIES_PATH):
        ydl_opts["cookiefile"] = COOKIES_PATH

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)

    return [entry["url"] for entry in info["entries"]]