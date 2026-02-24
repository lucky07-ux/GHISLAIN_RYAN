/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        lunchup: {
          orange: "#FF6B35",
          green: "#10B981",
          dark: "#0A0A0A",
          card: "#1A1A1A",
        }
      }
    },
  },
  plugins: [],
};
