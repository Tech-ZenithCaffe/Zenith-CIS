import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#f9edd9",
          200: "#f2d8b0",
          300: "#e9be7e",
          400: "#dfa04e",
          500: "#d4862a",
          600: "#c57122",
          700: "#a4581f",
          800: "#844620",
          900: "#6c3b1d",
          950: "#3a1d0d",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
