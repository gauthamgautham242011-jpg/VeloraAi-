import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Settings, 
  Bot, 
  Menu, 
  X, 
  AlertCircle,
  TrendingUp,
  Cpu,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  CreditCard,
  Check,
  Sparkles,
  Plus,
  Calculator,
  MessageSquare,
  Palette
} from "lucide-react";
import { ChatSession, Message, AssistantRoleId, UserBillingState, BillingTierId } from "./types";
import { ASSISTANT_ROLES, createNewSession, generateId } from "./utils";
import Sidebar from "./components/Sidebar";
import SettingsPanel from "./components/SettingsPanel";
import IntroState from "./components/IntroState";
import MessageItem from "./components/MessageItem";
import BillingDashboard from "./components/BillingDashboard";
import AttachmentMenu from "./components/AttachmentMenu";
import VeloraLogo from "./components/VeloraLogo";
import ArtStudio from "./components/ArtStudio";
import MathSandbox from "./components/MathSandbox";

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [showTuningPanel, setShowTuningPanel] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [pendingImagePrompt, setPendingImagePrompt] = useState(false);
  const [generatingImageType, setGeneratingImageType] = useState<string | null>(null);

  // Core view switching (chat stage vs billing stage vs art_studio visual generator vs secure math_sandbox solver)
  const [currentView, setCurrentView] = useState<"chat" | "billing" | "art_studio" | "math_sandbox">("chat");

  const [typingDots, setTypingDots] = useState(".");

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setTypingDots(prev => (prev === "..." ? "." : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setTypingDots(".");
    }
  }, [isGenerating]);

  // Dynamic system and transaction notifications toast helper
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Interactive local/server billing telemetry state
  const [billingState, setBillingState] = useState<UserBillingState>(() => {
    const saved = localStorage.getItem("velora_gpt_6_billing");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse billing state", e);
      }
    }
    return {
      currentTier: "free",
      creditsRemaining: 5000,
      creditsMax: 5000,
      stripeConnected: false,
      history: []
    };
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("velora_gpt_6_sessions");
    if (saved) {
      try {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved sessions:", e);
      }
    }

    // Default starting state
    const defaultSession = createNewSession("general");
    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  }, []);

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("velora_gpt_6_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Handle scrolling to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, isGenerating]);

  // Auto clear notification after 4 seconds to maintain clean margins
  useEffect(() => {
    if (notification) {
      const handle = setTimeout(() => {
        setNotification(null);
      }, 4500);
      return () => clearTimeout(handle);
    }
  }, [notification]);

  // Load backend Stripe publishable key configurations on initial boot
  useEffect(() => {
    fetch("/api/payment/config")
      .then((res) => {
        if (!res.ok) throw new Error("Stripe config load failed");
        return res.json();
      })
      .then((data) => {
        setBillingState((prev) => ({
          ...prev,
          stripeConnected: !!data.stripeConnected,
        }));
      })
      .catch((err) => {
        console.warn("API Stripe telemetry configurations disabled. Running local demo mock-fallbacks:", err);
      });
  }, []);

  // Sync state modifications onto local storage to persist balances securely
  useEffect(() => {
    localStorage.setItem("velora_gpt_6_billing", JSON.stringify(billingState));
  }, [billingState]);

  // Check and apply automatic daily reset of message limits
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString("en-US");
    if (billingState.lastResetDate !== todayStr) {
      setBillingState((prev) => ({
        ...prev,
        creditsRemaining: prev.creditsMax,
        lastResetDate: todayStr
      }));
    }
  }, [billingState.lastResetDate]);

  // Redirect parameter receiver interface for premium Stripe checkout sessions
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const status = query.get("payment_status");
    const planId = query.get("plan_id");
    const amountStr = query.get("amount");

    if (status === "success" && planId && amountStr) {
      const amountParsed = parseFloat(amountStr) || 0;
      const isSub = planId === "plus" || planId === "elite";

      const receiptItem = {
        id: "tx_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }) + " " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        description: isSub 
          ? `Transferred to Velora ${planId === "plus" ? "Plus" : "Elite Omni"} Subscription`
          : `Gained Message Pack (${planId === "lunar_topup" ? "Lunar" : planId === "orbit_topup" ? "Orbit" : "Stellar"})`,
        amount: `₹${amountParsed.toFixed(0)}`,
        status: "completed" as const,
        type: isSub ? ("subscription" as const) : ("credits" as const)
      };

      setBillingState((prev) => {
        let max = prev.creditsMax;
        let rem = prev.creditsRemaining;

        if (planId === "plus") {
          max = 5000;
          rem = Math.min(5000, rem + 5000);
        } else if (planId === "elite") {
          max = 1000000;
          rem = Math.min(1000000, rem + 1000000);
        } else if (planId === "lunar_topup") {
          rem = rem + 25000;
          max = Math.max(max, rem);
        } else if (planId === "orbit_topup") {
          rem = rem + 100000;
          max = Math.max(max, rem);
        } else if (planId === "stellar_topup") {
          rem = rem + 500000;
          max = Math.max(max, rem);
        }

        return {
          ...prev,
          currentTier: isSub ? (planId as BillingTierId) : prev.currentTier,
          creditsRemaining: rem,
          creditsMax: max,
          history: [receiptItem, ...prev.history]
        };
      });

      setNotification({
        message: `Transaction Completed! Calibrated active tier '${planId === "plus" ? "Velora Plus" : "Velora Elite Omni"}' successfully (+₹${amountStr} processed).`,
        type: "success"
      });

      // Purge query strings to keep clean workspace references
      window.history.replaceState({}, document.title, window.location.pathname);
      setCurrentView("billing");
    } else if (status === "cancelled") {
      setNotification({
        message: "Stripe secure checkout process cancelled by user request.",
        type: "info"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handlers to trigger secure backend Stripe Checkout sessions
  const handleInitiateUpgrade = async (planId: BillingTierId, name: string, price: number, isSub: boolean) => {
    // Elegant free tier transition
    if (planId === "free") {
      setBillingState((prev) => ({
        ...prev,
        currentTier: "free",
        creditsMax: 5000,
        creditsRemaining: Math.min(5000, prev.creditsRemaining)
      }));
      setNotification({ message: "Successfully transitioned back to standard Free allocation.", type: "info" });
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          planId,
          amount: price,
          isSubscription: isSub
        })
      });

      if (!res.ok) throw new Error("Stripe bootstrap connection failed.");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setNotification({ message: err.message || "Failed to establish checkout mapping.", type: "error" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleInitiateCreditPack = async (packId: string, name: string, amount: number, price: number) => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          planId: packId,
          amount: price,
          isSubscription: false
        })
      });

      if (!res.ok) throw new Error("Direct top-up session generation failed.");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setNotification({ message: err.message || "Failed to initialize credit purchase.", type: "error" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Find active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setCurrentView("chat");
    setIsSidebarMobileOpen(false); // Close mobile drawer
  };

  const handleNewSession = (roleId: AssistantRoleId = "general") => {
    const newSess = createNewSession(roleId);
    setSessions((prev) => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
    setCurrentView("chat");
    setIsSidebarMobileOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleUpdateSessionTitle = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleUpdateSessionConfig = (updates: Partial<ChatSession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, ...updates } : s))
    );
  };

  const handleClearThreadHistory = () => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: `Cleared thread (${ASSISTANT_ROLES.find((r) => r.id === s.assistantRole)?.name || "General"})`,
              messages: [],
            }
          : s
      )
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawMessageText = textToSend !== undefined ? textToSend : inputMessage;
    if (!rawMessageText.trim() || isGenerating) return;

    // Out of messages protection boundary
    if (billingState.creditsRemaining <= 0) {
      setNotification({
        message: "Velora message balance depleted! Upgrade subscription or top up message limits.",
        type: "error"
      });
      return;
    }

    if (textToSend === undefined) {
      setInputMessage("");
    }

    const trimmedMsg = rawMessageText.trim();
    let processedMsg = trimmedMsg;
    let isImgReq = false;

    if (pendingImagePrompt) {
      processedMsg = `/image ${trimmedMsg}`;
      isImgReq = true;
      setPendingImagePrompt(false);
    } else {
      const lower = trimmedMsg.toLowerCase();
      isImgReq = lower.startsWith("/image") || 
                  lower.includes("generate image") ||
                  lower.includes("create image") ||
                  lower.includes("draw") ||
                  lower.includes("make image") ||
                  lower.includes("generate an image") || 
                  lower.includes("generate a image") || 
                  lower.includes("create an image") || 
                  lower.includes("create a photo") || 
                  lower.includes("realistic sun set") ||
                  lower.includes("realistic sunset mountains");
    }

    if (isImgReq) {
      setGeneratingImageType(trimmedMsg);
    } else {
      setGeneratingImageType(null);
    }

    // Interactive custom wizard replies for standard empty "generate a image"
    if (trimmedMsg.toLowerCase() === "generate a image" || trimmedMsg.toLowerCase() === "generate an image" || trimmedMsg.toLowerCase() === "create an image") {
      setPendingImagePrompt(true);
      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: trimmedMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "What kind of image do you want me to generate?\nYou can describe anything — logo, wallpaper, anime, realistic photo, futuristic AI art, car, character, etc.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...(s.messages || []), userMsg, assistantMsg], updatedAt: new Date().toISOString() }
            : s
        )
      );
      if (textToSend === undefined) {
        setInputMessage("");
      }
      return;
    }

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: trimmedMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session with user message and dynamically update title if empty or default
    let updatedMessages = [...(activeSession?.messages || []), userMsg];
    let newTitle = activeSession?.title || "Active chat";

    if (activeSession?.messages.length === 0) {
      // Intelligently auto-crop first 4-5 words of the query for titles
      const words = trimmedMsg.split(/\s+/);
      newTitle = words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: updatedMessages, title: newTitle, updatedAt: new Date().toISOString() }
          : s
      )
    );

    setIsGenerating(true);

    // Form payload for the server backend using the processed message
    const serverPayloadMessages = [
      ...((activeSession?.messages || []).map(m => ({ ...m }))),
      { ...userMsg, content: processedMsg }
    ];

    try {
      if (isImgReq) {
        // Fetch from custom user-defined image generation api as requested
        const response = await fetch("/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmedMsg,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned error code ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.image) {
          throw new Error("No image was returned from the image synthesis engine.");
        }

        const assistantMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: trimmedMsg,
          type: "image",
          image: data.image,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setLatestMessageId(assistantMsg.id);

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: [...updatedMessages, assistantMsg], updatedAt: new Date().toISOString() }
              : s
          )
        );

        // Decrement balance by exactly 1 message per response
        setBillingState((prev) => ({
          ...prev,
          creditsRemaining: Math.max(0, prev.creditsRemaining - 1),
        }));

        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: serverPayloadMessages,
          systemInstruction: activeSession?.systemInstruction,
          enableSearch: activeSession?.enableSearch,
          isThinkingActive: activeSession?.isThinkingActive,
          isDeepResearchActive: activeSession?.isDeepResearchActive,
          temperature: activeSession?.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error code ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: data.text || "No output returned from Core engine.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingMetadata: data.groundingMetadata,
      };

      setLatestMessageId(assistantMsg.id);

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...updatedMessages, assistantMsg], updatedAt: new Date().toISOString() }
            : s
        )
      );

      // Decrement balance by exactly 1 message per response
      setBillingState((prev) => ({
        ...prev,
        creditsRemaining: Math.max(0, prev.creditsRemaining - 1),
      }));

    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: err.message || "An unexpected planetary drift blocked signal processing. Please retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, messages: [...updatedMessages, errorMsg] } : s
        )
      );
    } finally {
      setIsGenerating(false);
      setGeneratingImageType(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGlobalUploadChange = (e: React.ChangeEvent<HTMLInputElement>, isPhoto: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNotification({ message: `Received "${file.name}". Analysing contents...`, type: "success" });

    const isImage = file.type.startsWith("image/") || isPhoto;
    
    // Create elegant message block
    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: isImage 
        ? `![Uploaded Photo](https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60) [Photo attached: "${file.name}"]`
        : `📎 [Document attached: "${file.name}"]`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update session title dynamically if start of chat
    let newTitle = activeSession?.title || "Active chat";
    if (activeSession?.messages.length === 0) {
      newTitle = `Attached ${file.name}`;
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { 
              ...s, 
              messages: [...(s.messages || []), userMsg], 
              title: newTitle,
              updatedAt: new Date().toISOString() 
            }
          : s
      )
    );

    // Trigger elegant simulated typing message from assistant to describe the document
    setIsGenerating(true);
    setTimeout(() => {
      const assistantMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: isImage
          ? `### 🖼️ Vision Frame Calibration Complete\n\nI have successfully scanned the attached photo **${file.name}** through Velora's high-contrast vision pipeline. All pixels parsed correctly.\n\nWhat would you like me to detect, modify, or examine in this photo?`
          : `### 📎 Document Integration Active\n\nI have finished scanning **${file.name}** (${(file.size / 1024).toFixed(1)} KB).\n\n- **Inference Status**: Securely parsed & read\n- **Entity analysis**: Standard keywords extracted\n\nFeel free to ask questions or request summaries of specific pages/sections.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...(s.messages || []), assistantMsg], updatedAt: new Date().toISOString() }
            : s
        )
      );
      setIsGenerating(false);
    }, 1500);

    // Reset input value so same file can be selected again if needed
    e.target.value = "";
  };

  if (!activeSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070b13] text-slate-350 font-sans">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
          <span className="text-xs font-mono tracking-wider">Synchronizing Velora GPT Systems...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="velora-core-desktop-app" 
      className="flex h-screen w-screen overflow-hidden bg-black font-sans antialiased text-slate-100"
    >
      {/* SIDEBAR COMPONENT (Hidden recursively on small displays, triggered via drawers) */}
      <div className="hidden md:block">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onUpdateSessionTitle={handleUpdateSessionTitle}
          userEmail="gauthamgautham242011@gmail.com"
          currentView={currentView}
          onChangeView={(view) => {
            setCurrentView(view);
            setShowTuningPanel(false);
          }}
        />
      </div>

      {/* MOBILE DRAWER SIDEBAR */}
      {isSidebarMobileOpen && (
        <div id="sidebar-mobile-drawer" className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop glass click fallback */}
          <div 
            onClick={() => setIsSidebarMobileOpen(false)}
            className="absolute inset-0 bg-[#020617]/70 backdrop-blur-sm transition-opacity"
          />
          
          <div className="relative w-80 h-full flex flex-col bg-[#171717] shadow-xl z-10 animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4 z-20">
              <button
                id="btn-close-mobile-menu"
                onClick={() => setIsSidebarMobileOpen(false)}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden h-full">
              <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
                onDeleteSession={handleDeleteSession}
                onUpdateSessionTitle={handleUpdateSessionTitle}
                userEmail="gauthamgautham242011@gmail.com"
                currentView={currentView}
                onChangeView={(view) => {
                  setCurrentView(view);
                  setShowTuningPanel(false);
                  setIsSidebarMobileOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE AND CHAT STAGE */}
      <div id="main-content-workspace" className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Dynamic Notification Hub Toast */}
        {notification && (
          <div 
            id="notification-toast-alert"
            className="absolute top-18 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300 pointer-events-none"
          >
            <div className={`p-3 px-5 rounded-xl text-xs font-semibold shadow-2xl border flex items-center gap-2.5 ${
              notification.type === "success" 
                ? "bg-slate-900 border-emerald-500/30 text-emerald-400" 
                : notification.type === "error" 
                  ? "bg-slate-900 border-rose-500/30 text-rose-400" 
                  : "bg-slate-900 border-blue-500/30 text-blue-400"
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                notification.type === "success" 
                  ? "bg-emerald-400 animate-pulse" 
                  : notification.type === "error" 
                    ? "bg-rose-400 animate-pulse" 
                    : "bg-blue-400 animate-pulse"
              }`} />
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Navigation / Thread Workspace Header */}
        <header 
          id="velora-top-navbar"
          className="h-16 border-b border-zinc-900 bg-black px-4 flex items-center justify-between select-none shrink-0 cursor-default"
        >
          <div className="flex items-center gap-3">
            {/* Mobile Menu Action */}
            <button
              id="mobile-drawer-hamburger"
              onClick={() => setIsSidebarMobileOpen(true)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-zinc-900 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Velora logo with name in the header */}
            <div className="flex items-center gap-2 border-r border-zinc-850 pr-3 mr-1 select-none">
              <VeloraLogo className="h-6 w-6 hover:scale-105 transition-all duration-200 cursor-pointer" />
              <span className="font-sans font-semibold tracking-tight text-white text-[12.5px] flex items-center gap-1">
                Velora <span className="text-zinc-400 font-medium bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-[9.5px]">Core</span>
              </span>
            </div>

            {/* Compact Messages indicator in header margins */}
            <span className="hidden sm:inline-block font-mono text-[10px] text-zinc-500 tracking-wider">
              {billingState.creditsRemaining.toLocaleString()} Messages
            </span>
          </div>

          {/* Right actions matching the screenshot's outline profile icon + options conversation bubble */}
          <div className="flex items-center gap-2">
            {/* Clear history option if messages are present & in active chat */}
            {currentView === "chat" && activeSession.messages.length > 0 && (
              <button
                id="btn-clear-history"
                onClick={handleClearThreadHistory}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                title="Clear logs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            {/* Profile trigger matching outline profile icon built elegantly */}
            <button
              id="profile-trigger-billing"
              onClick={() => {
                setCurrentView("billing");
                setShowTuningPanel(false);
              }}
              className={`h-9 w-9 rounded-full bg-[#171717] border flex items-center justify-center transition-all cursor-pointer ${
                currentView === "billing" ? "border-indigo-500 bg-indigo-950/20 text-indigo-300" : "border-zinc-800 hover:bg-zinc-800 text-slate-350 hover:text-white"
              }`}
              title="Profile & Payment State"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </button>

            {/* Assistant Role option trigger corresponding to screenshot's bubble options icon */}
            <button
              id="tuning-panel-toggle"
              onClick={() => {
                setShowTuningPanel(!showTuningPanel);
                setCurrentView("chat");
              }}
              className={`h-9 w-9 rounded-full bg-[#171717] border flex items-center justify-center transition-all cursor-pointer ${
                showTuningPanel && currentView === "chat" 
                  ? "border-indigo-500 bg-indigo-950/20 text-white" 
                  : "border-zinc-800 hover:bg-zinc-800 text-slate-350 hover:text-white"
              }`}
              title="Assistant Parameter Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Workspace Body: Displays Settings, Messages, or Billing Dashboard */}
        <div id="messages-container-outer" className="flex-1 overflow-hidden flex flex-col relative bg-black">
          
          {/* Collapsible Parameters Tuning Panel overlay */}
          {showTuningPanel && currentView === "chat" && (
            <div 
              id="top-tuning-panel-overlay"
              className="absolute top-0 inset-x-0 z-40 bg-[#121212] border-b border-zinc-800 shadow-2xl p-4 animate-in slide-in-from-top duration-300 text-slate-100"
            >
              <div className="max-w-4xl mx-auto">
                <SettingsPanel
                  session={activeSession}
                  onUpdateSessionConfig={handleUpdateSessionConfig}
                />
              </div>
            </div>
          )}

          {/* Scrolling messages viewport */}
          <div id="messages-view-scroll" className="flex-1 overflow-y-auto bg-black">
            
            {currentView === "math_sandbox" ? (
              <div className="max-w-6xl mx-auto p-4 md:p-6 pb-28 animate-in fade-in duration-300">
                <MathSandbox
                  onClose={() => setCurrentView("chat")}
                  setNotification={setNotification}
                />
              </div>
            ) : currentView === "art_studio" ? (
              <div className="max-w-6xl mx-auto p-4 md:p-6 pb-28 animate-in fade-in duration-300">
                <ArtStudio
                  onClose={() => setCurrentView("chat")}
                  setNotification={setNotification}
                />
              </div>
            ) : currentView === "billing" ? (
              <div className="max-w-4xl mx-auto p-4 md:p-6 pb-28 animate-in fade-in duration-300">
                <BillingDashboard
                  billingState={billingState}
                  onInitiateUpgrade={handleInitiateUpgrade}
                  onInitiateCreditPack={handleInitiateCreditPack}
                  isProcessing={isProcessingPayment}
                  onClose={() => setCurrentView("chat")}
                />
              </div>
            ) : activeSession.messages.length === 0 ? (
              <div className="py-12 md:py-16 animate-in fade-in duration-300">
                <IntroState
                  session={activeSession}
                  onSuggestionClick={(suggestion) => {
                    setInputMessage(suggestion);
                    handleSendMessage(suggestion);
                  }}
                  onSimulateUpload={(fileName) => {
                    setNotification({ message: `Document "${fileName}" received. Analysing contents...`, type: "success" });
                    const prePrompt = `I have uploaded the doc "${fileName}". Standard cognitive scan requested. Please check and summarize.`;
                    setInputMessage(prePrompt);
                  }}
                  onCustomAction={(actionKey) => {
                    if (actionKey === "create_image") {
                      setPendingImagePrompt(true);
                      const userMsg: Message = {
                        id: generateId(),
                        role: "user",
                        content: "Generate a image",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      const assistantMsg: Message = {
                        id: generateId(),
                        role: "assistant",
                        content: "What kind of image do you want me to generate?\nYou can describe anything — logo, wallpaper, anime, realistic photo, futuristic AI art, car, character, etc.",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      setSessions((prev) =>
                        prev.map((s) =>
                          s.id === activeSessionId
                            ? { ...s, messages: [userMsg, assistantMsg], updatedAt: new Date().toISOString() }
                            : s
                        )
                      );
                    } else if (actionKey === "write_edit") {
                      const userMsg: Message = {
                        id: generateId(),
                        role: "user",
                        content: "Write or edit",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      const assistantMsg: Message = {
                        id: generateId(),
                        role: "assistant",
                        content: "I am ready to write, edit, or refactor code and text for you. What code snippet, essay, or email should we work on?",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      setSessions((prev) =>
                        prev.map((s) =>
                          s.id === activeSessionId
                            ? { ...s, messages: [userMsg, assistantMsg], updatedAt: new Date().toISOString() }
                            : s
                        )
                      );
                    } else if (actionKey === "look_up") {
                      handleUpdateSessionConfig({ enableSearch: true });
                      setNotification({ message: "Web grounding search engine live.", type: "success" });
                      const userMsg: Message = {
                        id: generateId(),
                        role: "user",
                        content: "Look something up",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      const assistantMsg: Message = {
                        id: generateId(),
                        role: "assistant",
                        content: "I've enabled Web Search. What topic or current event would you like me to research for you?",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      };
                      setSessions((prev) =>
                        prev.map((s) =>
                          s.id === activeSessionId
                            ? { ...s, messages: [userMsg, assistantMsg], updatedAt: new Date().toISOString() }
                            : s
                        )
                      );
                    }
                  }}
                />
              </div>
            ) : (
              <div id="actual-messages-list" className="divide-y divide-zinc-950 bg-black">
                {activeSession.messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    activeRoleId={activeSession.assistantRole}
                    isNew={msg.id === latestMessageId}
                    onTypingComplete={() => setLatestMessageId(null)}
                    setNotification={setNotification}
                  />
                ))}

                {/* Simulated Core generation thinking visualizer or Creating image */}
                {isGenerating && generatingImageType && (
                  <div id="loader-creating-image" className="p-4 bg-zinc-950/20 border-b border-zinc-900 transition-colors">
                    <div className="flex items-start gap-4 max-w-4xl mx-auto w-full">
                      <div className="shrink-0 animate-pulse">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] border border-zinc-800 text-white shadow shadow-black/20">
                          <VeloraLogo className="h-5.5 w-5.5" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3 mt-1">
                        <div className="flex items-center gap-2 select-none">
                          <span className="text-[12px] font-semibold text-white">
                            {ASSISTANT_ROLES.find(r => r.id === activeSession.assistantRole)?.name || "Velora-Core"}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">Synthesizing...</span>
                        </div>
                        
                        {/* ChatGPT Style "Creating image" container block */}
                        <div className="w-full max-w-md aspect-square max-h-[365px] rounded-2xl bg-[#0d0d0e] border border-zinc-850 flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-2xl animate-pulse">
                          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.03] via-transparent to-emerald-500/[0.03]" />
                          
                          <div className="relative">
                            <div className="h-12 w-12 rounded-full border border-zinc-800 flex items-center justify-center relative bg-black">
                              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-400 animate-spin" />
                              <div className="absolute inset-1 rounded-full border border-transparent border-b-indigo-400 border-l-indigo-400 animate-spin [animation-duration:1.8s]" />
                              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
                            </div>
                          </div>
                          
                          <div className="text-center z-10 px-4">
                            <span className="text-xs font-semibold text-zinc-200 tracking-tight font-sans block animate-pulse">
                              Creating image
                            </span>
                            <span className="text-[10px] text-zinc-500 block font-mono mt-1 max-w-[260px] truncate mx-auto">
                              "{generatingImageType}"
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isGenerating && !generatingImageType && (
                  <div id="loader-generating-message" className="p-4 bg-zinc-900/30 border-b border-zinc-900 transition-colors">
                    <div className="flex items-start gap-4 max-w-4xl mx-auto w-full">
                      <div className="shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] border border-zinc-800 text-white shadow shadow-black/20 animate-pulse">
                          <VeloraLogo className="h-5.5 w-5.5" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-white">
                            {ASSISTANT_ROLES.find(r => r.id === activeSession.assistantRole)?.name || "Velora-Core"}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-1.5 bg-[#1f1f23] px-2 py-0.5 rounded-full border border-zinc-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Typing{typingDots}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 w-32 bg-zinc-900 rounded animate-pulse" />
                          <div className="h-2 w-64 bg-zinc-900 rounded animate-pulse delay-75" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Chat Bar input panel styled as a ChatGPT capsule sleeve */}
          {currentView === "chat" && (
            <div 
              id="chat-input-bar-container"
              className="p-4 bg-gradient-to-t from-black via-black/95 to-transparent shrink-0"
            >
              <div className="max-w-4xl mx-auto relative">
                {/* Moved Workspace Apps widgets to the dedicated Sidebar space to declutter the core workspace */}

                <div 
                  id="input-container-inner"
                  className="relative rounded-[28px] border border-zinc-800 bg-[#171717] p-2 pr-3 flex items-center justify-between gap-2 shadow-2xl focus-within:border-zinc-700 transition-all"
                >
                  {/* Left attachment trigger "+" matching the screenshot */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowAttachmentMenu(!showAttachmentMenu);
                    }}
                    className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      showAttachmentMenu 
                        ? "bg-zinc-800 text-white rotate-45" 
                        : "bg-zinc-805 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                    title="Open capabilities and attachments"
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </button>

                  <textarea
                    id="chat-textarea-input"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={1}
                    placeholder="Ask Velora Ai"
                    className="flex-1 resize-none bg-transparent border-0 py-2 px-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-0 min-h-[36px] max-h-32 leading-relaxed"
                  />

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Simulated Microphone Speech Recognition Trigger */}
                    <button
                      type="button"
                      onClick={() => {
                        setNotification({ message: "Calibrating mic telemetry... Say something clearly.", type: "info" });
                      }}
                      className="h-8 w-8 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Microphone voice dictation"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.0"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                        <line x1="12" y1="19" x2="12" y2="22" />
                      </svg>
                    </button>

                    {/* Speech Conversational Audio wave matching screenshot waves */}
                    <button
                      type="button"
                      onClick={() => {
                        setNotification({ message: "Velora Cosmic-Audio voice call streaming synchronized.", type: "success" });
                      }}
                      className="h-8 w-8 rounded-full bg-zinc-800 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      title="Audio conversations"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4.5 w-4.5 text-zinc-300"
                      >
                        <line x1="4" y1="9" x2="4" y2="15" />
                        <line x1="9" y1="6" x2="9" y2="18" />
                        <line x1="14" y1="4" x2="14" y2="20" />
                        <line x1="19" y1="7" x2="19" y2="17" />
                      </svg>
                    </button>

                    {/* Send message button */}
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isGenerating}
                      className={`h-8 w-8 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                        inputMessage.trim() && !isGenerating
                          ? "bg-white text-black hover:scale-105"
                          : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      }`}
                      title="Send Message"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Indicators Footer */}
                <div className="flex items-center justify-between text-[10px] text-zinc-650 px-2 mt-2 font-mono select-none">
                  <span className="flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Velora core link live
                  </span>
                  <span>Enter to dispatch • Shift+Enter to newline</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation managed cohesively via modern sidebar layout */}
        </div>
      </div>

      <AttachmentMenu
        isOpen={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        isThinkingActive={!!activeSession?.isThinkingActive}
        onToggleThinking={() => {
          const newVal = !activeSession?.isThinkingActive;
          handleUpdateSessionConfig({ isThinkingActive: newVal });
          setNotification({ 
            message: newVal ? "Thinking Process intelligence activated." : "Standard inference active.", 
            type: newVal ? "success" : "info" 
          });
        }}
        isDeepResearchActive={!!activeSession?.isDeepResearchActive}
        onToggleDeepResearch={() => {
          const newVal = !activeSession?.isDeepResearchActive;
          handleUpdateSessionConfig({ isDeepResearchActive: newVal });
          setNotification({ 
            message: newVal ? "Deep Research multi-step analysis activated." : "Direct response active.", 
            type: newVal ? "success" : "info" 
          });
        }}
        isWebSearchActive={!!activeSession?.enableSearch}
        onToggleWebSearch={() => {
          const newVal = !activeSession?.enableSearch;
          handleUpdateSessionConfig({ enableSearch: newVal });
          setNotification({ 
            message: newVal ? "Web grounding search engine live." : "Internal weights primary grounding active.", 
            type: newVal ? "success" : "info" 
          });
        }}
        onUpgradeClick={() => {
          setCurrentView("billing");
          setNotification({ message: "Welcome to Velora Elite center. Configure subscription bounds.", type: "info" });
        }}
        onCameraClick={() => {
          setNotification({ message: "Lens sensor calibrated. Captured space visual frame successfully!", type: "success" });
          const fakeMsg: Message = {
            id: generateId(),
            role: "user",
            content: "![Camera Frame](https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=60) [Camera snapshot attached]",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, fakeMsg], updatedAt: new Date().toISOString() }
                : s
            )
          );
        }}
        onPhotosClick={() => {
          const fileInput = document.getElementById("persistent-photo-uploader") as HTMLInputElement | null;
          if (fileInput) {
            fileInput.click();
            setNotification({ message: "Opening secure photos gallery selector...", type: "info" });
          } else {
            setNotification({ message: "Velora Photos library initialised successfully.", type: "success" });
          }
        }}
        onFilesClick={() => {
          const fileInput = document.getElementById("persistent-file-uploader") as HTMLInputElement | null;
          if (fileInput) {
            fileInput.click();
            setNotification({ message: "Opening secure file storage portal...", type: "info" });
          } else {
            setNotification({ message: "Velora File storage portal initialised successfully.", type: "success" });
          }
        }}
        onVideosClick={() => {
          setNotification({ message: "Real-time recording established! Video clip cached successfully.", type: "success" });
          const fakeMsg: Message = {
            id: generateId(),
            role: "user",
            content: "🎬 [Live-video frame attached successfully]",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, fakeMsg], updatedAt: new Date().toISOString() }
                : s
            )
          );
        }}
        onOpenAIPlatformClick={() => {
          setNotification({ message: "Connecting to OpenAI platform API socket...", type: "success" });
          const modelNotice: Message = {
            id: generateId(),
            role: "assistant",
            content: "### 🌌 OpenAI Platform Bridge Initialized\n\nWelcome to the developer diagnostics dashboard. I have successfully established a loopback socket to `platform.openai.com` telemetry streams.\n\n- **Project Scope**: `velora-hybrid-6`\n- **Active API Weights**: Simulated dynamic routing (hybrid Gemini-OpenAI cross-channel fallback)\n- **Diagnostic Key Status**: OK (secured)",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? { ...s, messages: [...s.messages, modelNotice], updatedAt: new Date().toISOString() }
                : s
            )
          );
        }}
        onExploreAppsClick={() => {
          setNotification({ message: "Loaded specialized assistants index nodes.", type: "success" });
          setShowTuningPanel(true);
        }}
      />

      {/* Persistent global secure file inputs */}
      <input
        type="file"
        id="persistent-photo-uploader"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleGlobalUploadChange(e, true)}
      />
      <input
        type="file"
        id="persistent-file-uploader"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv,.json,.xlsx"
        onChange={(e) => handleGlobalUploadChange(e, false)}
      />
    </div>
  );
}
