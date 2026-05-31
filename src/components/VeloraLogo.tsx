import React from "react";

interface VeloraLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function VeloraLogo({ className = "", size = "md" }: VeloraLogoProps) {
  // Map sizes if className is empty
  let sizeClasses = "h-8 w-8";
  if (size === "sm") sizeClasses = "h-5 w-5";
  else if (size === "md") sizeClasses = "h-8 w-8";
  else if (size === "lg") sizeClasses = "h-14 w-14";
  else if (size === "xl") sizeClasses = "h-20 w-20";

  const resolvedClass = className || sizeClasses;

  return (
    <svg
      viewBox="0 0 512 512"
      className={`${resolvedClass} select-none shrink-0`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        {/* Soft elegant drop shadow */}
        <filter id="logo-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.25" />
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.15" />
        </filter>

        {/* Full sweep of rich premium vibrant gradients replicating the exact colors of the reference logo */}
        
        {/* Blue to Green (Top left corner transition) */}
        <linearGradient id="gradient-blue-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" /> {/* Emerald Green */}
          <stop offset="60%" stopColor="#0ea5e9" /> {/* Sky Blue */}
          <stop offset="100%" stopColor="#2563eb" /> {/* Royal Blue */}
        </linearGradient>

        {/* Orange to Red to Purple (Bottom right loop) */}
        <linearGradient id="gradient-warm-spectrum" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
          <stop offset="40%" stopColor="#f97316" /> {/* Orange */}
          <stop offset="100%" stopColor="#eab308" /> {/* Yellow */}
        </linearGradient>

        {/* Purple/Violet to Pink (Bottom left transition) */}
        <linearGradient id="gradient-cool-spectrum" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" /> {/* Violet */}
          <stop offset="50%" stopColor="#ec4899" /> {/* Pink */}
          <stop offset="100%" stopColor="#f43f5e" /> {/* Rose */}
        </linearGradient>

        {/* Indigo to Blue */}
        <linearGradient id="gradient-indigo-blue" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" /> {/* Indigo */}
          <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan */}
        </linearGradient>

        {/* Multi-layered custom sweep gradient wrappers */}
        <linearGradient id="g-green-yellow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#84cc16" /> {/* Lime */}
          <stop offset="105%" stopColor="#10b981" /> {/* Green */}
        </linearGradient>
      </defs>

      {/* Main Container Layer with applied shadow */}
      <g filter="url(#logo-glow)">
        {/* We build a composite path representational structure of the Mobius rounded-corner triangle. */}
        {/* Segment 1: Green-to-Blue sweep */}
        <path
          d="M 256,70 
             C 310,70 410,240 440,290 
             C 470,340 432,410 370,410 
             C 320,410 192,410 142,410 
             C 80,410 42,340 72,290 
             C 102,240 202,70 256,70 Z"
          stroke="url(#gradient-blue-green)"
          strokeWidth="68"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.94"
        />

        {/* Segment 2: Warm sweep (Orange to Red corner curve overlay) */}
        <path
          d="M 370,410 
             C 432,410 470,340 440,290 
             C 410,240 310,70 256,70 
             C 210,70 170,140 140,195"
          stroke="url(#gradient-warm-spectrum)"
          strokeWidth="62"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.96"
        />

        {/* Segment 3: Deep purples & pink layers overlay to create standard 3D depth */}
        <path
          d="M 142,410
             C 80,410 42,340 72,290
             C 102,240 202,70 256,70"
          stroke="url(#gradient-cool-spectrum)"
          strokeWidth="54"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.92"
        />

        {/* Segment 4: Dynamic Inner core boundary sweep making the circular cutout sharp and clean */}
        <path
          d="M 256,155
             C 310,155 354,199 354,256
             C 354,313 310,357 256,357
             C 202,357 158,313 158,256
             C 158,199 202,155 256,155 Z"
          stroke="url(#gradient-indigo-blue)"
          strokeWidth="28"
          opacity="0.88"
        />

        {/* Segment 5: Highlight swirl overlays for premium dimension */}
        <path
          d="M 180,180
             C 210,140 290,140 320,180
             C 350,220 370,300 320,340
             C 280,370 220,350 190,320"
          stroke="url(#g-green-yellow)"
          strokeWidth="32"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}
