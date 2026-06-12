from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


class VideoFormat(BaseModel):
    format_id: str
    ext: str
    quality: str
    resolution: Optional[str] = None
    filesize: Optional[int] = None
    fps: Optional[float] = None
    vcodec: Optional[str] = None
    acodec: Optional[str] = None
    format_note: Optional[str] = None


class VideoInfo(BaseModel):
    video_id: str
    title: str
    description: Optional[str] = None
    thumbnail: str
    channel: str
    channel_url: Optional[str] = None
    duration: int
    duration_string: str
    view_count: Optional[int] = None
    like_count: Optional[int] = None
    upload_date: Optional[str] = None
    formats: List[VideoFormat]
    audio_formats: List[VideoFormat]


class AnalyzeRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    format_id: str
    format_type: str
    quality: str
    title: str
    thumbnail: str
    channel: str
    duration: int
    video_id: str


class DownloadHistoryOut(BaseModel):
    id: int
    video_id: str
    title: str
    thumbnail: Optional[str]
    channel: str
    duration: int
    format_type: str
    quality: str
    file_size: Optional[int]
    url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
