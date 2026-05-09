/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', '"Google Sans"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      colors: {
        lic: {
          teal: '#2EBF8A',
          sky: '#56CFE1',
          offwhite: '#F7FAF9',
          mint: '#F0FBF7',
          charcoal: '#1A1A2E',
          body: '#4A4A68',
          pain: '#FF6B6B',
        },
      },
      borderRadius: {
        card: '16px',
        'card-lg': '24px',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(26, 26, 46, 0.08)',
        card: '0 8px 32px -8px rgba(26, 26, 46, 0.1), 0 2px 8px -2px rgba(46, 191, 138, 0.08)',
        'teal-glow':
          '0 20px 50px -12px rgba(46, 191, 138, 0.45), 0 8px 20px -8px rgba(86, 207, 225, 0.25)',
        lift: '0 24px 48px -12px rgba(26, 26, 46, 0.12), 0 0 0 1px rgba(46, 191, 138, 0.12)',
      },
      transitionTimingFunction: {
        material: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        drifty: {
          '0%, 100%': { transform: 'translate(0px, 0px)' },
          '33%': { transform: 'translate(12px, -8px)' },
          '66%': { transform: 'translate(-8px, 6px)' },
        },
        pulseteal: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(46, 191, 138, 0.35)' },
          '50%': { boxShadow: '0 0 0 12px rgba(46, 191, 138, 0)' },
        },
      },
      animation: {
        float: 'floaty 4s ease-in-out infinite',
        'pulse-soft': 'pulseteal 2.5s ease-in-out infinite',
        drift: 'drifty 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
