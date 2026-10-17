import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#07090E",
          deep: "#040508",
          surface: "#0F121C",
          elevated: "#161B2B",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.04)",
        },
        persona: {
          student: "#06B6D4", // Electric Cyan
          alumni: "#8B5CF6",  // Neon Purple
          founder: "#10B981", // Emerald Green
          faculty: "#F59E0B", // Amber Gold
          recruiter: "#F43F5E", // Rose Pink
          institution: "#6366F1", // Indigo Blue
        },
        trust: {
          gold: "#FACC15", // Glowing Solid Gold
          amber: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Outfit'", "'Inter'", "'DejaVu Sans'", "'Liberation Sans'", "system-ui", "sans-serif"],
        headline: ["'Plus Jakarta Sans'", "'Outfit'", "'Inter'", "'DejaVu Sans'", "sans-serif"],
        body: ["'Inter'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.5)",
        "glow-purple": "0 0 25px -5px rgba(139, 92, 246, 0.5)",
        "glow-green": "0 0 25px -5px rgba(16, 185, 129, 0.5)",
        "glow-amber": "0 0 25px -5px rgba(245, 158, 11, 0.5)",
        "glow-pink": "0 0 25px -5px rgba(244, 63, 94, 0.5)",
        "glow-gold": "0 0 30px -4px rgba(250, 204, 21, 0.65)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "spin-slow": "spin 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
