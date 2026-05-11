import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050505",
          900: "#0D0D0D",
          850: "#141414",
          800: "#1C1C1C"
        },
        signal: {
          purple: "#FFFFFF",
          blue: "#BFBFBF",
          cyan: "#FF2E2E",
          mint: "#F5F5F5",
          coral: "#F43F5E",
          amber: "#FF2E2E"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "Space Grotesk", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"]
      },
      boxShadow: {
        glow: "0 0 36px rgba(255, 46, 46, 0.25)",
        violet: "0 0 46px rgba(255, 255, 255, 0.08)"
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #FFFFFF 0%, #D8D8D8 52%, #FF2E2E 100%)",
        "panel-gradient": "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))"
      },
      borderRadius: {
        "2xl": "1rem"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseRing: {
          "0%, 100%": { opacity: "0.25", transform: "scale(1)" },
          "50%": { opacity: "0.65", transform: "scale(1.08)" }
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(18px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        }
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.8s linear infinite",
        pulseRing: "pulseRing 3.8s ease-in-out infinite",
        reveal: "reveal 0.55s ease-out both",
        slideIn: "slideIn 0.24s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
