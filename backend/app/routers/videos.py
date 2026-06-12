from fastapi import APIRouter, Depends, HTTPException
from app.schemas import AnalyzeRequest, VideoInfo
from app.auth import get_current_user
from app.services.yt_service import get_video_info
from app.services.cache_service import cache_get, cache_set
import re

router = APIRouter(prefix="/api/videos", tags=["videos"])


def extract_video_id(url: str) -> str:
    patterns = [
        r"(?:v=|youtu\.be/|embed/|shorts/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return ""


@router.post("/analyze", response_model=VideoInfo)
async def analyze_video(
    request: AnalyzeRequest,
    current_user: str = Depends(get_current_user),
):
    url = request.url.strip()
    if "youtube.com" not in url and "youtu.be" not in url:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    video_id = extract_video_id(url)
    cache_key = f"video_info:{video_id}"

    if video_id:
        cached = cache_get(cache_key)
        if cached:
            return cached

    try:
        info = get_video_info(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch video info: {str(e)}")

    if video_id:
        cache_set(cache_key, info, ttl=3600)

    return info
