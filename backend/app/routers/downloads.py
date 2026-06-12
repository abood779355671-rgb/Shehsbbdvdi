from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os

from app.schemas import DownloadRequest, DownloadHistoryOut
from app.auth import get_current_user
from app.database import get_db
from app.models import DownloadHistory
from app.services.yt_service import download_video, download_audio
from app.config import settings

router = APIRouter(prefix="/api/downloads", tags=["downloads"])


@router.post("/start")
async def start_download(
    request: DownloadRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    try:
        output_dir = os.path.join(settings.DOWNLOAD_DIR, request.video_id)

        if request.format_type == "audio":
            result = download_audio(request.url, request.format_id, output_dir, request.title)
        else:
            result = download_video(request.url, request.format_id, output_dir, request.title)

        record = DownloadHistory(
            video_id=request.video_id,
            title=request.title,
            thumbnail=request.thumbnail,
            channel=request.channel,
            duration=request.duration,
            format_type=request.format_type,
            quality=request.quality,
            file_size=result.get("filesize"),
            url=request.url,
            status="completed",
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        filename = os.path.basename(result["filename"])
        return {
            "id": record.id,
            "status": "completed",
            "filename": filename,
            "filesize": result.get("filesize"),
            "download_url": f"/api/downloads/file/{request.video_id}/{filename}",
        }

    except Exception as e:
        record = DownloadHistory(
            video_id=request.video_id,
            title=request.title,
            thumbnail=request.thumbnail,
            channel=request.channel,
            duration=request.duration,
            format_type=request.format_type,
            quality=request.quality,
            url=request.url,
            status="failed",
        )
        db.add(record)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


@router.get("/file/{video_id}/{filename}")
async def serve_file(
    video_id: str,
    filename: str,
    token: str = Query(None),
    current_user: str = Depends(get_current_user),
):
    file_path = os.path.join(settings.DOWNLOAD_DIR, video_id, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        file_path,
        filename=filename,
        media_type="application/octet-stream",
    )


@router.get("/history", response_model=List[DownloadHistoryOut])
async def get_history(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
):
    return (
        db.query(DownloadHistory)
        .order_by(DownloadHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.delete("/history/{item_id}")
async def delete_history_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    item = db.query(DownloadHistory).filter(DownloadHistory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    file_dir = os.path.join(settings.DOWNLOAD_DIR, item.video_id)
    if os.path.exists(file_dir):
        import shutil
        shutil.rmtree(file_dir, ignore_errors=True)

    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}


@router.delete("/history")
async def clear_history(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db.query(DownloadHistory).delete()
    db.commit()
    return {"message": "History cleared"}
