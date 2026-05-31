import React, { useState } from "react";
import { 
  Sparkles, 
  Camera, 
  Image, 
  Paperclip, 
  Video, 
  Lightbulb, 
  Telescope, 
  Globe, 
  Cpu, 
  LayoutGrid, 
  Check, 
  X,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isThinkingActive: boolean;
  onToggleThinking: () => void;
  isDeepResearchActive: boolean;
  onToggleDeepResearch: () => void;
  isWebSearchActive: boolean;
  onToggleWebSearch: () => void;
  onUpgradeClick: () => void;
  onCameraClick: () => void;
  onPhotosClick: () => void;
  onFilesClick: () => void;
  onVideosClick: () => void;
  onOpenAIPlatformClick: () => void;
  onExploreAppsClick: () => void;
}

export default function AttachmentMenu({
  isOpen,
  onClose,
  isThinkingActive,
  onToggleThinking,
  isDeepResearchActive,
  onToggleDeepResearch,
  isWebSearchActive,
  onToggleWebSearch,
  onUpgradeClick,
  onCameraClick,
  onPhotosClick,
  onFilesClick,
  onVideosClick,
  onOpenAIPlatformClick,
  onExploreAppsClick
}: AttachmentMenuProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 overflow-hidden">
        {/* Backdrop overlay matching standard mobile sheet constraints with safe blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        />

        {/* The bottom sheet capsule panel itself */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.5 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative w-full max-w-md bg-[#121214] border-t sm:border border-zinc-800/80 rounded-t-[32px] sm:rounded-[32px] p-6 pb-8 sm:pb-6 shadow-2xl flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          {/* Top Grab handle bar on mobile */}
          <div className="mx-auto w-12 h-1.5 rounded-full bg-zinc-800 sm:hidden -mt-2 mb-2" />

          {/* Header row with exit block */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-900/60 select-none">
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold tracking-tight text-white font-sans">
                Velora capabilities & attachments
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mt-0.5">
                Quantum toolchest
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* 1. First Sheet Content Block: Core Attachments Panel (styled list as seen in Video 1) */}
          <div className="flex flex-col gap-2">
            {/* UPGRADE BUTTON - styled with custom magical purple star/sparkle block */}
            <button
              onClick={() => {
                onUpgradeClick();
                onClose();
              }}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-950/20 to-indigo-950/20 hover:from-purple-950/35 hover:to-indigo-350/10 border border-purple-500/15 hover:border-purple-500/30 flex items-center justify-between px-4 transition-all duration-300 active:scale-[0.99] cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow shadow-purple-500/10 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                    Upgrade Subscription
                  </span>
                  <span className="text-[9px] text-zinc-500 block">Unthrottle core reasoning limits</span>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-purple-500 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* CAMERA BUTTON */}
            <button
              onClick={() => {
                onCameraClick();
                onClose();
              }}
              className="w-full h-12 rounded-xl hover:bg-zinc-900/60 flex items-center justify-between px-3 border border-transparent hover:border-zinc-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-zinc-900 text-zinc-300 flex items-center justify-center border border-zinc-800 shadow shadow-black/20 group-hover:scale-105 transition-transform">
                  <Camera className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Camera</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-650 uppercase">Snapshot</span>
            </button>

            {/* PHOTOS BUTTON */}
            <button
              onClick={() => {
                onPhotosClick();
                setTimeout(onClose, 180);
              }}
              className="w-full h-12 rounded-xl hover:bg-zinc-900/60 flex items-center justify-between px-3 border border-transparent hover:border-zinc-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-zinc-900 text-zinc-300 flex items-center justify-center border border-zinc-800 shadow shadow-black/20 group-hover:scale-105 transition-transform">
                  <Image className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Photos</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-650 uppercase">Gallery</span>
            </button>

            {/* FILES BUTTON */}
            <button
              onClick={() => {
                onFilesClick();
                setTimeout(onClose, 180);
              }}
              className="w-full h-12 rounded-xl hover:bg-zinc-900/60 flex items-center justify-between px-3 border border-transparent hover:border-zinc-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-zinc-900 text-zinc-300 flex items-center justify-center border border-zinc-800 shadow shadow-black/20 group-hover:scale-105 transition-transform">
                  <Paperclip className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Files</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-650 uppercase">Document</span>
            </button>

            {/* VIDEOS BUTTON */}
            <button
              onClick={() => {
                onVideosClick();
                onClose();
              }}
              className="w-full h-12 rounded-xl hover:bg-zinc-900/60 flex items-center justify-between px-3 border border-transparent hover:border-zinc-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-zinc-900 text-zinc-300 flex items-center justify-center border border-zinc-800 shadow shadow-black/20 group-hover:scale-105 transition-transform">
                  <Video className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Videos</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-650 uppercase">VLOG</span>
            </button>
          </div>

          {/* Divider style section label matching the screens */}
          <div className="h-px bg-zinc-900/80 my-1" />

          {/* 2. Second Sheet Content Block: Advanced AI Core reasoning / search (as seen in Video 2) */}
          <div className="flex flex-col gap-2">
            
            {/* THINKING TOGGLE BUTTON */}
            <button
              onClick={onToggleThinking}
              className={`w-full h-12 rounded-xl flex items-center justify-between px-3 border transition-all cursor-pointer group ${
                isThinkingActive 
                  ? "bg-amber-500/5 border-amber-500/20 text-amber-300 hover:bg-amber-500/10" 
                  : "hover:bg-zinc-900/60 border-transparent hover:border-zinc-800/40 text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all ${
                  isThinkingActive 
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" 
                    : "bg-zinc-900 text-zinc-300 border border-zinc-800 shadow shadow-black/20 group-hover:scale-105"
                }`}>
                  <Lightbulb className={`h-4 w-4 ${isThinkingActive ? "animate-pulse fill-amber-400/10" : ""}`} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium group-hover:text-white">Thinking</span>
                  <span className={`text-[9px] block ${isThinkingActive ? "text-amber-500/80" : "text-zinc-500"}`}>
                    Deep reasoning tree (o-flavor)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                    isThinkingActive 
                      ? "border-amber-500/20 bg-amber-500/10 text-amber-400 font-bold" 
                      : "border-zinc-800 text-zinc-500"
                  }`}>
                  {isThinkingActive ? "Active" : "Off"}
                </span>
              </div>
            </button>

            {/* DEEP RESEARCH TOGGLE BUTTON */}
            <button
              onClick={onToggleDeepResearch}
              className={`w-full h-12 rounded-xl flex items-center justify-between px-3 border transition-all cursor-pointer group ${
                isDeepResearchActive 
                  ? "bg-cyan-500/5 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/10" 
                  : "hover:bg-zinc-900/60 border-transparent hover:border-zinc-800/40 text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all ${
                  isDeepResearchActive 
                    ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" 
                    : "bg-zinc-900 text-zinc-300 border border-zinc-800 shadow shadow-black/20 group-hover:scale-105"
                }`}>
                  <Telescope className={`h-4 w-4 ${isDeepResearchActive ? "animate-bounce" : ""}`} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium group-hover:text-white">Deep research</span>
                  <span className={`text-[9px] block ${isDeepResearchActive ? "text-cyan-500/80" : "text-zinc-500"}`}>
                    Multi-step agent analytical loop
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                    isDeepResearchActive 
                      ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-bold" 
                      : "border-zinc-800 text-zinc-500"
                  }`}>
                  {isDeepResearchActive ? "Active" : "Off"}
                </span>
              </div>
            </button>

            {/* WEB SEARCH TOGGLE BUTTON */}
            <button
              onClick={onToggleWebSearch}
              className={`w-full h-12 rounded-xl flex items-center justify-between px-3 border transition-all cursor-pointer group ${
                isWebSearchActive 
                  ? "bg-indigo-500/5 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/10" 
                  : "hover:bg-zinc-900/60 border-transparent hover:border-zinc-800/40 text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all ${
                  isWebSearchActive 
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" 
                    : "bg-zinc-900 text-zinc-300 border border-zinc-800 shadow shadow-black/20 group-hover:scale-105"
                }`}>
                  <Globe className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium group-hover:text-white">Web search</span>
                  <span className={`text-[9px] block ${isWebSearchActive ? "text-indigo-400/80" : "text-zinc-500"}`}>
                    Real-time internet grounding search
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                    isWebSearchActive 
                      ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400 font-bold" 
                      : "border-zinc-800 text-zinc-500"
                  }`}>
                  {isWebSearchActive ? "Active" : "Off"}
                </span>
              </div>
            </button>

            {/* OPENAI PLATFORM EMBED LINK */}
            <button
              onClick={() => {
                onOpenAIPlatformClick();
                onClose();
              }}
              className="w-full h-12 rounded-xl hover:bg-zinc-900/60 flex items-center justify-between px-3 border border-transparent hover:border-zinc-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-zinc-900 text-zinc-300 flex items-center justify-center border border-zinc-800 shadow shadow-black/20 group-hover:scale-105 transition-transform">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className="h-4.5 w-4.5 text-blue-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.003 9.003 0 018.716 2.253M12 3a9.003 9.003 0 00-8.716 2.253m0 0A9.003 9.003 0 0112 12c2.485 0 4.5 4.03 4.5 9" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">OpenAI Platform</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-650" />
            </button>

            {/* EXPLORE APPS DRAWER */}
            <button
              onClick={() => {
                onExploreAppsClick();
                onClose();
              }}
              className="w-full h-12 rounded-xl hover:bg-zinc-900/60 flex items-center justify-between px-3 border border-transparent hover:border-zinc-800/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-zinc-900 text-zinc-300 flex items-center justify-center border border-zinc-800 shadow shadow-black/20 group-hover:scale-105 transition-transform">
                  <LayoutGrid className="h-4.5 w-4.5 text-zinc-400 group-hover:text-indigo-400" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium text-zinc-200 group-hover:text-white">Explore apps</span>
                  <span className="text-[9px] block text-zinc-500">
                    Switch neural core personalities
                  </span>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-650 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
