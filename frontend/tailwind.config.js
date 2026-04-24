/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: '#F0F7F0',
          100: '#E1EFE1',
          200: '#C3DFC3',
          300: '#A5D6A7',
          400: '#81C784',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#1B5E20',
          800: '#145218',
          900: '#0D3B10',
        },
        sage: {
          50: '#F6F7F4',
          100: '#ECF0E8',
          200: '#D4DDCE',
          300: '#B5C4AD',
          400: '#96A98D',
          500: '#7A8F70',
        },
        bark: {
          600: '#5D4037',
          700: '#4E342E',
          800: '#3E2723',
        },
        gold: {
          400: '#D4A84B',
          500: '#B8860B',
          600: '#9A6F00',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'float-medium': 'floatMedium 6s ease-in-out infinite 2s',
        'float-fast': 'floatFast 5s ease-in-out infinite 1s',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-25px) rotate(8deg)' },
        },
        floatMedium: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(-6deg)' },
        },
        floatFast: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(4deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'botanical': '0 4px 20px rgba(27, 94, 32, 0.08)',
        'botanical-lg': '0 10px 40px rgba(27, 94, 32, 0.12)',
        'botanical-xl': '0 20px 60px rgba(27, 94, 32, 0.15)',
      },
    },
  },
  plugins: [],
}
