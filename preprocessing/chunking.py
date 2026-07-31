CHUNK_SIZE = 45
OVERLAP = 10

def chunk_segments(segments: list[dict], video_id: str, title: str) -> list[dict]:
    """
    Takes raw Whisper/faster-whisper segments and merges them into
    overlapping chunks. Works in-memory — no file I/O.
    """
    chunk_id = 0
    merged_chunks = []
    current_segments = []
    current_start = None
    current_end = None

    for segment in segments:
        current_segments.append((segment["text"], segment["start"], segment["end"]))
        current_end = segment["end"]
        current_start = current_segments[0][1]

        if current_end - current_start >= CHUNK_SIZE:
            chunk_text = " ".join(s[0] for s in current_segments).strip()
            merged_chunks.append({
                "chunk_id": chunk_id,
                "video_id": video_id,
                "title": title,
                "start": current_start,
                "end": current_end,
                "duration": current_end - current_start,
                "text": chunk_text,
            })
            chunk_id += 1

            overlap_start_time = current_end - OVERLAP
            current_segments = [s for s in current_segments if s[2] >= overlap_start_time]

    return merged_chunks