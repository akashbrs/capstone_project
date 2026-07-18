/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#12151A',
          900: '#181B21',
          800: '#20242B',
          700: '#2B3038',
          600: '#3A414C',
          500: '#565F6D',
        },
        paper: {
          100: '#F6F3EC',
          200: '#EDE8DA',
        },
        amber: {
          400: '#F0B24E',
          500: '#E8A33D',
          600: '#C97F1F',
        },
        sage: {
          400: '#84A896',
          500: '#6B9080',
          600: '#537465',
        },
        rust: {
          400: '#D97052',
          500: '#C1502E',
          600: '#A13F23',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
