import React from "react";

// UrbanMind AI — Smart City SVG Logo
// City skyline inside a hexagon with a neural/circuit overlay
export default function Logo({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagon background */}
      <polygon
        points="18,2 32,10 32,26 18,34 4,26 4,10"
        fill="url(#hexGrad)"
        stroke="url(#hexStroke)"
        strokeWidth="0.8"
      />

      {/* City buildings */}
      {/* Left building */}
      <rect x="6" y="20" width="4" height="10" fill="white" opacity="0.15" rx="0.5" />
      <rect x="7" y="17" width="2" height="3" fill="white" opacity="0.2" rx="0.5" />

      {/* Center-left building */}
      <rect x="11" y="16" width="4" height="14" fill="white" opacity="0.2" rx="0.5" />
      <rect x="12" y="13" width="2" height="3" fill="white" opacity="0.25" rx="0.5" />

      {/* Center tall building */}
      <rect x="16" y="11" width="4" height="19" fill="white" opacity="0.3" rx="0.5" />
      {/* Antenna */}
      <line x1="18" y1="11" x2="18" y2="7" stroke="white" strokeWidth="0.8" opacity="0.5" />
      <circle cx="18" cy="6.5" r="1" fill="#4ECDC4" opacity="0.9" />

      {/* Center-right building */}
      <rect x="21" y="15" width="4" height="15" fill="white" opacity="0.2" rx="0.5" />
      <rect x="22" y="12" width="2" height="3" fill="white" opacity="0.25" rx="0.5" />

      {/* Right building */}
      <rect x="26" y="19" width="4" height="11" fill="white" opacity="0.15" rx="0.5" />

      {/* Ground line */}
      <line x1="5" y1="30" x2="31" y2="30" stroke="white" strokeWidth="0.6" opacity="0.2" />

      {/* Neural network dots — circuit overlay */}
      <circle cx="18" cy="17" r="1.2" fill="#4ECDC4" opacity="0.9" />
      <circle cx="13" cy="21" r="0.8" fill="#A78BFA" opacity="0.8" />
      <circle cx="23" cy="21" r="0.8" fill="#A78BFA" opacity="0.8" />
      <circle cx="10" cy="25" r="0.7" fill="#FF6B35" opacity="0.7" />
      <circle cx="26" cy="25" r="0.7" fill="#FF6B35" opacity="0.7" />

      {/* Connection lines */}
      <line x1="18" y1="17" x2="13" y2="21" stroke="#4ECDC4" strokeWidth="0.5" opacity="0.5" />
      <line x1="18" y1="17" x2="23" y2="21" stroke="#4ECDC4" strokeWidth="0.5" opacity="0.5" />
      <line x1="13" y1="21" x2="10" y2="25" stroke="#A78BFA" strokeWidth="0.5" opacity="0.4" />
      <line x1="23" y1="21" x2="26" y2="25" stroke="#A78BFA" strokeWidth="0.5" opacity="0.4" />

      {/* Gradients */}
      <defs>
        <linearGradient id="hexGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="hexStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}