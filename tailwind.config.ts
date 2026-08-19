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
        background: "#0B0F19",
        surface: {
          DEFAULT: "#111827",
          card: "#131C2E",
          hover: "#1A253C",
          border: "#1F2E48",
          input: "#0E1524"
        },
        primary: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        accent: {
          50: "#F5F3FF",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.1) 45%, transparent 70%)",
        "card-gradient": "linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)",
      },
      boxShadow: {
        "glow": "0 0 25px -5px rgba(99, 102, 241, 0.4)",
        "glow-accent": "0 0 25px -5px rgba(139, 92, 246, 0.4)",
      }
    },
  },
  plugins: [],
};
export default config;
