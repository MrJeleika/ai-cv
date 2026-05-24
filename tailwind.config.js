/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './frontend/index.html',
    './frontend/src/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        accent: 'var(--accent)',
        secondary: '#5f5f57',
        outline: '#7e7576',
        'outline-variant': '#cfc4c5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f3f3',
        'surface-container': '#eeeeee',
        'surface-container-high': '#e8e8e8',
        'surface-container-highest': '#e2e2e2',
        'surface-dim': '#dadada',
        'surface-bright': '#f9f9f9',
        'secondary-fixed': '#e4e3d9',
        'tertiary-fixed': '#e2e2e2',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      spacing: {
        unit: '8px',
        'container-max': '1280px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        gutter: '24px',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'headline-lg': [
          '32px',
          { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '500' },
        ],
        'headline-lg-mobile': [
          '24px',
          { lineHeight: '1.2', fontWeight: '500' },
        ],
        'headline-xl': [
          '48px',
          { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '500' },
        ],
        metadata: ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        'body-md': [
          '16px',
          { lineHeight: '1.6', letterSpacing: '0.01em', fontWeight: '400' },
        ],
        'label-sm': [
          '12px',
          { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '600' },
        ],
      },
    },
  },
  plugins: [],
};
