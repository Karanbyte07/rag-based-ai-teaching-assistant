import os
import yt_dlp

AUDIO_DIR = "data/audios"

def download_audio(video_url: str) -> dict:
    os.makedirs(AUDIO_DIR, exist_ok=True)

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(AUDIO_DIR, "%(id)s.%(ext)s"), #uniquie yt id filename 
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
        }],
        "quiet": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)

    return {
        "video_id": info["id"],
        "title": info["title"],
        "duration": info["duration"],
        "audio_path": os.path.join(AUDIO_DIR, f"{info['id']}.mp3"),
    }