/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          glow: '#00ff66',
        },
        surface: {
          DEFAULT: '#101416',
          lowest: '#0b0f11',
          low: '#181c1e',
          container: '#1c2022',
          high: '#262b2d',
          highest: '#313538',
        },
        accent: {
          cyan: '#4cd7f6',
          amber: '#ffb95f',
          coral: '#ff6b6b',
        }
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { filter: 'drop-shadow(0 0 6px rgba(0, 255, 102, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 16px rgba(0, 255, 102, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
