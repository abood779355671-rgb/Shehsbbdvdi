"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Trash2,
  RefreshCw,
  Video,
  Music,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import Image from "next/image";
import { getHistory, deleteHistoryItem, clearHistory } from "@/lib/api";
import { DownloadHistory } from "@/types";
import { formatFileSize, formatDuration, formatDate } from "@/lib/utils";

export default function DownloadHistoryPanel() {
  const [history, setHistory] = useState<DownloadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getHistory();
      setHistory(data);
    } catch {
      setError("Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Failed to delete item.");
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setClearing(true);
    try {
      await clearHistory();
      setHistory([]);
      setConfirmClear(false);
    } catch {
      setError("Failed to clear history.");
    } finally {
      setClearing(false);
    }
  };

  const filtered = history.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.channel.toLowerCase().includes(search.toLowerCase())
  );

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "completed") return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    if (status === "failed") return <XCircle className="w-4 h-4 text-red-400" />;
    return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        className="glass rounded-2xl p-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-white font-semibold text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Download History
            </h2>
            <p className="text-muted-foreground text-xs mt-0.5">{history.length} total downloads</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  confirmClear
                    ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                    : "bg-white/5 border border-white/10 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                }`}
              >
                {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {confirmClear ? "Confirm?" : "Clear All"}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="glass rounded-2xl p-12 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-white font-semibold mb-1">
            {search ? "No results found" : "No downloads yet"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {search ? "Try a different search term." : "Your download history will appear here."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl overflow-hidden hover:bg-white/[0.06] transition-all border border-white/5 hover:border-white/10"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  {item.thumbnail ? (
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-14 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                      {item.format_type === "audio" ? (
                        <Music className="w-6 h-6 text-muted-foreground" />
                      ) : (
                        <Video className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{item.title}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{item.channel}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <StatusIcon status={item.status} />
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.format_type === "audio"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-purple-500/20 text-purple-400"
                        }`}
                      >
                        {item.format_type === "audio" ? "MP3" : "MP4"} • {item.quality}
                      </span>
                      {item.file_size && (
                        <span className="text-xs text-muted-foreground">{formatFileSize(item.file_size)}</span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(item.duration)}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-2 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    title="Delete"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
