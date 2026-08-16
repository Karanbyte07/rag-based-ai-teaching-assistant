import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/cookies", tags=["cookies"])

COOKIES_PATH = "data/cookies.txt"


@router.post("/update", summary="Upload a new cookies.txt to replace the existing one")
async def update_cookies(file: UploadFile = File(...)):
    if not file.filename.endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="File must be a .txt file (Netscape cookies format)."
        )

    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Basic sanity check — Netscape cookies.txt starts with a comment
    first_line = content.decode("utf-8", errors="ignore").splitlines()[0] if content else ""
    if "youtube" not in first_line.lower() and "Netscape" not in first_line and "#" not in first_line:
        raise HTTPException(
            status_code=400,
            detail="File doesn't look like a valid Netscape cookies.txt. "
                   "Make sure you export from youtube.com."
        )

    os.makedirs(os.path.dirname(COOKIES_PATH) or ".", exist_ok=True)

    with open(COOKIES_PATH, "wb") as f:
        f.write(content)

    return JSONResponse(
        status_code=200,
        content={
            "message": "cookies.txt updated successfully. yt-dlp will use the new cookies on the next download.",
            "path": COOKIES_PATH,
            "size_bytes": len(content),
        }
    )


@router.get("/status", summary="Check if cookies.txt exists and when it was last updated")
def cookies_status():
    """Returns whether cookies.txt is present and its last modified timestamp."""
    if not os.path.isfile(COOKIES_PATH):
        return {
            "exists": False,
            "message": "No cookies.txt found. Upload one via POST /cookies/update.",
            "path": COOKIES_PATH,
        }

    stat = os.stat(COOKIES_PATH)
    size = stat.st_size
    import datetime
    last_modified = datetime.datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")

    return {
        "exists": True,
        "path": COOKIES_PATH,
        "size_bytes": size,
        "last_updated": last_modified,
        "message": "cookies.txt is present and will be used by yt-dlp.",
    }


@router.delete("/delete", summary="Delete the current cookies.txt")
def delete_cookies():
    """Remove cookies.txt. yt-dlp will fall back to bgutil PO tokens only."""
    if not os.path.isfile(COOKIES_PATH):
        raise HTTPException(status_code=404, detail="No cookies.txt found to delete.")

    os.remove(COOKIES_PATH)
    return {"message": "cookies.txt deleted. yt-dlp will now use bgutil PO tokens only."}
