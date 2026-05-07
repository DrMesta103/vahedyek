'use client';

import { getAppThemeVariables } from '../../lib/app-theme';
import { useServerInsertedHTML } from 'next/navigation';

const appThemeVariables = JSON.stringify(getAppThemeVariables());

const THEME_INIT_SCRIPT = `
(() => {
  try {
    const appThemeVariables = ${appThemeVariables};
    const savedTheme = window.localStorage.getItem('app-theme');
    const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'light';
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    Object.entries(appThemeVariables).forEach(([key, value]) => root.style.setProperty(key, value));
  } catch {}
})();
`;

export function ThemeInitScript() {
  useServerInsertedHTML(() => <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />);
  return null;
}
