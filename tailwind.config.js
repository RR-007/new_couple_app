/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // We're defining semantic colors for consistent usage
        primary: {
          DEFAULT: 'var(--color-primary, #8b5cf6)',
          50: 'var(--color-primary-50, #f5f3ff)',
          100: 'var(--color-primary-100, #ede9fe)',
          500: 'var(--color-primary, #8b5cf6)',
          600: 'var(--color-primary, #7c3aed)',
          700: 'var(--color-primary, #6d28d9)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #1C1C1E)',
          100: 'var(--color-secondary-100, #e2e8f0)',
          500: 'var(--color-secondary, #1C1C1E)',
        },
        // We use slate primarily for dark backgrounds to give a subtle cool-grey tint
        slate: {
          50: '#f8fafc',  // Light bg
          100: '#f1f5f9',
          200: '#e2e8f0', // Light border
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Dark elevated surface (cards)
          900: '#0f172a', // Dark main bg
          950: '#020617',
        }
      }
    },
  },
  plugins: [],
}
