import { getAppThemeVariables } from '../../lib/app-theme';

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
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
