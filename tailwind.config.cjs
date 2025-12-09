/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0b1021',
          800: '#0f172a',
          700: '#111827',
        },
        accent: {
          500: '#f97316',
          400: '#fb923c',
        },
      },
    },
  },
  plugins: [],
};

