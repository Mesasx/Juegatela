/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep, abandoned bar darks
        ink: {
          950: '#070509',
          900: '#0c0910',
          850: '#120d1a',
          800: '#181020',
          700: '#241830',
          600: '#322142',
        },
        // Neon palette
        neon: {
          red: '#ff2d55',
          pink: '#ff3d81',
          purple: '#b14bff',
          violet: '#8a5cff',
          blue: '#2dd4ff',
          cyan: '#22f5e0',
          green: '#39ff9e',
          lime: '#b6ff3d',
          amber: '#ffb627',
          gold: '#ffd24c',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Oswald', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'neon-red': '0 0 5px #ff2d55, 0 0 20px rgba(255,45,85,0.5)',
        'neon-purple': '0 0 5px #b14bff, 0 0 22px rgba(177,75,255,0.45)',
        'neon-blue': '0 0 5px #2dd4ff, 0 0 22px rgba(45,212,255,0.45)',
        'neon-green': '0 0 5px #39ff9e, 0 0 22px rgba(57,255,158,0.45)',
        'panel': '0 10px 40px -10px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        flicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.85', filter: 'brightness(1.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        flicker: 'flicker 4s infinite',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
