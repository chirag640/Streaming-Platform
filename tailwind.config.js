// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ios': {
          'blue': '#007AFF',
          'gray': '#8E8E93',
          'background': '#F2F2F7',
          'card': '#FFFFFF',
          'text': '#1C1C1E'
        }
      },
      boxShadow: {
        'ios': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'ios-hover': '0 4px 15px rgba(0, 0, 0, 0.1)'
      },
      borderRadius: {
        'ios': '10px'
      }
    },
  },
  plugins: [],
}