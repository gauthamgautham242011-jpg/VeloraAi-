export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  groundingMetadata?: GroundingMetadata | null;
  isError?: boolean;
  type?: "text" | "image";
  image?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SupportSegment {
  segment: {
    startIndex?: number;
    endIndex?: number;
    text?: string;
  };
  groundingChunkIndices?: number[];
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  groundingChunks?: GroundingChunk[];
  groundingSupports?: SupportSegment[];
}

export type AssistantRoleId = "general" | "coder" | "writer" | "scientist" | "mentor";

export interface AssistantRole {
  id: AssistantRoleId;
  name: string;
  description: string;
  systemPrompt: string;
  avatarColor: string;
  gradient: string;
  badge: string;
  suggestions: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string;
  systemInstruction?: string;
  enableSearch?: boolean;
  isThinkingActive?: boolean;
  isDeepResearchActive?: boolean;
  assistantRole: AssistantRoleId;
  temperature?: number;
}

export type BillingTierId = "free" | "plus" | "elite";

export interface BillingPlan {
  id: BillingTierId;
  name: string;
  price: string;
  interval?: "month";
  desc: string;
  limits: string[];
  stripePriceId?: string; // Real Stripe price ID reference
  color: string;
  borderClass: string;
  badgeClass: string;
}

export interface CreditPack {
  id: string;
  name: string;
  amount: number;
  price: string;
  stripePriceId?: string;
  popularityBadge?: boolean;
}

export interface UserTransaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  type: "subscription" | "credits";
}

export interface UserBillingState {
  currentTier: BillingTierId;
  creditsRemaining: number;
  creditsMax: number;
  stripeConnected: boolean;
  history: UserTransaction[];
  lastResetDate?: string;
}

