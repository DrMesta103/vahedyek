'use client';

import { useServerInsertedHTML } from 'next/navigation';

const THEME_INIT_SCRIPT =
  "try{var theme=localStorage.getItem('dastranj-theme');if(theme!=='light'&&theme!=='dark'){theme='dark';localStorage.setItem('dastranj-theme',theme);}document.documentElement.setAttribute('data-theme',theme);}catch(e){document.documentElement.setAttribute('data-theme','dark');}";

export function ThemeInitScript() {
  useServerInsertedHTML(() => (
    <script id="dastranj-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
  ));
  return null;
}
