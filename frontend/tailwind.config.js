export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        obsidian: '#0A0A0C',
        surface: '#121212',
        surfaceLight: '#1E1E1E',
        emerald: '#00F260',
        cyan: '#05D5FF',
        ink: '#ffffff', // Inverse for dark mode apps
        muted: '#A0A0A0'
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 242, 96, 0.3)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    }
  },
  plugins: []
};
