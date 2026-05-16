export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        obsidian: '#050505',
        surface: '#0d0d0d',
        surfaceLight: '#171717',
        emerald: '#00F260',
        emeraldDark: '#00A643',
        cyan: '#05D5FF',
        accent: '#9D00FF',
        ink: '#ffffff',
        muted: '#A0A0A0'
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 242, 96, 0.4)',
        glowAccent: '0 0 20px rgba(157, 0, 255, 0.4)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        inner: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: []
};
