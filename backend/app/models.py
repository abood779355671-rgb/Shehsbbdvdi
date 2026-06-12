from sqlalchemy import Column, Integer, String, DateTime, BigInteger, Text
from sqlalchemy.sql import func
from app.database import Base


class DownloadHistory(Base):
    __tablename__ = "download_history"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(String(50), index=True)
    title = Column(String(500))
    thumbnail = Column(Text)
    channel = Column(String(200))
    duration = Column(Integer)
    format_type = Column(String(10))
    quality = Column(String(50))
    file_size = Column(BigInteger, nullable=True)
    url = Column(Text)
    status = Column(String(20), default="completed")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
