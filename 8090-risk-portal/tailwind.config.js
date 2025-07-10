/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        '8090': {
          primary: '#0066CC',    // Blue from logo
          secondary: '#FF6B35',  // Orange accent
          dark: '#1A1A2E',      // Dark navy
          gray: {
            50: '#F8F9FA',
            100: '#E9ECEF',
            200: '#DEE2E6',
            300: '#CED4DA',
            400: '#ADB5BD',
            500: '#6C757D',
            600: '#495057',
            700: '#343A40',
            800: '#212529',
            900: '#0F0F0F'
          }
        },
        risk: {
          critical: '#DC3545',
          high: '#FD7E14',
          medium: '#FFC107',
          low: '#28A745'
        },
        status: {
          implemented: '#28A745',
          'in-progress': '#17A2B8',
          'not-implemented': '#6C757D',
          overdue: '#DC3545',
          'due-soon': '#FFC107'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
}