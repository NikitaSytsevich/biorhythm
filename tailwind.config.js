/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Палитра Zenith
        mystic: { bg: '#181029', card: '#28203D' },
        soul: { primary: '#FF9F8E', glow: '#ffbba5', secondary: '#A78BFA' },
        star: { white: '#E9E5F0', dim: '#9F97B6' },
        bio: { primary: '#34d399', dim: '#064e3b' },
        forest: { 700: '#2c3e36', 500: '#4e7a6c', 100: '#e3ebe5' }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"San Francisco"', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['"Iowan Old Style"', '"Baskerville"', 'serif']
      }
    },
  },
  plugins: [],
}
