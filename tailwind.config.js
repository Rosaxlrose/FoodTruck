/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        thai: ['IBM Plex Sans Thai', 'sans-serif'],
        sans: ['Prompt', 'IBM Plex Sans Thai', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          50: '#FFF1EC',
          100: '#FFE4D9',
          200: '#FFCBB4',
          300: '#FFB28F',
          400: '#FF996A',
          500: '#FF6B35',
          600: '#FF4A02',
          700: '#CE3A00',
          800: '#9B2C00',
          900: '#681D00',
        },
        secondary: {
          DEFAULT: '#2EC4B6',
          50: '#E6F7F5',
          100: '#CCEFEB',
          200: '#99DFD7',
          300: '#66CFC3',
          400: '#33BFAF',
          500: '#2EC4B6',
          600: '#239A8F',
          700: '#1B7269',
          800: '#124A44',
          900: '#09221F',
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
}
