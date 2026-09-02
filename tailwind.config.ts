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
        traveloka: {
          blue: "#0194f3",
          "blue-hover": "#0070ba",
          "blue-dark": "#0870d8",
          sky: "#e8f3fe",
          "sky-light": "#f2f8fe",
          navy: "#0b2f64",
          "navy-dark": "#03173d",
          orange: "#ff5e1f",
          "orange-hover": "#e64e12",
          "orange-light": "#fff3ec",
          yellow: "#ffd400",
          green: "#00875a",
          "green-light": "#e3fcef",
          red: "#ef4444",
          "red-light": "#fee2e2",
          gray: {
            50: "#f7f9fa",
            100: "#f2f4f7",
            200: "#eaecf0",
            300: "#d0d5dd",
            400: "#98a2b3",
            500: "#667085",
            600: "#475467",
            700: "#344054",
            800: "#1d2939",
            900: "#101828",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 2px 8px -2px rgba(16, 24, 40, 0.06), 0 1px 4px -1px rgba(16, 24, 40, 0.04)",
        "card-hover": "0 12px 24px -4px rgba(16, 24, 40, 0.12), 0 4px 8px -2px rgba(16, 24, 40, 0.06)",
        traveloka: "0 8px 30px rgba(1, 148, 243, 0.15)",
        floating: "0 20px 40px -8px rgba(11, 47, 100, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
