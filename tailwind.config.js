/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563eb",
          secondary: "#10b981",
          background: "#f9fafb",
          text: "#111827",
        },
      },
    },
  },
  plugins: [],
};
