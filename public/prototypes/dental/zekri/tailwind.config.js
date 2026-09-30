/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0A0B10',
          soft: '#11131A',
        },
        gold: {
          DEFAULT: '#D4AF37',
          hover: '#C5A059',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
