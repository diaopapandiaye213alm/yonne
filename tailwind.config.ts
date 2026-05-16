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
        // ── Navy — Primary System (bleu nuit technologique) ────────────────
        navy: {
          950: "#020617",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50:  "#F8FAFC",
        },
        // ── Emerald — Action, Brand, Success (vert vibrant) ──────────────
        emerald: {
          950: "#022c22",
          900: "#064e3b",
          800: "#065f46",
          700: "#047857",
          600: "#059669",
          500: "#10b981",
          400: "#34d399",
          300: "#6ee7b7",
          200: "#a7f3d0",
          100: "#d1fae5",
          50:  "#ecfdf5",
        },
        // ── Gold/Amber — Surge Pricing, Accent chaud ────────────────────
        gold: {
          600: "#d97706",
          500: "#f59e0b",
          400: "#fbbf24",
          300: "#fcd34d",
          200: "#fde68a",
          100: "#fef3c7",
          50:  "#fffbeb",
        },
        // ── Ink — Système texte (navy pour lisibilité soleil Dakar) ──────
        ink: {
          900: "#0F172A",
          700: "#334155",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
        },
        // ── Cream — Surfaces et fonds épurés ────────────────────────────
        cream: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
        },
        // ── shadcn semantic tokens ────────────────────────────────────────
        background: "#F8FAFC",
        foreground: "#0F172A",
        primary:     { DEFAULT: "#0F172A", foreground: "#FFFFFF" },
        secondary:   { DEFAULT: "#10b981", foreground: "#FFFFFF" },
        muted:       { DEFAULT: "#F1F5F9", foreground: "#64748B" },
        accent:      { DEFAULT: "#f59e0b", foreground: "#0F172A" },
        destructive: { DEFAULT: "#ef4444", foreground: "#FFFFFF" },
        border:  "#E2E8F0",
        input:   "#E2E8F0",
        ring:    "#10b981",
        card:    { DEFAULT: "#FFFFFF", foreground: "#0F172A" },
        popover: { DEFAULT: "#FFFFFF", foreground: "#0F172A" },
        // ── Status ───────────────────────────────────────────────────────
        success: "#10b981",
        warning: "#f59e0b",
        danger:  "#ef4444",
        info:    "#3b82f6",
      },

      borderRadius: {
        sm:   "6px",
        md:   "10px",
        lg:   "14px",
        xl:   "18px",
        "2xl":"24px",
      },

      boxShadow: {
        card:      "0 1px 3px rgba(15,23,42,0.06), 0 4px 14px rgba(15,23,42,0.06)",
        "card-md": "0 2px 8px rgba(15,23,42,0.08), 0 8px 24px rgba(15,23,42,0.05)",
        "card-lg": "0 4px 16px rgba(15,23,42,0.10), 0 16px 40px rgba(15,23,42,0.08)",
        "glow-emerald": "0 0 20px rgba(16,185,129,0.30), 0 4px 14px rgba(16,185,129,0.18)",
        "glow-navy":    "0 0 20px rgba(15,23,42,0.20), 0 4px 14px rgba(15,23,42,0.12)",
        "glow-amber":   "0 0 20px rgba(245,158,11,0.28), 0 4px 14px rgba(245,158,11,0.18)",
        glow:           "0 0 30px rgba(245,158,11,0.25)",
      },

      fontFamily: {
        display: ["var(--font-geist)", "system-ui", "sans-serif"],
        body:    ["var(--font-inter)",  "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },

      keyframes: {
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,158,11,0.5)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(245,158,11,0)" },
        },
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        livePulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.35" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        flashGreen: {
          "0%":   { color: "#10b981", transform: "translateY(-3px)", opacity: "0.6" },
          "100%": { color: "inherit", transform: "translateY(0)",    opacity: "1" },
        },
        // ── New ───────────────────────────────────────────────────────────
        scaleIn: {
          "0%":   { transform: "scale(0.4)", opacity: "0" },
          "70%":  { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(14px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        stepPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(16,185,129,0.55)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(16,185,129,0)" },
        },
      },

      animation: {
        "pulse-gold":  "pulseGold 2s ease-in-out infinite",
        "fade-in-up":  "fadeInUp 0.35s ease-out both",
        shimmer:       "shimmer 1.8s linear infinite",
        "live-pulse":  "livePulse 1.4s ease-in-out infinite",
        marquee:       "marquee 28s linear infinite",
        "flash-green": "flashGreen 0.35s ease-out both",
        "scale-in":    "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-up":    "slideUp 0.3s ease-out both",
        "step-pulse":  "stepPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
