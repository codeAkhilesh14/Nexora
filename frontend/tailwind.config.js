export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#0a0a0f',
        aurora: '#54f4c8',
        flare: '#ff4d8d',
        solar: '#ffd166'
      },
      boxShadow: {
        glow: '0 0 38px rgba(84, 244, 200, 0.22)'
      }
    }
  },
  plugins: []
};
