import React from "react";
import { 
  Compass, 
  Terminal, 
  Sparkles, 
  Atom, 
  Briefcase, 
  Search, 
  Sliders, 
  Info,
  SlidersHorizontal,
  Bot
} from "lucide-react";
import { AssistantRoleId, ChatSession } from "../types";
import { ASSISTANT_ROLES } from "../utils";

interface SettingsPanelProps {
  session: ChatSession;
  onUpdateSessionConfig: (updates: Partial<ChatSession>) => void;
}

export default function SettingsPanel({
  session,
  onUpdateSessionConfig,
}: SettingsPanelProps) {
  const currentRole = ASSISTANT_ROLES.find((r) => r.id === session.assistantRole) || ASSISTANT_ROLES[0];

  const handleRoleSelection = (roleId: AssistantRoleId) => {
    const roleObj = ASSISTANT_ROLES.find((r) => r.id === roleId);
    if (roleObj) {
      onUpdateSessionConfig({
        assistantRole: roleId,
        systemInstruction: roleObj.systemPrompt,
      });
    }
  };

  const getRoleIcon = (roleId: AssistantRoleId) => {
    switch (roleId) {
      case "coder":
        return <Terminal className="h-4 w-4 text-emerald-400" />;
      case "writer":
        return <Sparkles className="h-4 w-4 text-purple-400" />;
      case "scientist":
        return <Atom className="h-4 w-4 text-amber-400" />;
      case "mentor":
        return <Briefcase className="h-4 w-4 text-rose-400" />;
      default:
        return <Compass className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div 
      id="settings-panel-root"
      className="rounded-2xl border border-slate-800/60 bg-[#111827]/80 backdrop-blur-md p-5 text-slate-200"
    >
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-blue-400" />
          <h3 className="font-sans font-semibold text-white text-sm">Thread Tuning Parameters</h3>
        </div>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
          Gemini 3.5-Flash
        </span>
      </div>

      {/* Assistant Mode selector */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Assistant Specialization Persona
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2" id="assistant-specialization-grid">
          {ASSISTANT_ROLES.map((role) => {
            const isSelected = session.assistantRole === role.id;
            return (
              <button
                key={role.id}
                id={`role-btn-${role.id}`}
                onClick={() => handleRoleSelection(role.id)}
                className={`flex sm:flex-col items-center sm:justify-center text-left sm:text-center p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-br ${role.gradient} border-slate-700 text-white shadow-md shadow-black/10`
                    : "bg-[#1e293b]/20 border-slate-800/40 text-slate-400 hover:bg-[#1e293b]/40 hover:text-slate-200"
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? "bg-slate-800" : "bg-[#1d2636]"} mb-0 sm:mb-2 mr-3 sm:mr-0`}>
                  {getRoleIcon(role.id)}
                </div>
                <div className="flex flex-col sm:items-center">
                  <span className="text-xs font-semibold">{role.name}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{role.badge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Details of Active Mode */}
      <div className="mt-4 p-3 bg-slate-900/40 rounded-xl border border-slate-800/40 text-xs text-slate-400 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200 block">{currentRole.name} Mode active:</span>
          <span>{currentRole.description} System prompts have been calibrated to handle your prompt natively.</span>
        </div>
      </div>

      {/* Dynamic parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-800/60">
        
        {/* Toggle Real Web Lookup */}
        <div className="flex flex-col justify-between bg-slate-900/30 p-3.5 rounded-xl border border-slate-800/40">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Search className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Google Search Grounding</span>
              </div>
              <p className="text-[10px] text-slate-450 leading-relaxed">
                Empower core Gemini with real-time web lookups to fetch live global data, flight tracking, or recent world news.
              </p>
            </div>

            {/* Custom Sliding Toggle */}
            <button
              id="google-search-grounding-toggle"
              onClick={() => onUpdateSessionConfig({ enableSearch: !session.enableSearch })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                session.enableSearch ? "bg-cyan-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  session.enableSearch ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {session.enableSearch && (
            <div className="mt-2 text-[9px] bg-cyan-950/20 text-cyan-400 px-2 py-1 rounded inline-flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Live web grounding successfully calibrated.
            </div>
          )}
        </div>

        {/* Temperature slider */}
        <div className="bg-slate-900/30 p-3.5 rounded-xl border border-slate-800/40 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-violet-400" />
                <span className="text-xs font-semibold text-white">Creativity Temperature</span>
              </div>
              <span className="text-xs font-mono font-semibold text-violet-400">
                {(session.temperature ?? 0.7).toFixed(1)}
              </span>
            </div>
            <p className="text-[10px] text-slate-455">
              Lower temperatures promote robust factual accuracy. Higher temperatures facilitate fluent creative brainstorming.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] text-slate-500">Precise</span>
            <input
              type="range"
              id="temperature-slider-input"
              min="0.0"
              max="1.2"
              step="0.1"
              value={session.temperature ?? 0.7}
              onChange={(e) => onUpdateSessionConfig({ temperature: parseFloat(e.target.value) })}
              className="flex-1 accent-violet-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">Creative</span>
          </div>
        </div>

      </div>
    </div>
  );
}
