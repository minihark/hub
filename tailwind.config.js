/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Fraunces', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      colors: {
        hub: {
          bg: '#0A0E17',
          card: '#111726',
          hover: '#182035',
          border: '#1E2840',
          'border-active': '#2E3D60',
          emerald: '#10B981',
          amber: '#F59E0B',
          cyan: '#06B6D4',
          sky: '#0EA5E9',
          orange: '#EA580C',
        },
      },
      boxShadow: {
        'card-glow': '0 0 25px -5px rgba(16, 185, 129, 0.15)',
        'search-glow': '0 0 30px -4px rgba(6, 182, 212, 0.25)',
      },
    },
  },
  plugins: [],
}
