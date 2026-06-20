import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F4F5F8",
          100: "#E7E9F0",
          200: "#D3D7E3",
          300: "#AEB4C9",
          400: "#7E87A3",
          500: "#5C6480",
          600: "#3D4A6B",
          700: "#2A3350",
          800: "#1B2238",
          900: "#11172A",
          950: "#0B0F19",
        },
        paper: {
          50: "#FBFAF7",
          100: "#F6F4EE",
          200: "#ECE8DD",
        },
        teal: {
          50: "#EDFAF7",
          100: "#D2F1E9",
          400: "#2DB6A0",
          500: "#0F9D87",
          600: "#0B7E6C",
          700: "#08665A",
        },
        amber: {
          50: "#FFF8EC",
          100: "#FEEBC8",
          500: "#D97706",
          600: "#B45F04",
        },
        coral: {
          50: "#FDF1EF",
          100: "#FBDDD7",
          500: "#D6543F",
          600: "#B5402E",
        },
      },
      fontFamily: {
        display: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Georgia",
          "ui-serif",
          "serif",
        ],
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.06), 0 1px 1px rgba(15,23,42,0.04)",
        pop: "0 12px 32px rgba(11, 15, 25, 0.14)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};

export default config;
