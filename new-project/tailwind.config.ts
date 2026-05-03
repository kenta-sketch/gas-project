import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        quad: {
          a: "#e87d6e",
          b: "#e7b94d",
          c: "#7ec48f",
          d: "#6e8fe8",
          ink: "#0f172a",
          muted: "#475569",
          paper: "#fafaf7",
          line: "#e5e7eb",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        canvas: {
          DEFAULT: "#f8fafc",
          alt: "#f1f5f9",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "Yu Gothic UI",
          "Meiryo",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        "card-hover": "0 4px 12px 0 rgb(15 23 42 / 0.08), 0 2px 4px 0 rgb(15 23 42 / 0.04)",
        soft: "0 2px 8px 0 rgb(15 23 42 / 0.04)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
        "page-gradient":
          "linear-gradient(180deg, #ffffff 0%, #f8fafc 60%, #eef2ff 100%)",
        "hero-gradient":
          "linear-gradient(135deg, #eef2ff 0%, #ffffff 40%, #f1f5f9 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
