import type { Config } from "tailwindcss";
const withMT = require("@material-tailwind/react/utils/withMT");

const config: Config = withMT({
  content: [
    "./node_modules/flowbite-react/lib/**/*.js",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1800px",
    },
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: "#ffffff",
        purple: "#9B00E3",
        "purple-dimmed": "#4B0E67",
        black: "#000000",
        gray: "#191919",
        "gray-dimmed": "#2E2E2E",
        "light-gray": "#E5E5E5",
        "spotify-green": "#1DB954",
        "spotify-green-dimmed": "#1ed760",
      },
      keyframes: {
        fadeInBlur: {
          "0%": { opacity: "0", backdropFilter: "blur(0px)" },
          "100%": { opacity: "1", backdropFilter: "blur(12px)" },
        },
        fadeInVanilla: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeInBlurhalfs: "fadeInBlur 0.5s ease",
        fadeInBlurfulls: "fadeInBlur 1s ease",
        fadeIn: "fadeInVanilla 1s ease",
      },
    },
  },
});
export default config;
