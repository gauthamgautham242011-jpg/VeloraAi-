import React, { useState } from "react";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Bot, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  Terminal,
  Volume2,
  Sparkles,
  Edit2,
  Check,
  Palette,
  Calculator
} from "lucide-react";
import { ChatSession, AssistantRoleId } from "../types";
import { ASSISTANT_ROLES } from "../utils";
import VeloraLogo from "./VeloraLogo";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: (roleId?: AssistantRoleId) => void;
  onDeleteSession: (id: string) => void;
  onUpdateSessionTitle: (id: string, title: string) => void;
  userEmail?: string;
  currentView?: "chat" | "billing" | "art_studio" | "math_sandbox";
  onChangeView?: (view: "chat" | "billing" | "art_studio" | "math_sandbox") => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onUpdateSessionTitle,
  userEmail,
  currentView = "chat",
  onChangeView,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveTitle = (id: string) => {
    if (editTitle.trim()) {
      onUpdateSessionTitle(id, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveTitle(id);
    } else if (e.key === "Escape") {
      setEditingSessionId(null);
    }
  };

  return (
    <div 
      id="velora-sidebar-wrapper"
      className={`relative h-full border-r border-zinc-900 bg-[#171717] text-slate-200 transition-all duration-300 md:block ${
        isOpen ? "w-80" : "w-0 md:w-16"
      } flex flex-col overflow-hidden`}
    >
      {/* Brand Header */}
      <div 
        id="sidebar-brand-header"
        className="flex h-16 items-center justify-between border-b border-zinc-900 px-4"
      >
        {isOpen ? (
          <div className="flex items-center gap-2.5">
            <VeloraLogo className="h-8 w-8 hover:scale-105 transition-all duration-305 cursor-pointer" />
            <span className="font-sans font-semibold tracking-tight text-white text-sm">
              Velora <span className="text-zinc-500 font-medium">GPT-6</span>
            </span>
          </div>
        ) : (
          <VeloraLogo className="mx-auto h-8 w-8 hover:scale-105 transition-all duration-305 cursor-pointer" />
        )}

        <button
          id="toggle-sidebar-button"
          onClick={() => setIsOpen(!isOpen)}
          className="hidden rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white md:block"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary Action */}
      <div id="new-chat-container" className="p-4">
        {isOpen ? (
          <div className="flex flex-col gap-2">
            <button
              id="btn-new-session"
              onClick={() => onNewSession("general")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
            <div className="grid grid-cols-2 gap-1 text-[10px] mt-1">
              <button 
                onClick={() => onNewSession("coder")}
                className="flex items-center justify-center gap-1 rounded-lg bg-[#212121]/50 py-1 px-1.5 hover:bg-[#212121] border border-zinc-800/40 text-zinc-400 hover:text-white transition-colors"
              >
                <Terminal className="h-3 w-3 text-indigo-400" />
                Coder
              </button>
              <button 
                onClick={() => onNewSession("writer")}
                className="flex items-center justify-center gap-1 rounded-lg bg-[#212121]/50 py-1 px-1.5 hover:bg-[#212121] border border-zinc-800/40 text-zinc-400 hover:text-white transition-colors"
              >
                <Sparkles className="h-3 w-3 text-indigo-400" />
                Scribe
              </button>
            </div>
          </div>
        ) : (
          <button
            id="btn-new-session-collapsed"
            onClick={() => onNewSession("general")}
            className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800"
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Workspace Apps Taskbar section */}
      <div id="sidebar-apps-taskbar" className="px-4 py-2 border-b border-zinc-900/45 pb-3">
        {isOpen ? (
          <div>
            <div className="px-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-2">
              Workspace Apps
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => onChangeView?.(currentView === "billing" ? "chat" : "billing")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                  currentView === "billing"
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold"
                    : "bg-[#212121]/30 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span>Get Plus</span>
                </div>
                {currentView === "billing" && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />}
              </button>
              <button
                onClick={() => onChangeView?.(currentView === "art_studio" ? "chat" : "art_studio")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                  currentView === "art_studio"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                    : "bg-[#212121]/30 text-zinc-450 border border-transparent hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>AI Art Studio</span>
                </div>
                {currentView === "art_studio" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
              <button
                onClick={() => onChangeView?.(currentView === "math_sandbox" ? "chat" : "math_sandbox")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                  currentView === "math_sandbox"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold"
                    : "bg-[#212121]/30 text-zinc-455 border border-transparent hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 shrink-0 text-blue-400" />
                  <span>Math Solver</span>
                </div>
                {currentView === "math_sandbox" && <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <button
              onClick={() => onChangeView?.(currentView === "billing" ? "chat" : "billing")}
              className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                currentView === "billing"
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              title="Get Plus"
            >
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            </button>
            <button
              onClick={() => onChangeView?.(currentView === "art_studio" ? "chat" : "art_studio")}
              className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                currentView === "art_studio"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              title="AI Art Studio"
            >
              <Palette className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => onChangeView?.(currentView === "math_sandbox" ? "chat" : "math_sandbox")}
              className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                currentView === "math_sandbox"
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              title="Math Solver"
            >
              <Calculator className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>

      {/* Chat Session List */}
      <div id="session-list-scrollable" className="flex-1 overflow-y-auto px-2 space-y-1">
        {isOpen && sessions.length > 0 && (
          <div className="px-2 text-[10px] font-medium tracking-wider text-zinc-500 uppercase mb-2">
            Recent Threads
          </div>
        )}

        {sessions.map((session) => {
          const isSelected = session.id === activeSessionId;
          const associatedRoleObj = ASSISTANT_ROLES.find(r => r.id === session.assistantRole);

          return (
            <div
              key={session.id}
              id={`session-item-${session.id}`}
              onClick={() => onSelectSession(session.id)}
              className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "bg-[#212121] text-white shadow shadow-black/25 font-medium"
                  : "text-zinc-400 hover:bg-[#212121]/40 hover:text-slate-200"
              }`}
            >
              <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
                <MessageSquare className={`h-4 w-4 shrink-0 ${isSelected ? "text-white" : "text-zinc-500"}`} />
                <div className="flex-1 overflow-hidden">
                  {editingSessionId === session.id ? (
                    <input
                      type="text"
                      id={`edit-title-input-${session.id}`}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveTitle(session.id)}
                      onKeyDown={(e) => handleKeyDown(e, session.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-[#121212] text-white px-2 py-0.5 rounded border border-zinc-700 focus:outline-none text-xs"
                      autoFocus
                    />
                  ) : (
                    <div className="flex flex-col">
                      <span className="truncate">{session.title}</span>
                      {isOpen && associatedRoleObj && (
                        <span className="text-[9px] text-zinc-500 shrink-0 capitalize">
                          {associatedRoleObj.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isOpen && !editingSessionId && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleStartEdit(session, e)}
                    className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800"
                    title="Rename"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800"
                      title="Delete Thread"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Info Card Footer */}
      <div 
        id="sidebar-footer"
        className="mt-auto border-t border-zinc-900 bg-black/40 p-4 text-xs text-zinc-400 flex flex-col gap-2"
      >
        {isOpen ? (
          <>
            {userEmail && (
              <div className="flex items-center gap-2.5 rounded-xl bg-[#212121]/50 p-2 border border-zinc-800/40 overflow-hidden">
                <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-white text-[10px] uppercase font-bold">
                  {userEmail.substring(0, 2)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10.5px] text-zinc-350 truncate font-semibold leading-none">{userEmail}</span>
                  <span className="text-[9px] text-zinc-500 mt-1">Velora Plus Citizen</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mx-auto h-2.5 w-2.5 rounded-full bg-zinc-700" />
        )}
      </div>
    </div>
  );
}
