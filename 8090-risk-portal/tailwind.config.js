/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accent color
        accent: {
          DEFAULT: '#0055D4',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0055D4',
          600: '#0044AA',
          700: '#003380',
          800: '#002255',
          900: '#00112B',
        },
        // Using Tailwind's slate colors for neutrals
        // Pure white will be 'white' and slate-50 through slate-950 for grays
        // Not using pure black (#000000)
        
        // Risk level colors with WCAG AA compliant contrast
        risk: {
          critical: '#DC2626', // red-600
          high: '#EA580C',     // orange-600
          medium: '#D97706',   // amber-600
          low: '#16A34A',      // green-600
        },
        
        // Status colors with WCAG AA compliant contrast
        status: {
          implemented: '#16A34A',      // green-600
          'in-progress': '#0891B2',    // cyan-600
          'not-implemented': '#64748B', // slate-500
          overdue: '#DC2626',          // red-600
          'due-soon': '#D97706',       // amber-600
        }
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        'none': '0',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}