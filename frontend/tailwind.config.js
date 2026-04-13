/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f5f7fa',
        surface: '#ffffff',
        subtle: '#f1f4f8',
        border: '#e4e8ef',
        'border-strong': '#d1d7e0',
        muted: '#64748b',
        ink: '#0f172a',
        accent: {
          green: '#10b981',
          'green-soft': '#d1fae5',
          blue: '#2563eb',
          'blue-soft': '#dbeafe',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
        display: ['"Syne"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.05)',
        pop: '0 10px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}
