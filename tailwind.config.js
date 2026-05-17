/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#001F3F',
          50: '#E6EDF5',
          100: '#CCDAEB',
          200: '#99B5D7',
          300: '#6690C3',
          400: '#336BAF',
          500: '#00469B',
          600: '#003880',
          700: '#002A65',
          800: '#001F4A',
          900: '#001F3F',
        },
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FAF5E4',
          100: '#F5EBC9',
          200: '#EBD793',
          300: '#E1C35D',
          400: '#D4AF37',
          500: '#B8961D',
          600: '#9A7C16',
          700: '#7C630F',
          800: '#5E4A08',
          900: '#403201',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
