/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We will define premium dark/blue-grey tones for our SaaS layout
        brand: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d0daf2',
          300: '#a8bbe6',
          400: '#7996d8',
          500: '#4f70cc',
          600: '#3d55ab',
          700: '#32448a',
          800: '#2c3770',
          900: '#27305d',
          950: '#1a1f3d',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e1e1e4',
          200: '#c5c5cb',
          300: '#a2a2ac',
          400: '#80808c',
          500: '#636370',
          600: '#4c4c56',
          700: '#3a3a42',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        }
      }
    },
  },
  plugins: [],
}
