import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1b3541',
          darker: '#0e0e0e',
          orange: '#ff8a00',
          blue: '#4e97b7',
          gray: '#4b4b4b',
        },
      },
      fontFamily: {
        sansation: ['Sansation', 'Inter', 'sans-serif'],
        hacen: ['HacenTunisia', 'Cairo', 'sans-serif'],
        arabic: ['Cairo', 'HacenTunisia', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { opacity: '0.3', transform: 'scale(0.95)' },
          '100%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
