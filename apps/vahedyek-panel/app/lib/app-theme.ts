import { currentAppConfig, type AppThemeConfig } from '../config/current';

export function getAppThemeVariables(theme: AppThemeConfig = currentAppConfig.theme) {
  return {
    '--dark-teal': theme.primary,
    '--theme-accent': theme.primary,
    '--theme-accent-strong': theme.primary,
    '--theme-on-accent': '#ffffff',
    '--control-radius': theme.radius,
    '--app-accent': theme.accent,
  } as const;
}

export function applyAppThemeVariables(root: HTMLElement, theme: AppThemeConfig = currentAppConfig.theme) {
  const variables = getAppThemeVariables(theme);
  for (const [key, value] of Object.entries(variables)) {
    root.style.setProperty(key, value);
  }
}
