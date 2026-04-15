import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a0f',
          secondary: '#12121a',
          tertiary: '#1a1a25',
          elevated: '#22222f',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a',
        },
        status: {
          todo: '#64748b',
          progress: '#3b82f6',
          done: '#22c55e',
        },
        border: {
          subtle: '#1e293b',
          DEFAULT: '#334155',
          focus: '#3b82f6',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      fontFamily: {
        display: ['var(--font-jost)', 'Jost', 'sans-serif'],
        sans: ['var(--font-jost)', 'Jost', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
