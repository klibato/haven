import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#313338",
        "bg-secondary": "#2b2d31",
        "bg-tertiary": "#1e1f22",
        "bg-floating": "#111214",
        "text-normal": "#dbdee1",
        "text-muted": "#949ba4",
        "text-link": "#00a8fc",
        accent: "#5865f2",
        "accent-hover": "#4752c4",
        danger: "#da373c",
        success: "#23a55a",
        warning: "#f0b232",
      },
    },
  },
  plugins: [],
} satisfies Config;
