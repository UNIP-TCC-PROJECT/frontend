/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FFD257",
          primaryDark: "#F2C344",
          primaryText: "#202824",
          onPrimary: "#202824",
          gold: "#9B8458",
          goldText: "#7B6844",
          goldLight: "#E2B64F",
          champagne: "#F4EBDD",
          background: "#FDFBF8",
          surface: "#FFFFFF",
          text: "#202824",
          muted: "#68645C",
          border: "#E7E2D9",
        },
      },
      fontFamily: {
        brand: ["Bobby Jones Soft", "Plus Jakarta Sans", "sans-serif"],
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
