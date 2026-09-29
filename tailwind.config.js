/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2D4F3C",
          primaryDark: "#213b2c",
          sage: "#E8F0EA",
          background: "#F9F8F3",
          surface: "#FFFFFF",
          text: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
