/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '380px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      colors: {
        coffee: {
          950: '#120804',
          900: '#1F1009',
          850: '#2A170D',
          800: '#3A2012',
          700: '#542F1B',
          600: '#754327',
          500: '#9B5A34',
          400: '#BC784C',
          300: '#D69E76',
          200: '#E8C5A8',
          100: '#F5E4D5',
          50: '#FAF4ED',
        },
        gold: {
          300: '#F3D27A',
          400: '#E9C053',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#936B08',
        },
        cream: {
          50: '#FDFBF7',
          100: '#F8F4EC',
          200: '#F0E8D9',
          300: '#E4D6BE',
        },
        highland: {
          800: '#1B382B',
          700: '#234C3A',
          600: '#2D624B',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
        accent: ['"Cinzel"', 'serif'],
      },
      boxShadow: {
        'coffee': '0 10px 30px -10px rgba(31, 16, 9, 0.25)',
        'coffee-lg': '0 20px 40px -15px rgba(31, 16, 9, 0.35)',
        'gold': '0 10px 25px -5px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
