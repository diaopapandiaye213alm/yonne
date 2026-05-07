import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: { 500: "#15803D", 600: "#166534", 700: "#14532D", 800: "#0F3D21", 900: "#071A0E" },
        gold:    { 400: "#D4A574", 500: "#C8924C", 600: "#A87434" },
        cream:   { 50: "#FAF7F0", 100: "#F5EFE0", 200: "#E8DFD0" },
        ink:     { 900: "#3F2A1F", 700: "#5C4536", 500: "#8B7363" },
        success: "#15803D",
        warning: "#D4A574",
        danger:  "#B43A2E",
        info:    "#3B6CA8",
        // shadcn-required (mapped to Téranga)
        background: "#FAF7F0",
        foreground: "#3F2A1F",
        primary: { DEFAULT: "#15803D", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#D4A574", foreground: "#3F2A1F" },
        muted: { DEFAULT: "#F5EFE0", foreground: "#5C4536" },
        accent: { DEFAULT: "#D4A574", foreground: "#3F2A1F" },
        destructive: { DEFAULT: "#B43A2E", foreground: "#FFFFFF" },
        border: "#E8DFD0",
        input: "#E8DFD0",
        ring: "#15803D",
        card: { DEFAULT: "#FFFFFF", foreground: "#3F2A1F" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#3F2A1F" },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        card: "0 4px 14px rgba(63,42,31,0.08)",
        glow: "0 0 30px rgba(212,165,116,0.25)",
        "glow-emerald": "0 0 30px rgba(21,128,61,0.18)",
      },
      fontFamily: {
        display: ["var(--font-geist)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,165,116,0.5)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212,165,116,0)" },
        },
      },
      animation: {
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
