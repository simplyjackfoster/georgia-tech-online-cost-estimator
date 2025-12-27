/**
 * Georgia Tech brand colors sourced from the official brand guide.
 * https://brand.gatech.edu/visual-identity/colors
 */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tech: {
          gold: '#B3A369',
          navy: '#003057',
          white: '#FFFFFF',
          goldMedium: '#A4925A',
          goldDark: '#857437'
        }
      }
    }
  },
  plugins: []
};
