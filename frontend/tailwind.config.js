/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", // Look in all JS/TS/JSX/TSX files in pages
    "./components/**/*.{js,ts,jsx,tsx}", // If you add a components folder later
  ],
  theme: {
    extend: {
      // You can define custom colors, fonts, etc. here later
    },
  },
  plugins: [],
};