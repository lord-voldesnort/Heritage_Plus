/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sandstone: {
          50: '#fdfbf7',
          100: '#f7f1e6',
          200: '#ede0c8',
          300: '#dfc9a3',
          400: '#cdac7b',
          500: '#b88d55',
          600: '#9e7343',
          700: '#7f5936',
          800: '#67482f',
          900: '#563c29',
          950: '#301f14',
        },
      },
    },
  },
  plugins: [],
}
