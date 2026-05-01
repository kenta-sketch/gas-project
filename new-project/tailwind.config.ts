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
          ink: "#1f2937",
          paper: "#fafaf7",
          line: "#e5e7eb",
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
    },
  },
  plugins: [],
};

export default config;
