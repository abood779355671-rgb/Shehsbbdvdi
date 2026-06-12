"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import {
  Youtube,
  Download,
  History,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import VideoAnalyzer from "@/components/VideoAnalyzer";
import DownloadHistoryPanel from "@/components/DownloadHistoryPanel";

type Tab = "download" | "history";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("download");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) router.push("/");
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("access_token");
    router.push("/");
  };

  const navItems = [
    { id: "download" as Tab, icon: Download, label: "Download" },
    { id: "history" as Tab, icon: History, label: "History" },
  ];

  return (
    <div className="min-h-screen bg-hero-gradient flex relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(139,92,246,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-full w-64 glass-dark z-30 flex flex-col py-6 px-4 lg:relative lg:translate-x-0 lg:flex"
        style={{ minWidth: 256 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">YT Downloader</p>
            <p className="text-muted-foreground text-xs">Pro Edition</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <div className="text-xs text-muted-foreground uppercase tracking-widest px-3 mb-3 flex items-center gap-2">
            <LayoutDashboard className="w-3 h-3" /> Dashboard
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600/30 to-blue-600/20 text-white border border-purple-500/30"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 mt-4"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="glass-dark border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-lg">
              {activeTab === "download" ? "Download Videos" : "Download History"}
            </h1>
            <p className="text-muted-foreground text-xs">
              {activeTab === "download"
                ? "Paste a YouTube URL to analyze and download"
                : "All your previous downloads"}
            </p>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "download" ? (
              <VideoAnalyzer onNavigateHistory={() => setActiveTab("history")} />
            ) : (
              <DownloadHistoryPanel />
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
