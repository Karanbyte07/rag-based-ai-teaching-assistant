import os
import yt_dlp

AUDIO_DIR = "data/audios"


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
        "noplaylist": True,   # yeh line add karo
        "extractor_args": {
            "youtube": ["player_client=android"]
        },
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=True)

    return {
        "video_id": info["id"],
        "title": info["title"],
        "duration": info["duration"],
        "audio_path": os.path.join(AUDIO_DIR, f"{info['id']}.mp3"),
    }


# extract the individual video URLs from a playlist URL

def extract_playlist_urls(playlist_url: str) -> list[str]:
    ydl_opts = {
        "extract_flat": True,   #only extract metadata, not download
        "quiet": True,          
        "extractor_args": {
            "youtube": ["player_client=android"]
        },
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)

    video_urls = [entry["url"] for entry in info["entries"]]
    return video_urls