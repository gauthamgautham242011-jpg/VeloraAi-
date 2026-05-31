import React from "react";
import { 
  Sparkles, 
  Bot, 
  ArrowUpRight, 
  HelpCircle,
  Cpu,
  Image,
  Upload,
  PenTool,
  Globe
} from "lucide-react";
import { AssistantRoleId, ChatSession } from "../types";
import { ASSISTANT_ROLES } from "../utils";
import VeloraLogo from "./VeloraLogo";

interface IntroStateProps {
  session: ChatSession;
  onSuggestionClick: (suggestion: string) => void;
  onSimulateUpload: (fileName: string) => void;
  onCustomAction?: (actionKey: "create_image" | "write_edit" | "look_up") => void;
}

export default function IntroState({
  session,
  onSuggestionClick,
  onSimulateUpload,
  onCustomAction,
}: IntroStateProps) {
  const currentRole = ASSISTANT_ROLES.find((r) => r.id === session.assistantRole) || ASSISTANT_ROLES[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSimulateUpload(file.name);
    }
  };

  return (
    <div 
      id="intro-state-container"
      className="flex flex-col items-center justify-center max-w-xl mx-auto py-8 md:py-12 px-6 text-center select-none cursor-default"
    >
      {/* Decorative Core Pulsar */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-2xl animate-pulse" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#171717] border border-zinc-800 shadow-xl hover:scale-105 transition-all duration-300">
          <VeloraLogo className="h-8.5 w-8.5" />
        </div>
      </div>

      {/* Main Celestial Typography matching ChatGPT: "What can I help with?" */}
      <h1 className="font-sans text-2xl md:text-3xl font-bold tracking-tight text-white mb-8">
        What can I help with?
      </h1>

      {/* ChatGPT-style Core Quick Action items (Stacked Vertically & Nicely Aligned like the video!) */}
      <div className="w-full flex flex-col gap-2 mb-8 animate-in fade-in-50 slide-in-from-bottom-3 duration-500" id="chatgpt-quick-suggestions">
        {/* CREATE AN IMAGE */}
        <button
          onClick={() => onCustomAction?.("create_image")}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-zinc-800 bg-[#171717]/40 hover:bg-[#1c1c1e] hover:border-zinc-700 text-left transition-all cursor-pointer active:scale-[0.99] group"
        >
          <div className="h-9 w-9 bg-zinc-900 border border-zinc-805 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:bg-black transition-all">
            <Image className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-zinc-200 group-hover:text-white">Create an image</span>
            <span className="block text-[10px] text-zinc-500 font-mono">DALL-E style visual generator</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        {/* WRITE OR EDIT */}
        <button
          onClick={() => onCustomAction?.("write_edit")}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-zinc-800 bg-[#171717]/40 hover:bg-[#1c1c1e] hover:border-zinc-700 text-left transition-all cursor-pointer active:scale-[0.99] group"
        >
          <div className="h-9 w-9 bg-zinc-900 border border-zinc-805 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-black transition-all">
            <PenTool className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-zinc-200 group-hover:text-white">Write or edit</span>
            <span className="block text-[10px] text-zinc-500 font-mono">Clean code snippet generator</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>

        {/* LOOK SOMETHING UP */}
        <button
          onClick={() => onCustomAction?.("look_up")}
          className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-zinc-800 bg-[#171717]/40 hover:bg-[#1c1c1e] hover:border-zinc-700 text-left transition-all cursor-pointer active:scale-[0.99] group"
        >
          <div className="h-9 w-9 bg-zinc-900 border border-zinc-805 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 group-hover:bg-black transition-all">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-xs font-semibold text-zinc-200 group-hover:text-white">Look something up</span>
            <span className="block text-[10px] text-zinc-500 font-mono">Real-time web scan verification bounds</span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>

      {/* Alternate upload element */}
      <div className="mb-6 flex items-center gap-2 bg-zinc-900/30 border border-zinc-800/40 px-4 py-2 rounded-full backdrop-blur-sm select-none">
        <label 
          id="central-image-scanner-trigger"
          className="cursor-pointer flex items-center gap-2 group text-[11px] text-zinc-400 hover:text-white transition-colors"
        >
          <input 
            type="file" 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,.txt" 
            onChange={handleFileChange} 
          />
          <Upload className="h-3.5 w-3.5 text-emerald-500 group-hover:scale-110 transition-transform animate-pulse" />
          <span>Upload reference file or images</span>
        </label>
      </div>

      {/* Active Role Card Highlight */}
      <div className="w-full bg-[#171717]/30 border border-zinc-800/40 rounded-2xl p-4 text-left backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1 px-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono uppercase font-bold select-none text-center">
            {currentRole.name} Mode
          </div>
          <span className="text-[10px] text-zinc-500 select-none font-sans">Velora Core personality enabled</span>
        </div>
        <p className="text-[11.5px] text-zinc-400 leading-relaxed font-sans">
          {currentRole.description} Powered by gemini-3.5-flash.
        </p>
      </div>
    </div>
  );
}
