/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Vivid Indian-art accent palette pulled from the brand mock.
        royal: '#1f43ff', // electric blue (hero button, card 01)
        magenta: '#c4137f', // Chitram wordmark / card 02
        olive: '#8a7a12', // card 03
        ink: '#141414', // near-black (card 04, headlines)
        cream: '#f4f1ea', // soft footer / section background
        sand: '#efe9df',
        // Indian heritage palette
        saffron: '#FF9933', // Indian flag saffron / marigold
        gold: '#C9A84C', // temple gold / turmeric
        crimson: '#9B111E', // deep temple red / kumkum
      },
      fontFamily: {
        // Big editorial headlines
        display: ['Archivo', 'system-ui', 'sans-serif'],
        // Rounded heavy wordmark ("Chitram")
        brand: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        // Labels, eyebrows, nav, numbers
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
        // Body copy
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.75rem',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0,0,0,0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease both',
      },
    },
  },
  plugins: [],
};
