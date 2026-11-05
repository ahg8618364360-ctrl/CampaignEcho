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
          DEFAULT: "#F5F3EE",      // Warm ivory page ground
          subtle: "#EDEAE2",
        },
        surface: {
          DEFAULT: "#FFFFFF",     // Crisp white paper card surface
          subtle: "#FAF8F5",      // Inset sections & table headers
          hover: "#F3F0E8",
        },
        ink: {
          DEFAULT: "#202923",     // Charcoal forest primary text
          soft: "#3A453E",
        },
        muted: {
          DEFAULT: "#707970",     // Muted olive stone secondary text
          subtle: "#9BA39B",
        },
        terracotta: {
          DEFAULT: "#B85C38",     // Primary brand accent
          hover: "#A04E2E",
          subtle: "rgba(184, 92, 56, 0.08)",
          border: "rgba(184, 92, 56, 0.25)",
        },
        forest: {
          DEFAULT: "#39745D",     // Positive / Verified status
          hover: "#2D5C4A",
          subtle: "rgba(57, 116, 93, 0.08)",
          border: "rgba(57, 116, 93, 0.25)",
        },
        hairline: {
          DEFAULT: "#D9D7CF",     // Muted warm border divider
          subtle: "#E6E4DD",
          strong: "#C4C2B8",
        },
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
