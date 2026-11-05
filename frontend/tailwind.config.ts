import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#090D16",
          subtle: "#0D121F",
        },
        surface: {
          DEFAULT: "#0E1424",
          raised: "#141C32",
          hover: "rgba(255, 255, 255, 0.04)",
        },
        hairline: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
          strong: "rgba(255, 255, 255, 0.14)",
        },
        brand: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          muted: "rgba(59, 130, 246, 0.15)",
        },
        memory: {
          retain: "#10B981",       // Emerald for Stored Wisdom / Retain
          "retain-muted": "rgba(16, 185, 129, 0.15)",
          recall: "#3B82F6",       // Electric Blue for Recalled Memories
          "recall-muted": "rgba(59, 130, 246, 0.15)",
          reflect: "#8B5CF6",      // Violet for Reasoning Synthesis
          "reflect-muted": "rgba(139, 92, 246, 0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

