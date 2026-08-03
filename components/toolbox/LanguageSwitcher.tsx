'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Locale = 'ko' | 'en' | 'ja';

const languageNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};

const accessibilityLabels: Record<Locale, { trigger: string; menu: string }> = {
  ko: { trigger: '언어 선택', menu: '언어 선택 목록' },
  en: { trigger: 'Select language', menu: 'Language options' },
  ja: { trigger: '言語を選択', menu: '言語選択メニュー' },
};

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const changeLanguage = (nextLocale: Locale) => {
    document.cookie = `fixlgs_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    const segments = pathname.split('/');
    if (segments[1] === 'ko' || segments[1] === 'en' || segments[1] === 'ja') {
      segments[1] = nextLocale;
      router.push(segments.join('/') || `/${nextLocale}`);
    } else {
      router.push(`/${nextLocale}`);
    }
    setOpen(false);
  };

  return (
    <div className="toolbox-language" ref={wrapperRef}>
      <button
        type="button"
        className="toolbox-language-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={accessibilityLabels[locale].trigger}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{languageNames[locale]}</span><i aria-hidden="true">⌄</i>
      </button>
      {open && (
        <div className="toolbox-language-menu" role="listbox" aria-label={accessibilityLabels[locale].menu}>
          {(Object.keys(languageNames) as Locale[]).map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === locale}
              className={code === locale ? 'is-active' : ''}
              onClick={() => changeLanguage(code)}
            >
              {languageNames[code]}<span>{code === locale ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
