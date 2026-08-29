import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supportedLocales = ['ko', 'en', 'ja'] as const;
type Locale = (typeof supportedLocales)[number];

function detectLocale(request: NextRequest): Locale {
  const saved = request.cookies.get('fixlgs_locale')?.value;
  if (supportedLocales.includes(saved as Locale)) return saved as Locale;

  const language = request.headers.get('accept-language')?.toLowerCase() ?? '';
  if (language.startsWith('ko') || language.includes(',ko')) return 'ko';
  if (language.startsWith('ja') || language.includes(',ja')) return 'ja';
  return 'en';
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const appPathname = pathname.startsWith('/tools') ? pathname.slice('/tools'.length) || '/' : pathname;

  if (appPathname === '/toolbox' || appPathname === '/toolbox/') {
    const url = request.nextUrl.clone();
    url.pathname = `/tools/${detectLocale(request)}`;
    return NextResponse.redirect(url, 308);
  }

  const legacyMatch = appPathname.match(/^\/(ko|en|ja)\/toolbox(?:\/(.*))?$/);
  if (legacyMatch) {
    const [, locale, rest] = legacyMatch;
    const url = request.nextUrl.clone();
    url.pathname = rest ? `/tools/${locale}/${rest}` : `/tools/${locale}`;
    return NextResponse.redirect(url, 308);
  }

  const locale = appPathname.match(/^\/(ko|en|ja)(?:\/|$)/)?.[1] as Locale | undefined;
  if (locale) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-fixlgs-locale', locale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
