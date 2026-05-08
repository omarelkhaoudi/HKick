export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        pitch: '#101914',
        limeball: '#C7F000',
        turf: '#1FA463',
        ink: '#0B0F0D',
        cloud: '#F5F7F4'
      },
      boxShadow: {
        glow: '0 0 36px rgba(199, 240, 0, 0.22)'
      }
    }
  },
  plugins: []
};
