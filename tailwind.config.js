/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--brand-primary)',
        'brand-secondary': 'var(--brand-secondary)',
        'background-base': 'var(--background-base)',
        'text-base': 'var(--text-base)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        'destructive': 'var(--destructive)',
      },
      borderRadius: {
        'smooth': 'var(--radius-smooth)',
      }
    },
  },
  plugins: [],
}
