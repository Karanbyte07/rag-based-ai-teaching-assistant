import os
import yt_dlp
import requests
import re
import uuid

AUDIO_DIR = "data/audios"
COOKIES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "cookies.txt")

def download_audio(video_url: str) -> dict:
    os.makedirs(AUDIO_DIR, exist_ok=True)

    # 1. Extract metadata (title, duration, id) using yt-dlp (flat extraction)
    ydl_opts_meta = {
        "extract_flat": True,
        "quiet": True,
        "extractor_args": {
            "youtube": ["player_client=web_creator,android"]
        },
    }
    if os.path.exists(COOKIES_PATH):
        ydl_opts_meta["cookiefile"] = COOKIES_PATH

    try:
        with yt_dlp.YoutubeDL(ydl_opts_meta) as ydl:
            info = ydl.extract_info(video_url, download=False)
            video_id = info.get("id") or str(uuid.uuid4())[:11]
            title = info.get("title", "Unknown Title")
            duration = info.get("duration", 0)
    except Exception as e:
        print(f"Warning: Failed to extract metadata with yt-dlp: {e}")
        # Fallback if yt-dlp is completely blocked
        match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", video_url)
        video_id = match.group(1) if match else str(uuid.uuid4())[:11]
        title = f"Video {video_id}"
        duration = 0

    # 2. Download the audio using Cobalt API
    print(f"Requesting audio from Cobalt API for {video_id}...")
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    payload = {
        "url": video_url,
        "downloadMode": "audio",
        "audioFormat": "mp3",
    }
    
    cobalt_url = "https://api.cobalt.tools/api/json"
    response = requests.post(cobalt_url, json=payload, headers=headers)
    response.raise_for_status()
    data = response.json()
    
    if data.get("status") == "error":
        raise Exception(f"Cobalt API Error: {data.get('text')}")
        
    download_url = data.get("url")
    if not download_url:
        raise Exception("No download URL returned from Cobalt.")
        
    audio_path = os.path.join(AUDIO_DIR, f"{video_id}.mp3")
    
    print(f"Downloading stream to {audio_path}...")
    with requests.get(download_url, stream=True) as r:
        r.raise_for_status()
        with open(audio_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
                
    return {
        "video_id": video_id,
        "title": title,
        "duration": duration,
        "audio_path": audio_path,
    }


# extract the individual video URLs from a playlist URL

def extract_playlist_urls(playlist_url: str) -> list[str]:
    ydl_opts = {
        "extract_flat": True,   #only extract metadata, not download
        "quiet": True,
        "extractor_args": {
            "youtube": ["player_client=web_creator,android"]
        },
    }

    if os.path.exists(COOKIES_PATH):
        ydl_opts["cookiefile"] = COOKIES_PATH

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)

    video_urls = [entry["url"] for entry in info["entries"]]
    return video_urls