'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const ACTIVITY_ENDPOINT = '/api/audit-logs/activity';
const PAGE_LOG_DEDUPE_MS = 1000;

let lastPageLogKey = '';
let lastPageLogAt = 0;

function shouldIgnorePage(pathname: string) {
  return pathname === '/login' || pathname === '/register' || pathname === '/select-tenant';
}

function sendActivity(payload: Record<string, unknown>) {
  void fetch(ACTIVITY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    keepalive: true,
    body: JSON.stringify(payload),
  }).catch(() => {
    // Activity logging must never break the user flow.
  });
}

function getPageTitle(pathname: string) {
  const normalizeText = (value: string | null | undefined) => value?.replace(/\s+/g, ' ').trim() || '';
  const ignoredTitles = new Set(['خانه', 'خانه اپ']);

  const headingSelectors = ['main h1', '.contracts-hero-title', '.page-title', '[data-page-title]'];
  for (const selector of headingSelectors) {
    const heading = normalizeText(document.querySelector(selector)?.textContent);
    if (heading && !ignoredTitles.has(heading)) return heading;
  }

  const currentBreadcrumb = Array.from(document.querySelectorAll('.breadcrumb-item'))
    .map((item) => normalizeText(item.textContent))
    .find((item) => item && !ignoredTitles.has(item));
  if (currentBreadcrumb) return currentBreadcrumb;

  const documentTitle = normalizeText(document.title.split('|')[0]);
  return documentTitle || pathname;
}

function getPageSearch() {
  return window.location.search || '';
}

function resolveFetchUrl(input: RequestInfo | URL) {
  if (typeof input === 'string' || input instanceof URL) {
    return new URL(input.toString(), window.location.origin);
  }

  return new URL(input.url, window.location.origin);
}

function resolveFetchMethod(input: RequestInfo | URL, init?: RequestInit) {
  return (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
}

function shouldAttachPageContext(input: RequestInfo | URL, init?: RequestInit) {
  const method = resolveFetchMethod(input, init);
  if (method === 'GET' || method === 'HEAD') return false;

  const url = resolveFetchUrl(input);
  if (url.origin !== window.location.origin) return false;
  if (!url.pathname.startsWith('/api/')) return false;
  if (url.pathname === ACTIVITY_ENDPOINT) return false;

  return true;
}

export default function AuditActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if (!pathname || shouldIgnorePage(pathname)) return;

    const searchText = search ? `?${search}` : '';
    const pageKey = `${pathname}${searchText}`;
    const now = Date.now();
    if (lastPageLogKey === pageKey && now - lastPageLogAt < PAGE_LOG_DEDUPE_MS) return;

    lastPageLogKey = pageKey;
    lastPageLogAt = now;

    const timeoutId = window.setTimeout(() => {
      sendActivity({
        type: 'page.view',
        path: pathname,
        search: searchText,
        title: getPageTitle(pathname),
        referrer: document.referrer,
      });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, search]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = (async (...args: Parameters<typeof fetch>) => {
      const [input, init] = args;

      try {
        if (!shouldAttachPageContext(input, init)) {
          return originalFetch(...args);
        }

        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        headers.set('x-audit-page-path', window.location.pathname);
        headers.set('x-audit-page-search', getPageSearch());
        headers.set('x-audit-page-title', getPageTitle(window.location.pathname));

        return originalFetch(input, { ...init, headers });
      } catch {
        return originalFetch(...args);
      }
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
