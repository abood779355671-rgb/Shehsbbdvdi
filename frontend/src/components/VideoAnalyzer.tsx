"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Video,
  Music,
  Eye,
  ThumbsUp,
  Clock,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Play,
} from "lucide-react";
import Image from "next/image";
import { analyzeVideo, startDownload } from "@/lib/api";
import { VideoInfo, VideoFormat, DownloadProgress } from "@/types";
import { formatFileSize, formatNumber, formatDate } from "@/lib/utils";

interface Props {
  onNavigateHistory: () => void;
}

export default function VideoAnalyzer({ onNavigateHistory }: Props) {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedTab, setSelectedTab] = useState<"video" | "audio">("video");
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: "idle",
    progress: 0,
    message: "",
  });

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzeError("");
    setVideoInfo(null);
    setAnalyzing(true);
    setDownloadProgress({ status: "idle", progress: 0, message: "" });
    try {
      const info = await analyzeVideo(url.trim());
      setVideoInfo(info);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setAnalyzeError(err?.response?.data?.detail || "Failed to analyze video. Please check the URL.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async (format: VideoFormat, type: "video" | "audio") => {
    if (!videoInfo) return;
    setDownloadProgress({ status: "downloading", progress: 10, message: "Preparing download..." });

    const interval = setInterval(() => {
      setDownloadProgress((prev) => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 8, 85),
        message: prev.progress < 30 ? "Connecting to YouTube..." : prev.progress < 60 ? "Downloading..." : "Processing file...",
      }));
    }, 800);

    try {
      const result = await startDownload({
        url,
        format_id: format.format_id,
        format_type: type,
        quality: format.quality,
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        channel: videoInfo.channel,
        duration: videoInfo.duration,
        video_id: videoInfo.video_id,
      });

      clearInterval(interval);
      setDownloadProgress({ status: "completed", progress: 100, message: "Download complete!" });

      if (result.download_url) {
        const a = document.createElement("a");
        a.href = result.download_url;
        a.download = result.filename || "download";
        a.click();
      }
    } catch (e: unknown) {
      clearInterval(interval);
      const err = e as { response?: { data?: { detail?: string } } };
      setDownloadProgress({
        status: "error",
        progress: 0,
        message: err?.response?.data?.detail || "Download failed. Please try again.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* URL Input */}
      <motion.div
        className="glass rounded-2xl p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-400" />
          YouTube URL
        </h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !url.trim()}
            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
          >
            {analyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Search className="w-4 h-4" /> Analyze</>
            )}
          </button>
        </div>

        {analyzeError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {analyzeError}
          </motion.div>
        )}
      </motion.div>

      {/* Download progress */}
      <AnimatePresence>
        {downloadProgress.status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {downloadProgress.status === "downloading" && (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                )}
                {downloadProgress.status === "completed" && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
                {downloadProgress.status === "error" && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    downloadProgress.status === "completed"
                      ? "text-green-400"
                      : downloadProgress.status === "error"
                      ? "text-red-400"
                      : "text-white"
                  }`}
                >
                  {downloadProgress.message}
                </span>
              </div>
              {downloadProgress.status === "completed" && (
                <button
                  onClick={onNavigateHistory}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  View in History →
                </button>
              )}
            </div>
            {downloadProgress.status !== "error" && (
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    downloadProgress.status === "completed"
                      ? "bg-gradient-to-r from-green-500 to-emerald-400"
                      : "bg-gradient-to-r from-purple-600 to-blue-500"
                  }`}
                  animate={{ width: `${downloadProgress.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Info */}
      <AnimatePresence>
        {videoInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Video card */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-0">
                <div className="relative sm:w-64 flex-shrink-0 aspect-video sm:aspect-auto">
                  <Image
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono">
                    {videoInfo.duration_string}
                  </div>
                </div>

                <div className="p-5 flex-1">
                  <h3 className="text-white font-semibold text-base leading-snug mb-2 line-clamp-2">
                    {videoInfo.title}
                  </h3>
                  <p className="text-purple-400 text-sm mb-3 font-medium">{videoInfo.channel}</p>

                  <div className="flex flex-wrap gap-4 text-muted-foreground text-xs">
                    {videoInfo.view_count !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(videoInfo.view_count)} views
                      </div>
                    )}
                    {videoInfo.like_count !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {formatNumber(videoInfo.like_count)} likes
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {videoInfo.duration_string}
                    </div>
                    {videoInfo.upload_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {videoInfo.upload_date.slice(0, 4)}-{videoInfo.upload_date.slice(4, 6)}-{videoInfo.upload_date.slice(6, 8)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Format selector */}
            <div className="glass rounded-2xl p-5">
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setSelectedTab("video")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedTab === "video"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Video className="w-4 h-4" /> Video (MP4)
                </button>
                <button
                  onClick={() => setSelectedTab("audio")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedTab === "audio"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Music className="w-4 h-4" /> Audio (MP3)
                </button>
              </div>

              <div className="space-y-2">
                {(selectedTab === "video" ? videoInfo.formats : videoInfo.audio_formats).map((format) => (
                  <motion.div
                    key={format.format_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/10 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center">
                        {selectedTab === "video" ? (
                          <Video className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Music className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{format.quality}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">
                          {format.ext.toUpperCase()}
                          {format.resolution && ` • ${format.resolution}`}
                          {format.fps && ` • ${format.fps}fps`}
                          {format.filesize && ` • ${formatFileSize(format.filesize)}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(format, selectedTab)}
                      disabled={downloadProgress.status === "downloading"}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!videoInfo && !analyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4">
            <Youtube className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Ready to Download</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Paste any YouTube video URL above and click Analyze to see available download options.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["4K • 2160p", "Full HD • 1080p", "HD • 720p", "SD • 480p", "MP3 Audio"].map((label) => (
              <span key={label} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
