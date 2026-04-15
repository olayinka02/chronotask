'use client';
import { useEffect, useState } from 'react';

type Mode = 'dark' | 'light';
const KEY = 'chronostack-theme';

function apply(mode: Mode) {
  const root = document.documentElement;
  root.classList.toggle('light', mode === 'light');
  root.classList.toggle('dark', mode === 'dark');
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Mode | null;
    let initial: Mode;
    if (saved === 'dark' || saved === 'light') {
      initial = saved;
    } else if (typeof window.matchMedia === 'function') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const lightMql = window.matchMedia('(prefers-color-scheme: light)');
      initial = mql.matches ? 'dark' : lightMql.matches ? 'light' : 'light';
    } else {
      initial = 'light';
    }
    setMode(initial);
    apply(initial);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    apply(next);
    localStorage.setItem(KEY, next);
  };

  if (!mounted) return null;
  const isDark = mode === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-3 py-2 rounded-full border border-border-subtle bg-bg-elevated/90 backdrop-blur shadow-glow hover:border-primary-500 transition chrono-glow"
    >
      <span
        className={`relative w-10 h-5 rounded-full transition ${
          isDark ? 'bg-primary-700' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow grid place-items-center text-[10px] leading-none transition-all ${
            isDark ? 'left-0.5' : 'left-[calc(100%-1.125rem)]'
          }`}
          aria-hidden
        >
          {isDark ? '🌙' : '☀'}
        </span>
      </span>
      <span className="font-mono text-xs uppercase tracking-wider">
        {isDark ? 'dark' : 'light'}
      </span>
    </button>
  );
}
