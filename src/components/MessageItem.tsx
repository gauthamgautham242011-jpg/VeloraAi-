import React, { useState, useEffect } from "react";
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  ExternalLink,
  Globe,
  Terminal,
  Cpu,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Share2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from "lucide-react";
import { Message, GroundingMetadata, AssistantRoleId } from "../types";
import { parseMarkdownToBlocks, ASSISTANT_ROLES } from "../utils";
import VeloraLogo from "./VeloraLogo";

interface MessageItemProps {
  message: Message;
  activeRoleId: AssistantRoleId;
  key?: string;
  isNew?: boolean;
  onTypingComplete?: () => void;
  setNotification?: (notif: { message: string; type: "success" | "error" | "info" } | null) => void;
}

const MessageItem = React.memo(function MessageItem({ 
  message, 
  activeRoleId, 
  isNew = false, 
  onTypingComplete, 
  setNotification 
}: MessageItemProps) {
  const isAssistant = message.role === "assistant";
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [thoughtExpanded, setThoughtExpanded] = useState(true);
  const [displayedContent, setDisplayedContent] = useState(() => 
    isNew && isAssistant ? "" : message.content
  );

  useEffect(() => {
    if (isNew && isAssistant) {
      setDisplayedContent("");
      let currentLength = 0;
      const text = message.content;
      const timer = setInterval(() => {
        const increment = Math.min(text.length - currentLength, Math.floor(Math.random() * 6) + 7);
        currentLength += increment;
        if (currentLength >= text.length) {
          setDisplayedContent(text);
          clearInterval(timer);
          onTypingComplete?.();
        } else {
          setDisplayedContent(text.substring(0, currentLength));
        }
      }, 22);
      return () => {
        clearInterval(timer);
      };
    } else {
      setDisplayedContent(message.content);
    }
  }, [isNew, message.content]);

  const associatedRole = ASSISTANT_ROLES.find(r => r.id === activeRoleId) || ASSISTANT_ROLES[0];

  const handleCopyCode = (codeText: string, blockIndex: number) => {
    navigator.clipboard.writeText(codeText);
    const key = `${message.id}-${blockIndex}`;
    setCopiedCodeId(key);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Helper parser for inline rich formatting (bold, inline code, links)
  const renderInlineStyles = (lineText: string) => {
    // Escape standard HTML first
    let clean = lineText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Markdown Images ![Alt](url)
    clean = clean.replace(/!\[(.*?)\]\((.*?)\)/g, '<img class="my-3.5 rounded-2xl border border-zinc-800 max-h-96 object-contain w-full bg-zinc-950/40" src="$2" alt="$1" referrerPolicy="no-referrer" />');

    // Markdown Links [Text](url)
    clean = clean.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-350 hover:underline font-mono text-[11px] bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 inline-flex items-center gap-1.5 transition-colors">$1 ↗</a>');

    // Double asterisks for bold **text**
    clean = clean.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    
    // Single asterisks for emphasis *text*
    clean = clean.replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>');

    // Inline code backticks `code`
    clean = clean.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-pink-400 font-mono text-[11px] border border-slate-705">$1</code>');

    return <span dangerouslySetInnerHTML={{ __html: clean }} />;
  };

  // Parse a text block line by line into list items, headers or paragraphs
  const renderTextBlock = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Headers #, ##, ###
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-semibold text-white tracking-tight mt-4 mb-2">
            {renderInlineStyles(trimmed.substring(4))}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-base font-semibold text-white tracking-tight mt-5 mb-2.5">
            {renderInlineStyles(trimmed.substring(3))}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2 key={idx} className="text-lg font-bold text-white tracking-tight mt-6 mb-3">
            {renderInlineStyles(trimmed.substring(2))}
          </h2>
        );
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={idx} className="border-l-2 border-indigo-500 pl-4 py-1 my-3 text-slate-400 italic bg-indigo-500/5 rounded-r">
            {renderInlineStyles(trimmed.substring(2))}
          </blockquote>
        );
      }

      // Unordered lists - or *
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-4 my-1.5">
            <span className="text-blue-400 select-none mt-1.5 shrink-0 text-[10px]">•</span>
            <span className="text-slate-300 leading-relaxed text-xs">
              {renderInlineStyles(trimmed.substring(2))}
            </span>
          </div>
        );
      }

      // Ordered lists e.g. 1. or 2.
      const matchOrdered = trimmed.match(/^(\d+)\.\s(.*)/);
      if (matchOrdered) {
        return (
          <div key={idx} className="flex items-start gap-2 ml-4 my-1.5">
            <span className="text-blue-500/70 select-none font-mono text-[11px] shrink-0 font-semibold mt-0.5">
              {matchOrdered[1]}.
            </span>
            <span className="text-slate-300 leading-relaxed text-xs">
              {renderInlineStyles(matchOrdered[2])}
            </span>
          </div>
        );
      }

      // Empty line
      if (trimmed === "") {
        return <div key={idx} className="h-2.5" />;
      }

      // Standard Paragraph
      return (
        <p key={idx} className="text-slate-300 leading-relaxed text-xs mb-2">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  const handleVoiceSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setNotification?.({ message: "Text-to-speech is not supported in this browser.", type: "error" });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.content
      .replace(/[\*`\_#\-]/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShareResponse = () => {
    const mockShareUrl = `${window.location.origin}/share/${message.id}`;
    navigator.clipboard.writeText(mockShareUrl);
    setNotification?.({
      message: "Copied direct response share link to clipboard!",
      type: "success"
    });
  };

  const { rawThought, processedContent, blocks } = React.useMemo(() => {
    let rawThought: string | null = null;
    let processedContent = displayedContent;
    
    if (displayedContent.includes("<thought>")) {
      const startIdx = displayedContent.indexOf("<thought>") + 9;
      const endIdx = displayedContent.indexOf("</thought>");
      if (endIdx !== -1) {
        rawThought = displayedContent.slice(startIdx, endIdx).trim();
        processedContent = displayedContent.replace(/<thought>[\s\S]*?<\/thought>/, "").trim();
      } else {
        rawThought = displayedContent.slice(startIdx).trim();
        processedContent = "";
      }
    }

    const blocks = parseMarkdownToBlocks(processedContent);
    return { rawThought, processedContent, blocks };
  }, [displayedContent]);

  if (!isAssistant) {
    return (
      <div 
        id={`message-${message.id}`}
        className="flex w-full justify-end px-4 py-2.5 md:py-3.5 border-b border-zinc-950/20 bg-[#0d0d0e]/10 transition-colors"
      >
        <div className="max-w-[70%] select-text">
          <div className="bg-[#2f2f2f] text-[13px] text-zinc-100 rounded-2xl px-4 py-2.5 shadow-sm font-sans break-words whitespace-pre-wrap leading-relaxed">
            {message.content.startsWith("![Camera Frame]") ? (
              <div className="space-y-2">
                <img 
                  src={message.content.match(/\((.*?)\)/)?.[1] || ""} 
                  alt="Camera snapshot" 
                  className="rounded-xl border border-zinc-800 max-h-48 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="text-[11px] text-zinc-400 italic">
                  [Camera snapshot attached]
                </div>
              </div>
            ) : message.content.includes("🎬") ? (
              <div className="flex items-center gap-2 text-zinc-300">
                <span>🎬</span>
                <span>[Live-video frame attached successfully]</span>
              </div>
            ) : (
              message.content
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`message-${message.id}`}
      className="group flex w-full flex-col p-4 md:py-6 border-b border-zinc-950 bg-black transition-colors"
    >
      <div className="flex items-start gap-4 max-w-4xl mx-auto w-full">
        
        {/* Avatar Area */}
        <div className="shrink-0 select-none">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] border border-zinc-800/80 text-white shadow shadow-black/20">
            <VeloraLogo className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Bubble Area */}
        <div className="flex-1 space-y-3 min-w-0">
          
          {/* Sender metadata / action bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-white select-none">
                {associatedRole.name}
              </span>
              <span className="text-[9px] text-zinc-500 font-mono select-none">
                {message.timestamp}
              </span>
            </div>
          </div>

          {/* Actual content parsing */}
          <div className="space-y-4">
            {message.isError && (
              <div className="p-3 bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl text-xs flex items-start gap-2">
                <span className="font-bold uppercase tracking-wider text-[9px] bg-red-400/10 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">FAIL</span>
                <span>{message.content}</span>
              </div>
            )}

            {isAssistant && rawThought && (
              <div 
                id={`thought-block-${message.id}`}
                className="my-3 border-l-2 border-amber-500/50 bg-amber-500/[0.02] rounded-r-xl overflow-hidden"
              >
                <button
                  onClick={() => setThoughtExpanded(!thoughtExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/[0.03] select-none cursor-pointer border border-amber-500/10 rounded-t-xl"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                    <span className="font-semibold tracking-tight font-sans">
                      {processedContent === "" ? "Thinking Process..." : "Thought Process"}
                    </span>
                  </div>
                  {thoughtExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5 text-amber-500/60" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-amber-500/60" />
                  )}
                </button>

                {thoughtExpanded && (
                  <div className="px-4 py-3 text-zinc-400 font-mono text-[11px] leading-relaxed border-x border-b border-amber-500/10 bg-amber-950/[0.01] whitespace-pre-wrap">
                    {rawThought}
                  </div>
                )}
              </div>
            )}

            {!message.isError && message.type === "image" && (
              <div className="space-y-3">
                <img
                  src={message.image}
                  alt="AI Generated"
                  className="rounded-2xl border border-zinc-805 object-cover bg-zinc-950/40 shadow-2xl animate-in fade-in zoom-in-95 duration-500 select-none"
                  style={{
                    width: "300px",
                    height: "300px",
                    borderRadius: "20px",
                  }}
                  referrerPolicy="no-referrer"
                />
                {message.content && message.content !== message.image && (
                  <p className="text-xs text-zinc-450 font-medium whitespace-pre-wrap leading-relaxed bg-[#141416]/40 p-3 rounded-xl border border-zinc-850/60 max-w-xl">
                    {message.content}
                  </p>
                )}
              </div>
            )}

            {!message.isError && message.type !== "image" && blocks.map((block, index) => {
              if (block.type === "code") {
                const isCopied = copiedCodeId === `${message.id}-${index}`;
                return (
                  <div 
                    key={index} 
                    id={`code-block-${message.id}-${index}`}
                    className="rounded-xl border border-slate-800 overflow-hidden bg-[#060a12] shadow-inner text-xs my-3"
                  >
                    {/* Code Block Header */}
                    <div className="bg-[#0c101b] border-b border-indigo-950/50 px-4 py-2 flex items-center justify-between text-slate-400 select-none">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-slate-500">
                        <Terminal className="h-3.5 w-3.5 text-blue-500" />
                        {block.language || "code"}
                      </div>
                      <button
                        onClick={() => handleCopyCode(block.content, index)}
                        className="flex items-center gap-1 text-[10px] hover:text-white bg-slate-900/60 px-2 py-1 rounded border border-slate-800 transition-all cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Preformated scrollbox */}
                    <div className="p-4 overflow-x-auto font-mono text-[11.5px] leading-relaxed text-slate-300 whitespace-pre">
                      {block.content}
                    </div>
                  </div>
                );
              }

              // Normal text rendering
              return (
                <div key={index} className="text-slate-300">
                  {renderTextBlock(block.content)}
                </div>
              );
            })}
          </div>

          {/* Web Search Citations / Grounding metadata visualizer */}
          {isAssistant && message.groundingMetadata && (
            <div 
              id={`grounding-block-${message.id}`}
              className="mt-4 pt-3 border-t border-slate-900/60 space-y-2 select-none"
            >
              {message.groundingMetadata.webSearchQueries && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-semibold text-cyan-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Globe className="h-3 w-3 text-cyan-400 shrink-0" />
                    Web Scan Targets:
                  </span>
                  {message.groundingMetadata.webSearchQueries.map((query, qidx) => (
                    <span 
                      key={qidx} 
                      className="text-[10px] bg-cyan-950/20 text-cyan-400 border border-cyan-900/60 px-2 py-0.5 rounded-full"
                    >
                      " {query} "
                    </span>
                  ))}
                </div>
              )}

              {message.groundingMetadata.groundingChunks && message.groundingMetadata.groundingChunks.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Bookmark className="h-3 w-3 text-slate-500" />
                    Citations Verified ({message.groundingMetadata.groundingChunks.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {message.groundingMetadata.groundingChunks.map((chunk, cidx) => {
                      if (!chunk.web) return null;
                      return (
                        <a
                          key={cidx}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noreferrer referrer"
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-800/40 bg-slate-950/20 hover:bg-slate-950/40 hover:border-slate-700/40 transition-all text-[11px] group"
                        >
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <span className="h-5 w-5 bg-slate-900 flex items-center justify-center rounded text-slate-500 font-mono text-[9px] font-bold group-hover:text-blue-400">
                              {cidx + 1}
                            </span>
                            <span className="text-slate-300 truncate font-medium group-hover:text-blue-400">
                              {chunk.web.title || "Reference Source"}
                            </span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-white shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {isAssistant && (
            <div id={`actions-row-${message.id}`} className="flex items-center gap-2 mt-4 pt-2">
              <button
                onClick={handleCopyFullMessage}
                className="p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                title="Copy response"
              >
                {copiedText ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => {
                  setLiked(!liked);
                  setDisliked(false);
                }}
                className={`p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer ${
                  liked ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Good response"
              >
                <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-emerald-400/20" : ""}`} />
              </button>

              <button
                onClick={() => {
                  setDisliked(!disliked);
                  setLiked(false);
                }}
                className={`p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer ${
                  disliked ? "text-rose-400 bg-rose-500/5 border-rose-500/10" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title="Bad response"
              >
                <ThumbsDown className={`h-3.5 w-3.5 ${disliked ? "fill-rose-400/20" : ""}`} />
              </button>

              <button
                onClick={handleVoiceSpeak}
                className={`p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer ${
                  isSpeaking ? "text-indigo-400 bg-indigo-500/5 border-indigo-500/10 animate-pulse" : "text-zinc-500 hover:text-zinc-300"
                }`}
                title={isSpeaking ? "Stop speaking" : "Speak response"}
              >
                {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={handleShareResponse}
                className="p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                title="Share response"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer ${
                    showMoreMenu ? "text-white bg-zinc-850" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="More options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
                
                {showMoreMenu && (
                  <div className="absolute left-0 bottom-8 z-50 w-36 rounded-xl border border-zinc-850 bg-[#171717] shadow-xl p-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(message, null, 2));
                        setNotification?.({ message: "JSON metadata copied to clipboard.", type: "success" });
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left font-sans text-[10px] text-zinc-350 hover:text-white hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors block"
                    >
                      Copy raw JSON
                    </button>
                    <button
                      onClick={() => {
                        setNotification?.({ message: "Logged response to active developer diagnostic pipeline.", type: "info" });
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left font-sans text-[10px] text-zinc-350 hover:text-white hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors block mt-0.5"
                    >
                      Diagnostics
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
});

export default MessageItem;
