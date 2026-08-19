import os
import shutil
import yt_dlp
from yt_dlp.utils import DownloadError

AUDIO_DIR = "data/audios"


def _apply_optional_cookiefile(ydl_opts: dict) -> dict:
    """
    If cookie file exists, attach it to yt-dlp options.
    This helps bypass YouTube "sign in to confirm you're not a bot" checks on servers.
    """
    cookie_file = os.getenv("YTDLP_COOKIE_FILE", "data/cookies.txt")
    use_cookies = os.getenv("YTDLP_USE_COOKIES", "true").lower() in {"1", "true", "yes"}

    if use_cookies and os.path.isfile(cookie_file):
        runtime_cookie_file = os.getenv("YTDLP_RUNTIME_COOKIE_FILE", "/tmp/yt-dlp-cookies.txt")
        try:
            # yt-dlp may try to update cookie jar; use a writable runtime copy.
            shutil.copyfile(cookie_file, runtime_cookie_file)
            ydl_opts["cookiefile"] = runtime_cookie_file
            print(f"Using yt-dlp cookie file: {cookie_file} -> {runtime_cookie_file}")
        except Exception as e:
            # Fallback to original path if copy fails for any reason.
            ydl_opts["cookiefile"] = cookie_file
            print(f"Failed to copy cookie file to runtime path ({e}); using original: {cookie_file}")
    elif use_cookies:
        print(f"yt-dlp cookie file not found at: {cookie_file}")
    else:
        print("yt-dlp cookie usage disabled via YTDLP_USE_COOKIES")

    return ydl_opts


def _configure_youtube_client(ydl_opts: dict) -> dict:
    """
    Use client profile based on auth mode:
    - With cookies: prefer web client so browser cookies are honored.
    - Without cookies: keep android client fallback.
    """
    has_cookiefile = bool(ydl_opts.get("cookiefile"))

    if has_cookiefile:
        ydl_opts["extractor_args"] = {
            "youtube": {
                "player_client": ["web"],
            }
        }
        ydl_opts["http_headers"] = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/127.0.0.0 Safari/537.36"
            )
        }
        print("yt-dlp using web client mode because cookie auth is enabled")
    else:
        ydl_opts["extractor_args"] = {
            "youtube": {
                "player_client": ["android"],
            }
        }

    return ydl_opts


def _build_base_opts() -> dict:
    return {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(AUDIO_DIR, "%(id)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "retries": 5,
        "fragment_retries": 5,
        "force_ipv4": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
        }],
    }


def _inject_po_token_if_present(ydl_opts: dict) -> dict:
    """
    Optional: pass YouTube PO token via env for stricter anti-bot paths.
    Expected env format example:
      YTDLP_PO_TOKEN=web.gvs+<token>
    """
    po_token = os.getenv("YTDLP_PO_TOKEN", "").strip()
    if not po_token:
        return ydl_opts

    extractor_args = ydl_opts.get("extractor_args", {})
    youtube_args = extractor_args.get("youtube", {})
    youtube_args["po_token"] = [po_token]
    extractor_args["youtube"] = youtube_args
    ydl_opts["extractor_args"] = extractor_args
    print("yt-dlp PO token is enabled via YTDLP_PO_TOKEN")
    return ydl_opts


def _inject_bgutil_provider_if_enabled(ydl_opts: dict) -> dict:
    """
    Enable Brainicism bgutil provider plugin for yt-dlp PO token generation.
    Requires bgutil-ytdlp-pot-provider to be installed in Python env.
    """
    use_bgutil = os.getenv("YTDLP_USE_BGUTIL", "true").lower() in {"1", "true", "yes"}
    if not use_bgutil:
        return ydl_opts

    base_url = os.getenv("YTDLP_BGUTIL_BASE_URL", "http://127.0.0.1:4416").strip()
    extractor_args = ydl_opts.get("extractor_args", {})
    provider_args = extractor_args.get("youtubepot-bgutilhttp", {})
    provider_args["base_url"] = [base_url]
    extractor_args["youtubepot-bgutilhttp"] = provider_args
    ydl_opts["extractor_args"] = extractor_args
    print(f"yt-dlp bgutil provider enabled: {base_url}")
    return ydl_opts


def _attempt_download(video_url: str, ydl_opts: dict) -> dict:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(video_url, download=True)


def download_audio(video_url: str) -> dict:
    os.makedirs(AUDIO_DIR, exist_ok=True)

    print(f"Requesting audio stream via yt-dlp for {video_url}...")

    # Try multiple client profiles because VPS IPs are often challenged by YouTube.
    # 1) cookie + web mode
    # 2) cookie + ios mode
    # 3) cookie + android mode
    client_profiles = ["web", "ios", "android"]
    info = None
    last_error = None

    for client in client_profiles:
        ydl_opts = _build_base_opts()
        ydl_opts = _apply_optional_cookiefile(ydl_opts)
        ydl_opts = _configure_youtube_client(ydl_opts)
        ydl_opts = _inject_bgutil_provider_if_enabled(ydl_opts)
        ydl_opts = _inject_po_token_if_present(ydl_opts)

        # Override client profile per attempt.
        extractor_args = ydl_opts.get("extractor_args", {})
        youtube_args = extractor_args.get("youtube", {})
        youtube_args["player_client"] = [client]
        extractor_args["youtube"] = youtube_args
        ydl_opts["extractor_args"] = extractor_args

        print(f"yt-dlp attempt with player client: {client}")
        try:
            info = _attempt_download(video_url, ydl_opts)
            break
        except DownloadError as e:
            last_error = e
            print(f"yt-dlp failed with client '{client}': {e}")

    if info is None and last_error is not None:
        raise last_error

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
        "retries": 5,
        "force_ipv4": True,
    }
    ydl_opts = _apply_optional_cookiefile(ydl_opts)
    ydl_opts = _configure_youtube_client(ydl_opts)
    ydl_opts = _inject_bgutil_provider_if_enabled(ydl_opts)
    ydl_opts = _inject_po_token_if_present(ydl_opts)

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(playlist_url, download=False)

    entries = info.get("entries", [])
    return [
        f"https://www.youtube.com/watch?v={entry['id']}"
        for entry in entries
        if entry.get("id")
    ]