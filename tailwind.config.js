/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // force to be always light theme cause still not have full compatibility
  presets: [
    // Manage Tailwind Typography's configuration in a separate file.
    // require('./tailwind-typography.config.js'),
  ],
  content: [
    './javascript/**/*.js',
    './index.html',
    './javascript/db/*.json',
  ],
  theme: {
    // Extend the default Tailwind theme.
    extend: {
      screens: {
        'portrait': { 'raw': '(orientation: portrait)' },
        // => @media (orientation: portrait) { ... }
        'landscape': { 'raw': '(orientation: landscape)' },
        // => @media (orientation: portrait) { ... }
      },
      colors: {
        'primary': '#53CED1',
        'secondary': '#0D6F82',
        'nest-orange': '#E37C25',
        'nest-yellow': '#FFDE59',
        'nest-amarillo': '#E5B853',
        'nest-green': '#53D195',
        'nest-lime': '#CED153',
        'nest-red': '#D15653',
      },
      zIndex: {
        '100': '100',
        '110': '110',
        '120': '120',
        '130': '130',
        '140': '140',
        '150': '150',
        '10001': '10001',
        '10002': '10002',
        '10003': '10003',
        '10010': '10010',
        '10020': '10020',
        '10030': '10030',
        '10040': '10040',
        '10050': '10050',
      },
      borderWidth: {
        '1rem': '1rem',
        '3rem': '3rem',
        '1': '1px',
        '3': '3px',
        '6': '6px',
      },
      keyframes: {
        slowpulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      },
      animation: {
        slowpulse: 'slowpulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // add configuration for 8xl text size in tailwindcss config
      fontSize: {
        'md': ['1rem', '1.35rem'],
        '7xl': ['4.5rem', '5rem'],
        '8xl': ['5.25rem', '5.75rem'],
        '9xl': ['6rem', '6.5rem'],
        '10xl': ['6.75rem', '7.25rem'],
      }
    },
  },
  plugins: [
    // Add Tailwind Typography (via _tw fork).
    // require('@_tw/typography'),

    // Extract colors and widths from `theme.json`.
    // require('@_tw/themejson'),

    // Uncomment below to add additional first-party Tailwind plugins.
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/container-queries'),
  ],
};