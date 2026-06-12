import yt_dlp
import os
import re
from typing import Optional
from app.config import settings


def sanitize_filename(name: str) -> str:
    return re.sub(r'[\\/*?:"<>|]', "", name)


def format_duration(seconds: int) -> str:
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


def get_video_info(url: str) -> dict:
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    video_formats = []
    audio_formats = []
    seen_resolutions = set()

    for f in info.get("formats", []):
        vcodec = f.get("vcodec", "none")
        acodec = f.get("acodec", "none")
        ext = f.get("ext", "")
        height = f.get("height")
        filesize = f.get("filesize") or f.get("filesize_approx")

        if vcodec != "none" and height and ext in ("mp4", "webm"):
            res_key = f"{height}p"
            if res_key not in seen_resolutions:
                seen_resolutions.add(res_key)
                video_formats.append({
                    "format_id": f["format_id"],
                    "ext": ext,
                    "quality": f"{height}p",
                    "resolution": f"{f.get('width', '?')}x{height}",
                    "filesize": filesize,
                    "fps": f.get("fps"),
                    "vcodec": vcodec,
                    "acodec": acodec,
                    "format_note": f.get("format_note", ""),
                })

        elif vcodec == "none" and acodec != "none" and ext in ("m4a", "webm", "mp3", "ogg"):
            abr = f.get("abr", 0) or 0
            quality_label = f"{int(abr)}kbps" if abr else f.get("format_note", "audio")
            audio_formats.append({
                "format_id": f["format_id"],
                "ext": ext,
                "quality": quality_label,
                "filesize": filesize,
                "acodec": acodec,
                "format_note": f.get("format_note", ""),
            })

    video_formats.sort(key=lambda x: int(x["quality"].replace("p", "")), reverse=True)
    audio_formats.sort(key=lambda x: int(x["quality"].replace("kbps", "") or 0) if "kbps" in x["quality"] else 0, reverse=True)

    if not audio_formats:
        audio_formats = [
            {"format_id": "bestaudio/best", "ext": "mp3", "quality": "Best Quality", "filesize": None, "acodec": "aac", "format_note": "Best available"},
            {"format_id": "worstaudio/worst", "ext": "mp3", "quality": "Low Quality", "filesize": None, "acodec": "aac", "format_note": "Low quality"},
        ]

    duration = info.get("duration", 0) or 0

    return {
        "video_id": info.get("id", ""),
        "title": info.get("title", "Unknown"),
        "description": (info.get("description") or "")[:500],
        "thumbnail": info.get("thumbnail", ""),
        "channel": info.get("uploader", info.get("channel", "Unknown")),
        "channel_url": info.get("uploader_url", ""),
        "duration": duration,
        "duration_string": format_duration(duration),
        "view_count": info.get("view_count"),
        "like_count": info.get("like_count"),
        "upload_date": info.get("upload_date"),
        "formats": video_formats[:10],
        "audio_formats": audio_formats[:6],
    }


def download_video(url: str, format_id: str, output_dir: str, title: str) -> dict:
    os.makedirs(output_dir, exist_ok=True)
    safe_title = sanitize_filename(title)[:100]
    output_template = os.path.join(output_dir, f"{safe_title}.%(ext)s")

    ydl_opts = {
        "format": format_id,
        "outtmpl": output_template,
        "quiet": True,
        "no_warnings": True,
        "merge_output_format": "mp4",
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)

    if not os.path.exists(filename):
        for ext in ["mp4", "webm", "mkv"]:
            candidate = os.path.join(output_dir, f"{safe_title}.{ext}")
            if os.path.exists(candidate):
                filename = candidate
                break

    filesize = os.path.getsize(filename) if os.path.exists(filename) else 0
    return {"filename": filename, "filesize": filesize}


def download_audio(url: str, format_id: str, output_dir: str, title: str) -> dict:
    os.makedirs(output_dir, exist_ok=True)
    safe_title = sanitize_filename(title)[:100]
    output_template = os.path.join(output_dir, f"{safe_title}.%(ext)s")

    ydl_opts = {
        "format": format_id if format_id not in ("bestaudio/best", "worstaudio/worst") else "bestaudio/best",
        "outtmpl": output_template,
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    mp3_file = os.path.join(output_dir, f"{safe_title}.mp3")
    filesize = os.path.getsize(mp3_file) if os.path.exists(mp3_file) else 0
    return {"filename": mp3_file, "filesize": filesize}
