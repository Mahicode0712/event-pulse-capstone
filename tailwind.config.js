/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#7C3AED',
        darkbase: '#1F2937',
      },
    },
  },
  plugins: [],
}

