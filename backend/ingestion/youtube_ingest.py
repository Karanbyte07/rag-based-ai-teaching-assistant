import os
import uuid
from pytubefix import YouTube, Playlist

AUDIO_DIR = "data/audios"


def download_audio(video_url: str) -> dict:
    os.makedirs(AUDIO_DIR, exist_ok=True)
    
    print(f"Requesting audio stream via pytubefix for {video_url}...")
    
    # Using ANDROID_VR client helps bypass the current bot wall
    yt = YouTube(video_url, client='ANDROID_VR')
    
    # We want the highest quality audio stream available
    audio_stream = yt.streams.get_audio_only()
    
    if not audio_stream:
        raise Exception(f"No audio streams found for {video_url}")
        
    # We save it as the video_id so it matches our pipeline expectations
    video_id = yt.video_id or str(uuid.uuid4())[:11]
    filename = f"{video_id}.m4a"
    
    print(f"Downloading stream to {filename}...")
    audio_path = audio_stream.download(output_path=AUDIO_DIR, filename=filename)

    return {
        "video_id": video_id,
        "title": yt.title,
        "duration": yt.length,
        "audio_path": audio_path,
    }


def extract_playlist_urls(playlist_url: str) -> list[str]:
    print(f"Extracting playlist via pytubefix for {playlist_url}...")
    p = Playlist(playlist_url, client='ANDROID_VR')
    return list(p.video_urls)