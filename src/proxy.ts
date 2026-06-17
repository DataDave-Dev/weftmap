import { NextResponse, type NextRequest } from "next/server";
import { locales, matchLocale } from "@/i18n/config";

// Per-request nonce CSP. 'unsafe-inline' is gone: inline scripts (Next's
// hydration bootstrap and the layout's anti-FOUC theme script) are allowed only
// via the nonce; same-origin <script src> is allowed via 'self'. 'unsafe-eval'
// is dev-only (React Fast Refresh / webpack).
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (!hasLocale) {
    const lang = matchLocale(request.headers.get("accept-language"));
    request.nextUrl.pathname = `/${lang}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const nonce = crypto.randomUUID();
  const csp = buildCsp(nonce);

  // Next reads the CSP from the request headers to nonce its own scripts; the
  // layout reads x-nonce to nonce the inline theme script.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
