// lib/tokens.ts
export const colors = {
  emerald: { 500: "#15803D", 600: "#166534", 700: "#14532D" },
  gold:    { 400: "#D4A574", 500: "#C8924C", 600: "#A87434" },
  cream:   { 50: "#FAF7F0", 100: "#F5EFE0", 200: "#E8DFD0" },
  ink:     { 900: "#3F2A1F", 700: "#5C4536", 500: "#8B7363" },
  success: "#15803D",
  warning: "#D4A574",
  danger:  "#B43A2E",
  info:    "#3B6CA8",
} as const;

export const radii = { sm: "6px", md: "10px", lg: "14px", xl: "20px" } as const;

export const shadows = {
  card: "0 4px 14px rgba(63,42,31,0.08)",
  glow: "0 0 30px rgba(212,165,116,0.25)",
  glowEmerald: "0 0 30px rgba(21,128,61,0.18)",
} as const;
