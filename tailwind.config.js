/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1E6FB8",
          primaryDark: "#165690",
          sage: "#E6F1FA",
          background: "#F7FAFD",
          surface: "#FFFFFF",
          text: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        serif: ["Instrument Serif", "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
