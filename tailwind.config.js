/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(224 71% 4%)',
        foreground: 'hsl(213 31% 91%)',
        primary: 'hsl(4 90% 58%)',
        secondary: 'hsl(217 33% 17%)',
        accent: 'hsl(217 33% 12%)'
      }
    }
  },
  plugins: []
};