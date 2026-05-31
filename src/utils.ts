import { AssistantRole, ChatSession } from "./types";

export const ASSISTANT_ROLES: AssistantRole[] = [
  {
    id: "general",
    name: "Velora-Core",
    description: "Versatile, articulate general-purpose intelligence for all tasks.",
    systemPrompt: "You are Velora-Gpt-6, a state-of-the-art galactic conversational AI model. You speak with high intelligence, professional warmth, clarity, and exceptional structure. Always structure your responses beautifully with appropriate headings, bold sections, and clear paragraphs.",
    avatarColor: "bg-blue-600",
    gradient: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
    badge: "General IQ",
    suggestions: [
      "Show me the latest AI news",
      "Generate an image of a futuristic AI city at night",
      "Explain machine learning simply",
      "Tell me a cosmic story"
    ]
  },
  {
    id: "coder",
    name: "Aether-Code",
    description: "Expert software craftsperson, algorithm specialist, and debugger.",
    systemPrompt: "You are Velora-Gpt-6 Code Intelligence (Aether-Code). You are an industry-leading software engineer. When writing code, provide clean, optimal, and secure code blocks with comments. Identify potential bugs, edge cases, and describe complexity clearly.",
    avatarColor: "bg-emerald-600",
    gradient: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    badge: "Syntax Eng",
    suggestions: [
      "Write a React hooks custom form state",
      "Explain the Big O of QuickSort vs MergeSort",
      "Find the bug in this asynchronous JS loop",
      "Provide a secure JWT verify Express middleware"
    ]
  },
  {
    id: "writer",
    name: "Nebula-Scribe",
    description: "Eloquently creative copywriter, storyteller, and content editor.",
    systemPrompt: "You are Velora-Gpt-6 Creative Scribe (Nebula-Scribe). You possess rich vocabulary, deep empathy, and poetic fluency. Create highly engaging, descriptive, and emotionally resonance copy, tales, or marketing collateral based on user prompts.",
    avatarColor: "bg-purple-600",
    gradient: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    badge: "Creative",
    suggestions: [
      "Draft a futuristic sci-fi poem",
      "Write a catchy landing page headline for a fitness app",
      "Outline a mystery thriller synopsis",
      "Compose an apology email with deep warmth"
    ]
  },
  {
    id: "scientist",
    name: "Prism- Scholar",
    description: "Rigorous scientific advisor, data analyst, and mathematical proof assistant.",
    systemPrompt: "You are Velora-Gpt-6 prism scientific intelligence (Prism-Scholar). Speak with objective analytical precision. Break down complex math, physics, biology, and chemistry concepts. Use step-by-step reasoning (Chain of Thought) to justify your formulations.",
    avatarColor: "bg-amber-600",
    gradient: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    badge: "Research",
    suggestions: [
      "Solve and explain: Schrödinger wave equation bases",
      "Explain CRISPR gene editing mechanisms",
      "Convert the physics of drag coefficient simply",
      "How does carbon dating actually work?"
    ]
  },
  {
    id: "mentor",
    name: "Hyperion-Advisor",
    description: "Strategic executive coach, productivity engineer, and startup wizard.",
    systemPrompt: "You are Velora-Gpt-6 hyperion consulting (Hyperion-Advisor). You are an executive business consultant, productivity coordinator, and career developer. Focus on structured action items, measurable results, strategic frameworks, and empowering guidance.",
    avatarColor: "bg-rose-600",
    gradient: "from-rose-500/20 to-orange-500/20 border-rose-500/30",
    badge: "Strategist",
    suggestions: [
      "Analyze a SaaS business model strategy",
      "Plan a realistic morning routine for workaholics",
      "Draft a 30-60-90 day engineering plan",
      "Tips for presenting a pitch deck to VCs"
    ]
  }
];

// Helper to split a string into code and text sections
export interface MarkdownBlock {
  type: "text" | "code";
  content: string;
  language?: string;
}

export function parseMarkdownToBlocks(text: string): MarkdownBlock[] {
  if (!text) return [];
  const parts = text.split(/```/);
  const blocks: MarkdownBlock[] = [];

  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      // It is a code block
      const breakIndex = part.indexOf("\n");
      let language = "text";
      let content = part;

      if (breakIndex !== -1) {
        language = part.substring(0, breakIndex).trim().toLowerCase() || "text";
        content = part.substring(breakIndex + 1);
      }

      blocks.push({
        type: "code",
        content: content.trim(),
        language,
      });
    } else {
      // It is plain text block
      if (part) {
        blocks.push({
          type: "text",
          content: part,
        });
      }
    }
  });

  return blocks;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function createNewSession(roleId: keyof typeof ASSISTANT_ROLES | string = "general"): ChatSession {
  const selectedRole = ASSISTANT_ROLES.find(r => r.id === roleId) || ASSISTANT_ROLES[0];
  return {
    id: generateId(),
    title: `New session (${selectedRole.name})`,
    messages: [],
    updatedAt: new Date().toISOString(),
    systemInstruction: selectedRole.systemPrompt,
    enableSearch: false,
    isThinkingActive: false,
    isDeepResearchActive: false,
    assistantRole: selectedRole.id,
    temperature: 0.7,
  };
}
