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
        'primary-dark': '#212A31',
        'primary-dark-hover': '#192026',
        'secondary-dark': '#2E3944',
        'secondary-dark-hover': '#242D36',
        'primary-accent': '#124E66',
        'primary-accent-hover': '#0E3E52',
        'muted': '#748D92',
        'muted-light': '#E5ECED',
        'brand-bg': '#D3D9D4',
        'brand-surface': '#FFFFFF',
      },
      borderRadius: {
        'card': '16px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(33, 42, 49, 0.08), 0 2px 6px -1px rgba(33, 42, 49, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(33, 42, 49, 0.12), 0 4px 8px -2px rgba(33, 42, 49, 0.06)',
      },
    },
  },
  plugins: [],
}
