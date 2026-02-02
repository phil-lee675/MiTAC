import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8ff",
          100: "#e8f0ff",
          500: "#3b82f6",
          700: "#1d4ed8"
        }
      }
    }
  },
  plugins: []
};

export default config;
