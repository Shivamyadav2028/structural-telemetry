/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: '#00D2FF',
        brandOrange: '#FF6B00',
      }
    },
  },
  plugins: [],
}
