/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        leetcode: {
          dark: '#1a1a1a',
          darker: '#0a0a0a',
          card: '#262626',
          border: '#333333',
          text: '#eff2f699',
          'text-primary': '#ffffff',
          'text-secondary': '#a0a0a0',
          orange: '#ffa116',
          'orange-dark': '#ff8c00',
          green: '#00b8a3',
          yellow: '#ffc01e',
          red: '#ef4743',
          blue: '#2cbb5d',
          easy: '#00b8a3',
          medium: '#ffc01e',
          hard: '#ef4743',
        }
      },
      backgroundColor: {
        'leetcode-dark': '#1a1a1a',
        'leetcode-card': '#262626',
      }
    },
  },
  plugins: [],
}
