'use client';

import { useServerInsertedHTML } from 'next/navigation';

const THEME_INIT_SCRIPT =
  "try{var k='taav-ai-lab-theme';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';localStorage.setItem(k,t);}var r=document.documentElement;r.dataset.theme=t;r.dataset.taavTheme=t;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t;}catch(e){var r=document.documentElement;r.dataset.theme='dark';r.dataset.taavTheme='dark';r.classList.add('dark');r.style.colorScheme='dark';}";

export function ThemeInitScript() {
  useServerInsertedHTML(() => <script id="taav-ai-lab-theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />);
  return null;
}
