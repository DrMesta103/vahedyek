import { currentAppConfig, type AppMenuItem } from '../config/current';

export type { AppMenuItem };

const HIDDEN_MENU_ITEM_IDS = new Set(['complex']);

function isVisibleMenuItem(item: AppMenuItem) {
  return !HIDDEN_MENU_ITEM_IDS.has(item.id);
}

export const APP_MENU_ITEMS = currentAppConfig.menuItems.filter(isVisibleMenuItem);

export function getSidebarMenuItems() {
  return currentAppConfig.menuItems.filter((item) => isVisibleMenuItem(item) && !item.toolbarOnly);
}

export function getToolbarMenuItems() {
  return currentAppConfig.menuItems.filter((item) => isVisibleMenuItem(item) && item.toolbarOnly);
}
