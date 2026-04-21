import { currentAppConfig, type AppMenuItem } from '../config/current';

export type { AppMenuItem };

export const APP_MENU_ITEMS = currentAppConfig.menuItems;

export function getSidebarMenuItems() {
  return currentAppConfig.menuItems.filter((item) => !item.toolbarOnly);
}

export function getToolbarMenuItems() {
  return currentAppConfig.menuItems.filter((item) => item.toolbarOnly);
}
