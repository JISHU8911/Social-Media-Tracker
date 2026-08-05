/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#244855',
          'primary-hover': '#1C3843',
          accent: '#E64833',
          'accent-hover': '#9B1313',
          danger: '#9B1313',
          'danger-hover': '#38000A',
          dark: '#38000A',
          bg: '#FFF8F5',
          'section-bg': 'rgba(255, 168, 150, 0.08)',
          card: '#FFFFFF',
          border: 'rgba(36, 72, 85, 0.12)',
        },
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(36, 72, 85, 0.06), 0 2px 6px -1px rgba(36, 72, 85, 0.03)',
        'soft-lg': '0 12px 32px -4px rgba(36, 72, 85, 0.10), 0 4px 12px -2px rgba(36, 72, 85, 0.04)',
      },
    },
  },
  plugins: [],
}
