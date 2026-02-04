/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hairdao-purple': '#8b5cf6',
        'hairdao-dark': '#0a0a0f',
      },
    },
  },
  plugins: [],
}
