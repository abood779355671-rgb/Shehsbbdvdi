export interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  resolution?: string;
  filesize?: number;
  fps?: number;
  vcodec?: string;
  acodec?: string;
  format_note?: string;
}

export interface VideoInfo {
  video_id: string;
  title: string;
  description?: string;
  thumbnail: string;
  channel: string;
  channel_url?: string;
  duration: number;
  duration_string: string;
  view_count?: number;
  like_count?: number;
  upload_date?: string;
  formats: VideoFormat[];
  audio_formats: VideoFormat[];
}

export interface DownloadHistory {
  id: number;
  video_id: string;
  title: string;
  thumbnail?: string;
  channel: string;
  duration: number;
  format_type: string;
  quality: string;
  file_size?: number;
  url: string;
  status: string;
  created_at: string;
}

export interface DownloadProgress {
  status: "idle" | "downloading" | "completed" | "error";
  progress: number;
  message: string;
  download_url?: string;
  filename?: string;
}
