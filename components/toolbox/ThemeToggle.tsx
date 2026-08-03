'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Locale = 'ko' | 'en' | 'ja';

const labels: Record<Locale, { dark: string; light: string }> = {
  ko: { dark: '다크 모드', light: '라이트 모드' },
  en: { dark: 'Dark mode', light: 'Light mode' },
  ja: { dark: 'ダークモード', light: 'ライトモード' },
};

function readTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return current === 'dark' ? 'dark' : 'light';
}

export default function ThemeToggle({ locale }: { locale: Locale }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const toggleTheme = () => {
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.style.colorScheme = next;
    localStorage.setItem('fixlgs_theme', next);
    setTheme(next);
  };

  const target = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      className="toolbox-theme-toggle"
      onClick={toggleTheme}
      aria-label={labels[locale][target]}
      title={labels[locale][target]}
    >
      <span className="toolbox-theme-icon" aria-hidden="true">
        {target === 'dark' ? '☾' : '☀'}
      </span>
      <span className="toolbox-theme-label">{labels[locale][target]}</span>
    </button>
  );
}
