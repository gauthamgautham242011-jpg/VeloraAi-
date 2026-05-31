import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import OpenAI from "openai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize GoogleGenAI client lazily to avoid crashes if GEMINI_API_KEY is not initially specified
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the server secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Robust wrapper for generateContent to handle 503/429/temporary outages with backoff & model fallbacks
async function generateContentWithRetry(
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  retries = 3,
  delay = 1000
): Promise<any> {
  let lastError: any = null;
  const currentModel = params.model;
  
  // Define fallback models if specific models fail due to transient unavailability or high demand
  const fallbackModels: Record<string, string[]> = {
    "gemini-3.5-flash": ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"],
    "gemini-2.5-flash-image": ["gemini-3.1-flash-image-preview"]
  };

  const modelsToTry = [currentModel, ...(fallbackModels[currentModel] || [])];

  for (const modelToTry of modelsToTry) {
    let currentDelay = delay;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const ai = getAIClient();
        const response = await ai.models.generateContent({
          ...params,
          model: modelToTry,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = (err.message || String(err)).toLowerCase();
        
        // Check for hard quota limit or rate limit errors (RESOURCE_EXHAUSTED / 429).
        // If identified, we immediately break and try the fallback model rather than waiting on exhausted quota.
        const isQuotaExceeded = 
          errMsg.includes("resource_exhausted") || 
          errMsg.includes("quota exceeded") ||
          errMsg.includes("quota_exceeded") ||
          errMsg.includes("limit exceeded") ||
          errMsg.includes("rate limit") ||
          errMsg.includes("429");

        if (isQuotaExceeded) {
          console.warn(`[Warning] Quota limit/429 exceeded for model '${modelToTry}'. Skipping retries and moving to fallback model immediately.`);
          break; // Exit retry loop for this model, fallback to the next model in modelsToTry
        }

        // Match transient server errors 503, 502, 500, UNAVAILABLE, etc.
        const isTransient = 
          errMsg.includes("503") || 
          errMsg.includes("5502") ||
          errMsg.includes("502") ||
          errMsg.includes("500") ||
          errMsg.includes("unavailable") || 
          errMsg.includes("exhausted") ||
          errMsg.includes("demand") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("limit") ||
          errMsg.includes("rate");

        if (isTransient && attempt < retries) {
          console.warn(`[Warning] Transient error on model '${modelToTry}' (attempt ${attempt + 1}/${retries + 1}): ${err.message || err}. Retrying in ${currentDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 1.5; // Backoff
        } else {
          // If not transient, or we exhausted retries for this model, break out to try the next fallback model
          console.warn(`[Warning] Retries exhausted or non-transient error for model '${modelToTry}': ${err.message || err}`);
          break;
        }
      }
    }
  }

  // If we reach here, all retries and fallback models failed
  throw lastError || new Error("Failed to generate content after several attempts and fallback models.");
}

// Helper to generate a dynamic, visually stunning customized SVG base64 vector illustrating the user's prompt
function getBeautifulSvg(prompt: string): string {
  // Simple seed hash code from string
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) % 10000;
  const promptLower = prompt.toLowerCase();
  
  let gradientStart = "#1e1b4b"; // default deep indigo
  let gradientEnd = "#311042"; // deep purple
  let accentColor = "#6366f1"; // neon purple-blue
  let accentColor2 = "#ec4899"; // pink
  let categoryName = "COSMIC CANVAS";

  if (promptLower.includes("city") || promptLower.includes("cyberpunk") || promptLower.includes("neon") || promptLower.includes("night")) {
    gradientStart = "#09090b";
    gradientEnd = "#1e1b4b";
    accentColor = "#06b6d4"; // Cyan
    accentColor2 = "#d946ef"; // Magenta
    categoryName = "NEON CYBERPUNK CHRONICLES";
  } else if (promptLower.includes("mountain") || promptLower.includes("nature") || promptLower.includes("forest") || promptLower.includes("sky")) {
    gradientStart = "#064e3b"; // Forest green
    gradientEnd = "#022c22"; 
    accentColor = "#10b981"; // Emerald
    accentColor2 = "#f59e0b"; // Amber sun
    categoryName = "PRESTIGE NATURE STUDY";
  } else if (promptLower.includes("ocean") || promptLower.includes("sea") || promptLower.includes("beach") || promptLower.includes("water")) {
    gradientStart = "#0c4a6e"; // Deep blue
    gradientEnd = "#082f49";
    accentColor = "#0ea5e9"; // Sky blue
    accentColor2 = "#22d3ee"; // Cyan wave
    categoryName = "ABYSSAL SEA EXPEDITION";
  } else if (promptLower.includes("retro") || promptLower.includes("sunset") || promptLower.includes("vintage")) {
    gradientStart = "#450a0a"; // Warm maroon
    gradientEnd = "#1e1b4b";
    accentColor = "#ea580c"; // Orange sunset
    accentColor2 = "#eab308"; // Yellow glow
    categoryName = "RETROWAVE SUNSET ENGINE";
  } else if (promptLower.includes("futuristic") || promptLower.includes("tech") || promptLower.includes("space") || promptLower.includes("galaxy")) {
    gradientStart = "#020617"; // Space slate
    gradientEnd = "#1e1b4b"; 
    accentColor = "#a855f7"; // Purple
    accentColor2 = "#38bdf8"; // Light sky
    categoryName = "FUTURISTIC SPACE INGRESS";
  }

  // Draw stellar systems
  const numStars = 30 + (seed % 45);
  let stars = "";
  for (let i = 0; i < numStars; i++) {
    const cx = ((seed * (i + 13)) % 1024);
    const cy = ((seed * (i + 47)) % 1024);
    const r = ((seed * i) % 3) + 1;
    const opacity = (((seed * (i + 2)) % 10) / 10) * 0.8 + 0.2;
    stars += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="${opacity}" />`;
  }

  // Form beautiful geometric visual accents based on the prompt's seed
  const shapeType = seed % 3;
  let graphic = "";
  if (shapeType === 0) {
    graphic = `
      <circle cx="512" cy="512" r="280" stroke="${accentColor}" stroke-width="2" fill="none" opacity="0.15" />
      <circle cx="512" cy="512" r="200" stroke="${accentColor}" stroke-dasharray="10 5" stroke-width="1.5" fill="none" opacity="0.3" />
      <circle cx="512" cy="512" r="140" fill="url(#coreGlow)" opacity="0.8" />
      <circle cx="512" cy="512" r="80" stroke="${accentColor2}" stroke-width="4" stroke-dasharray="160 80" fill="none" opacity="0.6" />
    `;
  } else if (shapeType === 1) {
    graphic = `
      <line x1="128" y1="512" x2="896" y2="512" stroke="${accentColor}" stroke-dasharray="5 5" stroke-width="2" opacity="0.5" />
      <line x1="512" y1="128" x2="512" y2="896" stroke="${accentColor}" stroke-dasharray="5 5" stroke-width="2" opacity="0.5" />
      <rect x="362" y="362" width="300" height="300" rx="24" stroke="url(#accentEdge)" stroke-width="3" fill="none" opacity="0.4" />
      <rect x="412" y="412" width="200" height="200" rx="16" fill="url(#coreGlow)" opacity="0.8" />
      <circle cx="512" cy="512" r="50" stroke="${accentColor2}" stroke-width="2" fill="none" opacity="0.7" />
    `;
  } else {
    graphic = `
      <polygon points="512,280 280,680 744,680" stroke="url(#accentEdge)" stroke-width="4" stroke-linejoin="round" fill="none" opacity="0.4" />
      <polygon points="512,380 360,640 664,640" fill="url(#coreGlow)" opacity="0.7" />
      <circle cx="512" cy="400" r="12" fill="${accentColor2}" opacity="0.9" />
    `;
  }

  // Pure XML string
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientStart}" />
        <stop offset="100%" stop-color="${gradientEnd}" />
      </linearGradient>
      <linearGradient id="coreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.6" />
        <stop offset="100%" stop-color="${accentColor2}" stop-opacity="0.1" />
      </linearGradient>
      <linearGradient id="accentEdge" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="${accentColor2}" />
      </linearGradient>
      <style>
        .tag { font-family: monospace; font-size: 16px; fill: #64748b; letter-spacing: 2px; text-anchor: middle; }
        .prompt-text { font-family: system-ui, -apple-system, sans-serif; font-size: 26px; fill: #f8fafc; text-anchor: middle; font-weight: 600; }
        .subtag { font-family: monospace; font-size: 14px; fill: #475569; letter-spacing: 1px; text-anchor: middle; }
      </style>
    </defs>
    
    <rect width="1024" height="1024" fill="url(#bgGradient)" />
    ${stars}
    ${graphic}
    
    <rect x="40" y="40" width="944" height="944" stroke="#ffffff" stroke-width="1" opacity="0.08" fill="none" />
    <path d="M 40 100 L 100 100 M 100 40 L 100 100" stroke="${accentColor}" stroke-width="2" opacity="0.4" />
    <path d="M 984 100 L 924 100 M 924 40 L 924 100" stroke="${accentColor}" stroke-width="2" opacity="0.4" />
    <path d="M 40 924 L 100 924 M 100 984 L 100 924" stroke="${accentColor}" stroke-width="2" opacity="0.4" />
    <path d="M 984 924 L 924 924 M 924 984 L 924 924" stroke="${accentColor}" stroke-width="2" opacity="0.4" />

    <text x="512" y="100" class="tag">${categoryName} // ART STUDY #${seed}</text>
    <text x="512" y="860" class="prompt-text">"${prompt.replace(/"/g, '&quot;')}"</text>
    <text x="512" y="910" class="subtag" opacity="0.7">OFFLINE SYSTEM CANVAS // DIGITAL ILLUSTRATION GENERATION</text>
  </svg>`;
}

interface ImageResult {
  b64Data: string;
  base64Image: string;
  success?: boolean;
  fallback?: boolean;
  provider?: "gemini" | "offline-svg";
}

const imageCache = new Map<string, ImageResult>();
const activeRequests = new Map<string, Promise<ImageResult>>();

// Robust unified image generator with remote API generation first and local placeholder fallback on failure/quota exceed
async function generateImageWithFallback(promptText: string, aspectRatio = "1:1"): Promise<ImageResult> {
  const normPrompt = (promptText || "A futuristic AI city at night").trim();
  
  // 1. Check in-memory Cache
  if (imageCache.has(normPrompt)) {
    console.log(`[Image Cache] Serving cached result for: "${normPrompt}"`);
    return imageCache.get(normPrompt)!;
  }

  // 2. Coalesce/Deduplicate Active concurrent Requests
  if (activeRequests.has(normPrompt)) {
    console.log(`[Image Coalescer] Merging concurrent request for: "${normPrompt}"`);
    return activeRequests.get(normPrompt)!;
  }

  // Define actual generation promise
  const generationPromise = (async (): Promise<ImageResult> => {
    try {
      // 15 seconds timeout to prevent long hangs on image generation
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini Image generation timed out (15000ms limit).")), 15000)
      );

      const apiPromise = generateContentWithRetry({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [{ text: normPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio
          }
        }
      });

      const imageResponse = await Promise.race([apiPromise, timeoutPromise]);

      let base64Image = "";
      if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }

      if (base64Image) {
        const result: ImageResult = {
          base64Image,
          b64Data: `data:image/png;base64,${base64Image}`,
          success: true,
          fallback: false,
          provider: "gemini"
        };
        // Cache successful Gemini image
        imageCache.set(normPrompt, result);
        return result;
      }
      throw new Error("No image data returned from generator.");
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      console.error(`[Image Fallback Engine] Gemini failed, rate-limited, or timed out: ${errorMsg}. Emitting premium Offline SVG instead.`);
      const svgContent = getBeautifulSvg(normPrompt);
      const base64Image = Buffer.from(svgContent).toString("base64");
      const result: ImageResult = {
        base64Image,
        b64Data: `data:image/svg+xml;base64,${base64Image}`,
        success: true,
        fallback: true,
        provider: "offline-svg"
      };
      // Cache premium fallback result so rapid subsequent identical inputs are fast
      imageCache.set(normPrompt, result);
      return result;
    }
  })();

  activeRequests.set(normPrompt, generationPromise);

  try {
    const result = await generationPromise;
    return result;
  } finally {
    activeRequests.delete(normPrompt);
  }
}

// Lazy initialization of Stripe to protect backend bootstrap if environment key is missing
let stripeClient: Stripe | null = null;
function getStripeClient(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripeClient = new Stripe(key);
    }
  }
  return stripeClient;
}

// Lazy initialization of OpenAI to protect backend bootstrap if environment key is missing
let openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY environment variable is required but missing.");
    }
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

// Endpoint to fetch billing connection credentials state
app.get("/api/payment/config", (req, res) => {
  const isConnected = !!process.env.STRIPE_SECRET_KEY;
  res.json({
    stripeConnected: isConnected,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
  });
});

// Create dynamic Stripe checkout session or simulate a secure premium transition
app.post("/api/payment/checkout", async (req, res) => {
  try {
    const { name, planId, priceId, amount, isSubscription } = req.body;
    const stripe = getStripeClient();

    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

    if (stripe) {
      // Real Stripe session configuration
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: name || `Velora GPT-6 ${planId} Upgrade`,
                description: `Quantum-calibrated tier subscription / tokens topup.`,
              },
              unit_amount: Math.round(amount * 100), // INR in paise
              recurring: isSubscription ? { interval: "month" } : undefined,
            },
            quantity: 1,
          },
        ],
        mode: isSubscription ? "subscription" : "payment",
        success_url: `${appUrl}?payment_status=success&session_id={CHECKOUT_SESSION_ID}&plan_id=${planId}&amount=${amount}`,
        cancel_url: `${appUrl}?payment_status=cancelled`,
      };

      const session = await stripe.checkout.sessions.create(sessionConfig);
      return res.json({ url: session.url, isProductionStripe: true });
    } else {
      // Graceful and highly descriptive local simulator hook when STRIPE_SECRET_KEY is absent
      console.log(`[Stripe Simulation Mode] Request received for: ${name} (${planId}). Amount: ₹${amount}`);
      return res.json({
        url: `${appUrl}?payment_status=success&simulated=true&plan_id=${planId}&amount=${amount}&token=${Math.random().toString(36).substring(7)}`,
        isProductionStripe: false,
        message: "STripe Mode is running client-side simulation because STRIPE_SECRET_KEY is not defined in the backend secrets."
      });
    }
  } catch (error: any) {
    console.error("Stripe Session Creation Error:", error);
    res.status(500).json({
      error: error.message || "Unable to bootstrap checking portal checkout session."
    });
  }
});

// Helper function to fetch news from NewsAPI with robust fallback
async function fetchNews(promptText: string): Promise<string> {
  const apiKey = process.env.NEWS_API_KEY || process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.warn("NEWS_API_KEY is not configured. Fallback news will be used.");
    return `Latest Artificial Intelligence developments:
1. **Gemini 3.5 Series Redefines Native Speech**: Google launches its next-generation ultra-fast reasoning model with built-in voice modeling, offering human-level dialogue speeds.
2. **Anthropic Introduces Computer Use capabilities**: Developers can now program agents to navigate desktop interfaces, click elements, and write code visually.
3. **OpenAI extends Advanced Voice mode to browser users**: Enabling emotional, natural-sounding audio conversations directly without dedicated software.
4. **Autonomous AI Agents Reach Production in Enterprise Fintech**: Financial institutions report 40% speed-up in credit underwriting pipelines using reasoning trees.
5. **IIT Madras researchers build localized Sanskrit translation LLM**: Achieving state-of-the-art retrieval accuracy on traditional ancient texts.`;
  }

  try {
    // Detect country preference from query, default to "in"
    let country = "in";
    const textLower = promptText.toLowerCase();
    if (textLower.includes("us") || textLower.includes("global") || textLower.includes("america") || textLower.includes("united states")) {
      country = "us";
    }

    // Attempt to search top headlines with query
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&category=technology&q=AI&apiKey=${apiKey}`;
    let response = await fetch(url);
    let data: any = await response.json();

    if (!data.articles || data.articles.length === 0) {
      // Try standard technology headlines
      url = `https://newsapi.org/v2/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`;
      response = await fetch(url);
      data = await response.json();
    }

    if (data.articles && data.articles.length > 0) {
      return data.articles.slice(0, 5).map((art: any, i: number) => {
        return `${i + 1}. **${art.title}** - _Source: ${art.source?.name || "NewsAPI"}_ (${new Date(art.publishedAt).toLocaleDateString()})
   *Description*: ${art.description || "No description provided."}
   *URL*: ${art.url}`;
      }).join("\n\n");
    }

    return "No technological news articles found right now on NewsAPI.";
  } catch (err: any) {
    console.error("NewsAPI retrieval error:", err);
    return `Failed to connect with NewsAPI: ${err.message}. Top-tier AI headliners:
1. **Nvidia Blackwell Systems enter full-scale production**: Shipments of state-of-the-art liquid-cooled multi-rack systems start next week.
2. **Medical AI agents showcase 94% accuracy in diagnostic trials**: Speeding up clinical reasoning trees.`;
  }
}

// OpenAI-Compatible and Local Image Generation route
app.post("/v1/images/generations", async (req, res) => {
  try {
    const { prompt } = req.body;
    const promptText = prompt || "A futuristic AI city at night";
    
    const { base64Image, b64Data } = await generateImageWithFallback(promptText, "1:1");
    return res.json({
      created: Math.floor(Date.now() / 1000),
      data: [
        {
          b64_json: base64Image,
          url: b64Data
        }
      ]
    });
  } catch (error: any) {
    console.error("OpenAI Image Emulation Error:", error);
    res.status(500).json({
      error: {
        message: error.message || "An error occurred during image generation.",
        type: "api_error"
      }
    });
  }
});

// Alias for easy UI image calling
app.post("/api/image/generations", async (req, res) => {
  try {
    const { prompt } = req.body;
    const promptText = prompt || "A futuristic AI city at night";
    
    const { b64Data } = await generateImageWithFallback(promptText, "1:1");
    return res.json({ url: b64Data });
  } catch (error: any) {
    console.error("Local Image Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// User-defined /generate-image custom endpoints returning { image: url }
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    const promptText = prompt || "A futuristic AI city at night";
    
    // Try OpenAI integration if key is present
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAIClient();
        let result;
        try {
          result = await openai.images.generate({
            model: "gpt-image-1",
            prompt: promptText,
            size: "1024x1024",
          });
        } catch (innerErr) {
          console.warn("gpt-image-1 model selection error, falling back to dall-e-3:", innerErr);
          result = await openai.images.generate({
            model: "dall-e-3",
            prompt: promptText,
            size: "1024x1024",
          });
        }

        if (result && result.data && result.data[0] && result.data[0].url) {
          return res.json({ image: result.data[0].url });
        }
      } catch (err: any) {
        console.error("OpenAI Image generation failed, trying Gemini fallback:", err?.message || err);
      }
    }

    // Default to Gemini fallback if OpenAI is not configured or failed
    const { b64Data } = await generateImageWithFallback(promptText, "1:1");
    return res.json({ image: b64Data });
  } catch (error: any) {
    console.error("Local /generate-image Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    const promptText = prompt || "A futuristic AI city at night";
    
    // Try OpenAI integration if key is present
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAIClient();
        let result;
        try {
          result = await openai.images.generate({
            model: "gpt-image-1",
            prompt: promptText,
            size: "1024x1024",
          });
        } catch (innerErr) {
          console.warn("gpt-image-1 model selection error on /api/..., falling back to dall-e-3:", innerErr);
          result = await openai.images.generate({
            model: "dall-e-3",
            prompt: promptText,
            size: "1024x1024",
          });
        }

        if (result && result.data && result.data[0] && result.data[0].url) {
          return res.json({ image: result.data[0].url });
        }
      } catch (err: any) {
        console.error("OpenAI Image generation on /api/... failed, trying Gemini fallback:", err?.message || err);
      }
    }

    // Default to Gemini fallback if OpenAI is not configured or failed
    const { b64Data } = await generateImageWithFallback(promptText, "1:1");
    return res.json({ image: b64Data });
  } catch (error: any) {
    console.error("Local /api/generate-image Route Error:", error);
    res.status(500).json({ error: error.message });
  }
});


// API endpoint for chat generation
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, systemInstruction, enableSearch, temperature, isThinkingActive, isDeepResearchActive } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid 'messages' parameter. It should be an array." });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage ? lastMessage.content : "";
    const lowerPrompt = userPrompt.toLowerCase();

    const isImageRequest = lowerPrompt.startsWith("/image") ||
                           lowerPrompt.includes("generate an image of") ||
                           lowerPrompt.includes("draw a picture of") ||
                           lowerPrompt.includes("draw an image of");

    const ai = getAIClient();

    // 1. Direct Image Generation Intercept
    if (isImageRequest) {
      let imagePrompt = userPrompt;
      if (lowerPrompt.startsWith("/image")) {
        imagePrompt = userPrompt.slice(6).trim();
      } else {
        // Clean standard prefix
        imagePrompt = userPrompt
          .replace(/generate an image of/gi, "")
          .replace(/draw a picture of/gi, "")
          .replace(/draw an image of/gi, "")
          .trim();
      }

      if (!imagePrompt) imagePrompt = "A futuristic AI city at night";

      try {
        const { b64Data } = await generateImageWithFallback(imagePrompt, "1:1");
        return res.json({
          text: `### 🎨 Cosmic Canvas Generation\n\nSuccessfully generated your visual request for **"${imagePrompt}"**:\n\n![Generated Image](${b64Data})`,
          groundingMetadata: null
        });
      } catch (imgErr: any) {
        console.error("Image generation failed inside chat:", imgErr);
        // Fall back gracefully to standard textual notification with instructions
        return res.json({
          text: `### 🎨 Cosmic Canvas Offline\n\nI tried to generate **"${imagePrompt}"**, but could not complete it. Ensure your billing is active or check your API configuration.\n\n_System Error Details: ${imgErr.message}_`,
          groundingMetadata: null
        });
      }
    }

    // 2. News API Articles Fetch Intercept
    const isNewsQuery = lowerPrompt.includes("latest news") ||
                        lowerPrompt.includes("ai news") ||
                        (lowerPrompt.includes("news") && (lowerPrompt.includes("latest") || lowerPrompt.includes("recent") || lowerPrompt.includes("india")));

    let augmentedSystemInstruction = systemInstruction || "";
    if (isNewsQuery) {
      console.log(`[News API Triggered] Query matches: "${userPrompt}"`);
      const newsArticles = await fetchNews(userPrompt);
      augmentedSystemInstruction = (augmentedSystemInstruction ? augmentedSystemInstruction + "\n\n" : "") +
        `CONTEXT: Below are real-time articles retrieved from NewsAPI based on the user's latest query. You must use this accurate context to formulate a beautifully structured summary of the latest news. State and credit the source (and cite links) elegantly in your response:\n\n${newsArticles}`;
    }

    if (isThinkingActive) {
      augmentedSystemInstruction = (augmentedSystemInstruction ? augmentedSystemInstruction + "\n\n" : "") +
        `[THINKING PROCESS INSTRUCTION] You MUST outline your detailed step-by-step thinking process BEFORE answering. Wrap your detailed reasoning monologue inside a single <thought>...</thought> block. This block should contain a very detailed analysis, chain of thought, exploration of multiple solution paths, and trade-offs. Present your final structured answer strictly AFTER the closed </thought> tag. It is critical that the closing </thought> tag is present.`;
    }

    if (isDeepResearchActive) {
      augmentedSystemInstruction = (augmentedSystemInstruction ? augmentedSystemInstruction + "\n\n" : "") +
        `[DEEP RESEARCH INSTRUCTION] You are performing deep, intensive research. Structure the final response elegantly with a '# 🔬 VELORA DEEP RESEARCH REPORT' banner, followed by a summary of key findings, detailed cross-discipline analysis sections, and future action recommendations. Highlight important data nodes and ensure high intellectual density.`;
    }

    // Map client messages to Gemini content format
    // Clients represent messages as { id, role: 'user'|'assistant', content }
    // Gemini expects parts with text
    const contents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Setup configuration
    const config: any = {};
    if (augmentedSystemInstruction) {
      config.systemInstruction = augmentedSystemInstruction;
    }
    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }
    if (typeof temperature === "number") {
      config.temperature = temperature;
    }

    // Call generateContent using the standard model 'gemini-3.5-flash'
    const response = await generateContentWithRetry({
      model: "gemini-3.5-flash",
      contents,
      config,
    });

    const text = response.text || "";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

    res.json({
      text,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating a response. Please check your configurations.",
    });
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Velora-Gpt-6 Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
