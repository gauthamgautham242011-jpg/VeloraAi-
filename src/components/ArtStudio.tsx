import React, { useState } from "react";
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Paintbrush, 
  Compass, 
  ArrowRight,
  TrendingUp,
  X
} from "lucide-react";

interface ArtStudioProps {
  onClose: () => void;
  setNotification: (notif: { message: string; type: "success" | "error" | "info" } | null) => void;
}

const PRESET_PROMPTS = [
  "A futuristic AI cybernetic city with cascading holographic waterfalls and flying neon-lit lightcycles",
  "A majestic celestial nebula vortex shaping a glowing cosmic eye with dust starburst flares",
  "An ancient library filled with glowing levitating spellbooks and green bioluminescent vines",
  "A high-contrast cinematic portrait of a cybernetic astrobiologist overlooking a purple planet terrain",
  "A glass prism sculpture sitting on wet volcanic sand refracting rainbow light under a dual moon sky"
];

export default function ArtStudio({ onClose, setNotification }: ArtStudioProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const handleGenerateImage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const promptText = userPrompt.trim();
    if (!promptText) {
      setNotification({ message: "Please enter a visual descriptive prompt.", type: "error" });
      return;
    }

    setIsGenerating(true);
    setNotification({ message: "Initializing Velora-Core Cosmic Canvas pipeline...", type: "info" });

    try {
      // Execute the user's requested fetch snippet precisely
      const res = await fetch("/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: promptText
        })
      });

      if (!res.ok) {
        throw new Error(`Server image generator returned status ${res.status}`);
      }

      const data = await res.json();

      if (data.image) {
        setGeneratedImage(data.image);
        setNotification({ message: "Celestial art synthesized successfully!", type: "success" });
      } else {
        throw new Error("Invalid response received from image generator payload.");
      }
    } catch (err: any) {
      console.error(err);
      setNotification({ 
        message: err.message || "Synthesizer offline. Check server key registration.", 
        type: "error" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = () => {
    if (!generatedImage) return;
    navigator.clipboard.writeText(generatedImage);
    setCopied(true);
    setNotification({ message: "Image data copied successfully.", type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `velora-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification({ message: "Initiating asset file download...", type: "success" });
  };

  return (
    <div 
      id="art-studio-panel-container"
      className="w-full flex flex-col xl:flex-row gap-6 text-slate-200 animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Prompt Form Input Left Panel */}
      <div className="flex-1 space-y-6">
        <div className="bg-[#121214] border border-zinc-850 rounded-2.5xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
          {/* Subtle glowing ambient lighting */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl" />
          
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-850/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Paintbrush className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-sans font-bold text-base text-white tracking-tight">AI Art Studio</h2>
                <p className="text-[10px] text-zinc-500 font-mono">POWERED BY DALL-E & GEMINI MULTIMODAL IMAGERY</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 px-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs font-mono text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Exit Studio
            </button>
          </div>

          <form onSubmit={handleGenerateImage} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono tracking-wider text-zinc-450 uppercase mb-2">
                DESCRIPTIVE PROMPT TRANSCRIPTER
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => {
                  setUserPrompt(e.target.value);
                  setActivePreset(null);
                }}
                rows={4}
                placeholder="Describe your vision with detail: light angles, styles, colors, medium, textures, or cameras..."
                className="w-full rounded-xl bg-black border border-zinc-800 hover:border-zinc-750 focus:border-indigo-500 p-4 font-sans text-xs text-white placeholder-zinc-600 focus:outline-none transition-all resize-none shadow-inner leading-relaxed"
              />
            </div>

            {/* Synthesizer Trigger Button */}
            <button
              type="submit"
              disabled={isGenerating || !userPrompt.trim()}
              className={`w-full py-3 px-4 rounded-xl font-sans font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer select-none border ${
                isGenerating || !userPrompt.trim()
                  ? "bg-zinc-900/50 border-zinc-800/45 text-zinc-650 cursor-not-allowed"
                  : "bg-white text-black border-transparent hover:bg-zinc-150 active:scale-[0.99] shadow-lg shadow-white/5 font-extrabold"
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-zinc-800" />
                  <span>Synthesizing Cosmic Canvas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Generate Vision Art</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Suggestion Presets */}
        <div className="bg-[#121214] border border-zinc-850 rounded-2.5xl p-5 md:p-6 shadow-2xl relative">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white tracking-tight">Prescribed Visual Presets</h3>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserPrompt(preset);
                  setActivePreset(idx);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center gap-2 group ${
                  activePreset === idx
                    ? "bg-emerald-950/20 border-emerald-500/45 text-emerald-300 shadow-md shadow-emerald-950/20"
                    : "bg-black/30 border-zinc-850/60 hover:bg-[#1c1c1e] text-zinc-400 hover:text-white"
                }`}
              >
                <div className={`h-2 w-2 rounded-full shrink-0 transition-all ${
                  activePreset === idx ? "bg-emerald-400 scale-125 animate-pulse" : "bg-zinc-700 group-hover:bg-zinc-400"
                }`} />
                <span className="truncate leading-relaxed flex-1 font-sans">{preset}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Render Canvas Preview Frame Right Panel */}
      <div className="w-full xl:w-[420px] shrink-0">
        <div className="bg-[#121214] border border-zinc-850 rounded-2.5xl p-5 md:p-6 shadow-2xl h-full flex flex-col justify-between min-h-[460px] relative overflow-hidden">
          {/* Subtle decorative grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

          <div className="z-10 w-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-indigo-400" />
                OUTPUT CANVAS FEED
              </span>
              <span className="text-[9px] font-mono text-zinc-600 bg-black/60 border border-zinc-850 px-2 py-0.5 rounded-md">
                1024 × 1024 PX
              </span>
            </div>

            {/* Main Picture Output Display */}
            <div className="w-full aspect-square rounded-xl bg-black border border-zinc-850 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
              {isGenerating ? (
                // Synthesizing interactive loader
                <div className="absolute inset-0 bg-[#0d0d0e] flex flex-col items-center justify-center gap-4 animate-pulse">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border border-zinc-800 flex items-center justify-center relative bg-black shadow-lg">
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 border-r-indigo-400 animate-spin" />
                      <div className="absolute inset-1 rounded-full border border-transparent border-b-emerald-400 border-l-emerald-400 animate-spin [animation-duration:1.6s]" />
                      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <span className="text-xs font-semibold text-zinc-200 tracking-tight font-sans block">
                      Synthesizing Pixels...
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                      Applying quantum diffusion models
                    </span>
                  </div>
                </div>
              ) : generatedImage ? (
                // Beautiful complete visual outcome
                <>
                  <img
                    src={generatedImage}
                    alt="Synthesized Canvas Vision"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  {/* Hover visual actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center gap-3">
                    <button
                      onClick={handleDownload}
                      className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-105"
                      title="Download PNG Asset"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={handleCopyUrl}
                      className="h-10 w-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all hover:scale-105"
                      title="Copy Data URI"
                    >
                      {copied ? <Check className="h-4.5 w-4.5 text-emerald-400" /> : <Copy className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </>
              ) : (
                // Placeholder empty state
                <div className="text-center p-6 flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900/50 border border-zinc-800/40 flex items-center justify-center text-zinc-500">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 font-sans block">Canvas empty</span>
                    <span className="text-[10.5px] text-zinc-650 max-w-[200px] leading-relaxed block mt-1 font-sans">
                      A visual representation of your descriptive prompt will render here.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="z-10 w-full mt-4 pt-4 border-t border-zinc-850/60 flex items-center gap-3">
            {generatedImage ? (
              <div className="w-full flex gap-2.5">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  onClick={handleCopyUrl}
                  className="flex-1 py-2 px-3 bg-[#17171e] hover:bg-[#1d1d26] border border-zinc-805 text-zinc-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                      Copy URI
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mx-auto text-center text-[10px] text-zinc-600 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-amber-500/50 animate-pulse" />
                Vibrant 1:1 Aspect ratio outputs
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
