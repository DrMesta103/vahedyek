'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var classVarianceAuthority = require('class-variance-authority');
var jsxRuntime = require('react/jsx-runtime');
var TooltipPrimitive = require('@radix-ui/react-tooltip');
var React = require('react');
var DialogPrimitive = require('@radix-ui/react-dialog');
var PopoverPrimitive = require('@radix-ui/react-popover');
var DropdownMenuPrimitive = require('@radix-ui/react-dropdown-menu');
var TabsPrimitive = require('@radix-ui/react-tabs');
var dynamic = require('next/dynamic');
var persian = require('react-date-object/calendars/persian');
var persian_fa = require('react-date-object/locales/persian_fa');
var Link = require('next/link');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var TooltipPrimitive__namespace = /*#__PURE__*/_interopNamespace(TooltipPrimitive);
var React__namespace = /*#__PURE__*/_interopNamespace(React);
var DialogPrimitive__namespace = /*#__PURE__*/_interopNamespace(DialogPrimitive);
var PopoverPrimitive__namespace = /*#__PURE__*/_interopNamespace(PopoverPrimitive);
var DropdownMenuPrimitive__namespace = /*#__PURE__*/_interopNamespace(DropdownMenuPrimitive);
var TabsPrimitive__namespace = /*#__PURE__*/_interopNamespace(TabsPrimitive);
var dynamic__default = /*#__PURE__*/_interopDefault(dynamic);
var persian__default = /*#__PURE__*/_interopDefault(persian);
var persian_fa__default = /*#__PURE__*/_interopDefault(persian_fa);
var Link__default = /*#__PURE__*/_interopDefault(Link);

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}

// src/tokens/catalog.ts
var TAAV_TOKEN_CATALOG = [
  // Semantic colors
  { name: "bg", cssVar: "--taav-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u06A9\u0644\u06CC \u0635\u0641\u062D\u0647 \u0648 shell", category: "semantic", preview: "color", themeAware: true },
  { name: "surface", cssVar: "--taav-surface", value: "theme", description: "\u0633\u0637\u062D \u0627\u0635\u0644\u06CC \u06A9\u0627\u0631\u062A \u0648 \u067E\u0646\u0644", category: "semantic", preview: "color", themeAware: true },
  { name: "surface-muted", cssVar: "--taav-surface-muted", value: "theme", description: "\u0633\u0637\u062D \u062B\u0627\u0646\u0648\u06CC\u0647 \u0648 \u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0628\u062E\u0634\u200C\u0647\u0627", category: "semantic", preview: "color", themeAware: true },
  { name: "border", cssVar: "--taav-border", value: "theme", description: "\u0645\u0631\u0632 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0627\u062C\u0632\u0627", category: "semantic", preview: "color", themeAware: true },
  { name: "border-strong", cssVar: "--taav-border-strong", value: "theme", description: "\u0645\u0631\u0632 \u067E\u0631\u0631\u0646\u06AF\u200C\u062A\u0631 \u0628\u0631\u0627\u06CC \u062A\u0627\u06A9\u06CC\u062F", category: "semantic", preview: "color", themeAware: true },
  { name: "text-strong", cssVar: "--taav-text-strong", value: "theme", description: "\u0639\u0646\u0648\u0627\u0646 \u0648 \u0645\u062A\u0646 \u067E\u0631\u0631\u0646\u06AF", category: "semantic", preview: "color", themeAware: true },
  { name: "text-body", cssVar: "--taav-text-body", value: "theme", description: "\u0645\u062A\u0646 \u0627\u0635\u0644\u06CC", category: "semantic", preview: "color", themeAware: true },
  { name: "text-muted", cssVar: "--taav-text-muted", value: "theme", description: "\u0645\u062A\u0646 \u062B\u0627\u0646\u0648\u06CC\u0647", category: "semantic", preview: "color", themeAware: true },
  { name: "text-subtle", cssVar: "--taav-text-subtle", value: "theme", description: "\u0645\u062A\u0646 \u06A9\u0645\u200C\u0627\u0647\u0645\u06CC\u062A \u0648 label", category: "semantic", preview: "color", themeAware: true },
  { name: "brand", cssVar: "--taav-brand", value: "theme", description: "\u0631\u0646\u06AF \u0628\u0631\u0646\u062F \u0627\u0635\u0644\u06CC", category: "color", preview: "color", themeAware: true },
  { name: "success", cssVar: "--taav-success", value: "theme", description: "\u0648\u0636\u0639\u06CC\u062A \u0645\u0648\u0641\u0642\u06CC\u062A", category: "color", preview: "color", themeAware: true },
  { name: "warning", cssVar: "--taav-warning", value: "theme", description: "\u0647\u0634\u062F\u0627\u0631", category: "color", preview: "color", themeAware: true },
  { name: "danger", cssVar: "--taav-danger", value: "theme", description: "\u062E\u0637\u0631 \u0648 \u062E\u0637\u0627", category: "color", preview: "color", themeAware: true },
  { name: "info", cssVar: "--taav-info", value: "theme", description: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A", category: "color", preview: "color", themeAware: true },
  // Typography
  { name: "text-xs", cssVar: "--taav-text-xs", value: "11px", description: "\u0628\u0631\u0686\u0633\u0628 \u0648 meta", category: "typography", preview: "text" },
  { name: "text-sm", cssVar: "--taav-text-sm", value: "13px", description: "\u0645\u062A\u0646 \u0631\u0627\u0628\u0637 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636", category: "typography", preview: "text" },
  { name: "text-md", cssVar: "--taav-text-md", value: "14px", description: "\u0645\u062A\u0646 \u0628\u062F\u0646\u0647 \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F", category: "typography", preview: "text" },
  { name: "text-lg", cssVar: "--taav-text-lg", value: "16px", description: "\u0645\u062A\u0646 \u0628\u0631\u062C\u0633\u062A\u0647", category: "typography", preview: "text" },
  { name: "leading-normal", cssVar: "--taav-leading-normal", value: "1.6", description: "\u0641\u0627\u0635\u0644\u0647 \u062E\u0637 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u0641\u0627\u0631\u0633\u06CC", category: "typography", preview: "none" },
  { name: "leading-relaxed", cssVar: "--taav-leading-relaxed", value: "1.8", description: "\u0641\u0627\u0635\u0644\u0647 \u062E\u0637 \u0628\u0631\u0627\u06CC \u062A\u0648\u0636\u06CC\u062D\u0627\u062A", category: "typography", preview: "none" },
  // Spacing
  { name: "space-2", cssVar: "--taav-space-2", value: "8px", description: "\u0641\u0627\u0635\u0644\u0647 \u0641\u0634\u0631\u062F\u0647", category: "spacing", preview: "spacing" },
  { name: "space-3", cssVar: "--taav-space-3", value: "12px", description: "\u0641\u0627\u0635\u0644\u0647 \u062F\u0627\u062E\u0644\u06CC \u06A9\u0648\u0686\u06A9", category: "spacing", preview: "spacing" },
  { name: "space-4", cssVar: "--taav-space-4", value: "16px", description: "\u0641\u0627\u0635\u0644\u0647 \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F", category: "spacing", preview: "spacing" },
  { name: "space-5", cssVar: "--taav-space-5", value: "20px", description: "\u0641\u0627\u0635\u0644\u0647 \u06A9\u0627\u0631\u062A", category: "spacing", preview: "spacing" },
  { name: "space-6", cssVar: "--taav-space-6", value: "24px", description: "\u0641\u0627\u0635\u0644\u0647 \u0628\u062E\u0634\u200C\u0647\u0627", category: "spacing", preview: "spacing" },
  { name: "space-8", cssVar: "--taav-space-8", value: "32px", description: "\u0641\u0627\u0635\u0644\u0647 \u0635\u0641\u062D\u0647", category: "spacing", preview: "spacing" },
  // Radius
  { name: "radius-sm", cssVar: "--taav-radius-sm", value: "6px", description: "\u06A9\u0646\u062A\u0631\u0644\u200C\u0647\u0627\u06CC \u06A9\u0648\u0686\u06A9", category: "radius", preview: "radius" },
  { name: "radius-md", cssVar: "--taav-radius-md", value: "10px", description: "\u062F\u06A9\u0645\u0647 \u0648 input", category: "radius", preview: "radius" },
  { name: "radius-lg", cssVar: "--taav-radius-lg", value: "14px", description: "\u06A9\u0627\u0631\u062A \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F", category: "radius", preview: "radius" },
  { name: "radius-xl", cssVar: "--taav-radius-xl", value: "18px", description: "\u067E\u0646\u0644 \u0648 hero", category: "radius", preview: "radius" },
  { name: "radius-pill", cssVar: "--taav-radius-pill", value: "9999px", description: "badge \u0648 chip", category: "radius", preview: "radius" },
  // Shadow
  { name: "shadow-xs", cssVar: "--taav-shadow-xs", value: "subtle", description: "\u0633\u0627\u06CC\u0647 \u062E\u06CC\u0644\u06CC \u06A9\u0645", category: "shadow", preview: "shadow" },
  { name: "shadow-sm", cssVar: "--taav-shadow-sm", value: "card", description: "\u06A9\u0627\u0631\u062A \u0628\u0631\u062C\u0633\u062A\u0647", category: "shadow", preview: "shadow" },
  { name: "shadow-md", cssVar: "--taav-shadow-md", value: "dropdown", description: "tooltip \u0648 \u0645\u0646\u0648", category: "shadow", preview: "shadow" },
  { name: "shadow-lg", cssVar: "--taav-shadow-lg", value: "modal", description: "\u0644\u0627\u06CC\u0647 \u0628\u0627\u0644\u0627\u062A\u0631", category: "shadow", preview: "shadow" },
  // Focus & motion
  { name: "focus-ring", cssVar: "--taav-focus-ring", value: "3px brand", description: "\u062D\u0644\u0642\u0647 \u0641\u0648\u06A9\u0648\u0633 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636", category: "focus", preview: "none", themeAware: true },
  { name: "duration-fast", cssVar: "--taav-duration-fast", value: "120ms", description: "\u0627\u0646\u06CC\u0645\u06CC\u0634\u0646 \u0633\u0631\u06CC\u0639", category: "motion", preview: "none" },
  { name: "duration-normal", cssVar: "--taav-duration-normal", value: "180ms", description: "\u0627\u0646\u06CC\u0645\u06CC\u0634\u0646 \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F", category: "motion", preview: "none" },
  { name: "duration-slow", cssVar: "--taav-duration-slow", value: "280ms", description: "\u0627\u0646\u06CC\u0645\u06CC\u0634\u0646 \u0622\u0647\u0633\u062A\u0647", category: "motion", preview: "none" },
  // Component sizing
  { name: "btn-height-md", cssVar: "--taav-btn-height-md", value: "40px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 \u062F\u06A9\u0645\u0647 md", category: "component", preview: "spacing" },
  { name: "badge-height-md", cssVar: "--taav-badge-height-md", value: "28px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 badge md", category: "component", preview: "spacing" },
  { name: "card-padding-md", cssVar: "--taav-card-padding-md", value: "20px", description: "padding \u06A9\u0627\u0631\u062A md", category: "component", preview: "spacing" },
  { name: "tooltip-padding", cssVar: "--taav-tooltip-padding-x", value: "12px", description: "padding \u0627\u0641\u0642\u06CC tooltip", category: "component", preview: "spacing" },
  /* Form tokens */
  { name: "input-height-md", cssVar: "--taav-input-height-md", value: "42px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 input md", category: "component", preview: "spacing" },
  { name: "input-px-md", cssVar: "--taav-input-px-md", value: "14px", description: "padding \u0627\u0641\u0642\u06CC input", category: "component", preview: "spacing" },
  { name: "input-border", cssVar: "--taav-input-border", value: "theme", description: "\u0645\u0631\u0632 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 input", category: "component", preview: "color", themeAware: true },
  { name: "input-bg-disabled", cssVar: "--taav-input-bg-disabled", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 disabled", category: "component", preview: "color", themeAware: true },
  { name: "input-placeholder", cssVar: "--taav-input-placeholder", value: "theme", description: "\u0631\u0646\u06AF placeholder", category: "component", preview: "color", themeAware: true },
  { name: "input-focus-ring", cssVar: "--taav-input-focus-ring", value: "brand ring", description: "\u062D\u0644\u0642\u0647 \u0641\u0648\u06A9\u0648\u0633 input", category: "focus", preview: "none", themeAware: true },
  { name: "textarea-min-height-md", cssVar: "--taav-textarea-min-height-md", value: "108px", description: "\u062D\u062F\u0627\u0642\u0644 \u0627\u0631\u062A\u0641\u0627\u0639 textarea", category: "component", preview: "spacing" },
  { name: "form-label-md", cssVar: "--taav-form-label-md", value: "13px", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC label", category: "typography", preview: "text" },
  { name: "form-message-sm", cssVar: "--taav-form-message-sm", value: "11px", description: "\u067E\u06CC\u0627\u0645 \u062E\u0637\u0627/\u0631\u0627\u0647\u0646\u0645\u0627", category: "typography", preview: "text" },
  { name: "required-mark", cssVar: "--taav-required-mark", value: "theme", description: "\u0631\u0646\u06AF \u0633\u062A\u0627\u0631\u0647 \u0627\u0644\u0632\u0627\u0645\u06CC", category: "color", preview: "color", themeAware: true },
  { name: "control-size-md", cssVar: "--taav-control-size-md", value: "18px", description: "\u0627\u0646\u062F\u0627\u0632\u0647 checkbox/radio md", category: "component", preview: "spacing" },
  { name: "control-focus-ring", cssVar: "--taav-control-focus-ring", value: "brand ring", description: "\u062D\u0644\u0642\u0647 \u0641\u0648\u06A9\u0648\u0633 \u06A9\u0646\u062A\u0631\u0644\u200C\u0647\u0627", category: "focus", preview: "none", themeAware: true },
  { name: "switch-track-w-md", cssVar: "--taav-switch-track-w-md", value: "42px", description: "\u0639\u0631\u0636 track \u0633\u0648\u06CC\u06CC\u0686", category: "component", preview: "spacing" },
  { name: "switch-track-on-brand", cssVar: "--taav-switch-track-on-brand", value: "theme", description: "\u0631\u0646\u06AF track \u0631\u0648\u0634\u0646", category: "color", preview: "color", themeAware: true },
  { name: "segmented-height-md", cssVar: "--taav-segmented-height-md", value: "38px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 segmented control", category: "component", preview: "spacing" },
  { name: "segmented-selected-bg", cssVar: "--taav-segmented-selected-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u06AF\u0632\u06CC\u0646\u0647 \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647", category: "component", preview: "color", themeAware: true },
  { name: "option-card-selected-border", cssVar: "--taav-option-card-selected-border", value: "theme", description: "\u0645\u0631\u0632 option card \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647", category: "color", preview: "color", themeAware: true },
  { name: "overlay-backdrop", cssVar: "--taav-overlay-backdrop", value: "rgba", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 modal/drawer", category: "color", preview: "color" },
  { name: "overlay-surface", cssVar: "--taav-overlay-surface", value: "theme", description: "\u0633\u0637\u062D dialog/dropdown", category: "component", preview: "color", themeAware: true },
  { name: "dialog-width-md", cssVar: "--taav-dialog-width-md", value: "480px", description: "\u0639\u0631\u0636 dialog md", category: "component", preview: "spacing" },
  { name: "drawer-width-md", cssVar: "--taav-drawer-width-md", value: "400px", description: "\u0639\u0631\u0636 drawer md", category: "component", preview: "spacing" },
  { name: "dropdown-item-height-md", cssVar: "--taav-dropdown-item-height-md", value: "36px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 \u0622\u06CC\u062A\u0645 dropdown", category: "component", preview: "spacing" },
  { name: "tabs-height-md", cssVar: "--taav-tabs-height-md", value: "40px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 tab trigger", category: "component", preview: "spacing" },
  { name: "tabs-indicator", cssVar: "--taav-tabs-indicator", value: "theme", description: "\u0631\u0646\u06AF indicator \u0641\u0639\u0627\u0644", category: "color", preview: "color", themeAware: true },
  { name: "stepper-current", cssVar: "--taav-stepper-current", value: "theme", description: "\u0631\u0646\u06AF step \u0641\u0639\u0644\u06CC", category: "color", preview: "color", themeAware: true },
  { name: "stepper-connector", cssVar: "--taav-stepper-connector", value: "theme", description: "\u062E\u0637 \u0627\u062A\u0635\u0627\u0644 stepper", category: "color", preview: "color", themeAware: true },
  { name: "chip-height-md", cssVar: "--taav-chip-height-md", value: "30px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 chip md", category: "component", preview: "spacing" },
  { name: "chip-selected-ring", cssVar: "--taav-chip-selected-ring", value: "brand ring", description: "\u062D\u0644\u0642\u0647 chip \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647", category: "color", preview: "color", themeAware: true },
  { name: "skeleton-bg", cssVar: "--taav-skeleton-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 skeleton", category: "component", preview: "color", themeAware: true },
  { name: "table-row-height-comfortable", cssVar: "--taav-table-row-height-comfortable", value: "48px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 row \u062C\u062F\u0648\u0644", category: "component", preview: "spacing" },
  { name: "table-header-bg", cssVar: "--taav-table-header-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 header \u062C\u062F\u0648\u0644", category: "component", preview: "color", themeAware: true },
  { name: "kv-label-size-md", cssVar: "--taav-kv-label-size-md", value: "13px", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC label", category: "typography", preview: "text" },
  /* Layout tokens */
  { name: "page-bg", cssVar: "--taav-page-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 page shell", category: "component", preview: "color", themeAware: true },
  { name: "page-container-normal", cssVar: "--taav-page-container-normal", value: "960px", description: "\u0639\u0631\u0636 container \u0627\u0633\u062A\u0627\u0646\u062F\u0627\u0631\u062F", category: "component", preview: "spacing" },
  { name: "page-container-wide", cssVar: "--taav-page-container-wide", value: "1200px", description: "\u0639\u0631\u0636 container \u06AF\u0633\u062A\u0631\u062F\u0647", category: "component", preview: "spacing" },
  { name: "page-padding-md", cssVar: "--taav-page-padding-md", value: "24px", description: "padding page shell md", category: "component", preview: "spacing" },
  { name: "layout-gap-comfortable", cssVar: "--taav-layout-gap-comfortable", value: "24px", description: "\u0641\u0627\u0635\u0644\u0647 \u0628\u06CC\u0646 \u0628\u062E\u0634\u200C\u0647\u0627\u06CC layout", category: "spacing", preview: "spacing" },
  { name: "section-padding-md", cssVar: "--taav-section-padding-md", value: "20px", description: "padding section md", category: "component", preview: "spacing" },
  { name: "section-surface-card", cssVar: "--taav-section-surface-card", value: "theme", description: "\u0633\u0637\u062D section card", category: "component", preview: "color", themeAware: true },
  { name: "header-title-md", cssVar: "--taav-header-title-md", value: "20px", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC \u0639\u0646\u0648\u0627\u0646 page header", category: "typography", preview: "text" },
  { name: "action-bar-height", cssVar: "--taav-action-bar-height", value: "64px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 sticky action bar", category: "component", preview: "spacing" },
  { name: "action-bar-surface", cssVar: "--taav-action-bar-surface", value: "theme", description: "\u0633\u0637\u062D sticky action bar", category: "component", preview: "color", themeAware: true },
  { name: "sidebar-width-md", cssVar: "--taav-sidebar-width-md", value: "320px", description: "\u0639\u0631\u0636 sidebar panel md", category: "component", preview: "spacing" },
  { name: "stats-value-md", cssVar: "--taav-stats-value-md", value: "24px", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC \u0645\u0642\u062F\u0627\u0631 stats card", category: "typography", preview: "text" },
  { name: "stats-tone-brand", cssVar: "--taav-stats-tone-brand", value: "theme", description: "\u0633\u0637\u062D stats card brand", category: "component", preview: "color", themeAware: true },
  { name: "progress-height-md", cssVar: "--taav-progress-height-md", value: "8px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 progress bar", category: "component", preview: "spacing" },
  { name: "progress-bg", cssVar: "--taav-progress-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 progress bar", category: "component", preview: "color", themeAware: true },
  { name: "progress-fill-brand", cssVar: "--taav-progress-fill-brand", value: "theme", description: "\u0631\u0646\u06AF fill progress brand", category: "color", preview: "color", themeAware: true }
];
var TAAV_TOKEN_SECTIONS = [
  { id: "semantic", title: "Semantic Colors", titleFa: "\u0631\u0646\u06AF\u200C\u0647\u0627\u06CC \u0645\u0639\u0646\u0627\u06CC\u06CC", categories: ["semantic", "color"] },
  { id: "typography", title: "Typography", titleFa: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC", categories: ["typography"] },
  { id: "spacing", title: "Spacing", titleFa: "\u0641\u0627\u0635\u0644\u0647\u200C\u06AF\u0630\u0627\u0631\u06CC", categories: ["spacing"] },
  { id: "radius", title: "Radius", titleFa: "\u0634\u0639\u0627\u0639", categories: ["radius"] },
  { id: "shadow", title: "Shadow", titleFa: "\u0633\u0627\u06CC\u0647", categories: ["shadow"] },
  { id: "focus", title: "Focus Ring", titleFa: "\u062D\u0644\u0642\u0647 \u0641\u0648\u06A9\u0648\u0633", categories: ["focus"] },
  { id: "motion", title: "Motion", titleFa: "\u062D\u0631\u06A9\u062A", categories: ["motion"] },
  { id: "component", title: "Component Sizing", titleFa: "\u0627\u0646\u062F\u0627\u0632\u0647 \u06A9\u0627\u0645\u067E\u0648\u0646\u0646\u062A", categories: ["component"] }
];

// src/tokens/index.ts
var TAAV_TONE_LABELS = {
  brand: "\u0628\u0631\u0646\u062F",
  neutral: "\u062E\u0646\u062B\u06CC",
  success: "\u0645\u0648\u0641\u0642\u06CC\u062A",
  warning: "\u0647\u0634\u062F\u0627\u0631",
  danger: "\u062E\u0637\u0631",
  info: "\u0627\u0637\u0644\u0627\u0639\u0627\u062A",
  purple: "\u0628\u0646\u0641\u0634"
};
var TAAV_RADIUS = {
  sm: "var(--taav-radius-sm)",
  md: "var(--taav-radius-md)",
  lg: "var(--taav-radius-lg)",
  xl: "var(--taav-radius-xl)",
  xxl: "var(--taav-radius-xxl)",
  pill: "var(--taav-radius-pill)"
};
var TAAV_SHADOW = {
  xs: "var(--taav-shadow-xs)",
  sm: "var(--taav-shadow-sm)",
  md: "var(--taav-shadow-md)",
  lg: "var(--taav-shadow-lg)"
};
var TAAV_SPACING = {
  0: "var(--taav-space-0)",
  1: "var(--taav-space-1)",
  2: "var(--taav-space-2)",
  3: "var(--taav-space-3)",
  4: "var(--taav-space-4)",
  5: "var(--taav-space-5)",
  6: "var(--taav-space-6)",
  8: "var(--taav-space-8)",
  10: "var(--taav-space-10)",
  12: "var(--taav-space-12)"
};
var TAAV_BUTTON_HEIGHT = {
  xs: "var(--taav-btn-height-xs)",
  sm: "var(--taav-btn-height-sm)",
  md: "var(--taav-btn-height-md)",
  lg: "var(--taav-btn-height-lg)",
  xl: "var(--taav-btn-height-xl)"
};
var TAAV_DURATION = {
  fast: "var(--taav-duration-fast)",
  normal: "var(--taav-duration-normal)",
  slow: "var(--taav-duration-slow)"
};

// src/primitives/shared/interaction.ts
var TAAV_INTERACTION = {
  base: [
    "transition-[background-color,border-color,color,box-shadow,transform,opacity]",
    "duration-[var(--taav-duration-normal)]",
    "ease-[var(--taav-ease-standard)]"
  ].join(" "),
  pressable: "active:scale-[0.98] active:brightness-[0.97] disabled:active:scale-100 disabled:active:brightness-100",
  focus: "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
  iconSlot: "inline-flex shrink-0 [&_svg]:pointer-events-none"
};
var toneColorMap = {
  brand: {
    solid: "bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)] border-[color:var(--taav-brand-border)] hover:brightness-110 hover:shadow-[var(--taav-shadow-xs)]",
    soft: "bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)] hover:bg-[color-mix(in_srgb,var(--taav-brand-soft)_82%,var(--taav-brand))]",
    outline: "bg-transparent text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)] hover:bg-[var(--taav-brand-muted)]",
    ghost: "bg-transparent text-[var(--taav-brand-strong)] border-transparent hover:bg-[var(--taav-brand-muted)]",
    link: "bg-transparent text-[var(--taav-brand-strong)] border-transparent underline-offset-4 hover:underline"
  },
  neutral: {
    solid: "bg-[var(--taav-neutral-strong)] text-[var(--taav-surface)] border-[color:var(--taav-neutral-border)] hover:brightness-110",
    soft: "bg-[var(--taav-neutral-soft)] text-[var(--taav-text-body)] border-[color:var(--taav-neutral-border)] hover:bg-[color-mix(in_srgb,var(--taav-neutral-soft)_88%,var(--taav-neutral))]",
    outline: "bg-transparent text-[var(--taav-text-body)] border-[color:var(--taav-border)] hover:bg-[var(--taav-surface-muted)] hover:border-[color:var(--taav-border-strong)]",
    ghost: "bg-transparent text-[var(--taav-text-muted)] border-transparent hover:bg-[var(--taav-surface-muted)] hover:text-[var(--taav-text-body)]",
    link: "bg-transparent text-[var(--taav-text-muted)] border-transparent underline-offset-4 hover:underline hover:text-[var(--taav-text-body)]"
  },
  success: {
    solid: "bg-[var(--taav-success)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-success-border)] hover:brightness-110",
    soft: "bg-[var(--taav-success-soft)] text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)] hover:bg-[color-mix(in_srgb,var(--taav-success-soft)_82%,var(--taav-success))]",
    outline: "bg-transparent text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)] hover:bg-[var(--taav-success-muted)]",
    ghost: "bg-transparent text-[var(--taav-success-strong)] border-transparent hover:bg-[var(--taav-success-muted)]",
    link: "bg-transparent text-[var(--taav-success-strong)] border-transparent underline-offset-4 hover:underline"
  },
  warning: {
    solid: "bg-[var(--taav-warning)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-warning-border)] hover:brightness-110",
    soft: "bg-[var(--taav-warning-soft)] text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)] hover:bg-[color-mix(in_srgb,var(--taav-warning-soft)_82%,var(--taav-warning))]",
    outline: "bg-transparent text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)] hover:bg-[var(--taav-warning-muted)]",
    ghost: "bg-transparent text-[var(--taav-warning-strong)] border-transparent hover:bg-[var(--taav-warning-muted)]",
    link: "bg-transparent text-[var(--taav-warning-strong)] border-transparent underline-offset-4 hover:underline"
  },
  danger: {
    solid: "bg-[var(--taav-danger)] text-[var(--taav-text-on-danger)] border-[color:var(--taav-danger-border)] hover:brightness-110 focus-visible:shadow-[var(--taav-focus-ring-danger)]",
    soft: "bg-[var(--taav-danger-soft)] text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)] hover:bg-[color-mix(in_srgb,var(--taav-danger-soft)_82%,var(--taav-danger))]",
    outline: "bg-transparent text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)] hover:bg-[var(--taav-danger-muted)]",
    ghost: "bg-transparent text-[var(--taav-danger-strong)] border-transparent hover:bg-[var(--taav-danger-muted)]",
    link: "bg-transparent text-[var(--taav-danger-strong)] border-transparent underline-offset-4 hover:underline"
  },
  info: {
    solid: "bg-[var(--taav-info)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-info-border)] hover:brightness-110",
    soft: "bg-[var(--taav-info-soft)] text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)] hover:bg-[color-mix(in_srgb,var(--taav-info-soft)_82%,var(--taav-info))]",
    outline: "bg-transparent text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)] hover:bg-[var(--taav-info-muted)]",
    ghost: "bg-transparent text-[var(--taav-info-strong)] border-transparent hover:bg-[var(--taav-info-muted)]",
    link: "bg-transparent text-[var(--taav-info-strong)] border-transparent underline-offset-4 hover:underline"
  }
};
function resolveVariantStyle(variant, tone) {
  if (variant === "primary") return toneColorMap[tone].solid;
  if (variant === "secondary")
    return "bg-[var(--taav-surface-soft)] text-[var(--taav-text-body)] border-[color:var(--taav-border)] hover:bg-[var(--taav-surface-muted)] hover:border-[color:var(--taav-border-strong)]";
  if (variant === "outline") return toneColorMap[tone].outline;
  if (variant === "ghost") return toneColorMap[tone].ghost;
  if (variant === "soft") return toneColorMap[tone].soft;
  if (variant === "link") return toneColorMap[tone].link;
  if (variant === "danger") return toneColorMap.danger.solid;
  if (variant === "success") return toneColorMap.success.solid;
  if (variant === "warning") return toneColorMap.warning.solid;
  return toneColorMap.brand.solid;
}
var taavButtonVariants = classVarianceAuthority.cva(
  [
    "inline-flex items-center justify-center gap-[var(--taav-btn-gap)] font-[var(--taav-font-weight-medium)]",
    "border border-solid",
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.pressable,
    TAAV_INTERACTION.focus,
    "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
    "select-none whitespace-nowrap"
  ],
  {
    variants: {
      size: {
        xs: "h-[var(--taav-btn-height-xs)] px-[var(--taav-btn-px-xs)] text-[length:var(--taav-text-xs)] rounded-[var(--taav-btn-radius-sm)]",
        sm: "h-[var(--taav-btn-height-sm)] px-[var(--taav-btn-px-sm)] text-[length:var(--taav-text-xs)] rounded-[var(--taav-btn-radius-md)]",
        md: "h-[var(--taav-btn-height-md)] px-[var(--taav-btn-px-md)] text-[length:var(--taav-text-sm)] rounded-[var(--taav-btn-radius-md)]",
        lg: "h-[var(--taav-btn-height-lg)] px-[var(--taav-btn-px-lg)] text-[length:var(--taav-text-sm)] rounded-[var(--taav-btn-radius-lg)]",
        xl: "h-[var(--taav-btn-height-xl)] px-[var(--taav-btn-px-xl)] text-[length:var(--taav-text-lg)] rounded-[var(--taav-btn-radius-lg)]"
      },
      width: {
        auto: "w-auto",
        full: "w-full",
        fit: "w-fit",
        icon: "aspect-square p-0"
      }
    },
    defaultVariants: {
      size: "md",
      width: "auto"
    }
  }
);
function getTaavButtonToneClasses(variant, tone) {
  return resolveVariantStyle(variant, tone);
}
function LoadingSpinner({ size }) {
  const iconSize2 = size === "xs" || size === "sm" ? "h-3.5 w-3.5" : size === "xl" ? "h-5 w-5" : "h-4 w-4";
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      className: cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent", iconSize2),
      "aria-hidden": true
    }
  );
}
function TaavButton({
  variant = "primary",
  size = "md",
  width = "auto",
  tone = "brand",
  loading = false,
  disabled = false,
  iconStart,
  iconEnd,
  children,
  type = "button",
  unsafeClassName,
  "aria-label": ariaLabel,
  ...props
}) {
  const isIconOnly = width === "icon" || !children && (iconStart || iconEnd);
  const isDisabled = disabled || loading;
  const iconOnlySizeClass = size === "xs" ? "w-[var(--taav-btn-height-xs)]" : size === "sm" ? "w-[var(--taav-btn-height-sm)]" : size === "lg" ? "w-[var(--taav-btn-height-lg)]" : size === "xl" ? "w-[var(--taav-btn-height-xl)]" : "w-[var(--taav-btn-height-md)]";
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      type,
      disabled: isDisabled,
      "aria-busy": loading || void 0,
      "aria-label": isIconOnly ? ariaLabel : ariaLabel,
      className: cn(
        taavButtonVariants({ size, width: isIconOnly ? "icon" : width }),
        getTaavButtonToneClasses(variant, tone),
        isIconOnly && iconOnlySizeClass,
        loading && "relative",
        unsafeClassName
      ),
      ...props,
      children: [
        loading ? /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner, { size }) : null,
        !loading && iconStart ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconStart }) : null,
        !loading && children ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex items-center leading-none", children }) : null,
        !loading && iconEnd ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconEnd }) : null
      ]
    }
  );
}
var toneStyles = {
  neutral: {
    solid: "bg-[var(--taav-neutral-strong)] text-[var(--taav-surface)] border-[color:var(--taav-neutral-border)]",
    soft: "bg-[var(--taav-neutral-soft)] text-[var(--taav-text-body)] border-[color:var(--taav-neutral-border)]",
    outline: "bg-transparent text-[var(--taav-text-body)] border-[color:var(--taav-border)]",
    subtle: "bg-[var(--taav-surface-muted)] text-[var(--taav-text-muted)] border-transparent"
  },
  brand: {
    solid: "bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)] border-[color:var(--taav-brand-border)]",
    soft: "bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)]",
    outline: "bg-transparent text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)]",
    subtle: "bg-[var(--taav-brand-muted)] text-[var(--taav-brand-strong)] border-transparent"
  },
  success: {
    solid: "bg-[var(--taav-success)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-success-border)]",
    soft: "bg-[var(--taav-success-soft)] text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)]",
    outline: "bg-transparent text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)]",
    subtle: "bg-[var(--taav-success-muted)] text-[var(--taav-success-strong)] border-transparent"
  },
  warning: {
    solid: "bg-[var(--taav-warning)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-warning-border)]",
    soft: "bg-[var(--taav-warning-soft)] text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)]",
    outline: "bg-transparent text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)]",
    subtle: "bg-[var(--taav-warning-muted)] text-[var(--taav-warning-strong)] border-transparent"
  },
  danger: {
    solid: "bg-[var(--taav-danger)] text-[var(--taav-text-on-danger)] border-[color:var(--taav-danger-border)]",
    soft: "bg-[var(--taav-danger-soft)] text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)]",
    outline: "bg-transparent text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)]",
    subtle: "bg-[var(--taav-danger-muted)] text-[var(--taav-danger-strong)] border-transparent"
  },
  info: {
    solid: "bg-[var(--taav-info)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-info-border)]",
    soft: "bg-[var(--taav-info-soft)] text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)]",
    outline: "bg-transparent text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)]",
    subtle: "bg-[var(--taav-info-muted)] text-[var(--taav-info-strong)] border-transparent"
  },
  purple: {
    solid: "bg-[var(--taav-purple)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-purple-border)]",
    soft: "bg-[var(--taav-purple-soft)] text-[var(--taav-purple-strong)] border-[color:var(--taav-purple-border)]",
    outline: "bg-transparent text-[var(--taav-purple-strong)] border-[color:var(--taav-purple-border)]",
    subtle: "bg-[var(--taav-purple-muted)] text-[var(--taav-purple-strong)] border-transparent"
  }
};
var taavBadgeVariants = classVarianceAuthority.cva(
  [
    "inline-flex items-center justify-center gap-[var(--taav-space-1)] border border-solid",
    "font-[var(--taav-font-weight-medium)] leading-none",
    TAAV_INTERACTION.base
  ],
  {
    variants: {
      size: {
        sm: "h-[var(--taav-badge-height-sm)] min-w-[var(--taav-badge-height-sm)] px-[var(--taav-badge-px-sm)] text-[length:var(--taav-text-2xs)]",
        md: "h-[var(--taav-badge-height-md)] min-w-[var(--taav-badge-height-md)] px-[var(--taav-badge-px-md)] text-[length:var(--taav-text-xs)]",
        lg: "h-[var(--taav-badge-height-lg)] min-w-[var(--taav-badge-height-lg)] px-[var(--taav-badge-px-lg)] text-[length:var(--taav-text-sm)]"
      },
      shape: {
        pill: "rounded-[var(--taav-radius-pill)]",
        rounded: "rounded-[var(--taav-radius-md)]",
        square: "rounded-[var(--taav-radius-sm)]"
      },
      width: {
        auto: "w-auto max-w-full",
        fixed: "w-[var(--taav-badge-width-fixed)]",
        full: "w-full"
      }
    },
    defaultVariants: {
      size: "md",
      shape: "pill",
      width: "auto"
    }
  }
);
function getTaavBadgeToneClasses(tone, variant) {
  return toneStyles[tone][variant];
}
function TaavBadge({
  tone = "neutral",
  size = "md",
  shape = "pill",
  width = "auto",
  variant = "soft",
  iconStart,
  iconEnd,
  children,
  unsafeClassName
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "span",
    {
      className: cn(
        taavBadgeVariants({ size, shape, width }),
        getTaavBadgeToneClasses(tone, variant),
        unsafeClassName
      ),
      children: [
        iconStart ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconStart }) : null,
        children ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate text-center", children }) : null,
        iconEnd ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconEnd }) : null
      ]
    }
  );
}
var taavCardVariants = classVarianceAuthority.cva(
  ["relative flex flex-col overflow-hidden", TAAV_INTERACTION.base],
  {
    variants: {
      variant: {
        elevated: "bg-[var(--taav-surface-elevated)] border border-[color:var(--taav-border-subtle)] shadow-[var(--taav-shadow-sm)]",
        outlined: "bg-[var(--taav-surface)] border border-[color:var(--taav-border)]",
        soft: "bg-[var(--taav-surface-soft)] border border-[color:var(--taav-border-subtle)]",
        ghost: "bg-[var(--taav-surface-ghost)] border border-transparent"
      },
      padding: {
        none: "p-0",
        sm: "p-[var(--taav-card-padding-sm)]",
        md: "p-[var(--taav-card-padding-md)]",
        lg: "p-[var(--taav-card-padding-lg)]"
      },
      radius: {
        md: "rounded-[var(--taav-radius-md)]",
        lg: "rounded-[var(--taav-radius-lg)]",
        xl: "rounded-[var(--taav-radius-xl)]",
        xxl: "rounded-[var(--taav-radius-xxl)]"
      },
      interactive: {
        true: "cursor-pointer hover:border-[color:var(--taav-border-strong)] hover:shadow-[var(--taav-shadow-md)] hover:-translate-y-px active:translate-y-0",
        false: ""
      },
      selected: {
        true: "border-[color:var(--taav-brand-border)] shadow-[var(--taav-shadow-sm)] ring-1 ring-[color:color-mix(in_srgb,var(--taav-brand)_22%,transparent)]",
        false: ""
      }
    },
    defaultVariants: {
      variant: "outlined",
      padding: "md",
      radius: "lg",
      interactive: false,
      selected: false
    }
  }
);
var sectionPadding = {
  sm: "px-[var(--taav-card-padding-sm)] py-[var(--taav-space-3)]",
  md: "px-[var(--taav-card-header-px)] py-[var(--taav-card-header-py)]",
  lg: "px-[var(--taav-card-padding-lg)] py-[var(--taav-space-5)]"
};
function TaavCard({
  variant = "outlined",
  padding = "md",
  radius = "lg",
  interactive = false,
  selected = false,
  header,
  footer,
  children,
  wrapperClassName,
  contentClassName,
  ...props
}) {
  const hasSections = Boolean(header || footer);
  const bodyPadding = hasSections ? "none" : padding;
  const sectionPad = padding === "none" ? sectionPadding.md : sectionPadding[padding];
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        taavCardVariants({ variant, padding: bodyPadding, radius, interactive, selected }),
        wrapperClassName
      ),
      ...props,
      children: [
        header ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("border-b border-[color:var(--taav-border-subtle)]", sectionPad), children: header }) : null,
        children ? /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: cn(
              hasSections && padding === "sm" && "p-[var(--taav-card-padding-sm)]",
              hasSections && padding === "md" && "p-[var(--taav-card-padding-md)]",
              hasSections && padding === "lg" && "p-[var(--taav-card-padding-lg)]",
              contentClassName
            ),
            children
          }
        ) : null,
        footer ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("border-t border-[color:var(--taav-border-subtle)]", sectionPad), children: footer }) : null
      ]
    }
  );
}
function TaavTooltipProvider({ children }) {
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Provider, { delayDuration: 200, skipDelayDuration: 100, children });
}
function TaavTooltip({
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
  children,
  contentClassName
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(TooltipPrimitive__namespace.Root, { delayDuration, children: [
    /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex rounded-[var(--taav-radius-sm)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]", children }) }),
    /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsxs(
      TooltipPrimitive__namespace.Content,
      {
        side,
        align,
        sideOffset: 6,
        collisionPadding: 8,
        className: cn(
          "z-[var(--taav-z-tooltip)] max-w-[var(--taav-tooltip-max-width)]",
          "rounded-[var(--taav-tooltip-radius)] border border-[color:var(--taav-border)]",
          "bg-[var(--taav-surface-elevated)] px-[var(--taav-tooltip-padding-x)] py-[var(--taav-tooltip-padding-y)]",
          "text-right text-[length:var(--taav-text-xs)] leading-[var(--taav-leading-relaxed)]",
          "text-[var(--taav-text-body)] shadow-[var(--taav-tooltip-shadow)]",
          contentClassName
        ),
        style: { direction: "rtl" },
        children: [
          content,
          /* @__PURE__ */ jsxRuntime.jsx(
            TooltipPrimitive__namespace.Arrow,
            {
              width: 10,
              height: 5,
              className: "fill-[var(--taav-surface-elevated)]"
            }
          )
        ]
      }
    ) })
  ] });
}
var toneStyles2 = {
  neutral: "bg-[var(--taav-surface-muted)] border-[color:var(--taav-border)] text-[var(--taav-text-muted)]",
  info: "bg-[var(--taav-info-muted)] border-[color:var(--taav-info-border)] text-[var(--taav-info-strong)]",
  success: "bg-[var(--taav-success-muted)] border-[color:var(--taav-success-border)] text-[var(--taav-success-strong)]",
  warning: "bg-[var(--taav-warning-muted)] border-[color:var(--taav-warning-border)] text-[var(--taav-warning-strong)]",
  danger: "bg-[var(--taav-danger-muted)] border-[color:var(--taav-danger-border)] text-[var(--taav-danger-strong)]"
};
var taavFieldHintVariants = classVarianceAuthority.cva(
  "flex items-start gap-[var(--taav-field-hint-gap)] rounded-[var(--taav-field-hint-radius)] border border-solid",
  {
    variants: {
      size: {
        sm: "p-[var(--taav-field-hint-padding-sm)] text-[length:var(--taav-text-xs)] leading-[var(--taav-leading-relaxed)]",
        md: "p-[var(--taav-field-hint-padding-md)] text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
function getTaavFieldHintToneClasses(tone) {
  return toneStyles2[tone];
}
function TaavFieldHint({
  tone = "neutral",
  size = "md",
  icon,
  title,
  children,
  unsafeClassName
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      role: "note",
      className: cn(taavFieldHintVariants({ size }), getTaavFieldHintToneClasses(tone), unsafeClassName),
      children: [
        icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn(TAAV_INTERACTION.iconSlot, "mt-0.5"), children: icon }) : null,
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid min-w-0 flex-1 gap-[var(--taav-space-1)]", children: [
          title ? /* @__PURE__ */ jsxRuntime.jsx("strong", { className: "font-[var(--taav-font-weight-bold)] leading-[var(--taav-leading-tight)]", children: title }) : null,
          children ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[color:inherit] opacity-90 leading-[var(--taav-leading-relaxed)]", children }) : null
        ] })
      ]
    }
  );
}
function TaavRequiredMark({ tone = "danger", label = "\u0627\u0644\u0632\u0627\u0645\u06CC" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center leading-none",
        tone === "danger" ? "text-[var(--taav-required-mark)]" : "text-[var(--taav-required-mark-muted)]"
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": "true", children: "*" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: label })
      ]
    }
  );
}
var sizeClass = {
  sm: "text-[length:var(--taav-form-label-sm)]",
  md: "text-[length:var(--taav-form-label-md)]",
  lg: "text-[length:var(--taav-form-label-lg)]"
};
var toneClass = {
  default: "text-[var(--taav-text-strong)]",
  muted: "text-[var(--taav-text-muted)]",
  danger: "text-[var(--taav-danger-strong)]"
};
function TaavLabel({
  htmlFor,
  children,
  size = "md",
  tone = "default",
  required = false,
  optional = false,
  disabled = false,
  wrapperClassName,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "label",
    {
      htmlFor,
      className: cn(
        "inline-flex items-center gap-[var(--taav-space-1)] font-[var(--taav-font-weight-bold)] leading-[var(--taav-leading-tight)]",
        sizeClass[size],
        toneClass[tone],
        disabled && "cursor-not-allowed opacity-60",
        wrapperClassName
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { children }),
        required ? /* @__PURE__ */ jsxRuntime.jsx(TaavRequiredMark, { tone: "danger" }) : null,
        !required && optional ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[length:var(--taav-form-label-sm)] font-[var(--taav-font-weight-medium)] text-[var(--taav-text-subtle)]", children: "(\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)" }) : null
      ]
    }
  );
}
var toneBorderMap = {
  neutral: "border-[color:var(--taav-input-border)] focus-within:border-[color:var(--taav-border-strong)]",
  success: "border-[color:var(--taav-success-border)] focus-within:border-[color:var(--taav-success)]",
  warning: "border-[color:var(--taav-warning-border)] focus-within:border-[color:var(--taav-warning)]",
  danger: "border-[color:var(--taav-danger-border)] focus-within:border-[color:var(--taav-danger)]"
};
var variantBgMap = {
  default: "bg-[var(--taav-input-bg)]",
  filled: "bg-[var(--taav-input-bg-filled)]",
  soft: "bg-[var(--taav-input-bg-soft)]",
  ghost: "bg-[var(--taav-surface-ghost)] border-transparent"
};
var taavFieldShellVariants = classVarianceAuthority.cva(
  [
    "flex items-center gap-[var(--taav-space-2)] border border-solid",
    TAAV_INTERACTION.base,
    "focus-within:shadow-[var(--taav-input-focus-ring)]",
    "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:bg-[var(--taav-input-bg-disabled)]",
    "has-[:read-only]:bg-[var(--taav-input-bg-soft)]"
  ],
  {
    variants: {
      size: {
        sm: "min-h-[var(--taav-input-height-sm)] px-[var(--taav-input-px-sm)]",
        md: "min-h-[var(--taav-input-height-md)] px-[var(--taav-input-px-md)]",
        lg: "min-h-[var(--taav-input-height-lg)] px-[var(--taav-input-px-lg)]"
      },
      variant: {
        default: variantBgMap.default,
        filled: variantBgMap.filled,
        soft: variantBgMap.soft,
        ghost: variantBgMap.ghost
      },
      width: {
        auto: "w-auto",
        full: "w-full"
      },
      radius: {
        md: "rounded-[var(--taav-input-radius-md)]",
        lg: "rounded-[var(--taav-input-radius-lg)]",
        xl: "rounded-[var(--taav-input-radius-xl)]"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      width: "full",
      radius: "md"
    }
  }
);
var taavFieldControlClass = "min-w-0 flex-1 border-0 bg-transparent p-0 text-[length:var(--taav-text-sm)] text-[var(--taav-input-text)] placeholder:text-[var(--taav-input-placeholder)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed read-only:cursor-default";
function getTaavFieldToneClasses(tone, invalid) {
  if (invalid) {
    return "border-[color:var(--taav-danger-border)] focus-within:border-[color:var(--taav-danger)] focus-within:shadow-[var(--taav-input-focus-ring-danger)]";
  }
  return toneBorderMap[tone];
}
var taavTextareaShellVariants = classVarianceAuthority.cva(
  [
    "relative flex flex-col border border-solid",
    TAAV_INTERACTION.base,
    "focus-within:shadow-[var(--taav-input-focus-ring)]",
    "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:bg-[var(--taav-input-bg-disabled)]",
    "has-[:read-only]:bg-[var(--taav-input-bg-soft)]"
  ],
  {
    variants: {
      size: {
        sm: "px-[var(--taav-input-px-sm)] py-[var(--taav-input-py-sm)] min-h-[var(--taav-textarea-min-height-sm)]",
        md: "px-[var(--taav-input-px-md)] py-[var(--taav-input-py-md)] min-h-[var(--taav-textarea-min-height-md)]",
        lg: "px-[var(--taav-input-px-lg)] py-[var(--taav-input-py-lg)] min-h-[var(--taav-textarea-min-height-lg)]"
      },
      variant: {
        default: variantBgMap.default,
        filled: variantBgMap.filled,
        soft: variantBgMap.soft,
        ghost: variantBgMap.ghost
      },
      width: {
        auto: "w-auto",
        full: "w-full"
      },
      radius: {
        md: "rounded-[var(--taav-input-radius-md)]",
        lg: "rounded-[var(--taav-input-radius-lg)]",
        xl: "rounded-[var(--taav-input-radius-xl)]"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      width: "full",
      radius: "md"
    }
  }
);
var taavTextareaControlClass = "min-h-[inherit] w-full flex-1 resize-y border-0 bg-transparent p-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-input-text)] placeholder:text-[var(--taav-input-placeholder)] focus:outline-none focus:ring-0 disabled:cursor-not-allowed read-only:cursor-default";
function LoadingSpinner2() {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      className: "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-[var(--taav-text-muted)]",
      "aria-hidden": true
    }
  );
}
function TaavInput({
  size = "md",
  variant = "default",
  tone = "neutral",
  width = "full",
  radius = "md",
  disabled,
  readOnly,
  invalid = false,
  required,
  loading = false,
  iconStart,
  iconEnd,
  prefix,
  suffix,
  wrapperClassName,
  inputClassName,
  type = "text",
  ...props
}) {
  const isDisabled = disabled || loading;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        taavFieldShellVariants({ size, variant, width, radius }),
        getTaavFieldToneClasses(tone, invalid),
        wrapperClassName
      ),
      children: [
        loading ? /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner2, {}) : null,
        !loading && iconStart ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconStart }) : null,
        !loading && prefix ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: prefix }) : null,
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            type,
            disabled: isDisabled,
            readOnly,
            required,
            "aria-invalid": invalid || void 0,
            className: cn(taavFieldControlClass, inputClassName),
            ...props
          }
        ),
        !loading && suffix ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: suffix }) : null,
        !loading && iconEnd ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconEnd }) : null
      ]
    }
  );
}
function TaavTextarea({
  size = "md",
  variant = "default",
  tone = "neutral",
  width = "full",
  radius = "md",
  disabled,
  readOnly,
  invalid = false,
  required,
  rows,
  minRows,
  maxLength,
  showCount = false,
  wrapperClassName,
  inputClassName,
  value,
  defaultValue,
  onChange,
  ...props
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue?.toString() ?? "");
  const currentValue = value !== void 0 ? value.toString() : internalValue;
  const count = currentValue.length;
  const resolvedRows = React.useMemo(() => {
    if (rows) return rows;
    if (minRows) return minRows;
    return size === "sm" ? 3 : size === "lg" ? 5 : 4;
  }, [rows, minRows, size]);
  const handleChange = (event) => {
    if (value === void 0) setInternalValue(event.target.value);
    onChange?.(event);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-1)]", width === "full" && "w-full"), children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: cn(
          taavTextareaShellVariants({ size, variant, width, radius }),
          getTaavFieldToneClasses(tone, invalid),
          wrapperClassName
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(
          "textarea",
          {
            disabled,
            readOnly,
            required,
            rows: resolvedRows,
            maxLength,
            "aria-invalid": invalid || void 0,
            value,
            defaultValue: value === void 0 ? defaultValue : void 0,
            onChange: handleChange,
            className: cn(taavTextareaControlClass, inputClassName),
            style: minRows ? { minHeight: `${minRows * 1.5}rem` } : void 0,
            ...props
          }
        )
      }
    ),
    showCount && maxLength ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-left text-[length:var(--taav-form-message-sm)] text-[var(--taav-text-subtle)]", dir: "ltr", children: [
      count,
      "/",
      maxLength
    ] }) : null
  ] });
}
var sizeClass2 = {
  sm: "text-[length:var(--taav-form-description-sm)]",
  md: "text-[length:var(--taav-form-description-md)]"
};
var toneClass2 = {
  muted: "text-[var(--taav-text-subtle)]",
  neutral: "text-[var(--taav-text-muted)]",
  info: "text-[var(--taav-info-strong)]"
};
function TaavFormDescription({
  size = "sm",
  tone = "muted",
  children,
  unsafeClassName
}) {
  if (!children) return null;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "p",
    {
      className: cn(
        "m-0 leading-[var(--taav-leading-relaxed)]",
        sizeClass2[size],
        toneClass2[tone],
        unsafeClassName
      ),
      children
    }
  );
}
var toneClass3 = {
  neutral: "text-[var(--taav-text-muted)]",
  info: "text-[var(--taav-info-strong)]",
  success: "text-[var(--taav-success-strong)]",
  warning: "text-[var(--taav-warning-strong)]",
  danger: "text-[var(--taav-danger-strong)]"
};
var sizeClass3 = {
  sm: "text-[length:var(--taav-form-message-sm)] leading-[var(--taav-leading-relaxed)]",
  md: "text-[length:var(--taav-form-message-md)] leading-[var(--taav-leading-relaxed)]"
};
function TaavFormMessage({
  tone = "neutral",
  size = "sm",
  icon,
  children,
  unsafeClassName
}) {
  if (!children) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "p",
    {
      role: tone === "danger" ? "alert" : void 0,
      className: cn("m-0 flex items-start gap-[var(--taav-space-1)]", sizeClass3[size], toneClass3[tone], unsafeClassName),
      children: [
        icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn(TAAV_INTERACTION.iconSlot, "mt-0.5"), children: icon }) : null,
        /* @__PURE__ */ jsxRuntime.jsx("span", { children })
      ]
    }
  );
}
function TaavFormField({
  label,
  required = false,
  optional = false,
  description,
  message,
  messageTone = "neutral",
  error,
  htmlFor,
  disabled = false,
  children,
  wrapperClassName,
  contentClassName
}) {
  const resolvedMessage = error ?? message;
  const resolvedTone = error ? "danger" : messageTone;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn("grid gap-[var(--taav-form-field-gap)]", wrapperClassName),
      "data-disabled": disabled || void 0,
      children: [
        label ? /* @__PURE__ */ jsxRuntime.jsx(TaavLabel, { htmlFor, required, optional, disabled, tone: error ? "danger" : "default", children: label }) : null,
        description ? /* @__PURE__ */ jsxRuntime.jsx(TaavFormDescription, { children: description }) : null,
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(contentClassName), children }),
        resolvedMessage ? /* @__PURE__ */ jsxRuntime.jsx(TaavFormMessage, { tone: resolvedTone, children: resolvedMessage }) : null
      ]
    }
  );
}
function SelectChevron() {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      "aria-hidden": true,
      viewBox: "0 0 16 16",
      className: "pointer-events-none h-[var(--taav-select-chevron-size)] w-[var(--taav-select-chevron-size)] shrink-0 text-[var(--taav-text-subtle)]",
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4 6l4 4 4-4", fill: "none", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round" })
    }
  );
}
function TaavSelect({
  size = "md",
  variant = "default",
  tone = "neutral",
  width = "full",
  radius = "md",
  disabled,
  invalid = false,
  required,
  placeholder,
  options,
  iconStart,
  wrapperClassName,
  controlClassName,
  value,
  defaultValue,
  ...props
}) {
  const hasPlaceholder = Boolean(placeholder);
  const showPlaceholder = hasPlaceholder && value === void 0 && defaultValue === void 0;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        taavFieldShellVariants({ size, variant, width, radius }),
        getTaavFieldToneClasses(tone, invalid),
        "relative gap-[var(--taav-select-icon-gap)] pe-[calc(var(--taav-input-px-md)+var(--taav-select-chevron-size)+var(--taav-space-1))]",
        wrapperClassName
      ),
      children: [
        iconStart ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconStart }) : null,
        /* @__PURE__ */ jsxRuntime.jsxs(
          "select",
          {
            disabled,
            required,
            "aria-invalid": invalid || void 0,
            value,
            defaultValue,
            className: cn(
              taavFieldControlClass,
              "cursor-pointer appearance-none pe-[var(--taav-space-1)]",
              disabled && "cursor-not-allowed",
              controlClassName
            ),
            ...props,
            children: [
              hasPlaceholder ? /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", disabled: required, hidden: !showPlaceholder, children: placeholder }) : null,
              options.map((option) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value))
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "pointer-events-none absolute inset-y-0 end-[var(--taav-input-px-md)] flex items-center", children: /* @__PURE__ */ jsxRuntime.jsx(SelectChevron, {}) })
      ]
    }
  );
}
var controlSizeClass = {
  sm: "h-[var(--taav-control-size-sm)] w-[var(--taav-control-size-sm)]",
  md: "h-[var(--taav-control-size-md)] w-[var(--taav-control-size-md)]",
  lg: "h-[var(--taav-control-size-lg)] w-[var(--taav-control-size-lg)]"
};
var checkboxCheckedTone = {
  brand: "checked:border-[color:var(--taav-control-checked-brand-border)] checked:bg-[var(--taav-control-checked-brand)]",
  neutral: "checked:border-[color:var(--taav-control-checked-neutral-border)] checked:bg-[var(--taav-control-checked-neutral)]",
  success: "checked:border-[color:var(--taav-control-checked-success-border)] checked:bg-[var(--taav-control-checked-success)]",
  warning: "checked:border-[color:var(--taav-control-checked-warning-border)] checked:bg-[var(--taav-control-checked-warning)]",
  danger: "checked:border-[color:var(--taav-control-checked-danger-border)] checked:bg-[var(--taav-control-checked-danger)]"
};
var radioCheckedTone = {
  brand: "checked:border-[color:var(--taav-control-checked-brand)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-brand)]",
  neutral: "checked:border-[color:var(--taav-control-checked-neutral)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-neutral)]",
  success: "checked:border-[color:var(--taav-control-checked-success)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-success)]",
  warning: "checked:border-[color:var(--taav-control-checked-warning)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-warning)]",
  danger: "checked:border-[color:var(--taav-control-checked-danger)] checked:bg-[var(--taav-control-bg)] checked:shadow-[inset_0_0_0_var(--taav-radio-dot-size-md)_var(--taav-control-checked-danger)]"
};
var radioDotSizeVar = {
  sm: "[--taav-radio-dot-size-md:var(--taav-radio-dot-size-sm)]",
  md: "[--taav-radio-dot-size-md:var(--taav-radio-dot-size-md)]",
  lg: "[--taav-radio-dot-size-md:var(--taav-radio-dot-size-lg)]"
};
var switchTrackWidth = {
  sm: "w-[var(--taav-switch-track-w-sm)]",
  md: "w-[var(--taav-switch-track-w-md)]",
  lg: "w-[var(--taav-switch-track-w-lg)]"
};
var switchTrackHeight = {
  sm: "h-[var(--taav-switch-track-h-sm)]",
  md: "h-[var(--taav-switch-track-h-md)]",
  lg: "h-[var(--taav-switch-track-h-lg)]"
};
var switchThumbSize = {
  sm: "h-[var(--taav-switch-thumb-sm)] w-[var(--taav-switch-thumb-sm)]",
  md: "h-[var(--taav-switch-thumb-md)] w-[var(--taav-switch-thumb-md)]",
  lg: "h-[var(--taav-switch-thumb-lg)] w-[var(--taav-switch-thumb-lg)]"
};
var switchTrackOnTone = {
  brand: "group-has-[:checked]:bg-[var(--taav-switch-track-on-brand)]",
  neutral: "group-has-[:checked]:bg-[var(--taav-switch-track-on-neutral)]",
  success: "group-has-[:checked]:bg-[var(--taav-switch-track-on-success)]",
  warning: "group-has-[:checked]:bg-[var(--taav-switch-track-on-warning)]",
  danger: "group-has-[:checked]:bg-[var(--taav-switch-track-on-danger)]"
};
var taavChoiceControlBase = [
  "shrink-0 appearance-none border border-solid border-[color:var(--taav-control-border)] bg-[var(--taav-control-bg)]",
  TAAV_INTERACTION.base,
  "focus-visible:outline-none focus-visible:shadow-[var(--taav-control-focus-ring)]",
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-[var(--taav-control-bg-disabled)]"
].join(" ");
var taavChoiceInvalidClass = "border-[color:var(--taav-control-invalid-border)] focus-visible:shadow-[var(--taav-control-focus-ring-danger)]";
var taavChoiceCheckIconClass = 'checked:bg-[length:10px_10px] checked:bg-center checked:bg-no-repeat checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2012%2012%27%20fill%3D%27none%27%3E%3Cpath%20d%3D%27M2%206l2.5%202.5L10%203%27%20stroke%3D%27white%27%20stroke-width%3D%271.75%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27/%3E%3C/svg%3E")]';
var taavChoiceIndeterminateClass = 'data-[indeterminate=true]:border-[color:var(--taav-control-checked-brand-border)] data-[indeterminate=true]:bg-[var(--taav-control-checked-brand)] data-[indeterminate=true]:bg-[length:10px_2px] data-[indeterminate=true]:bg-center data-[indeterminate=true]:bg-no-repeat data-[indeterminate=true]:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2012%202%27%3E%3Crect%20width%3D%2712%27%20height%3D%272%27%20rx%3D%271%27%20fill%3D%27white%27/%3E%3C/svg%3E")]';
function getTaavCheckboxClasses(size, tone, invalid) {
  return [
    taavChoiceControlBase,
    controlSizeClass[size],
    "rounded-[var(--taav-checkbox-radius)]",
    checkboxCheckedTone[tone],
    taavChoiceCheckIconClass,
    taavChoiceIndeterminateClass,
    invalid ? taavChoiceInvalidClass : ""
  ].filter(Boolean).join(" ");
}
function getTaavRadioClasses(size, tone, invalid) {
  return [
    taavChoiceControlBase,
    controlSizeClass[size],
    radioDotSizeVar[size],
    "rounded-full",
    radioCheckedTone[tone],
    invalid ? taavChoiceInvalidClass : ""
  ].filter(Boolean).join(" ");
}
function getTaavSwitchTrackClasses(size, tone) {
  return [
    "inline-flex items-center rounded-full bg-[var(--taav-switch-track-off)] p-0.5",
    switchTrackWidth[size],
    switchTrackHeight[size],
    TAAV_INTERACTION.base,
    switchTrackOnTone[tone]
  ].join(" ");
}
function getTaavSwitchThumbClasses(size) {
  return [
    "block rounded-full bg-[var(--taav-switch-thumb-bg)] shadow-[var(--taav-switch-thumb-shadow)] transition-[margin] duration-[var(--taav-duration-normal)] ease-[var(--taav-ease-standard)] group-has-[:checked]:ms-auto",
    switchThumbSize[size]
  ].join(" ");
}
var taavChoiceLabelLayoutClass = "inline-flex items-start gap-[var(--taav-choice-label-gap)]";
var taavChoiceTextBlockClass = "grid gap-[var(--taav-choice-description-gap)] min-w-0";
var taavChoiceLabelTextClass = "text-[length:var(--taav-form-label-md)] font-[var(--taav-font-weight-bold)] leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]";
var taavChoiceDescriptionTextClass = "text-[length:var(--taav-form-description-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]";
var taavSegmentedRootVariants = classVarianceAuthority.cva(
  ["inline-flex items-center gap-[var(--taav-segmented-gap)] rounded-[var(--taav-segmented-radius)] bg-[var(--taav-segmented-bg)] p-[var(--taav-segmented-gap)]", TAAV_INTERACTION.base],
  {
    variants: {
      size: {
        sm: "min-h-[var(--taav-segmented-height-sm)]",
        md: "min-h-[var(--taav-segmented-height-md)]",
        lg: "min-h-[var(--taav-segmented-height-lg)]"
      },
      width: {
        auto: "w-auto",
        full: "w-full"
      }
    },
    defaultVariants: { size: "md", width: "auto" }
  }
);
var taavSegmentedItemVariants = classVarianceAuthority.cva(
  [
    "inline-flex flex-1 items-center justify-center gap-[var(--taav-space-2)] rounded-[calc(var(--taav-segmented-radius)-2px)] px-[var(--taav-space-3)]",
    "text-[length:var(--taav-text-sm)] font-[var(--taav-font-weight-bold)] text-[var(--taav-text-muted)]",
    TAAV_INTERACTION.base,
    "focus-visible:outline-none focus-visible:shadow-[var(--taav-control-focus-ring)]",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ],
  {
    variants: {
      size: {
        sm: "min-h-[calc(var(--taav-segmented-height-sm)-4px)] text-[length:var(--taav-text-xs)]",
        md: "min-h-[calc(var(--taav-segmented-height-md)-4px)]",
        lg: "min-h-[calc(var(--taav-segmented-height-lg)-4px)] text-[length:var(--taav-text-md)]"
      },
      selected: {
        true: "bg-[var(--taav-segmented-selected-bg)] text-[var(--taav-text-strong)] shadow-[var(--taav-segmented-selected-shadow)] ring-1 ring-[color:var(--taav-segmented-selected-ring)]",
        false: "hover:text-[var(--taav-text-body)]"
      },
      tone: {
        brand: "",
        neutral: ""
      },
      variant: {
        solid: "",
        soft: "",
        outline: "border border-transparent data-[selected=true]:border-[color:var(--taav-border)]"
      }
    },
    defaultVariants: { size: "md", selected: false, tone: "brand", variant: "solid" }
  }
);
function TaavCheckbox({
  size = "md",
  tone = "brand",
  indeterminate = false,
  invalid = false,
  label,
  description,
  disabled,
  wrapperClassName,
  controlClassName,
  id,
  ...props
}) {
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  const control = /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      ref: inputRef,
      id,
      type: "checkbox",
      disabled,
      "aria-invalid": invalid || void 0,
      "data-indeterminate": indeterminate || void 0,
      className: cn(getTaavCheckboxClasses(size, tone, invalid), "mt-0.5", controlClassName),
      ...props
    }
  );
  if (!label && !description) {
    return control;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "label",
    {
      className: cn(taavChoiceLabelLayoutClass, disabled && "cursor-not-allowed opacity-60", wrapperClassName),
      children: [
        control,
        /* @__PURE__ */ jsxRuntime.jsxs("span", { className: taavChoiceTextBlockClass, children: [
          label ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceLabelTextClass, children: label }) : null,
          description ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceDescriptionTextClass, children: description }) : null
        ] })
      ]
    }
  );
}
function TaavRadio({
  size = "md",
  tone = "brand",
  invalid = false,
  label,
  description,
  disabled,
  wrapperClassName,
  controlClassName,
  id,
  ...props
}) {
  const control = /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      id,
      type: "radio",
      disabled,
      "aria-invalid": invalid || void 0,
      className: cn(getTaavRadioClasses(size, tone, invalid), "mt-0.5", controlClassName),
      ...props
    }
  );
  if (!label && !description) {
    return control;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "label",
    {
      className: cn(taavChoiceLabelLayoutClass, disabled && "cursor-not-allowed opacity-60", wrapperClassName),
      children: [
        control,
        /* @__PURE__ */ jsxRuntime.jsxs("span", { className: taavChoiceTextBlockClass, children: [
          label ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceLabelTextClass, children: label }) : null,
          description ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceDescriptionTextClass, children: description }) : null
        ] })
      ]
    }
  );
}
function TaavRadioGroup({
  value,
  defaultValue,
  onValueChange,
  name,
  options,
  orientation = "vertical",
  size = "md",
  tone = "brand",
  disabled = false,
  invalid = false,
  wrapperClassName,
  contentClassName
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "radiogroup",
      "aria-invalid": invalid || void 0,
      className: cn(
        "flex gap-[var(--taav-space-3)]",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap items-center",
        wrapperClassName
      ),
      children: options.map((option, index) => {
        const id = `${name ?? "taav-radio"}-${option.value}-${index}`;
        const isControlled = value !== void 0;
        return /* @__PURE__ */ jsxRuntime.jsx(
          TaavRadio,
          {
            id,
            name,
            value: option.value,
            size,
            tone,
            invalid,
            disabled: disabled || option.disabled,
            label: option.label,
            description: option.description,
            checked: isControlled ? value === option.value : void 0,
            defaultChecked: !isControlled ? defaultValue === option.value : void 0,
            onChange: (event) => {
              if (event.target.checked) {
                onValueChange?.(option.value);
              }
            },
            wrapperClassName: contentClassName
          },
          option.value
        );
      })
    }
  );
}
function TaavSwitch({
  size = "md",
  tone = "brand",
  invalid = false,
  label,
  description,
  disabled,
  wrapperClassName,
  controlClassName,
  id,
  checked,
  defaultChecked,
  onCheckedChange,
  onChange,
  ...props
}) {
  const track = /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      className: cn(
        getTaavSwitchTrackClasses(size, tone),
        invalid && "ring-1 ring-[color:var(--taav-control-invalid-border)]"
      ),
      "aria-hidden": true,
      children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: getTaavSwitchThumbClasses(size) })
    }
  );
  if (!label && !description) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "label",
      {
        className: cn("group inline-flex shrink-0 items-center", disabled && "cursor-not-allowed opacity-60", wrapperClassName),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              id,
              type: "checkbox",
              role: "switch",
              disabled,
              "aria-invalid": invalid || void 0,
              checked,
              defaultChecked,
              className: cn("peer sr-only", controlClassName),
              onChange: (event) => {
                onChange?.(event);
                onCheckedChange?.(event.target.checked);
              },
              ...props
            }
          ),
          track
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "label",
    {
      className: cn(
        taavChoiceLabelLayoutClass,
        "group items-center",
        disabled && "cursor-not-allowed opacity-60",
        wrapperClassName
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            id,
            type: "checkbox",
            role: "switch",
            disabled,
            "aria-invalid": invalid || void 0,
            checked,
            defaultChecked,
            className: cn("peer sr-only", controlClassName),
            onChange: (event) => {
              onChange?.(event);
              onCheckedChange?.(event.target.checked);
            },
            ...props
          }
        ),
        track,
        /* @__PURE__ */ jsxRuntime.jsxs("span", { className: taavChoiceTextBlockClass, children: [
          label ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceLabelTextClass, children: label }) : null,
          description ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceDescriptionTextClass, children: description }) : null
        ] })
      ]
    }
  );
}
function TaavSegmentedControl({
  size = "md",
  tone = "brand",
  variant = "solid",
  width = "auto",
  value,
  defaultValue,
  onValueChange,
  options,
  disabled = false,
  wrapperClassName,
  contentClassName,
  "aria-label": ariaLabel
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? options[0]?.value ?? "");
  const isControlled = value !== void 0;
  const currentValue = isControlled ? value : internalValue;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "radiogroup",
      "aria-label": ariaLabel,
      className: cn(taavSegmentedRootVariants({ size, width }), wrapperClassName),
      children: options.map((option) => {
        const isSelected = currentValue === option.value;
        const isDisabled = disabled || option.disabled;
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": isSelected,
            disabled: isDisabled,
            "data-selected": isSelected || void 0,
            className: cn(
              taavSegmentedItemVariants({ size, selected: isSelected, tone, variant }),
              contentClassName
            ),
            onClick: () => {
              if (isDisabled) return;
              if (!isControlled) {
                setInternalValue(option.value);
              }
              onValueChange?.(option.value);
            },
            children: [
              option.icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4", children: option.icon }) : null,
              /* @__PURE__ */ jsxRuntime.jsx("span", { children: option.label })
            ]
          },
          option.value
        );
      })
    }
  );
}
var sizePadding = {
  sm: "p-[var(--taav-space-3)]",
  md: "p-[var(--taav-space-4)]",
  lg: "p-[var(--taav-space-5)]"
};
var sizeTitle = {
  sm: "text-[length:var(--taav-text-sm)]",
  md: "text-[length:var(--taav-text-md)]",
  lg: "text-[length:var(--taav-text-lg)]"
};
var toneSelectedBorder = {
  brand: "border-[color:var(--taav-option-card-selected-border)] bg-[var(--taav-option-card-selected-bg)] ring-1 ring-[color:var(--taav-option-card-selected-ring)]",
  neutral: "border-[color:var(--taav-border-strong)] bg-[var(--taav-surface-soft)] ring-1 ring-[color:var(--taav-neutral-muted)]",
  success: "border-[color:var(--taav-success-border)] bg-[var(--taav-success-muted)] ring-1 ring-[color:var(--taav-success-muted)]",
  warning: "border-[color:var(--taav-warning-border)] bg-[var(--taav-warning-muted)] ring-1 ring-[color:var(--taav-warning-muted)]",
  danger: "border-[color:var(--taav-danger-border)] bg-[var(--taav-danger-muted)] ring-1 ring-[color:var(--taav-danger-muted)]",
  info: "border-[color:var(--taav-info-border)] bg-[var(--taav-info-muted)] ring-1 ring-[color:var(--taav-info-muted)]"
};
function TaavOptionCard({
  size = "md",
  tone = "brand",
  selected = false,
  disabled = false,
  invalid = false,
  title,
  description,
  meta,
  icon,
  badge,
  inputType = "none",
  name,
  value,
  checked,
  defaultChecked,
  onClick,
  wrapperClassName,
  contentClassName,
  unsafeClassName,
  id,
  ...inputProps
}) {
  const isSelected = selected || checked;
  const inputId = id ?? (value ? `taav-option-${value}` : void 0);
  const showInput = inputType !== "none";
  const cardClass = cn(
    "relative flex w-full cursor-pointer flex-col gap-[var(--taav-space-3)] rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-border)] bg-[var(--taav-surface)] text-start",
    TAAV_INTERACTION.base,
    sizePadding[size],
    !disabled && !isSelected && "hover:border-[color:var(--taav-border-strong)] hover:shadow-[var(--taav-shadow-sm)]",
    isSelected && toneSelectedBorder[tone],
    invalid && !isSelected && "border-[color:var(--taav-option-card-invalid-border)]",
    disabled && "cursor-not-allowed opacity-60",
    unsafeClassName,
    wrapperClassName
  );
  const body = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    showInput ? /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        id: inputId,
        type: inputType,
        name,
        value,
        checked,
        defaultChecked,
        disabled,
        "aria-invalid": invalid || void 0,
        className: "peer sr-only",
        onChange: () => onClick?.(),
        ...inputProps
      }
    ) : null,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-2)]", contentClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between gap-[var(--taav-space-3)]", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-w-0 items-start gap-[var(--taav-space-3)]", children: [
          icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 rounded-[var(--taav-radius-md)] border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-2 text-[var(--taav-text-muted)] [&_svg]:h-5 [&_svg]:w-5", children: icon }) : null,
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 grid gap-[var(--taav-space-1)]", children: [
            /* @__PURE__ */ jsxRuntime.jsx("strong", { className: cn("font-black leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]", sizeTitle[size]), children: title }),
            description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-form-description-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]", children: description }) : null
          ] })
        ] }),
        badge ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0", children: badge }) : null
      ] }),
      meta ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: meta }) : null
    ] })
  ] });
  if (showInput) {
    return /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: inputId, className: cardClass, children: body });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", disabled, onClick, className: cardClass, children: body });
}
var overlayVariantMap = {
  default: "bg-[var(--taav-overlay-surface)] border-[color:var(--taav-overlay-border)] shadow-[var(--taav-overlay-shadow)]",
  elevated: "bg-[var(--taav-overlay-surface)] border-[color:var(--taav-overlay-border-subtle)] shadow-[var(--taav-shadow-xl)]",
  soft: "bg-[var(--taav-overlay-surface-soft)] border-[color:var(--taav-overlay-border-subtle)] shadow-[var(--taav-shadow-md)]"
};
var overlayToneBorderMap = {
  neutral: "",
  danger: "border-[color:var(--taav-danger-border)]",
  success: "border-[color:var(--taav-success-border)]",
  warning: "border-[color:var(--taav-warning-border)]",
  info: "border-[color:var(--taav-info-border)]"
};
var taavOverlayBackdropClass = "fixed inset-0 z-[var(--taav-z-overlay)] bg-[var(--taav-overlay-backdrop)]";
var taavDialogContentVariants = classVarianceAuthority.cva(
  [
    "fixed z-[calc(var(--taav-z-overlay)+1)] grid w-full gap-[var(--taav-space-4)] border border-solid",
    "rounded-[var(--taav-overlay-radius)] p-[var(--taav-overlay-padding-md)] text-right",
    TAAV_INTERACTION.base,
    "focus:outline-none"
  ],
  {
    variants: {
      size: {
        sm: "max-w-[var(--taav-dialog-width-sm)]",
        md: "max-w-[var(--taav-dialog-width-md)]",
        lg: "max-w-[var(--taav-dialog-width-lg)]",
        xl: "max-w-[var(--taav-dialog-width-xl)]",
        fullscreen: "inset-4 max-w-none h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] overflow-hidden"
      },
      variant: {
        default: overlayVariantMap.default,
        elevated: overlayVariantMap.elevated,
        soft: overlayVariantMap.soft
      }
    },
    defaultVariants: { size: "md", variant: "default" }
  }
);
function getTaavOverlayToneClass(tone) {
  return overlayToneBorderMap[tone];
}
var taavDialogPositionClass = "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100vh-var(--taav-space-8))] overflow-y-auto";
var taavDrawerContentVariants = classVarianceAuthority.cva(
  [
    "fixed z-[calc(var(--taav-z-overlay)+1)] flex flex-col border border-solid",
    TAAV_INTERACTION.base,
    "focus:outline-none"
  ],
  {
    variants: {
      side: {
        left: "inset-y-0 start-0 h-full border-e",
        right: "inset-y-0 end-0 h-full border-s",
        top: "inset-x-0 top-0 w-full border-b",
        bottom: "inset-x-0 bottom-0 w-full border-t"
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
        full: ""
      },
      variant: {
        default: overlayVariantMap.default,
        elevated: overlayVariantMap.elevated,
        soft: overlayVariantMap.soft
      }
    },
    compoundVariants: [
      { side: ["left", "right"], size: "sm", class: "w-[var(--taav-drawer-width-sm)]" },
      { side: ["left", "right"], size: "md", class: "w-[var(--taav-drawer-width-md)]" },
      { side: ["left", "right"], size: "lg", class: "w-[var(--taav-drawer-width-lg)]" },
      { side: ["left", "right"], size: "xl", class: "w-[var(--taav-drawer-width-xl)]" },
      { side: ["left", "right"], size: "full", class: "w-full max-w-full" },
      { side: ["top", "bottom"], size: "sm", class: "h-[240px]" },
      { side: ["top", "bottom"], size: "md", class: "h-[320px]" },
      { side: ["top", "bottom"], size: "lg", class: "h-[420px]" },
      { side: ["top", "bottom"], size: "xl", class: "h-[520px]" },
      { side: ["top", "bottom"], size: "full", class: "h-full max-h-full" }
    ],
    defaultVariants: { side: "left", size: "md", variant: "default" }
  }
);
var taavPopoverContentVariants = classVarianceAuthority.cva(
  [
    "z-[var(--taav-z-dropdown)] rounded-[var(--taav-radius-lg)] border border-solid text-right",
    TAAV_INTERACTION.base,
    "focus:outline-none"
  ],
  {
    variants: {
      size: {
        sm: "w-[var(--taav-popover-width-sm)] p-[var(--taav-popover-padding-sm)]",
        md: "w-[var(--taav-popover-width-md)] p-[var(--taav-popover-padding-md)]",
        lg: "w-[var(--taav-popover-width-lg)] p-[var(--taav-popover-padding-lg)]"
      },
      variant: {
        default: overlayVariantMap.default,
        elevated: overlayVariantMap.elevated,
        soft: overlayVariantMap.soft
      },
      tone: {
        neutral: "",
        info: "border-[color:var(--taav-info-border)]",
        success: "border-[color:var(--taav-success-border)]",
        warning: "border-[color:var(--taav-warning-border)]",
        danger: "border-[color:var(--taav-danger-border)]"
      }
    },
    defaultVariants: { size: "md", variant: "default", tone: "neutral" }
  }
);
var taavDropdownContentClass = "z-[var(--taav-z-dropdown)] min-w-[var(--taav-dropdown-min-width)] overflow-hidden rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-overlay-border)] bg-[var(--taav-overlay-surface)] p-[var(--taav-space-1)] shadow-[var(--taav-overlay-shadow)]";
var taavDropdownItemVariants = classVarianceAuthority.cva(
  [
    "relative flex cursor-pointer select-none items-center gap-[var(--taav-space-2)] rounded-[var(--taav-dropdown-item-radius)] px-[var(--taav-space-3)]",
    "text-[length:var(--taav-text-sm)] text-[var(--taav-text-body)] outline-none",
    TAAV_INTERACTION.base,
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    "data-[highlighted]:bg-[var(--taav-dropdown-item-hover)] data-[highlighted]:text-[var(--taav-text-strong)]"
  ],
  {
    variants: {
      size: {
        sm: "min-h-[var(--taav-dropdown-item-height-sm)] text-[length:var(--taav-text-xs)]",
        md: "min-h-[var(--taav-dropdown-item-height-md)]",
        lg: "min-h-[var(--taav-dropdown-item-height-lg)] text-[length:var(--taav-text-md)]"
      },
      tone: {
        neutral: "",
        danger: "text-[var(--taav-danger-strong)] data-[highlighted]:bg-[var(--taav-danger-muted)]",
        success: "text-[var(--taav-success-strong)] data-[highlighted]:bg-[var(--taav-success-muted)]",
        warning: "text-[var(--taav-warning-strong)] data-[highlighted]:bg-[var(--taav-warning-muted)]",
        info: "text-[var(--taav-info-strong)] data-[highlighted]:bg-[var(--taav-info-muted)]"
      }
    },
    defaultVariants: { size: "md", tone: "neutral" }
  }
);
function TaavOverlayCloseIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { "aria-hidden": true, viewBox: "0 0 16 16", className: "h-4 w-4", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4 4l8 8M12 4 4 12", fill: "none", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round" }) });
}
var taavOverlayCloseButtonClass = "absolute top-[var(--taav-space-4)] end-[var(--taav-space-4)] inline-flex h-8 w-8 items-center justify-center rounded-[var(--taav-radius-md)] text-[var(--taav-text-muted)] hover:bg-[var(--taav-surface-muted)] hover:text-[var(--taav-text-strong)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]";
var taavOverlayHeaderClass = "grid gap-[var(--taav-space-2)] pe-10";
var taavOverlayTitleClass = "text-[length:var(--taav-text-lg)] font-black leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]";
var taavOverlayDescriptionClass = "text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]";
var taavOverlayFooterClass = "flex flex-wrap items-center justify-end gap-[var(--taav-space-2)]";
var TaavDialog = DialogPrimitive__namespace.Root;
var TaavDialogTrigger = DialogPrimitive__namespace.Trigger;
var TaavDialogClose = DialogPrimitive__namespace.Close;
var TaavDialogPortal = DialogPrimitive__namespace.Portal;
function TaavDialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Overlay, { className: cn(taavOverlayBackdropClass, className), ...props });
}
function TaavDialogContent({
  size = "md",
  variant = "default",
  tone = "neutral",
  showCloseButton = true,
  contentClassName,
  children,
  ...props
}) {
  const isFullscreen = size === "fullscreen";
  return /* @__PURE__ */ jsxRuntime.jsxs(TaavDialogPortal, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(TaavDialogOverlay, {}),
    /* @__PURE__ */ jsxRuntime.jsxs(
      DialogPrimitive__namespace.Content,
      {
        className: cn(
          taavDialogContentVariants({ size, variant }),
          getTaavOverlayToneClass(tone),
          !isFullscreen && taavDialogPositionClass,
          contentClassName
        ),
        style: { direction: "rtl" },
        ...props,
        children: [
          children,
          showCloseButton ? /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Close, { className: taavOverlayCloseButtonClass, "aria-label": "\u0628\u0633\u062A\u0646", children: /* @__PURE__ */ jsxRuntime.jsx(TaavOverlayCloseIcon, {}) }) : null
        ]
      }
    )
  ] });
}
function TaavDialogHeader({ children, className }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(taavOverlayHeaderClass, className), children });
}
function TaavDialogTitle({
  children,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Title, { className: cn(taavOverlayTitleClass, className), ...props, children });
}
function TaavDialogDescription({
  children,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Description, { className: cn(taavOverlayDescriptionClass, className), ...props, children });
}
function TaavDialogFooter({ children, className }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(taavOverlayFooterClass, className), children });
}
var TaavDrawer = DialogPrimitive__namespace.Root;
var TaavDrawerTrigger = DialogPrimitive__namespace.Trigger;
var TaavDrawerClose = DialogPrimitive__namespace.Close;
var TaavDrawerPortal = DialogPrimitive__namespace.Portal;
function TaavDrawerOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Overlay, { className: cn(taavOverlayBackdropClass, className), ...props });
}
function TaavDrawerContent({
  side = "left",
  size = "md",
  variant = "default",
  showCloseButton = true,
  contentClassName,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(TaavDrawerPortal, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(TaavDrawerOverlay, {}),
    /* @__PURE__ */ jsxRuntime.jsxs(
      DialogPrimitive__namespace.Content,
      {
        className: cn(
          taavDrawerContentVariants({ side, size, variant }),
          "overflow-y-auto p-[var(--taav-overlay-padding-md)]",
          contentClassName
        ),
        style: { direction: "rtl" },
        ...props,
        children: [
          children,
          showCloseButton ? /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Close, { className: taavOverlayCloseButtonClass, "aria-label": "\u0628\u0633\u062A\u0646", children: /* @__PURE__ */ jsxRuntime.jsx(TaavOverlayCloseIcon, {}) }) : null
        ]
      }
    )
  ] });
}
function TaavDrawerHeader({ children, className }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(taavOverlayHeaderClass, className), children });
}
function TaavDrawerTitle({
  children,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Title, { className: cn(taavOverlayTitleClass, className), ...props, children });
}
function TaavDrawerDescription({
  children,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Description, { className: cn(taavOverlayDescriptionClass, className), ...props, children });
}
function TaavDrawerFooter({ children, className }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(taavOverlayFooterClass, className), children });
}
var TaavPopover = PopoverPrimitive__namespace.Root;
var TaavPopoverTrigger = PopoverPrimitive__namespace.Trigger;
var TaavPopoverAnchor = PopoverPrimitive__namespace.Anchor;
var TaavPopoverClose = PopoverPrimitive__namespace.Close;
function TaavPopoverContent({
  size = "md",
  variant = "default",
  tone = "neutral",
  side = "bottom",
  align = "center",
  collisionPadding = 8,
  contentClassName,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(PopoverPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
    PopoverPrimitive__namespace.Content,
    {
      side,
      align,
      collisionPadding,
      className: cn(taavPopoverContentVariants({ size, variant, tone }), contentClassName),
      style: { direction: "rtl" },
      ...props,
      children
    }
  ) });
}
var TaavDropdown = DropdownMenuPrimitive__namespace.Root;
var TaavDropdownTrigger = DropdownMenuPrimitive__namespace.Trigger;
var TaavDropdownGroup = DropdownMenuPrimitive__namespace.Group;
var TaavDropdownPortal = DropdownMenuPrimitive__namespace.Portal;
function TaavDropdownContent({
  sideOffset = 6,
  align = "start",
  collisionPadding = 8,
  contentClassName,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DropdownMenuPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.Content,
    {
      sideOffset,
      align,
      collisionPadding,
      className: cn(taavDropdownContentClass, contentClassName),
      style: { direction: "rtl" },
      ...props,
      children
    }
  ) });
}
function TaavDropdownItem({
  tone = "neutral",
  size = "md",
  iconStart,
  iconEnd,
  shortcut,
  description,
  children,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(DropdownMenuPrimitive__namespace.Item, { className: cn(taavDropdownItemVariants({ size, tone }), className), ...props, children: [
    iconStart ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4", children: iconStart }) : null,
    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block", children }),
      description ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "block text-[length:var(--taav-text-2xs)] font-[var(--taav-font-weight-medium)] text-[var(--taav-text-subtle)]", children: description }) : null
    ] }),
    shortcut ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ms-auto text-[length:var(--taav-text-2xs)] text-[var(--taav-text-subtle)]", children: shortcut }) : null,
    iconEnd ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-4 [&_svg]:w-4", children: iconEnd }) : null
  ] });
}
function TaavDropdownLabel({
  children,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.Label,
    {
      className: cn(
        "px-[var(--taav-space-3)] py-[var(--taav-space-2)] text-[length:var(--taav-text-2xs)] font-black text-[var(--taav-text-subtle)]",
        className
      ),
      ...props,
      children
    }
  );
}
function TaavDropdownSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.Separator,
    {
      className: cn("my-[var(--taav-space-1)] h-px bg-[var(--taav-border-subtle)]", className),
      ...props
    }
  );
}
var taavTabsListVariants = classVarianceAuthority.cva(["inline-flex gap-[var(--taav-space-1)]", TAAV_INTERACTION.base], {
  variants: {
    variant: {
      underline: "border-b border-[color:var(--taav-border-subtle)]",
      pill: "rounded-[var(--taav-radius-lg)] bg-[var(--taav-surface-muted)] p-[var(--taav-space-1)]",
      soft: "rounded-[var(--taav-radius-md)] bg-[var(--taav-surface-soft)] p-[var(--taav-space-1)]",
      boxed: "rounded-[var(--taav-radius-md)] border border-[color:var(--taav-border)] p-[var(--taav-space-1)]"
    },
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col items-stretch"
    }
  },
  defaultVariants: { variant: "underline", orientation: "horizontal" }
});
var taavTabsTriggerVariants = classVarianceAuthority.cva(
  [
    "inline-flex items-center justify-center gap-[var(--taav-space-2)] whitespace-nowrap px-[var(--taav-space-3)]",
    "text-[length:var(--taav-text-sm)] font-[var(--taav-font-weight-bold)] text-[var(--taav-text-muted)]",
    TAAV_INTERACTION.base,
    "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=active]:text-[var(--taav-tabs-selected-text)]"
  ],
  {
    variants: {
      size: {
        sm: "min-h-[var(--taav-tabs-height-sm)] text-[length:var(--taav-text-xs)]",
        md: "min-h-[var(--taav-tabs-height-md)]",
        lg: "min-h-[var(--taav-tabs-height-lg)] text-[length:var(--taav-text-md)]"
      },
      variant: {
        underline: "rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--taav-tabs-indicator)]",
        pill: "rounded-[var(--taav-radius-md)] data-[state=active]:bg-[var(--taav-tabs-selected-bg)] data-[state=active]:shadow-[var(--taav-shadow-sm)]",
        soft: "rounded-[var(--taav-radius-md)] data-[state=active]:bg-[var(--taav-surface)] data-[state=active]:shadow-[var(--taav-shadow-sm)]",
        boxed: "rounded-[var(--taav-radius-sm)] data-[state=active]:bg-[var(--taav-tabs-selected-bg)] data-[state=active]:ring-1 data-[state=active]:ring-[color:var(--taav-brand-border)]"
      },
      tone: {
        brand: "data-[state=active]:text-[var(--taav-brand-strong)]",
        neutral: "data-[state=active]:text-[var(--taav-text-strong)] data-[state=active]:border-[color:var(--taav-neutral)]"
      }
    },
    defaultVariants: { size: "md", variant: "underline", tone: "brand" }
  }
);
var taavTabsContentClass = "mt-[var(--taav-space-4)] focus-visible:outline-none";
var stepperStatusColor = {
  complete: "border-[color:var(--taav-stepper-complete)] bg-[var(--taav-success-muted)] text-[var(--taav-success-strong)]",
  current: "border-[color:var(--taav-stepper-current)] bg-[var(--taav-brand-muted)] text-[var(--taav-brand-strong)] ring-2 ring-[color:color-mix(in_srgb,var(--taav-brand)_20%,transparent)]",
  upcoming: "border-[color:var(--taav-stepper-upcoming)] bg-[var(--taav-surface)] text-[var(--taav-text-muted)]",
  error: "border-[color:var(--taav-stepper-error)] bg-[var(--taav-danger-muted)] text-[var(--taav-danger-strong)]",
  warning: "border-[color:var(--taav-stepper-warning)] bg-[var(--taav-warning-muted)] text-[var(--taav-warning-strong)]"
};
function getTaavStepperIndicatorClass(size, status) {
  const sizeClass4 = size === "sm" ? "h-[var(--taav-stepper-size-sm)] w-[var(--taav-stepper-size-sm)] text-[length:var(--taav-text-2xs)]" : size === "lg" ? "h-[var(--taav-stepper-size-lg)] w-[var(--taav-stepper-size-lg)] text-[length:var(--taav-text-sm)]" : "h-[var(--taav-stepper-size-md)] w-[var(--taav-stepper-size-md)] text-[length:var(--taav-text-xs)]";
  return [
    "inline-flex shrink-0 items-center justify-center rounded-full border border-solid font-black",
    sizeClass4,
    stepperStatusColor[status]
  ].join(" ");
}
function getTaavStepperConnectorClass(status, orientation) {
  const color = status === "complete" ? "bg-[var(--taav-stepper-complete)]" : status === "error" ? "bg-[var(--taav-stepper-error)]" : status === "warning" ? "bg-[var(--taav-stepper-warning)]" : "bg-[var(--taav-stepper-connector)]";
  return orientation === "horizontal" ? `h-0.5 min-w-[var(--taav-space-8)] flex-1 ${color}` : `w-0.5 min-h-[var(--taav-space-6)] flex-1 ${color}`;
}
var TaavTabs = TabsPrimitive__namespace.Root;
function TaavTabsList({
  variant = "underline",
  size = "md",
  tone = "brand",
  orientation = "horizontal",
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TabsPrimitive__namespace.List,
    {
      className: cn(taavTabsListVariants({ variant, orientation }), className),
      ...props
    }
  );
}
function TaavTabsTrigger({
  variant = "underline",
  size = "md",
  tone = "brand",
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TabsPrimitive__namespace.Trigger,
    {
      className: cn(taavTabsTriggerVariants({ variant, size, tone }), className),
      ...props
    }
  );
}
function TaavTabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(TabsPrimitive__namespace.Content, { className: cn(taavTabsContentClass, className), ...props });
}
function resolveStatus(step, index, currentIndex) {
  if (step.status) return step.status;
  if (index < currentIndex) return "complete";
  if (index === currentIndex) return "current";
  return "upcoming";
}
function TaavStepper({
  steps,
  currentStep,
  orientation = "horizontal",
  size = "md",
  variant = "numbered",
  showProgress = true,
  allowClick = false,
  onStepClick,
  wrapperClassName,
  contentClassName
}) {
  const currentIndex = Math.max(0, currentStep ? steps.findIndex((step) => step.id === currentStep) : 0);
  const progress = steps.length > 1 ? Math.round(currentIndex / (steps.length - 1) * 100) : 100;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-4)]", wrapperClassName), dir: "rtl", children: [
    showProgress ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-1 overflow-hidden rounded-full bg-[var(--taav-surface-muted)]", children: /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "h-full rounded-full bg-[var(--taav-brand)] transition-[width] duration-[var(--taav-duration-normal)]",
        style: { width: `${progress}%` },
        role: "progressbar",
        "aria-valuenow": progress,
        "aria-valuemin": 0,
        "aria-valuemax": 100
      }
    ) }) : null,
    /* @__PURE__ */ jsxRuntime.jsx(
      "ol",
      {
        className: cn(
          "m-0 flex list-none p-0",
          orientation === "horizontal" ? "flex-row items-start" : "flex-col gap-[var(--taav-space-4)]",
          contentClassName
        ),
        children: steps.map((step, index) => {
          const status = resolveStatus(step, index, currentIndex);
          const clickable = allowClick && !step.disabled && Boolean(onStepClick);
          const showCheck = status === "complete" && variant !== "icon";
          const indicatorContent = showCheck ? "\u2713" : variant === "icon" && step.icon ? step.icon : index + 1;
          const stepNode = /* @__PURE__ */ jsxRuntime.jsxs(
            "div",
            {
              className: cn(
                "flex min-w-0",
                orientation === "horizontal" ? "flex-col items-center gap-[var(--taav-space-2)] text-center" : "flex-row items-start gap-[var(--taav-space-3)]"
              ),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  "button",
                  {
                    type: "button",
                    disabled: !clickable,
                    onClick: () => clickable && onStepClick?.(step.id),
                    className: cn(
                      getTaavStepperIndicatorClass(size, status),
                      clickable && "cursor-pointer hover:brightness-105",
                      !clickable && "cursor-default",
                      step.disabled && "opacity-50"
                    ),
                    "aria-current": status === "current" ? "step" : void 0,
                    children: indicatorContent
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]", children: step.title }),
                  step.description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]", children: step.description }) : null
                ] })
              ]
            }
          );
          return /* @__PURE__ */ jsxRuntime.jsxs(
            "li",
            {
              className: cn("flex min-w-0 items-start", orientation === "horizontal" && "flex-1 flex-row"),
              children: [
                orientation === "horizontal" && index > 0 ? /* @__PURE__ */ jsxRuntime.jsx(
                  "div",
                  {
                    className: cn("mt-[calc(var(--taav-stepper-size-md)/2)] flex-1", getTaavStepperConnectorClass("complete", orientation)),
                    "aria-hidden": true
                  }
                ) : null,
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: orientation === "horizontal" ? "shrink-0" : "w-full", children: stepNode }),
                orientation === "vertical" && index < steps.length - 1 ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("ms-[calc(var(--taav-stepper-size-md)/2)]", getTaavStepperConnectorClass(status, orientation)), "aria-hidden": true }) : null
              ]
            },
            step.id
          );
        })
      }
    )
  ] });
}
var chipToneStyles = {
  neutral: {
    soft: "bg-[var(--taav-neutral-soft)] text-[var(--taav-text-body)] border-[color:var(--taav-neutral-border)]",
    outline: "bg-transparent text-[var(--taav-text-body)] border-[color:var(--taav-border)]",
    solid: "bg-[var(--taav-neutral-strong)] text-[var(--taav-surface)] border-[color:var(--taav-neutral-border)]",
    ghost: "bg-transparent text-[var(--taav-text-muted)] border-transparent"
  },
  brand: {
    soft: "bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)]",
    outline: "bg-transparent text-[var(--taav-brand-strong)] border-[color:var(--taav-brand-border)]",
    solid: "bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)] border-[color:var(--taav-brand-border)]",
    ghost: "bg-transparent text-[var(--taav-brand-strong)] border-transparent"
  },
  success: {
    soft: "bg-[var(--taav-success-soft)] text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)]",
    outline: "bg-transparent text-[var(--taav-success-strong)] border-[color:var(--taav-success-border)]",
    solid: "bg-[var(--taav-success)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-success-border)]",
    ghost: "bg-transparent text-[var(--taav-success-strong)] border-transparent"
  },
  warning: {
    soft: "bg-[var(--taav-warning-soft)] text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)]",
    outline: "bg-transparent text-[var(--taav-warning-strong)] border-[color:var(--taav-warning-border)]",
    solid: "bg-[var(--taav-warning)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-warning-border)]",
    ghost: "bg-transparent text-[var(--taav-warning-strong)] border-transparent"
  },
  danger: {
    soft: "bg-[var(--taav-danger-soft)] text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)]",
    outline: "bg-transparent text-[var(--taav-danger-strong)] border-[color:var(--taav-danger-border)]",
    solid: "bg-[var(--taav-danger)] text-[var(--taav-text-on-danger)] border-[color:var(--taav-danger-border)]",
    ghost: "bg-transparent text-[var(--taav-danger-strong)] border-transparent"
  },
  info: {
    soft: "bg-[var(--taav-info-soft)] text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)]",
    outline: "bg-transparent text-[var(--taav-info-strong)] border-[color:var(--taav-info-border)]",
    solid: "bg-[var(--taav-info)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-info-border)]",
    ghost: "bg-transparent text-[var(--taav-info-strong)] border-transparent"
  },
  purple: {
    soft: "bg-[var(--taav-purple-soft)] text-[var(--taav-purple-strong)] border-[color:var(--taav-purple-border)]",
    outline: "bg-transparent text-[var(--taav-purple-strong)] border-[color:var(--taav-purple-border)]",
    solid: "bg-[var(--taav-purple)] text-[var(--taav-text-on-solid)] border-[color:var(--taav-purple-border)]",
    ghost: "bg-transparent text-[var(--taav-purple-strong)] border-transparent"
  }
};
var taavChipVariants = classVarianceAuthority.cva(
  [
    "inline-flex max-w-full items-center justify-center gap-[var(--taav-space-1)] border border-solid",
    "font-[var(--taav-font-weight-medium)] leading-none",
    TAAV_INTERACTION.base,
    "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
    "disabled:pointer-events-none disabled:opacity-50"
  ],
  {
    variants: {
      size: {
        xs: "h-[var(--taav-chip-height-xs)] px-[var(--taav-chip-px-xs)] text-[length:var(--taav-text-2xs)]",
        sm: "h-[var(--taav-chip-height-sm)] px-[var(--taav-chip-px-sm)] text-[length:var(--taav-text-xs)]",
        md: "h-[var(--taav-chip-height-md)] px-[var(--taav-chip-px-md)] text-[length:var(--taav-text-sm)]",
        lg: "h-[var(--taav-chip-height-lg)] px-[var(--taav-chip-px-lg)] text-[length:var(--taav-text-md)]"
      },
      shape: {
        pill: "rounded-[var(--taav-radius-pill)]",
        rounded: "rounded-[var(--taav-radius-md)]",
        square: "rounded-[var(--taav-radius-sm)]"
      },
      width: {
        auto: "w-auto",
        fixed: "w-[var(--taav-chip-width-fixed)]",
        full: "w-full"
      }
    },
    defaultVariants: { size: "md", shape: "pill", width: "auto" }
  }
);
function getTaavChipToneClasses(tone, variant) {
  return chipToneStyles[tone][variant];
}
var taavChipSelectedClass = "border-[color:var(--taav-chip-selected-border)] bg-[var(--taav-chip-selected-bg)] ring-1 ring-[color:var(--taav-chip-selected-ring)]";
var taavChipGroupGapClass = {
  xs: "gap-[var(--taav-space-1)]",
  sm: "gap-[var(--taav-space-2)]",
  md: "gap-[var(--taav-space-3)]",
  lg: "gap-[var(--taav-space-4)]"
};
var taavTableShellVariants = classVarianceAuthority.cva(
  ["relative w-full overflow-x-auto rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-table-border)]", TAAV_INTERACTION.base],
  {
    variants: {
      variant: {
        default: "bg-[var(--taav-surface)]",
        bordered: "bg-[var(--taav-surface)]",
        striped: "bg-[var(--taav-surface)]",
        card: "bg-[var(--taav-surface)] shadow-[var(--taav-shadow-sm)]"
      }
    },
    defaultVariants: { variant: "default" }
  }
);
var taavTableHeadCellClass = "bg-[var(--taav-table-header-bg)] px-[var(--taav-space-4)] py-[var(--taav-space-3)] text-start text-[length:var(--taav-text-xs)] font-black text-[var(--taav-text-subtle)]";
var taavTableCellClass = "border-t border-[color:var(--taav-table-border)] px-[var(--taav-space-4)] py-[var(--taav-space-3)] text-[length:var(--taav-text-sm)] text-[var(--taav-text-body)]";
var taavTableRowClass = "transition-colors hover:bg-[var(--taav-table-row-hover)] data-[striped=true]:bg-[var(--taav-surface-soft)]";
var taavKeyValueLabelClass = {
  sm: "text-[length:var(--taav-kv-label-size-sm)]",
  md: "text-[length:var(--taav-kv-label-size-md)]",
  lg: "text-[length:var(--taav-kv-label-size-lg)]"
};
var taavKeyValueValueClass = {
  sm: "text-[length:var(--taav-kv-value-size-sm)]",
  md: "text-[length:var(--taav-kv-value-size-md)]",
  lg: "text-[length:var(--taav-kv-value-size-lg)]"
};
var taavKeyValueGapClass = {
  compact: "gap-[var(--taav-kv-gap-compact)]",
  comfortable: "gap-[var(--taav-kv-gap-comfortable)]"
};
function ChipSpinner() {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      className: "inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70",
      "aria-hidden": true
    }
  );
}
function ChipRemoveButton({ label, onRemove, disabled }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      className: cn(
        "inline-flex h-[var(--taav-chip-remove-size)] w-[var(--taav-chip-remove-size)] shrink-0 items-center justify-center rounded-full",
        "text-current opacity-70 hover:bg-[var(--taav-surface-muted)] hover:opacity-100",
        "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]"
      ),
      "aria-label": label,
      disabled,
      onClick: (event) => {
        event.stopPropagation();
        onRemove?.();
      },
      children: /* @__PURE__ */ jsxRuntime.jsx("svg", { "aria-hidden": true, viewBox: "0 0 12 12", className: "h-3 w-3", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3 3l6 6M9 3 3 9", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) })
    }
  );
}
function TaavChip({
  variant = "soft",
  tone = "neutral",
  size = "md",
  shape = "pill",
  width = "auto",
  selected = false,
  disabled = false,
  loading = false,
  behavior = "static",
  iconStart,
  iconEnd,
  removeLabel = "\u062D\u0630\u0641",
  onRemove,
  onClick,
  children,
  itemClassName,
  unsafeClassName,
  ...props
}) {
  const isInteractive = behavior !== "static";
  const isDisabled = disabled || loading;
  const showRemove = behavior === "removable" && onRemove;
  const className = cn(
    taavChipVariants({ size, shape, width }),
    getTaavChipToneClasses(tone, variant),
    selected && taavChipSelectedClass,
    isInteractive && !isDisabled && "cursor-pointer",
    itemClassName,
    unsafeClassName
  );
  const content = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    loading ? /* @__PURE__ */ jsxRuntime.jsx(ChipSpinner, {}) : null,
    !loading && iconStart ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconStart }) : null,
    children ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children }) : null,
    !loading && iconEnd ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconEnd }) : null,
    showRemove ? /* @__PURE__ */ jsxRuntime.jsx(ChipRemoveButton, { label: removeLabel, onRemove, disabled: isDisabled }) : null
  ] });
  if (!isInteractive) {
    return /* @__PURE__ */ jsxRuntime.jsx("span", { className, children: content });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className, disabled: isDisabled, onClick, "aria-pressed": behavior === "selectable" ? selected : void 0, ...props, children: content });
}
var STATUS_MAP = {
  active: { label: "\u0641\u0639\u0627\u0644", tone: "success" },
  inactive: { label: "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644", tone: "neutral" },
  draft: { label: "\u067E\u06CC\u0634\u200C\u0646\u0648\u06CC\u0633", tone: "neutral" },
  pending: { label: "\u062F\u0631 \u0627\u0646\u062A\u0638\u0627\u0631", tone: "warning" },
  approved: { label: "\u062A\u0623\u06CC\u06CC\u062F \u0634\u062F\u0647", tone: "success" },
  rejected: { label: "\u0631\u062F \u0634\u062F\u0647", tone: "danger" },
  completed: { label: "\u062A\u06A9\u0645\u06CC\u0644 \u0634\u062F\u0647", tone: "success" },
  failed: { label: "\u0646\u0627\u0645\u0648\u0641\u0642", tone: "danger" },
  warning: { label: "\u0647\u0634\u062F\u0627\u0631", tone: "warning" },
  archived: { label: "\u0628\u0627\u06CC\u06AF\u0627\u0646\u06CC", tone: "neutral" },
  locked: { label: "\u0642\u0641\u0644 \u0634\u062F\u0647", tone: "info" },
  unknown: { label: "\u0646\u0627\u0645\u0634\u062E\u0635", tone: "neutral" }
};
var dotSizeClass = {
  sm: "h-[var(--taav-status-dot-size-sm)] w-[var(--taav-status-dot-size-sm)]",
  md: "h-[var(--taav-status-dot-size-md)] w-[var(--taav-status-dot-size-md)]",
  lg: "h-[var(--taav-status-dot-size-lg)] w-[var(--taav-status-dot-size-lg)]"
};
function TaavStatusBadge({
  status,
  size = "md",
  variant = "soft",
  withDot = true,
  icon,
  label,
  children,
  wrapperClassName
}) {
  const config = STATUS_MAP[status];
  const text = children ?? label ?? config.label;
  const badgeSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "md";
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "span",
    {
      className: cn(
        taavBadgeVariants({ size: badgeSize, shape: "pill", width: "auto" }),
        getTaavBadgeToneClasses(config.tone, variant),
        wrapperClassName
      ),
      children: [
        withDot ? /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            className: cn("inline-block shrink-0 rounded-full bg-current opacity-80", dotSizeClass[size]),
            "aria-hidden": true
          }
        ) : null,
        icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5", children: icon }) : null,
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: text })
      ]
    }
  );
}
var sizePadding2 = {
  sm: "p-[var(--taav-empty-padding-sm)]",
  md: "p-[var(--taav-empty-padding-md)]",
  lg: "p-[var(--taav-empty-padding-lg)]"
};
var iconSize = {
  sm: "h-[var(--taav-empty-icon-size-sm)] w-[var(--taav-empty-icon-size-sm)]",
  md: "h-[var(--taav-empty-icon-size-md)] w-[var(--taav-empty-icon-size-md)]",
  lg: "h-[var(--taav-empty-icon-size-lg)] w-[var(--taav-empty-icon-size-lg)]"
};
var toneSurface = {
  neutral: "text-[var(--taav-text-muted)]",
  info: "text-[var(--taav-info-strong)]",
  warning: "text-[var(--taav-warning-strong)]",
  danger: "text-[var(--taav-danger-strong)]",
  success: "text-[var(--taav-success-strong)]"
};
function TaavEmptyState({
  variant = "default",
  size = "md",
  tone = "neutral",
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
  contentClassName,
  wrapperClassName
}) {
  const isCompact = variant === "compact" || size === "sm";
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        "flex flex-col items-center justify-center text-center",
        sizePadding2[size],
        variant !== "compact" && "rounded-[var(--taav-radius-lg)] bg-[var(--taav-empty-surface)]",
        wrapperClassName
      ),
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid max-w-md gap-[var(--taav-space-3)]", contentClassName), children: [
        icon ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("mx-auto inline-flex items-center justify-center rounded-full bg-[var(--taav-surface-muted)]", iconSize[size], toneSurface[tone]), children: icon }) : null,
        title ? /* @__PURE__ */ jsxRuntime.jsx("h3", { className: cn("m-0 font-black text-[var(--taav-text-strong)]", isCompact ? "text-[length:var(--taav-text-sm)]" : "text-[length:var(--taav-text-lg)]"), children: title }) : null,
        description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]", children: description }) : null,
        children,
        (primaryAction || secondaryAction) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center justify-center gap-[var(--taav-space-2)]", children: [
          secondaryAction,
          primaryAction
        ] })
      ] })
    }
  );
}
var sizeHeight = {
  sm: "h-3",
  md: "h-4",
  lg: "h-5"
};
var variantDefaults = {
  text: { height: "h-4", width: "w-full", radius: "md" },
  title: { height: "h-6", width: "w-2/3", radius: "md" },
  avatar: { height: "h-10 w-10", width: "w-10", radius: "full" },
  button: { height: "h-9", width: "w-24", radius: "md" },
  card: { height: "h-32", width: "w-full", radius: "lg" },
  row: { height: "h-12", width: "w-full", radius: "md" },
  table: { height: "h-10", width: "w-full", radius: "sm" }
};
var radiusClass = {
  sm: "rounded-[var(--taav-radius-sm)]",
  md: "rounded-[var(--taav-radius-md)]",
  lg: "rounded-[var(--taav-radius-lg)]",
  pill: "rounded-[var(--taav-radius-pill)]",
  full: "rounded-full"
};
function SkeletonBlock({
  className,
  animated,
  style
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "aria-hidden": true,
      className: cn(
        "bg-[var(--taav-skeleton-bg)]",
        animated && "animate-pulse",
        className
      ),
      style
    }
  );
}
function TaavSkeleton({
  variant = "text",
  size = "md",
  lines = 1,
  width,
  height,
  radius,
  animated = true,
  count = 1,
  contentClassName,
  wrapperClassName
}) {
  if (variant === "custom") {
    return /* @__PURE__ */ jsxRuntime.jsx(
      SkeletonBlock,
      {
        animated,
        className: cn(radiusClass[radius ?? "md"], contentClassName, wrapperClassName),
        style: { width, height }
      }
    );
  }
  const defaults = variantDefaults[variant];
  const resolvedRadius = radius ?? defaults.radius;
  if (variant === "text" && lines > 1) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("grid gap-2", wrapperClassName), children: Array.from({ length: lines }).map((_, index) => /* @__PURE__ */ jsxRuntime.jsx(
      SkeletonBlock,
      {
        animated,
        className: cn(defaults.height, index === lines - 1 ? "w-4/5" : "w-full", radiusClass[resolvedRadius], contentClassName)
      },
      index
    )) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("grid gap-2", wrapperClassName), children: Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsxRuntime.jsx(
    SkeletonBlock,
    {
      animated,
      className: cn(
        variant === "avatar" ? defaults.height : variant === "title" ? defaults.height : sizeHeight[size],
        variant !== "avatar" && (width ? "" : defaults.width),
        radiusClass[resolvedRadius],
        contentClassName
      ),
      style: width || height ? { width, height } : void 0
    },
    index
  )) });
}
function TaavTableShell({
  variant = "default",
  density = "comfortable",
  loading = false,
  empty = false,
  emptyState,
  footer,
  children,
  wrapperClassName,
  contentClassName
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(taavTableShellVariants({ variant }), wrapperClassName), children: [
    loading ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-[var(--taav-space-4)]", children: /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "table", count: 5 }) }) : empty ? emptyState ?? /* @__PURE__ */ jsxRuntime.jsx(TaavEmptyState, { variant: "compact", size: "sm", title: "\u0645\u0648\u0631\u062F\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F", description: "\u062F\u0627\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u0646\u0645\u0627\u06CC\u0634 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F." }) : /* @__PURE__ */ jsxRuntime.jsx("table", { className: cn("w-full border-collapse text-right", contentClassName), "data-density": density, "data-variant": variant, children }),
    footer ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-[color:var(--taav-table-border)] p-[var(--taav-space-3)]", children: footer }) : null
  ] });
}
function TaavTableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx("thead", { className, ...props });
}
function TaavTableBody({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx("tbody", { className, ...props });
}
function TaavTableRow({ className, striped, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx("tr", { className: cn(taavTableRowClass, className), "data-striped": striped || void 0, ...props });
}
function TaavTableHead({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx("th", { className: cn(taavTableHeadCellClass, className), ...props });
}
function TaavTableCell({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx("td", { className: cn(taavTableCellClass, className), ...props });
}
function TaavTableActions({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "td",
    {
      className: cn(taavTableCellClass, "w-[1%] whitespace-nowrap text-end", className),
      ...props
    }
  );
}
var valueToneClass = {
  neutral: "text-[var(--taav-text-strong)]",
  success: "text-[var(--taav-success-strong)]",
  warning: "text-[var(--taav-warning-strong)]",
  danger: "text-[var(--taav-danger-strong)]",
  info: "text-[var(--taav-info-strong)]"
};
function TaavKeyValue({
  items,
  layout = "vertical",
  size = "md",
  density = "comfortable",
  labelWidth,
  emptyText = "\u2014",
  separator = false,
  children,
  wrapperClassName,
  contentClassName
}) {
  if (children) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("grid", wrapperClassName), children });
  }
  const layoutClass = layout === "grid" ? "grid gap-[var(--taav-space-4)] sm:grid-cols-2" : layout === "horizontal" ? "grid gap-[var(--taav-space-3)]" : "grid gap-[var(--taav-space-3)]";
  return /* @__PURE__ */ jsxRuntime.jsx("dl", { className: cn(layoutClass, wrapperClassName), children: items?.map((item, index) => /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        layout === "horizontal" ? "flex items-start gap-[var(--taav-space-4)]" : "grid",
        taavKeyValueGapClass[density],
        separator && index > 0 && "border-t border-[color:var(--taav-border-subtle)] pt-[var(--taav-space-3)]",
        contentClassName
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "dt",
          {
            className: cn(
              "m-0 font-[var(--taav-font-weight-bold)] text-[var(--taav-text-muted)]",
              taavKeyValueLabelClass[size],
              layout === "horizontal" && "shrink-0"
            ),
            style: labelWidth ? { width: labelWidth } : void 0,
            children: /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "inline-flex items-center gap-[var(--taav-space-2)]", children: [
              item.icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex [&_svg]:h-4 [&_svg]:w-4", children: item.icon }) : null,
              item.label
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("dd", { className: cn("m-0 font-[var(--taav-font-weight-medium)]", taavKeyValueValueClass[size], valueToneClass[item.tone ?? "neutral"]), children: [
          item.value ?? emptyText,
          item.description ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mt-1 block text-[length:var(--taav-text-xs)] font-[var(--taav-font-weight-medium)] text-[var(--taav-text-subtle)]", children: item.description }) : null
        ] })
      ]
    },
    `${item.label}-${index}`
  )) });
}
function normalizeMultiple(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
function TaavChipGroup({
  orientation = "horizontal",
  wrap = true,
  gap = "sm",
  selectionMode = "none",
  value,
  defaultValue,
  onValueChange,
  options,
  size = "md",
  tone = "neutral",
  variant = "soft",
  disabled = false,
  children,
  wrapperClassName,
  contentClassName
}) {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? (selectionMode === "multiple" ? [] : "")
  );
  const isControlled = value !== void 0;
  const currentValue = isControlled ? value : internalValue;
  const toggle = (optionValue) => {
    if (selectionMode === "none") return;
    let next;
    if (selectionMode === "single") {
      next = optionValue;
    } else {
      const current = normalizeMultiple(currentValue);
      next = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
    }
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };
  const isSelected = (optionValue) => {
    if (selectionMode === "single") return currentValue === optionValue;
    if (selectionMode === "multiple") return normalizeMultiple(currentValue).includes(optionValue);
    return false;
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: selectionMode !== "none" ? "group" : void 0,
      className: cn(
        "flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        wrap && orientation === "horizontal" && "flex-wrap",
        taavChipGroupGapClass[gap],
        wrapperClassName
      ),
      children: options ? options.map((option) => /* @__PURE__ */ jsxRuntime.jsx(
        TaavChip,
        {
          size,
          tone: option.tone ?? tone,
          variant,
          behavior: selectionMode === "none" ? "static" : "selectable",
          selected: isSelected(option.value),
          disabled: disabled || option.disabled,
          iconStart: option.icon,
          onClick: () => toggle(option.value),
          itemClassName: contentClassName,
          children: option.label
        },
        option.value
      )) : children
    }
  );
}
function buildPageItems(page, totalPages, variant) {
  if (variant === "minimal") return [page];
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items = [1];
  if (page > 3) items.push("ellipsis");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p += 1) items.push(p);
  if (page < totalPages - 2) items.push("ellipsis");
  items.push(totalPages);
  return items;
}
function TaavPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  size = "md",
  variant = "default",
  showPageSize = false,
  showTotal = true,
  disabled = false,
  wrapperClassName
}) {
  const buttonSize = size === "lg" ? "md" : size === "sm" ? "sm" : "md";
  const pages = buildPageItems(page, totalPages, variant);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "flex flex-wrap items-center justify-between gap-[var(--taav-space-3)]",
        wrapperClassName
      ),
      dir: "rtl",
      children: [
        showTotal ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: totalItems != null ? `${totalItems} \u0645\u0648\u0631\u062F` : `\u0635\u0641\u062D\u0647 ${page} \u0627\u0632 ${totalPages}` }) : /* @__PURE__ */ jsxRuntime.jsx("span", {}),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            TaavButton,
            {
              size: buttonSize,
              variant: "outline",
              tone: "neutral",
              disabled: disabled || page <= 1,
              onClick: () => onPageChange(page - 1),
              "aria-label": "\u0635\u0641\u062D\u0647 \u0642\u0628\u0644",
              children: "\u0642\u0628\u0644\u06CC"
            }
          ),
          variant !== "minimal" && pages.map(
            (item, index) => item === "ellipsis" ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "px-1 text-[var(--taav-text-subtle)]", children: "\u2026" }, `ellipsis-${index}`) : /* @__PURE__ */ jsxRuntime.jsx(
              TaavButton,
              {
                size: buttonSize,
                variant: item === page ? "primary" : "outline",
                tone: item === page ? "brand" : "neutral",
                disabled,
                onClick: () => onPageChange(item),
                "aria-current": item === page ? "page" : void 0,
                children: item
              },
              item
            )
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            TaavButton,
            {
              size: buttonSize,
              variant: "outline",
              tone: "neutral",
              disabled: disabled || page >= totalPages,
              onClick: () => onPageChange(page + 1),
              "aria-label": "\u0635\u0641\u062D\u0647 \u0628\u0639\u062F",
              children: "\u0628\u0639\u062F\u06CC"
            }
          )
        ] }),
        showPageSize && pageSize != null && onPageSizeChange ? /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "inline-flex items-center gap-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: "\u062A\u0639\u062F\u0627\u062F" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "select",
            {
              className: "h-[var(--taav-pagination-height-md)] rounded-[var(--taav-radius-md)] border border-[color:var(--taav-border)] bg-[var(--taav-surface)] px-2 text-[length:var(--taav-text-sm)]",
              value: pageSize,
              disabled,
              onChange: (event) => onPageSizeChange(Number(event.target.value)),
              children: pageSizeOptions.map((option) => /* @__PURE__ */ jsxRuntime.jsx("option", { value: option, children: option }, option))
            }
          )
        ] }) : null
      ]
    }
  );
}
function TaavFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "\u062C\u0633\u062A\u062C\u0648...",
  filters,
  activeFilters,
  actions,
  children,
  layout = "responsive",
  density = "comfortable",
  sticky = false,
  resultCount,
  loading = false,
  wrapperClassName,
  contentClassName
}) {
  const showSearch = onSearchChange !== void 0;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-filterbar-border)] bg-[var(--taav-filterbar-surface)]",
        density === "compact" ? "p-[var(--taav-space-3)]" : "p-[var(--taav-space-4)]",
        sticky && "sticky top-0 z-[var(--taav-z-sticky)]",
        wrapperClassName
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: cn(
              "grid gap-[var(--taav-filterbar-gap)]",
              layout === "inline" && "grid-cols-[1fr_auto_auto]",
              layout === "stacked" && "grid-cols-1",
              layout === "responsive" && "lg:grid-cols-[1fr_auto_auto] lg:items-center",
              contentClassName
            ),
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-[var(--taav-filterbar-gap)]", children: [
                showSearch ? loading ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "row", size: "sm" }) : /* @__PURE__ */ jsxRuntime.jsx(
                  TaavInput,
                  {
                    size: density === "compact" ? "sm" : "md",
                    placeholder: searchPlaceholder,
                    value: searchValue,
                    onChange: (event) => onSearchChange?.(event.target.value)
                  }
                ) : null,
                filters,
                activeFilters ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap gap-[var(--taav-space-2)]", children: activeFilters }) : null
              ] }),
              resultCount != null ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 self-center text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: loading ? "\u2026" : `${resultCount} \u0646\u062A\u06CC\u062C\u0647` }) : null,
              actions ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: actions }) : null
            ]
          }
        ),
        children
      ]
    }
  );
}

// src/layout/shared/layout.variants.ts
var layoutDensityGap = {
  compact: "gap-[var(--taav-layout-gap-compact)]",
  comfortable: "gap-[var(--taav-layout-gap-comfortable)]",
  spacious: "gap-[var(--taav-layout-gap-spacious)]"
};
var layoutPaddingClass = {
  none: "p-0",
  sm: "p-[var(--taav-section-padding-sm)]",
  md: "p-[var(--taav-section-padding-md)]",
  lg: "p-[var(--taav-section-padding-lg)]"
};
var pagePaddingClass = {
  none: "p-0",
  sm: "p-[var(--taav-page-padding-sm)]",
  md: "p-[var(--taav-page-padding-md)]",
  lg: "p-[var(--taav-page-padding-lg)]"
};
var layoutToneSurface = {
  neutral: "bg-[var(--taav-stats-tone-neutral)]",
  brand: "bg-[var(--taav-stats-tone-brand)]",
  success: "bg-[var(--taav-stats-tone-success)]",
  warning: "bg-[var(--taav-stats-tone-warning)]",
  danger: "bg-[var(--taav-stats-tone-danger)]",
  info: "bg-[var(--taav-stats-tone-info)]",
  purple: "bg-[var(--taav-stats-tone-purple)]"
};
var layoutToneText = {
  neutral: "text-[var(--taav-text-strong)]",
  brand: "text-[var(--taav-brand-strong)]",
  success: "text-[var(--taav-success-strong)]",
  warning: "text-[var(--taav-warning-strong)]",
  danger: "text-[var(--taav-danger-strong)]",
  info: "text-[var(--taav-info-strong)]",
  purple: "text-[var(--taav-purple-strong)]"
};
var progressFillTone = {
  neutral: "bg-[var(--taav-neutral)]",
  brand: "bg-[var(--taav-progress-fill-brand)]",
  success: "bg-[var(--taav-progress-fill-success)]",
  warning: "bg-[var(--taav-warning)]",
  danger: "bg-[var(--taav-danger)]",
  info: "bg-[var(--taav-info)]",
  purple: "bg-[var(--taav-purple)]"
};
var variantClass = {
  default: "",
  dashboard: "bg-[var(--taav-page-bg)]",
  settings: "bg-[var(--taav-page-bg)]",
  detail: "bg-[var(--taav-page-bg)]",
  form: "bg-[var(--taav-surface-soft)]",
  report: "bg-[var(--taav-page-bg)]"
};
var widthClass = {
  narrow: "max-w-[var(--taav-page-container-narrow)]",
  normal: "max-w-[var(--taav-page-container-normal)]",
  wide: "max-w-[var(--taav-page-container-wide)]",
  full: "max-w-[var(--taav-page-container-full)]"
};
function TaavPageShell({
  variant = "default",
  width = "normal",
  padding = "md",
  density = "comfortable",
  withBackground = true,
  withContainer = true,
  header,
  sidebar,
  footer,
  children,
  wrapperClassName,
  contentClassName,
  ...props
}) {
  const hasSidebar = Boolean(sidebar);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        "min-h-full w-full",
        withBackground && (variantClass[variant] || "bg-[var(--taav-page-bg)]"),
        wrapperClassName
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: cn(
            "mx-auto w-full",
            withContainer && widthClass[width],
            pagePaddingClass[padding]
          ),
          children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-col", layoutDensityGap[density], contentClassName), children: [
            header,
            hasSidebar ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-col lg:flex-row", layoutDensityGap[density]), children: [
              sidebar,
              /* @__PURE__ */ jsxRuntime.jsx("main", { className: "min-w-0 flex-1", children })
            ] }) : children,
            footer
          ] })
        }
      )
    }
  );
}
var variantClass2 = {
  default: "pb-[var(--taav-header-gap)]",
  compact: "pb-[var(--taav-space-3)]",
  hero: "pb-[var(--taav-space-6)]",
  plain: ""
};
var sizeTitleClass = {
  sm: "text-[length:var(--taav-header-title-sm)]",
  md: "text-[length:var(--taav-header-title-md)]",
  lg: "text-[length:var(--taav-header-title-lg)]"
};
function TaavPageHeader({
  title,
  eyebrow,
  description,
  badge,
  status,
  meta,
  breadcrumbs,
  actions,
  secondaryActions,
  backAction,
  icon,
  variant = "default",
  size = "md",
  sticky = false,
  bordered = false,
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName
}) {
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("header", { className: cn("grid gap-[var(--taav-space-3)]", variantClass2[variant], wrapperClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", lines: 1, width: "30%" }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title" }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", lines: 2 })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "header",
    {
      className: cn(
        variantClass2[variant],
        sticky && "sticky top-[var(--taav-header-sticky-offset)] z-[var(--taav-z-sticky)] bg-[var(--taav-page-bg)]",
        bordered && "border-b border-[color:var(--taav-border-subtle)]",
        wrapperClassName
      ),
      children: [
        breadcrumbs ? /* @__PURE__ */ jsxRuntime.jsx("nav", { "aria-label": "breadcrumb", className: "mb-[var(--taav-space-3)] text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: breadcrumbs }) : null,
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-header-gap)]", headerClassName), children: [
          (backAction || icon || eyebrow) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
            backAction,
            icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 items-center justify-center rounded-[var(--taav-radius-md)] bg-[var(--taav-surface-muted)] p-2 text-[var(--taav-brand-strong)]", children: icon }) : null,
            eyebrow ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[length:var(--taav-header-eyebrow)] font-bold text-[var(--taav-text-subtle)]", children: eyebrow }) : null
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-col gap-[var(--taav-space-4)] lg:flex-row lg:items-start lg:justify-between", contentClassName), children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid min-w-0 flex-1 gap-[var(--taav-space-2)]", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
                title ? /* @__PURE__ */ jsxRuntime.jsx("h1", { className: cn("m-0 font-black leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]", sizeTitleClass[size]), children: title }) : null,
                badge,
                status ? /* @__PURE__ */ jsxRuntime.jsx(TaavStatusBadge, { status, size: "sm" }) : null
              ] }),
              description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 max-w-3xl text-[length:var(--taav-header-description)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]", children: description }) : null,
              meta ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-3)] text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: meta }) : null
            ] }),
            (actions || secondaryActions) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex shrink-0 flex-wrap items-center gap-[var(--taav-space-2)]", children: [
              secondaryActions,
              actions
            ] })
          ] })
        ] })
      ]
    }
  );
}
var variantClass3 = {
  default: "border-b border-[color:var(--taav-section-border)] pb-[var(--taav-space-6)]",
  card: "rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-card)]",
  split: "",
  compact: "border-b border-[color:var(--taav-section-border)] pb-[var(--taav-space-4)]"
};
function TaavSettingsSection({
  title,
  description,
  status,
  completion,
  required,
  optional,
  warning,
  actions,
  aside,
  children,
  variant = "default",
  density = "comfortable",
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName,
  ...props
}) {
  const isSplit = variant === "split" || variant === "card";
  const padding = variant === "card" ? layoutPaddingClass.md : "";
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("section", { className: cn(variantClass3[variant], padding, wrapperClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "row", count: 2 }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("section", { className: cn(variantClass3[variant], padding, wrapperClassName), ...props, children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        isSplit ? cn("grid gap-[var(--taav-space-6)] lg:grid-cols-[minmax(0,280px)_1fr]", layoutDensityGap[density]) : cn("grid", layoutDensityGap[density])
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-2)]", headerClassName), children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
            title ? /* @__PURE__ */ jsxRuntime.jsxs("h3", { className: "m-0 text-[length:var(--taav-text-md)] font-black text-[var(--taav-text-strong)]", children: [
              title,
              required ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ms-1 text-[color:var(--taav-required-mark)]", "aria-hidden": true, children: "*" }) : null
            ] }) : null,
            optional ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: "(\u0627\u062E\u062A\u06CC\u0627\u0631\u06CC)" }) : null,
            status ? /* @__PURE__ */ jsxRuntime.jsx(TaavStatusBadge, { status, size: "sm" }) : null,
            completion
          ] }),
          description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]", children: description }) : null,
          warning ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-warning-strong)]", children: warning }) : null,
          aside
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-4)]", contentClassName), children: [
          actions ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: actions }) : null,
          children
        ] })
      ]
    }
  ) });
}
var variantClass4 = {
  default: "pb-[var(--taav-space-5)]",
  card: "rounded-[var(--taav-radius-xl)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-card)] p-[var(--taav-section-padding-md)]",
  compact: "pb-[var(--taav-space-3)]",
  hero: "rounded-[var(--taav-radius-xl)] bg-[var(--taav-surface-soft)] p-[var(--taav-section-padding-lg)] pb-[var(--taav-space-6)]"
};
function TaavDetailHeader({
  title,
  subtitle,
  avatar,
  icon,
  status,
  meta,
  tags,
  actions,
  backAction,
  tabs,
  summary,
  variant = "default",
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName
}) {
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsx("header", { className: cn(variantClass4[variant], wrapperClassName), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-[var(--taav-space-4)]", children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "avatar" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title" }),
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", lines: 1 })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("header", { className: cn(variantClass4[variant], wrapperClassName), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-4)]", headerClassName), children: [
    backAction ? /* @__PURE__ */ jsxRuntime.jsx("div", { children: backAction }) : null,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-col gap-[var(--taav-space-4)] lg:flex-row lg:items-start lg:justify-between", contentClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-w-0 flex-1 items-start gap-[var(--taav-space-4)]", children: [
        avatar ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "shrink-0", children: avatar }) : null,
        !avatar && icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--taav-radius-lg)] bg-[var(--taav-brand-muted)] text-[var(--taav-brand-strong)]", children: icon }) : null,
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid min-w-0 flex-1 gap-[var(--taav-space-2)]", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
            title ? /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "m-0 text-[length:var(--taav-header-title-md)] font-black text-[var(--taav-text-strong)]", children: title }) : null,
            status ? /* @__PURE__ */ jsxRuntime.jsx(TaavStatusBadge, { status, size: "sm" }) : null
          ] }),
          subtitle ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: subtitle }) : null,
          meta ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-3)] text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: meta }) : null,
          tags ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: tags }) : null
        ] })
      ] }),
      actions ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex shrink-0 flex-wrap items-center gap-[var(--taav-space-2)]", children: actions }) : null
    ] }),
    summary ? /* @__PURE__ */ jsxRuntime.jsx("div", { children: summary }) : null,
    tabs ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-b border-[color:var(--taav-border-subtle)]", children: tabs }) : null
  ] }) });
}
var positionClass = {
  bottom: "sticky bottom-0 border-t",
  top: "sticky top-[var(--taav-header-sticky-offset)] border-b"
};
var variantClass5 = {
  default: "bg-[var(--taav-action-bar-surface)] border-[color:var(--taav-action-bar-border)]",
  elevated: "bg-[var(--taav-action-bar-surface)] border-[color:var(--taav-action-bar-border)] shadow-[var(--taav-action-bar-shadow)]",
  soft: "bg-[var(--taav-surface-soft)] border-[color:var(--taav-border-subtle)]",
  transparent: "border-[color:var(--taav-border-subtle)] bg-transparent backdrop-blur-sm"
};
var alignClass = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
  center: "justify-center"
};
function TaavStickyActionBar({
  position = "bottom",
  variant = "default",
  align = "end",
  primaryAction,
  secondaryAction,
  tertiaryAction,
  actions,
  summary,
  dirty = false,
  loading = false,
  disabled = false,
  children,
  contentClassName,
  wrapperClassName,
  ...props
}) {
  const hasActions = Boolean(primaryAction || secondaryAction || tertiaryAction || actions || children);
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "toolbar",
      "aria-label": "\u0627\u0642\u062F\u0627\u0645\u0627\u062A \u0635\u0641\u062D\u0647",
      className: cn(
        "z-[var(--taav-z-sticky)] min-h-[var(--taav-action-bar-height)] px-[var(--taav-page-padding-md)] py-[var(--taav-space-3)]",
        positionClass[position],
        variantClass5[variant],
        disabled && "pointer-events-none opacity-60",
        wrapperClassName
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: cn(
            "mx-auto flex w-full max-w-[var(--taav-page-container-wide)] flex-wrap items-center gap-[var(--taav-space-3)]",
            summary ? "justify-between" : alignClass[align],
            contentClassName
          ),
          children: [
            summary ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "min-w-0 flex-1 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: summary }) : null,
            loading ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "button", count: 2 }) : hasActions ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-wrap items-center gap-[var(--taav-space-2)]", !summary && alignClass[align]), children: [
              dirty ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-warning-strong)]", children: "\u062A\u063A\u06CC\u06CC\u0631\u0627\u062A \u0630\u062E\u06CC\u0631\u0647 \u0646\u0634\u062F\u0647" }) : null,
              tertiaryAction,
              secondaryAction,
              primaryAction,
              actions,
              children
            ] }) : null
          ]
        }
      )
    }
  );
}
var variantClass6 = {
  card: "rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-card)]",
  soft: "rounded-[var(--taav-radius-lg)]",
  outline: "rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-transparent",
  ghost: "rounded-[var(--taav-radius-lg)] bg-transparent"
};
var sizeValueClass = {
  sm: "text-[length:var(--taav-stats-value-sm)]",
  md: "text-[length:var(--taav-stats-value-md)]",
  lg: "text-[length:var(--taav-stats-value-lg)]"
};
var trendToneClass = {
  neutral: "text-[var(--taav-text-muted)]",
  success: "text-[var(--taav-success-strong)]",
  warning: "text-[var(--taav-warning-strong)]",
  danger: "text-[var(--taav-danger-strong)]",
  info: "text-[var(--taav-info-strong)]"
};
var trendDirectionSymbol = {
  up: "\u2191",
  down: "\u2193",
  flat: "\u2192"
};
function TaavStatsCard({
  title,
  value,
  description,
  icon,
  trend,
  tone = "neutral",
  size = "md",
  variant = "card",
  loading = false,
  footer,
  action,
  contentClassName,
  wrapperClassName,
  ...props
}) {
  const softSurface = variant === "soft";
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(variantClass6[variant], layoutPaddingClass.md, wrapperClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", width: "40%" }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        variantClass6[variant],
        softSurface && layoutToneSurface[tone],
        layoutPaddingClass.md,
        wrapperClassName
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-2)]", contentClassName), children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between gap-[var(--taav-space-2)]", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid min-w-0 flex-1 gap-[var(--taav-space-1)]", children: [
            title ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-stats-title)] font-bold text-[var(--taav-text-subtle)]", children: title }) : null,
            value ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: cn("m-0 font-black leading-[var(--taav-leading-tight)]", sizeValueClass[size], softSurface ? layoutToneText[tone] : "text-[var(--taav-text-strong)]"), children: value }) : null
          ] }),
          icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("inline-flex shrink-0 rounded-[var(--taav-radius-md)] p-2", layoutToneSurface[tone], layoutToneText[tone]), children: icon }) : null
        ] }),
        description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-stats-description)] text-[var(--taav-text-muted)]", children: description }) : null,
        trend ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-wrap items-center gap-[var(--taav-space-1)] text-[length:var(--taav-text-xs)] font-bold", trendToneClass[trend.tone ?? "neutral"]), children: [
          trend.direction ? /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": true, children: trendDirectionSymbol[trend.direction] }) : null,
          /* @__PURE__ */ jsxRuntime.jsx("span", { children: trend.value }),
          trend.label ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-normal text-[var(--taav-text-subtle)]", children: trend.label }) : null
        ] }) : null,
        action ? /* @__PURE__ */ jsxRuntime.jsx("div", { children: action }) : null,
        footer ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-[color:var(--taav-border-subtle)] pt-[var(--taav-space-2)]", children: footer }) : null
      ] })
    }
  );
}
var sizeBarHeight = {
  sm: "h-[var(--taav-progress-height-sm)]",
  md: "h-[var(--taav-progress-height-md)]",
  lg: "h-[var(--taav-progress-height-lg)]"
};
var sizeRingSize = {
  sm: "h-[var(--taav-progress-ring-size-sm)] w-[var(--taav-progress-ring-size-sm)]",
  md: "h-[var(--taav-progress-ring-size-md)] w-[var(--taav-progress-ring-size-md)]",
  lg: "h-[var(--taav-progress-ring-size-lg)] w-[var(--taav-progress-ring-size-lg)]"
};
var itemStatusClass = {
  done: "text-[var(--taav-success-strong)]",
  current: "text-[var(--taav-brand-strong)]",
  pending: "text-[var(--taav-text-subtle)]",
  warning: "text-[var(--taav-warning-strong)]",
  error: "text-[var(--taav-danger-strong)]"
};
var itemStatusSymbol = {
  done: "\u2713",
  current: "\u25CF",
  pending: "\u25CB",
  warning: "!",
  error: "\u2715"
};
var ringStrokeVar = {
  neutral: "var(--taav-neutral)",
  brand: "var(--taav-progress-fill-brand)",
  success: "var(--taav-progress-fill-success)",
  warning: "var(--taav-warning)",
  danger: "var(--taav-danger)",
  info: "var(--taav-info)",
  purple: "var(--taav-purple)"
};
function resolvePercent(value, max, percent) {
  if (typeof percent === "number") return Math.min(100, Math.max(0, percent));
  if (typeof value === "number" && typeof max === "number" && max > 0) {
    return Math.min(100, Math.max(0, Math.round(value / max * 100)));
  }
  return 0;
}
function TaavProgressSummary({
  value,
  max,
  percent,
  label,
  description,
  status,
  items,
  tone = "brand",
  size = "md",
  variant = "bar",
  showPercent = true,
  loading = false,
  contentClassName,
  wrapperClassName,
  ...props
}) {
  const resolvedPercent = resolvePercent(value, max, percent);
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-3)]", wrapperClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", width: "50%" }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", height: 8 })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[var(--taav-space-3)]", wrapperClassName), ...props, children: [
    (label || description || status || showPercent && variant !== "list") && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex flex-wrap items-start justify-between gap-[var(--taav-space-2)]", contentClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-[var(--taav-space-1)]", children: [
        label ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]", children: label }) : null,
        description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]", children: description }) : null
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
        status ? /* @__PURE__ */ jsxRuntime.jsx(TaavStatusBadge, { status, size: "sm" }) : null,
        showPercent && variant !== "list" ? /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]", children: [
          resolvedPercent,
          "%"
        ] }) : null
      ] })
    ] }),
    variant === "bar" || variant === "compact" ? /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: cn(
          "overflow-hidden rounded-[var(--taav-radius-pill)] bg-[var(--taav-progress-bg)]",
          sizeBarHeight[size],
          variant === "compact" && "max-w-xs"
        ),
        role: "progressbar",
        "aria-valuenow": resolvedPercent,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: cn("h-full rounded-[var(--taav-radius-pill)] transition-[width] duration-[var(--taav-duration-normal)]", progressFillTone[tone]),
            style: { width: `${resolvedPercent}%` }
          }
        )
      }
    ) : null,
    variant === "ring" ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-[var(--taav-space-4)]", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: cn("relative inline-flex items-center justify-center rounded-full", sizeRingSize[size]),
          role: "progressbar",
          "aria-valuenow": resolvedPercent,
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("svg", { className: "h-full w-full -rotate-90", viewBox: "0 0 36 36", "aria-hidden": true, children: [
              /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "18", cy: "18", r: "15.5", fill: "none", stroke: "var(--taav-progress-bg)", strokeWidth: "3" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "circle",
                {
                  cx: "18",
                  cy: "18",
                  r: "15.5",
                  fill: "none",
                  stroke: ringStrokeVar[tone],
                  strokeWidth: "3",
                  strokeDasharray: `${resolvedPercent} 100`,
                  strokeLinecap: "round",
                  pathLength: 100
                }
              )
            ] }),
            showPercent ? /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "absolute text-[length:var(--taav-text-xs)] font-black text-[var(--taav-text-strong)]", children: [
              resolvedPercent,
              "%"
            ] }) : null
          ]
        }
      ),
      description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: description }) : null
    ] }) : null,
    (variant === "list" || items) && items && items.length > 0 ? /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "m-0 grid list-none gap-[var(--taav-space-2)] p-0", children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "flex items-start gap-[var(--taav-space-2)]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("inline-flex h-5 w-5 shrink-0 items-center justify-center text-[length:var(--taav-text-xs)] font-black", itemStatusClass[item.status]), "aria-hidden": true, children: itemStatusSymbol[item.status] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-[var(--taav-space-0)]", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[length:var(--taav-text-sm)] text-[var(--taav-text-body)]", children: item.label }),
        item.description ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]", children: item.description }) : null
      ] })
    ] }, item.id)) }) : null
  ] });
}
var variantSurface = {
  card: "rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-card)]",
  plain: "",
  outlined: "rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-section-border)] bg-[var(--taav-section-surface-outlined)]",
  soft: "rounded-[var(--taav-radius-lg)] bg-[var(--taav-section-surface-soft)]"
};
function TaavSection({
  title,
  description,
  eyebrow,
  icon,
  badge,
  actions,
  footer,
  children,
  variant = "card",
  padding = "md",
  density = "comfortable",
  collapsible = false,
  defaultCollapsed = false,
  disabled = false,
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName,
  ...props
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const isCollapsed = collapsible && collapsed;
  const hasHeader = Boolean(title || description || eyebrow || icon || badge || actions);
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("section", { className: cn(variantSurface[variant], layoutPaddingClass[padding], wrapperClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", lines: 3 }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "section",
    {
      className: cn(
        variantSurface[variant],
        disabled && "pointer-events-none opacity-60",
        wrapperClassName
      ),
      "aria-disabled": disabled || void 0,
      ...props,
      children: [
        hasHeader ? /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: cn(
              "flex flex-wrap items-start justify-between gap-[var(--taav-space-3)] border-b border-[color:var(--taav-border-subtle)]",
              layoutPaddingClass[padding],
              !children && !footer && "border-b-0",
              headerClassName
            ),
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid min-w-0 flex-1 gap-[var(--taav-space-1)]", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
                  collapsible ? /* @__PURE__ */ jsxRuntime.jsx(
                    "button",
                    {
                      type: "button",
                      className: "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--taav-radius-sm)] text-[var(--taav-text-muted)] transition hover:bg-[var(--taav-surface-muted)]",
                      "aria-expanded": !isCollapsed,
                      onClick: () => setCollapsed((value) => !value),
                      children: /* @__PURE__ */ jsxRuntime.jsx(
                        "span",
                        {
                          className: cn(
                            "inline-block text-[length:var(--taav-text-xs)] transition-transform duration-[var(--taav-duration-fast)]",
                            isCollapsed && "-rotate-90"
                          ),
                          "aria-hidden": true,
                          children: "\u25BE"
                        }
                      )
                    }
                  ) : null,
                  icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 text-[var(--taav-brand-strong)]", children: icon }) : null,
                  eyebrow ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-subtle)]", children: eyebrow }) : null,
                  title ? /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "m-0 text-[length:var(--taav-text-md)] font-black text-[var(--taav-text-strong)]", children: title }) : null,
                  badge
                ] }),
                description && !isCollapsed ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]", children: description }) : null
              ] }),
              actions ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex shrink-0 flex-wrap items-center gap-[var(--taav-space-2)]", children: actions }) : null
            ]
          }
        ) : null,
        !isCollapsed && children ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(layoutPaddingClass[padding], layoutDensityGap[density], "grid", contentClassName), children }) : null,
        !isCollapsed && footer ? /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: cn(
              "border-t border-[color:var(--taav-border-subtle)]",
              layoutPaddingClass[padding]
            ),
            children: footer
          }
        ) : null
      ]
    }
  );
}
var variantClass7 = {
  card: "rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-sidebar-border)] bg-[var(--taav-sidebar-surface)]",
  soft: "rounded-[var(--taav-radius-lg)] bg-[var(--taav-surface-soft)]",
  outlined: "rounded-[var(--taav-radius-lg)] border border-[color:var(--taav-sidebar-border)] bg-[var(--taav-sidebar-surface)]",
  plain: ""
};
var widthClass2 = {
  sm: "w-full lg:w-[var(--taav-sidebar-width-sm)]",
  md: "w-full lg:w-[var(--taav-sidebar-width-md)]",
  lg: "w-full lg:w-[var(--taav-sidebar-width-lg)]"
};
function TaavSidebarPanel({
  title,
  description,
  icon,
  status,
  actions,
  footer,
  children,
  variant = "card",
  width = "md",
  sticky = false,
  collapsible = false,
  defaultCollapsed = false,
  density = "comfortable",
  loading = false,
  headerClassName,
  contentClassName,
  wrapperClassName,
  ...props
}) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const isCollapsed = collapsible && collapsed;
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsxs("aside", { className: cn(variantClass7[variant], widthClass2[width], layoutPaddingClass.md, wrapperClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "card" }) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "aside",
    {
      className: cn(
        variantClass7[variant],
        widthClass2[width],
        sticky && "lg:sticky lg:top-[var(--taav-space-4)] lg:self-start",
        "shrink-0",
        wrapperClassName
      ),
      ...props,
      children: [
        (title || description || icon || status || actions || collapsible) && /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: cn(
              "flex items-start justify-between gap-[var(--taav-space-2)] border-b border-[color:var(--taav-border-subtle)]",
              layoutPaddingClass.md,
              headerClassName
            ),
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid min-w-0 flex-1 gap-[var(--taav-space-1)]", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
                  collapsible ? /* @__PURE__ */ jsxRuntime.jsx(
                    "button",
                    {
                      type: "button",
                      className: "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--taav-radius-sm)] text-[var(--taav-text-muted)] hover:bg-[var(--taav-surface-muted)]",
                      "aria-expanded": !isCollapsed,
                      onClick: () => setCollapsed((value) => !value),
                      children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("text-[length:var(--taav-text-xs)] transition-transform", isCollapsed && "-rotate-90"), "aria-hidden": true, children: "\u25BE" })
                    }
                  ) : null,
                  icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[var(--taav-brand-strong)]", children: icon }) : null,
                  title ? /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]", children: title }) : null,
                  status ? /* @__PURE__ */ jsxRuntime.jsx(TaavStatusBadge, { status, size: "sm" }) : null
                ] }),
                description && !isCollapsed ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[length:var(--taav-text-xs)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]", children: description }) : null
              ] }),
              actions ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex shrink-0 items-center gap-[var(--taav-space-2)]", children: actions }) : null
            ]
          }
        ),
        !isCollapsed && children ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(layoutPaddingClass.md, layoutDensityGap[density], "grid", contentClassName), children }) : null,
        !isCollapsed && footer ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("border-t border-[color:var(--taav-border-subtle)]", layoutPaddingClass.md), children: footer }) : null
      ]
    }
  );
}
var DatePicker = dynamic__default.default(() => import('react-multi-date-picker').then((mod) => mod?.default ?? mod), { ssr: false });
function PersianDatePicker({
  value,
  onChange,
  placeholder = "\u0627\u0646\u062A\u062E\u0627\u0628 \u062A\u0627\u0631\u06CC\u062E",
  className = "",
  containerClassName = "",
  withCalendarIcon = true,
  calendarIconAriaLabel = "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u062A\u0642\u0648\u06CC\u0645"
}) {
  const [portalTarget, setPortalTarget] = React.useState(null);
  React.useEffect(() => {
    setPortalTarget(document.body);
  }, []);
  const inputClassName = React.useMemo(() => {
    const base = "app-control text-left text-sm text-gray-800 placeholder:text-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 [direction:ltr]";
    const iconPadding = withCalendarIcon ? "pr-10" : "";
    return `${base} ${iconPadding} ${className}`.trim();
  }, [className, withCalendarIcon]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    DatePicker,
    {
      calendar: persian__default.default,
      locale: persian_fa__default.default,
      calendarPosition: "bottom-right",
      portal: Boolean(portalTarget),
      portalTarget: portalTarget ?? void 0,
      zIndex: 1200,
      value,
      onChange: (date) => {
        if (date) onChange(date.format("YYYY/MM/DD"));
        else onChange("");
      },
      inputClass: inputClassName,
      placeholder,
      style: { width: "100%" },
      containerClassName,
      render: (displayValue, openCalendar) => {
        if (!withCalendarIcon) {
          return /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              value: displayValue,
              readOnly: true,
              onFocus: openCalendar,
              onClick: openCalendar,
              placeholder,
              className: inputClassName,
              style: { width: "100%" }
            }
          );
        }
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-full", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              value: displayValue,
              readOnly: true,
              onFocus: openCalendar,
              onClick: openCalendar,
              placeholder,
              className: inputClassName,
              style: { width: "100%" }
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              "aria-label": calendarIconAriaLabel,
              onClick: openCalendar,
              className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600",
              children: /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsx(
                "path",
                {
                  d: "M8 3v3M16 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              ) })
            }
          )
        ] });
      }
    }
  );
}
function BusinessSwitch({
  checked,
  onChange,
  activeLabel = "\u0641\u0639\u0627\u0644",
  inactiveLabel = "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644",
  className = "business-switch"
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", className, "aria-pressed": checked, onClick: () => onChange(!checked), children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "business-switch-option is-on", children: activeLabel }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "business-switch-option is-off", children: inactiveLabel })
  ] });
}
function SegmentedToggle({
  checked,
  onChange,
  activeLabel = "\u0641\u0639\u0627\u0644",
  inactiveLabel = "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644"
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(BusinessSwitch, { checked, onChange, activeLabel, inactiveLabel });
}
var Input = React__namespace.forwardRef(
  ({
    className = "",
    startAdornment,
    endAdornment,
    startAdornmentClassName = "",
    endAdornmentClassName = "",
    containerClassName = "",
    startAdornmentWrapperClassName = "",
    endAdornmentWrapperClassName = "",
    ...props
  }, ref) => {
    const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
    const baseClassName = `h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${invalid ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"}`;
    const inputClassName = `${baseClassName} ${startAdornment ? "pl-11" : ""} ${endAdornment ? "pr-11" : ""} ${className}`;
    if (!startAdornment && !endAdornment) {
      return /* @__PURE__ */ jsxRuntime.jsx("input", { ref, className: inputClassName, ...props });
    }
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `relative w-full ${containerClassName}`, children: [
      startAdornment ? /* @__PURE__ */ jsxRuntime.jsx(
        "span",
        {
          className: `pointer-events-none absolute left-3 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center ${startAdornmentWrapperClassName} ${startAdornmentClassName}`,
          children: startAdornment
        }
      ) : null,
      /* @__PURE__ */ jsxRuntime.jsx("input", { ref, className: inputClassName, ...props }),
      endAdornment ? /* @__PURE__ */ jsxRuntime.jsx(
        "span",
        {
          className: `pointer-events-none absolute right-3 top-1/2 z-10 inline-flex -translate-y-1/2 items-center justify-center ${endAdornmentWrapperClassName} ${endAdornmentClassName}`,
          children: endAdornment
        }
      ) : null
    ] });
  }
);
Input.displayName = "Input";
function PageIntro({
  title,
  description,
  action,
  badge,
  aside
}) {
  return /* @__PURE__ */ jsxRuntime.jsx("section", { className: "page-intro overflow-hidden rounded-[30px] border border-[color:var(--border-color)] bg-[linear-gradient(135deg,rgba(8,17,31,0.96),rgba(14,26,43,0.9))] p-6 shadow-[0_18px_50px_var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-5 lg:max-w-[min(100%,720px)]", children: [
      badge ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-start", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-bold text-white/90", children: badge }) }) : null,
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-[28px] font-black leading-tight text-white sm:text-[34px]", children: title }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "max-w-3xl text-sm leading-8 text-white/72", children: description })
      ] }),
      action ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap items-center gap-3", children: action }) : null
    ] }),
    aside ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "lg:min-w-[280px] lg:max-w-[320px]", children: aside }) : null
  ] }) });
}
function PrimaryLink({ href, children }) {
  return /* @__PURE__ */ jsxRuntime.jsx(Link__default.default, { href, className: "primary-link", children });
}
function EmptyState({ title, description, action }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "empty-state", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h3", { children: title }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { children: description }),
    action
  ] });
}
function StatGrid({ items }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "stat-grid", children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsxs("article", { className: "stat-card", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { children: item.label }),
    /* @__PURE__ */ jsxRuntime.jsx("strong", { children: typeof item.value === "number" ? new Intl.NumberFormat("fa-IR").format(item.value) : item.value })
  ] }, item.label)) });
}
function DataTable({ columns, rows }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxRuntime.jsxs("table", { className: "data-table", children: [
    /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsx("tr", { children: columns.map((column) => /* @__PURE__ */ jsxRuntime.jsx("th", { children: column }, column)) }) }),
    /* @__PURE__ */ jsxRuntime.jsx("tbody", { children: rows.map((row, rowIndex) => /* @__PURE__ */ jsxRuntime.jsx("tr", { children: row.map((cell, cellIndex) => /* @__PURE__ */ jsxRuntime.jsx("td", { children: cell }, cellIndex)) }, rowIndex)) })
  ] }) });
}
function FormCard({ title, description, children }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "form-card", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "form-card-header", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { children: title }),
      description ? /* @__PURE__ */ jsxRuntime.jsx("p", { children: description }) : null
    ] }),
    children
  ] });
}

// src/styles/formStyles.ts
var formStyles_exports = {};
__export(formStyles_exports, {
  compactTextareaStyle: () => compactTextareaStyle,
  formControlMutedDisabledStyle: () => formControlMutedDisabledStyle,
  formControlStyle: () => formControlStyle,
  formErrorStyle: () => formErrorStyle,
  formLabelStyle: () => formLabelStyle,
  formMetaLabelStyle: () => formMetaLabelStyle,
  outlineButtonStyle: () => outlineButtonStyle,
  primaryButtonStyle: () => primaryButtonStyle
});
var formControlStyle = {
  width: "100%",
  minHeight: "42px",
  padding: "0 14px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontFamily: "inherit",
  fontSize: "13px",
  color: "#374151",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease"
};
var compactTextareaStyle = {
  ...formControlStyle,
  minHeight: "96px",
  padding: "9px 14px",
  lineHeight: 1.7,
  resize: "vertical"
};
var formControlMutedDisabledStyle = {
  background: "#f8fafc",
  color: "#9ca3af"
};
var formLabelStyle = {
  fontSize: "12px",
  color: "#6b7280",
  marginBottom: "6px",
  display: "block",
  fontWeight: "600"
};
var formMetaLabelStyle = {
  fontSize: "11px",
  color: "#9ca3af",
  marginBottom: "4px",
  display: "block"
};
var formErrorStyle = {
  fontSize: "11px",
  color: "#ef4444",
  marginTop: "4px"
};
var outlineButtonStyle = {
  minHeight: "42px",
  padding: "0 16px",
  border: "1px solid #d1d5db",
  borderRadius: "999px",
  background: "transparent",
  fontFamily: "inherit",
  fontSize: "13px",
  color: "#4b5563",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease"
};
var primaryButtonStyle = {
  ...outlineButtonStyle,
  border: "none",
  background: "var(--dark-teal)",
  color: "#fff",
  boxShadow: "0 4px 12px rgba(0, 128, 128, 0.18)"
};

// src/components/rules/rulePanelClassNames.ts
var RULE_PANEL_FIELD_FOCUS = "focus:!border-[color:var(--theme-action-border)] focus:!ring-2 focus:!ring-[color:var(--theme-action-bg)]/20";
var RULE_PANEL_TEXT_INPUT_CLASSNAME = [
  "!h-14 w-full !rounded-xl !border-[color:var(--border-color)] !bg-[color:var(--surface)] !px-4 !py-0 !text-right",
  "!text-lg !font-bold !text-[color:var(--text-strong)] !shadow-none !outline-none transition",
  RULE_PANEL_FIELD_FOCUS
].join(" ");
var RULE_PANEL_SELECT_CLASSNAME = "h-14 w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-4 py-0 text-right text-lg font-bold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--theme-action-border)] focus:ring-2 focus:ring-[color:var(--theme-action-bg)]/20";
function rulePanelNumericInputClassName(suffixPosition) {
  return [
    "!h-14 w-full !rounded-xl !border-[color:var(--border-color)] !bg-[color:var(--surface)]",
    suffixPosition === "left" ? "!pl-24 !pr-4" : suffixPosition === "right" ? "!pr-16 !pl-4" : "!px-4",
    "!text-right !text-lg !font-bold !text-[color:var(--text-strong)] !shadow-none !outline-none transition",
    RULE_PANEL_FIELD_FOCUS
  ].join(" ");
}
function formatIntegerInput(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}
function formatDecimalInput(value) {
  const normalized = value.replace(/[٫,]/g, ".");
  const cleaned = normalized.replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const [integerPart = "", ...fractionParts] = cleaned.split(".");
  const fractionPart = fractionParts.join("");
  if (!fractionParts.length) return integerPart;
  return `${integerPart}.${fractionPart}`;
}
function RuleAmountInput({
  value,
  onChange,
  placeholder,
  suffix
}) {
  const resolvedSuffix = suffix === void 0 ? "\u062A\u0648\u0645\u0627\u0646" : suffix;
  const showSuffixChip = resolvedSuffix.length > 0;
  const isPercent = resolvedSuffix === "%";
  const isNumeric = resolvedSuffix === "\u062A\u0648\u0645\u0627\u0646" || isPercent || suffix === "";
  const suffixPosition = !showSuffixChip ? "none" : isPercent ? "left" : "right";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Input,
    {
      value,
      onChange: (event) => onChange(
        isNumeric ? isPercent ? formatDecimalInput(event.target.value) : formatIntegerInput(event.target.value) : event.target.value
      ),
      placeholder,
      inputMode: isPercent ? "decimal" : isNumeric ? "numeric" : void 0,
      dir: isNumeric ? "ltr" : void 0,
      className: `${rulePanelNumericInputClassName(suffixPosition)} ${isPercent ? "!text-left" : ""}`,
      startAdornment: suffixPosition === "left" ? resolvedSuffix : void 0,
      startAdornmentClassName: "text-xs font-bold text-[color:var(--text-muted)]",
      startAdornmentWrapperClassName: suffixPosition === "left" ? "w-8" : void 0,
      endAdornment: suffixPosition === "right" ? resolvedSuffix : void 0,
      endAdornmentClassName: "text-xs font-bold text-[color:var(--text-muted)]",
      endAdornmentWrapperClassName: suffixPosition === "right" ? "w-8" : void 0
    }
  );
}
function RuleFieldLabel({ label, required = false, rightSlot }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-3 flex items-center justify-between gap-3", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "block text-right text-[15px] font-black text-[color:var(--text-strong)]", children: [
      label,
      required ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mr-1 text-[#ff6b7a]", children: "*" }) : null
    ] }),
    rightSlot
  ] });
}
function cn2(...classes) {
  return classes.filter(Boolean).join(" ");
}
function RuleTabButton({
  title,
  icon: Icon2,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn2(
        "group relative flex min-w-[168px] flex-1 flex-col items-center justify-center gap-3 px-3 py-5 text-center transition max-sm:min-w-[132px] max-sm:gap-2 max-sm:px-2 max-sm:py-4",
        active ? "text-[color:var(--text-strong)]" : "text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]"
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            className: cn2(
              "flex h-14 w-14 items-center justify-center rounded-full border transition max-sm:h-12 max-sm:w-12",
              active ? "border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)]" : "border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"
            ),
            children: /* @__PURE__ */ jsxRuntime.jsx(Icon2, { className: "h-6 w-6 max-sm:h-5 max-sm:w-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm font-bold", children: title }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            className: cn2(
              "absolute inset-x-4 bottom-0 h-[2px] transition",
              active ? "bg-[color:var(--theme-action-border)]" : "bg-transparent group-hover:bg-[color:var(--border-color)]"
            )
          }
        )
      ]
    }
  );
}
function cn3(...classes) {
  return classes.filter(Boolean).join(" ");
}
function TagPills({
  options,
  value,
  onChange,
  wrap = true,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn3("flex gap-2", wrap ? "flex-wrap" : "flex-nowrap overflow-x-auto pb-1", className), children: options.map((option) => {
    const active = value === option.value;
    return /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(option.value),
        "data-tag-pill": "true",
        "data-active": active ? "true" : "false",
        className: cn3(
          "inline-flex h-[36px] items-center rounded-full border px-4 text-[12px] font-bold whitespace-nowrap transition-all",
          active ? "border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]" : "border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
        ),
        children: option.label
      },
      option.value
    );
  }) });
}
function cn4(...classes) {
  return classes.filter(Boolean).join(" ");
}
function SearchIcon({ className = "" }) {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className, children: /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }
  ) });
}
function XIcon({ className = "" }) {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M18 6 6 18M6 6l12 12", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function ChevronDownIcon({ className = "" }) {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m6 9 6 6 6-6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function ChevronUpIcon({ className = "" }) {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", className, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m18 15-6-6-6 6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function ExpandableTagGroup({
  label,
  items,
  selectedId,
  onSelect,
  emptyText,
  itemsPerRow = 8,
  required,
  className = "",
  showSearch = true,
  invalid = false,
  onDisabledSelect
}) {
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const inputRef = React.useRef(null);
  const filtered = React.useMemo(() => {
    const q = query.trim();
    if (!q) return items;
    return items.filter((item) => item.name.includes(q) || (item.sub ?? "").includes(q));
  }, [items, query]);
  const visible = expanded ? filtered : filtered.slice(0, itemsPerRow);
  const hasMore = filtered.length > itemsPerRow;
  const openSearch = () => {
    setSearchOpen(true);
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 20);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setExpanded(false);
  };
  React.useEffect(() => {
    if (!showSearch && searchOpen) closeSearch();
  }, [showSearch]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn4("space-y-2", invalid && "rounded-xl border border-rose-300 bg-rose-50/40 p-3", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "text-[13px] font-bold text-slate-700", children: [
        label,
        required ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-rose-500", children: "*" }) : null
      ] }),
      showSearch && !searchOpen ? /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: openSearch,
          className: "relative top-[4px] flex h-4 w-4 items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-600",
          "aria-label": `\u062C\u0633\u062A\u062C\u0648 \u062F\u0631 ${label}`,
          children: /* @__PURE__ */ jsxRuntime.jsx(SearchIcon, { className: "h-3 w-3" })
        }
      ) : null,
      showSearch ? /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: cn4(
            "relative flex items-center overflow-hidden rounded-md border bg-white transition-[max-width,opacity,border-color] duration-200 ease-out",
            searchOpen ? "max-w-[176px] border-slate-300 opacity-100" : "max-w-0 border-transparent opacity-0"
          ),
          style: { height: "22px" },
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(SearchIcon, { className: "pointer-events-none absolute right-1.5 h-2.5 w-2.5 shrink-0 text-slate-400" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                ref: inputRef,
                value: query,
                onChange: (event) => setQuery(event.target.value),
                placeholder: `\u062C\u0633\u062A\u062C\u0648 \u062F\u0631 ${label}...`,
                tabIndex: searchOpen ? 0 : -1,
                className: "h-full w-44 bg-transparent pr-6 pl-6 text-[10px] font-light text-slate-600 placeholder:text-slate-400 outline-none"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                onClick: closeSearch,
                tabIndex: searchOpen ? 0 : -1,
                className: "absolute left-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
                "aria-label": "\u0628\u0633\u062A\u0646 \u062C\u0633\u062A\u062C\u0648",
                children: /* @__PURE__ */ jsxRuntime.jsx(XIcon, { className: "h-2.5 w-2.5" })
              }
            )
          ]
        }
      ) : null
    ] }),
    items.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[12px] text-slate-400", children: emptyText }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
        visible.map((item) => {
          const active = selectedId === item.id;
          return /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                if (item.disabled) {
                  onDisabledSelect?.(item.id);
                  return;
                }
                onSelect(item.id);
              },
              "data-tag-pill": "true",
              "data-active": active ? "true" : "false",
              "aria-disabled": item.disabled || void 0,
              className: cn4(
                "inline-flex h-[34px] items-center rounded-full border px-4 text-[12px] font-medium whitespace-nowrap transition-all",
                item.disabled ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-400" : "",
                active ? "border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]" : "border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
              ),
              children: item.sub ? `${item.name} \xB7 ${item.sub}` : item.name
            },
            item.id
          );
        }),
        filtered.length === 0 ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[12px] text-slate-400", children: "\u0645\u0648\u0631\u062F\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F" }) : null
      ] }),
      hasMore ? /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: () => setExpanded((current) => !current),
          className: "mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700",
          children: expanded ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ChevronUpIcon, { className: "h-3 w-3" }),
            " \u0646\u0645\u0627\u06CC\u0634 \u06A9\u0645\u062A\u0631"
          ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(ChevronDownIcon, { className: "h-3 w-3" }),
            " ",
            filtered.length - itemsPerRow,
            " \u0645\u0648\u0631\u062F \u0628\u06CC\u0634\u062A\u0631"
          ] })
        }
      ) : null
    ] })
  ] });
}
function ContractTypeTags({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TagPills,
    {
      value,
      onChange,
      options: [
        { value: "pre-sale", label: "\u067E\u06CC\u0634\u200C\u0641\u0631\u0648\u0634" },
        { value: "sale", label: "\u0641\u0631\u0648\u0634" }
      ]
    }
  );
}
function ContractIssuerTags({
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TagPills,
    {
      value,
      onChange,
      options: [
        { value: "self", label: "\u062E\u0648\u062F\u0645" },
        { value: "former", label: "\u06A9\u0627\u0631\u0645\u0646\u062F \u0633\u0627\u0628\u0642" },
        { value: "staff", label: "\u0633\u0627\u06CC\u0631 \u06A9\u0627\u0631\u0645\u0646\u062F\u0627\u0646" }
      ]
    }
  );
}
function cn5(...classes) {
  return classes.filter(Boolean).join(" ");
}
function ShareModePills({
  label = "\u0646\u0648\u0639 \u0633\u0647\u0645",
  value,
  onChange,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn5("flex items-center gap-3", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[12px] font-bold text-slate-700", children: label }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex overflow-hidden rounded-full border border-slate-200 bg-white", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange("percent"),
          className: cn5(
            "min-w-[78px] px-4 py-2 text-[12px] font-bold transition",
            value === "percent" ? "bg-[color:var(--theme-accent-soft)] text-[color:var(--theme-accent-strong)]" : "text-slate-600 hover:bg-slate-50"
          ),
          children: "\u062F\u0631\u0635\u062F"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange("dang"),
          className: cn5(
            "min-w-[78px] px-4 py-2 text-[12px] font-bold transition",
            value === "dang" ? "bg-[color:var(--theme-accent-soft)] text-[color:var(--theme-accent-strong)]" : "text-slate-600 hover:bg-slate-50"
          ),
          children: "\u062F\u0627\u0646\u06AF"
        }
      )
    ] })
  ] });
}
function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled = false,
  className = ""
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef(null);
  React.useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const selected = React.useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);
  const filtered = React.useMemo(() => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())), [options, query]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref, className: `relative ${className}`, children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        type: "button",
        disabled,
        onClick: () => setOpen((c) => !c),
        className: "flex h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 bg-[image:var(--control-bg-gradient)] px-3.5 text-[13px] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition-all hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: selected ? "text-slate-800" : "text-slate-400", children: selected?.label ?? placeholder }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-slate-400", children: "\u25BE" })
        ]
      }
    ),
    open && !disabled ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-b border-slate-100 px-3 py-2", children: /* @__PURE__ */ jsxRuntime.jsx(
        "input",
        {
          autoFocus: true,
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder: searchPlaceholder,
          className: "w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "max-h-60 overflow-auto py-1", children: filtered.length ? filtered.map((option) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            onSelect(option.value);
            setOpen(false);
            setQuery("");
          },
          className: `flex w-full items-center justify-between px-3 py-2 text-right text-[13px] transition-colors hover:bg-slate-50 ${option.value === value ? "font-semibold text-blue-600" : "text-slate-700"}`,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: option.label }),
            option.value === value ? /* @__PURE__ */ jsxRuntime.jsx("span", { children: "\u2713" }) : null
          ]
        }
      ) }, option.value)) : /* @__PURE__ */ jsxRuntime.jsx("li", { className: "px-3 py-3 text-center text-[12px] text-slate-400", children: emptyText }) })
    ] }) : null
  ] });
}
function StickySubmitBar({
  label,
  onClick,
  disabled = false,
  loadingLabel,
  embedded = false,
  submitId
}) {
  const isLoading = disabled && Boolean(loadingLabel);
  const displayLabel = isLoading ? loadingLabel : label;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: embedded ? "mt-6" : "sticky bottom-0 z-10 -mx-8 -mb-8 mt-6 border-t border-[color:var(--border-color)] bg-[color:var(--surface-overlay)] backdrop-blur-sm max-sm:-mx-4 max-sm:-mb-4",
      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-end gap-3 px-5 py-3 max-sm:px-4", children: /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          onClick,
          disabled,
          "data-contract-save-trigger": submitId,
          className: "inline-flex h-9 items-center gap-2 rounded-lg bg-teal-700 px-5 text-[13px] font-semibold text-white transition-all hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:cursor-not-allowed disabled:opacity-50 max-sm:min-h-11 max-sm:w-full max-sm:justify-center",
          children: [
            isLoading ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" }) : null,
            displayLabel
          ]
        }
      ) })
    }
  );
}
function cn6(...classes) {
  return classes.filter(Boolean).join(" ");
}
function ChoicePills({
  options,
  value,
  onChange,
  ariaLabel,
  wrap = true,
  className = "",
  pillClassName = "",
  showActiveIndicator = true
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "radiogroup",
      "aria-label": ariaLabel,
      className: cn6("flex gap-2 max-sm:max-w-full max-sm:overflow-x-auto max-sm:pb-1", wrap ? "flex-wrap" : "flex-nowrap overflow-x-auto pb-1", className),
      children: options.map((option) => {
        const active = value === option.value;
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onChange(option.value),
            "aria-pressed": active,
            "data-tag-pill": "true",
            "data-active": active ? "true" : "false",
            className: cn6(
              "inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-[12px] whitespace-nowrap transition-all max-sm:min-h-11 max-sm:px-4",
              active ? "border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] font-semibold text-[color:var(--text-strong)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]" : "border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-body)] hover:bg-[color:var(--surface-soft)]",
              pillClassName
            ),
            children: [
              active && showActiveIndicator ? /* @__PURE__ */ jsxRuntime.jsxs("span", { "aria-hidden": "true", className: "choice-pill__check inline-flex h-3 w-3 shrink-0 items-center justify-center", children: [
                /* @__PURE__ */ jsxRuntime.jsx("style", { children: `
                    .choice-pill__check {
                      transform-origin: center;
                      animation: choice-pill-check-appear 120ms ease-out both;
                    }
                    @keyframes choice-pill-check-appear {
                      from { opacity: 0; transform: scale(0.95); }
                      to { opacity: 1; transform: scale(1); }
                    }
                    .choice-pill__check-path {
                      stroke-dasharray: 30;
                      stroke-dashoffset: 30;
                      animation: choice-pill-check-draw 360ms cubic-bezier(0.22, 1, 0.36, 1) 60ms both;
                    }
                    @keyframes choice-pill-check-draw {
                      to { stroke-dashoffset: 0; }
                    }
                  ` }),
                /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", className: "h-3 w-3", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntime.jsx("path", { className: "choice-pill__check-path", d: "M20 6 9 17l-5-5" }) })
              ] }) : null,
              option.label
            ]
          },
          option.value
        );
      })
    }
  );
}
function cn7(...classes) {
  return classes.filter(Boolean).join(" ");
}
function ChoicePillsField({
  label,
  labelAs: LabelAs = "div",
  ariaLabel,
  options,
  value,
  onChange,
  wrap,
  className = "",
  labelClassName = "",
  pillsClassName = "",
  pillClassName = "",
  showActiveIndicator,
  invalid = false
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn7("space-y-2", invalid && "rounded-xl border border-rose-300 bg-rose-50/40 p-2", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx(LabelAs, { className: cn7("text-[12px] font-bold text-[color:var(--text-strong)]", labelClassName), children: label }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ChoicePills,
      {
        ariaLabel: ariaLabel ?? label,
        options,
        value,
        onChange,
        wrap,
        className: pillsClassName,
        pillClassName,
        showActiveIndicator
      }
    )
  ] });
}

// src/components/dev-docs/dev-doc.types.ts
var DEV_DOC_THREAD_PRIORITIES = ["p0", "p1", "p2", "p3"];
var DEV_DOC_THREAD_STATUSES = ["todo", "in_progress", "done"];
var DEV_DOC_PRIORITY_LABELS = {
  p0: "\u062E\u06CC\u0644\u06CC \u0641\u0648\u0631\u06CC",
  p1: "\u0641\u0648\u0631\u06CC",
  p2: "\u0639\u0627\u062F\u06CC",
  p3: "\u06A9\u0645\u200C\u0627\u0647\u0645\u06CC\u062A"
};
function normalizeDevDocThreadPriority(value) {
  return typeof value === "string" && DEV_DOC_THREAD_PRIORITIES.includes(value) ? value : "p2";
}
function normalizeDevDocThreadStatus(value) {
  return typeof value === "string" && DEV_DOC_THREAD_STATUSES.includes(value) ? value : "todo";
}
function normalizeDevDocLabels(input) {
  if (!Array.isArray(input)) return [];
  return Array.from(
    new Set(
      input.map((value) => typeof value === "string" ? value.trim() : "").filter(Boolean).slice(0, 12)
    )
  );
}

// ../../node_modules/lucide-react/dist/esm/shared/src/utils.js
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

// ../../node_modules/lucide-react/dist/esm/defaultAttributes.js
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// ../../node_modules/lucide-react/dist/esm/Icon.js
var Icon = React.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => {
    return React.createElement(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: mergeClasses("lucide", className),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => React.createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// ../../node_modules/lucide-react/dist/esm/createLucideIcon.js
var createLucideIcon = (iconName, iconNode) => {
  const Component = React.forwardRef(
    ({ className, ...props }, ref) => React.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

// ../../node_modules/lucide-react/dist/esm/icons/arrow-up-right.js
var __iconNode = [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
];
var ArrowUpRight = createLucideIcon("arrow-up-right", __iconNode);

// ../../node_modules/lucide-react/dist/esm/icons/circle-check.js
var __iconNode2 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
];
var CircleCheck = createLucideIcon("circle-check", __iconNode2);

// ../../node_modules/lucide-react/dist/esm/icons/circle.js
var __iconNode3 = [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]];
var Circle = createLucideIcon("circle", __iconNode3);

// ../../node_modules/lucide-react/dist/esm/icons/grip-vertical.js
var __iconNode4 = [
  ["circle", { cx: "9", cy: "12", r: "1", key: "1vctgf" }],
  ["circle", { cx: "9", cy: "5", r: "1", key: "hp0tcf" }],
  ["circle", { cx: "9", cy: "19", r: "1", key: "fkjjf6" }],
  ["circle", { cx: "15", cy: "12", r: "1", key: "1tmaij" }],
  ["circle", { cx: "15", cy: "5", r: "1", key: "19l28e" }],
  ["circle", { cx: "15", cy: "19", r: "1", key: "f4zoj3" }]
];
var GripVertical = createLucideIcon("grip-vertical", __iconNode4);

// ../../node_modules/lucide-react/dist/esm/icons/loader-circle.js
var __iconNode5 = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
var LoaderCircle = createLucideIcon("loader-circle", __iconNode5);

// ../../node_modules/lucide-react/dist/esm/icons/message-square-text.js
var __iconNode6 = [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }],
  ["path", { d: "M13 8H7", key: "14i4kc" }],
  ["path", { d: "M17 12H7", key: "16if0g" }]
];
var MessageSquareText = createLucideIcon("message-square-text", __iconNode6);

// ../../node_modules/lucide-react/dist/esm/icons/refresh-cw.js
var __iconNode7 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
var RefreshCw = createLucideIcon("refresh-cw", __iconNode7);

// ../../node_modules/lucide-react/dist/esm/icons/search.js
var __iconNode8 = [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
];
var Search = createLucideIcon("search", __iconNode8);

// ../../node_modules/lucide-react/dist/esm/icons/trash-2.js
var __iconNode9 = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
];
var Trash2 = createLucideIcon("trash-2", __iconNode9);
var STATUS_COLUMNS = [
  { id: "todo", title: "\u0627\u0646\u062C\u0627\u0645\u200C\u0646\u0634\u062F\u0647", description: "\u06AF\u0641\u062A\u06AF\u0648\u0647\u0627\u06CC\u06CC \u06A9\u0647 \u0647\u0646\u0648\u0632 \u0634\u0631\u0648\u0639 \u0646\u0634\u062F\u0647\u200C\u0627\u0646\u062F" },
  { id: "in_progress", title: "\u062F\u0631 \u062D\u0627\u0644 \u0627\u0646\u062C\u0627\u0645", description: "\u0645\u0648\u0627\u0631\u062F\u06CC \u06A9\u0647 \u062A\u06CC\u0645 \u0631\u0648\u06CC \u0622\u0646\u200C\u0647\u0627 \u062F\u0631 \u062D\u0627\u0644 \u06A9\u0627\u0631 \u0627\u0633\u062A" },
  { id: "done", title: "\u0627\u0646\u062C\u0627\u0645\u200C\u0634\u062F\u0647", description: "\u0645\u0648\u0627\u0631\u062F \u0646\u0647\u0627\u06CC\u06CC \u0634\u062F\u0647 \u0648 \u0628\u0633\u062A\u0647 \u0634\u062F\u0647" }
];
function formatDateTime(value) {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function chipClass() {
  return "inline-flex items-center rounded-full border border-[color:var(--border-color)] bg-transparent px-2 py-1 text-[11px] font-medium text-[color:var(--text-muted)]";
}
function DevDocThreadsBoard({
  appName,
  listEndpoint,
  updateEndpoint,
  deleteEndpoint,
  title = "\u0628\u0631\u062F \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u0647\u0627\u06CC \u0645\u0633\u062A\u0646\u062F\u0627\u062A",
  description = "\u062F\u0631 \u0627\u06CC\u0646 \u0628\u062E\u0634 \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u06AF\u0641\u062A\u06AF\u0648\u0647\u0627 \u0648 \u0646\u0638\u0631\u0627\u062A \u0645\u0631\u0628\u0648\u0637 \u0628\u0647 \u0645\u0633\u062A\u0646\u062F\u0627\u062A \u0631\u0627 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0648 \u062F\u0646\u0628\u0627\u0644 \u06A9\u0646\u06CC\u062F. \u0627\u0632 \u062C\u0633\u062A\u062C\u0648\u060C \u0645\u0631\u062A\u0628\u200C\u0633\u0627\u0632\u06CC \u0648 \u06A9\u0634\u06CC\u062F\u0646 \u06A9\u0627\u0631\u062A\u200C\u0647\u0627 \u0628\u0631\u0627\u06CC \u062A\u063A\u06CC\u06CC\u0631 \u0648\u0636\u0639\u06CC\u062A \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F."
}) {
  const [threads, setThreads] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [savingThreadId, setSavingThreadId] = React.useState(null);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [creatorFilters, setCreatorFilters] = React.useState([]);
  const [draggingThreadId, setDraggingThreadId] = React.useState(null);
  const [activeDropZone, setActiveDropZone] = React.useState(null);
  const resolvedDeleteEndpoint = deleteEndpoint ?? updateEndpoint;
  const loadThreads = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(listEndpoint, { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "\u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u06AF\u0641\u062A\u06AF\u0648\u0647\u0627 \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F.");
      setThreads(payload.threads);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "\u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u06AF\u0641\u062A\u06AF\u0648\u0647\u0627 \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F.");
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    void loadThreads();
  }, []);
  const creatorOptions = React.useMemo(() => {
    const seen = /* @__PURE__ */ new Map();
    for (const thread of threads) {
      const creatorId = thread.createdBy?.id;
      if (!creatorId || seen.has(creatorId)) continue;
      seen.set(creatorId, {
        id: creatorId,
        fullName: thread.createdBy?.fullName || "\u0646\u0627\u0645\u0634\u062E\u0635"
      });
    }
    return Array.from(seen.values()).sort((a, b) => a.fullName.localeCompare(b.fullName, "fa"));
  }, [threads]);
  React.useEffect(() => {
    const refresh = () => {
      void loadThreads();
    };
    const intervalId = window.setInterval(refresh, 15e3);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const filteredThreads = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const baseThreads = creatorFilters.length === 0 ? threads : threads.filter((thread) => thread.createdBy?.id && creatorFilters.includes(thread.createdBy.id));
    if (!query) return baseThreads;
    return baseThreads.filter(
      (thread) => [
        thread.title,
        thread.docType,
        thread.pagePathSample,
        thread.pageKey,
        thread.tenantName,
        thread.tenantSlug,
        thread.createdBy?.fullName,
        ...thread.labels
      ].filter(Boolean).join(" ").toLowerCase().includes(query)
    );
  }, [creatorFilters, search, threads]);
  const columns = React.useMemo(
    () => STATUS_COLUMNS.map((column) => ({
      ...column,
      threads: filteredThreads.filter((thread) => thread.status === column.id).sort((left, right) => {
        const timeDiff = new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
        if (timeDiff !== 0) return timeDiff;
        return left.title.localeCompare(right.title, "fa");
      })
    })),
    [filteredThreads]
  );
  const moveThread = async (threadId, nextStatus) => {
    const currentThread = threads.find((thread) => thread.id === threadId);
    if (!currentThread || currentThread.status === nextStatus) return;
    const previousThreads = threads;
    setThreads((current) => current.map((thread) => thread.id === threadId ? { ...thread, status: nextStatus } : thread));
    setSavingThreadId(threadId);
    setError("");
    try {
      const response = await fetch(updateEndpoint(threadId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "\u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F.");
    } catch (updateError) {
      setThreads(previousThreads);
      setError(updateError instanceof Error ? updateError.message : "\u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0648\u0636\u0639\u06CC\u062A \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F.");
    } finally {
      setSavingThreadId(null);
      setDraggingThreadId(null);
      setActiveDropZone(null);
    }
  };
  const removeThread = async (threadId) => {
    const currentThread = threads.find((thread) => thread.id === threadId);
    if (!currentThread) return;
    const confirmed = window.confirm(`\u062D\u0630\u0641 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648\u06CC \xAB${currentThread.title}\xBB\u061F \u0627\u06CC\u0646 \u0639\u0645\u0644\u06CC\u0627\u062A \u0642\u0627\u0628\u0644 \u0628\u0627\u0632\u06AF\u0634\u062A \u0646\u06CC\u0633\u062A.`);
    if (!confirmed) return;
    const previousThreads = threads;
    setThreads((current) => current.filter((thread) => thread.id !== threadId));
    setSavingThreadId(threadId);
    setError("");
    try {
      const response = await fetch(resolvedDeleteEndpoint(threadId), { method: "DELETE" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.message || "\u062D\u0630\u0641 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648 \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F.");
    } catch (removeError) {
      setThreads(previousThreads);
      setError(removeError instanceof Error ? removeError.message : "\u062D\u0630\u0641 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648 \u0628\u0627 \u062E\u0637\u0627 \u0645\u0648\u0627\u062C\u0647 \u0634\u062F.");
    } finally {
      setSavingThreadId(null);
      setDraggingThreadId(null);
      setActiveDropZone(null);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "mx-auto max-w-[1880px] p-4 sm:p-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-[32px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-6 shadow-[0_10px_30px_var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]", children: appName }),
          /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "mt-2 text-[28px] font-black leading-tight text-[color:var(--text-strong)]", children: title }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-3 max-w-4xl text-sm leading-7 text-[color:var(--text-muted)]", children: description })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            className: "inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] bg-transparent px-4 py-2 text-sm font-medium text-[color:var(--text-body)]",
            onClick: () => void loadThreads(),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(RefreshCw, { className: "h-4 w-4" }),
              "\u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px_280px]", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("label", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-semibold text-[color:var(--text-muted)]", children: "\u062C\u0633\u062A\u062C\u0648 \u0628\u06CC\u0646 \u0639\u0646\u0627\u0648\u06CC\u0646\u060C \u0645\u0633\u062A\u0646\u062F\u0627\u062A\u060C \u0645\u0633\u06CC\u0631\u0647\u0627 \u0648 \u0628\u0631\u0686\u0633\u0628\u200C\u0647\u0627" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntime.jsx(Search, { className: "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" }),
            /* @__PURE__ */ jsxRuntime.jsx(Input, { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "\u0645\u062B\u0644\u0627 \u0642\u0631\u0627\u0631\u062F\u0627\u062F\u060C financial\u060C /business-settings/...", className: "pr-10" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-xs font-semibold text-[color:var(--text-muted)]", children: "\u0641\u06CC\u0644\u062A\u0631 \u0628\u0631 \u0627\u0633\u0627\u0633 \u0633\u0627\u0632\u0646\u062F\u0647 \u06AF\u0641\u062A\u06AF\u0648" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: "text-xs font-semibold text-[color:var(--theme-accent)]",
                onClick: () => setCreatorFilters([]),
                children: "\u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-2 rounded-[18px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: creatorFilters.length === 0 ? "inline-flex items-center rounded-full bg-[color:var(--theme-accent)] px-3 py-2 text-xs font-bold text-white" : chipClass(),
                onClick: () => setCreatorFilters([]),
                children: "\u0647\u0645\u0647 \u0633\u0627\u0632\u0646\u062F\u0647\u200C\u0647\u0627"
              }
            ),
            creatorOptions.map((creator) => {
              const active = creatorFilters.includes(creator.id);
              return /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  type: "button",
                  className: active ? "inline-flex items-center rounded-full bg-[color:var(--theme-accent)] px-3 py-2 text-xs font-bold text-white" : chipClass(),
                  onClick: () => {
                    setCreatorFilters(
                      (current) => current.includes(creator.id) ? current.filter((id) => id !== creator.id) : [...current, creator.id]
                    );
                  },
                  children: creator.fullName
                },
                creator.id
              );
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-3 gap-2", children: STATUS_COLUMNS.map((column) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-[22px] border border-[color:var(--border-color)] bg-transparent px-3 py-3 text-center text-sm text-[color:var(--text-body)]", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-lg font-black text-[color:var(--text-strong)]", children: columns.find((item) => item.id === column.id)?.threads.length ?? 0 }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-1 text-xs text-[color:var(--text-muted)]", children: column.title })
        ] }, column.id)) })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-6 rounded-[28px] border border-[color:var(--border-color)] bg-[color:var(--surface)] p-10 text-center text-sm text-[color:var(--text-muted)]", children: [
      /* @__PURE__ */ jsxRuntime.jsx(LoaderCircle, { className: "mx-auto mb-3 h-5 w-5 animate-spin" }),
      "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u06AF\u0641\u062A\u06AF\u0648\u0647\u0627..."
    ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      error ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-6 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700", children: error }) : null,
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-6 grid gap-5 xl:grid-cols-3", children: columns.map((column) => /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: `min-h-[520px] rounded-[30px] border p-5 transition ${activeDropZone === column.id ? "border-[color:var(--theme-accent)] bg-[color:var(--surface)] shadow-[0_14px_36px_var(--shadow-soft)]" : "border-[color:var(--border-color)] bg-[color:var(--surface)]"}`,
          onDragOver: (event) => {
            event.preventDefault();
            if (draggingThreadId) setActiveDropZone(column.id);
          },
          onDragLeave: (event) => {
            if (event.currentTarget.contains(event.relatedTarget)) return;
            setActiveDropZone((current) => current === column.id ? null : current);
          },
          onDrop: (event) => {
            event.preventDefault();
            const threadId = event.dataTransfer.getData("text/plain") || draggingThreadId;
            if (threadId) void moveThread(threadId, column.id);
          },
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-5 flex items-start justify-between gap-3 border-b border-[color:var(--border-color)] pb-4", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "text-xl font-black text-[color:var(--text-strong)]", children: column.title }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-1 text-xs leading-6 text-[color:var(--text-muted)]", children: column.description })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-full border border-[color:var(--border-color)] px-3 py-1.5 text-xs font-bold text-[color:var(--text-body)]", children: column.threads.length })
            ] }),
            column.threads.length ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "space-y-3", children: column.threads.map((thread) => /* @__PURE__ */ jsxRuntime.jsxs(
              "article",
              {
                draggable: true,
                onDragStart: (event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", thread.id);
                  setDraggingThreadId(thread.id);
                },
                onDragEnd: () => {
                  setDraggingThreadId(null);
                  setActiveDropZone(null);
                },
                className: `rounded-[24px] border border-[color:var(--border-color)] bg-[color:var(--surface-soft)] p-4 transition ${draggingThreadId === thread.id ? "opacity-60" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-w-0 gap-3", children: [
                      /* @__PURE__ */ jsxRuntime.jsx(
                        "span",
                        {
                          className: `mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${thread.isOpened ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)]"}`,
                          title: thread.isOpened ? "\u0628\u0627\u0632 \u0634\u062F\u0647" : "\u0628\u0633\u062A\u0647 \u0634\u062F\u0647",
                          "aria-label": thread.isOpened ? "\u0628\u0627\u0632 \u0634\u062F\u0647" : "\u0628\u0633\u062A\u0647 \u0634\u062F\u0647",
                          children: thread.isOpened ? /* @__PURE__ */ jsxRuntime.jsx(CircleCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntime.jsx(Circle, { className: "h-4 w-4" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0", children: [
                        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-3 flex flex-wrap gap-2", children: [
                          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex items-center rounded-full border border-[color:var(--border-color)] bg-[color:var(--surface)] px-2.5 py-1 text-[11px] font-bold text-[color:var(--text-body)]", children: "\u06AF\u0641\u062A\u200C\u0648\u06AF\u0648" }),
                          /* @__PURE__ */ jsxRuntime.jsx("span", { className: chipClass(), children: thread.docType }),
                          /* @__PURE__ */ jsxRuntime.jsx("span", { className: chipClass(), children: DEV_DOC_PRIORITY_LABELS[thread.priority] }),
                          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: chipClass(), children: [
                            /* @__PURE__ */ jsxRuntime.jsx(MessageSquareText, { className: "ml-1 h-3.5 w-3.5" }),
                            thread.messageCount,
                            " \u067E\u06CC\u0627\u0645"
                          ] }),
                          /* @__PURE__ */ jsxRuntime.jsx("span", { className: chipClass(), children: thread.tenantName || thread.tenantSlug || "tenant \u0646\u0627\u0645\u0634\u062E\u0635" }),
                          thread.status === "in_progress" ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700", children: "\u062F\u0631 \u062D\u0627\u0644 \u0627\u0646\u062C\u0627\u0645" }) : null,
                          thread.status === "done" ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700", children: "\u0627\u0646\u062C\u0627\u0645\u200C\u0634\u062F\u0647" }) : null,
                          thread.labels.slice(0, 3).map((label) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: chipClass(), children: label }, `${thread.id}-${label}`))
                        ] }),
                        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "text-[15px] font-black leading-7 text-[color:var(--text-strong)]", children: thread.title })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                      savingThreadId === thread.id ? /* @__PURE__ */ jsxRuntime.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-[color:var(--theme-accent)]" }) : null,
                      /* @__PURE__ */ jsxRuntime.jsx(
                        "button",
                        {
                          type: "button",
                          className: "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-color)] text-[color:var(--text-muted)] transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700",
                          onClick: () => void removeThread(thread.id),
                          "aria-label": "\u062D\u0630\u0641 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648",
                          title: "\u062D\u0630\u0641 \u06AF\u0641\u062A\u200C\u0648\u06AF\u0648",
                          children: /* @__PURE__ */ jsxRuntime.jsx(Trash2, { className: "h-4 w-4" })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsx(GripVertical, { className: "h-4 w-4 text-[color:var(--text-muted)]" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 space-y-2 text-xs text-[color:var(--text-muted)]", children: [
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-x-3 gap-y-1", children: [
                      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                        "\u0627\u06CC\u062C\u0627\u062F\u06A9\u0646\u0646\u062F\u0647: ",
                        thread.createdBy?.fullName || "\u0646\u0627\u0645\u0634\u062E\u0635"
                      ] }),
                      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                        "\u0622\u062E\u0631\u06CC\u0646 \u0628\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC: ",
                        formatDateTime(thread.updatedAt)
                      ] }),
                      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                        "tenant: ",
                        thread.tenantName || thread.tenantSlug || "\u0646\u0627\u0645\u0634\u062E\u0635"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-[18px] border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface)] px-3 py-2", children: [
                      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--text-muted)]", children: "\u0635\u0641\u062D\u0647 \u0645\u0631\u062A\u0628\u0637" }),
                      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "truncate font-mono text-[11px] text-[color:var(--text-body)]", children: thread.pagePathSample })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border-color)] pt-4", children: [
                    /* @__PURE__ */ jsxRuntime.jsxs(
                      Link__default.default,
                      {
                        href: thread.pagePathSample,
                        target: "_blank",
                        className: "inline-flex items-center gap-2 rounded-full border border-[color:var(--border-color)] px-3 py-2 text-xs font-medium text-[color:var(--text-body)]",
                        children: [
                          "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0635\u0641\u062D\u0647",
                          /* @__PURE__ */ jsxRuntime.jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-[color:var(--text-muted)]", children: "\u06A9\u0627\u0631\u062A \u0631\u0627 \u0628\u06A9\u0634 \u0648 \u062F\u0631 \u0633\u062A\u0648\u0646 \u062C\u062F\u06CC\u062F \u0631\u0647\u0627 \u06A9\u0646." })
                  ] })
                ]
              },
              thread.id
            )) }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex min-h-[360px] items-center justify-center rounded-[24px] border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface)] px-6 text-center text-sm leading-7 text-[color:var(--text-muted)]", children: "\u062F\u0631 \u0627\u06CC\u0646 \u0633\u062A\u0648\u0646 \u0645\u0648\u0631\u062F\u06CC \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F." })
          ]
        },
        column.id
      )) })
    ] })
  ] });
}
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/arrow-up-right.js:
lucide-react/dist/esm/icons/circle-check.js:
lucide-react/dist/esm/icons/circle.js:
lucide-react/dist/esm/icons/grip-vertical.js:
lucide-react/dist/esm/icons/loader-circle.js:
lucide-react/dist/esm/icons/message-square-text.js:
lucide-react/dist/esm/icons/refresh-cw.js:
lucide-react/dist/esm/icons/search.js:
lucide-react/dist/esm/icons/trash-2.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.487.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

exports.BusinessSwitch = BusinessSwitch;
exports.ChoicePills = ChoicePills;
exports.ChoicePillsField = ChoicePillsField;
exports.ContractIssuerTags = ContractIssuerTags;
exports.ContractTypeTags = ContractTypeTags;
exports.DEV_DOC_PRIORITY_LABELS = DEV_DOC_PRIORITY_LABELS;
exports.DEV_DOC_THREAD_PRIORITIES = DEV_DOC_THREAD_PRIORITIES;
exports.DEV_DOC_THREAD_STATUSES = DEV_DOC_THREAD_STATUSES;
exports.DataTable = DataTable;
exports.DevDocThreadsBoard = DevDocThreadsBoard;
exports.EmptyState = EmptyState;
exports.ExpandableTagGroup = ExpandableTagGroup;
exports.FormCard = FormCard;
exports.Input = Input;
exports.PageIntro = PageIntro;
exports.PersianDatePicker = PersianDatePicker;
exports.PrimaryLink = PrimaryLink;
exports.RULE_PANEL_SELECT_CLASSNAME = RULE_PANEL_SELECT_CLASSNAME;
exports.RULE_PANEL_TEXT_INPUT_CLASSNAME = RULE_PANEL_TEXT_INPUT_CLASSNAME;
exports.RuleAmountInput = RuleAmountInput;
exports.RuleFieldLabel = RuleFieldLabel;
exports.RuleTabButton = RuleTabButton;
exports.SearchableSelect = SearchableSelect;
exports.SegmentedToggle = SegmentedToggle;
exports.ShareModePills = ShareModePills;
exports.StatGrid = StatGrid;
exports.StickySubmitBar = StickySubmitBar;
exports.TAAV_BUTTON_HEIGHT = TAAV_BUTTON_HEIGHT;
exports.TAAV_DURATION = TAAV_DURATION;
exports.TAAV_RADIUS = TAAV_RADIUS;
exports.TAAV_SHADOW = TAAV_SHADOW;
exports.TAAV_SPACING = TAAV_SPACING;
exports.TAAV_TOKEN_CATALOG = TAAV_TOKEN_CATALOG;
exports.TAAV_TOKEN_SECTIONS = TAAV_TOKEN_SECTIONS;
exports.TAAV_TONE_LABELS = TAAV_TONE_LABELS;
exports.TaavBadge = TaavBadge;
exports.TaavButton = TaavButton;
exports.TaavCard = TaavCard;
exports.TaavCheckbox = TaavCheckbox;
exports.TaavChip = TaavChip;
exports.TaavChipGroup = TaavChipGroup;
exports.TaavDetailHeader = TaavDetailHeader;
exports.TaavDialog = TaavDialog;
exports.TaavDialogClose = TaavDialogClose;
exports.TaavDialogContent = TaavDialogContent;
exports.TaavDialogDescription = TaavDialogDescription;
exports.TaavDialogFooter = TaavDialogFooter;
exports.TaavDialogHeader = TaavDialogHeader;
exports.TaavDialogOverlay = TaavDialogOverlay;
exports.TaavDialogPortal = TaavDialogPortal;
exports.TaavDialogTitle = TaavDialogTitle;
exports.TaavDialogTrigger = TaavDialogTrigger;
exports.TaavDrawer = TaavDrawer;
exports.TaavDrawerClose = TaavDrawerClose;
exports.TaavDrawerContent = TaavDrawerContent;
exports.TaavDrawerDescription = TaavDrawerDescription;
exports.TaavDrawerFooter = TaavDrawerFooter;
exports.TaavDrawerHeader = TaavDrawerHeader;
exports.TaavDrawerOverlay = TaavDrawerOverlay;
exports.TaavDrawerPortal = TaavDrawerPortal;
exports.TaavDrawerTitle = TaavDrawerTitle;
exports.TaavDrawerTrigger = TaavDrawerTrigger;
exports.TaavDropdown = TaavDropdown;
exports.TaavDropdownContent = TaavDropdownContent;
exports.TaavDropdownGroup = TaavDropdownGroup;
exports.TaavDropdownItem = TaavDropdownItem;
exports.TaavDropdownLabel = TaavDropdownLabel;
exports.TaavDropdownPortal = TaavDropdownPortal;
exports.TaavDropdownSeparator = TaavDropdownSeparator;
exports.TaavDropdownTrigger = TaavDropdownTrigger;
exports.TaavEmptyState = TaavEmptyState;
exports.TaavFieldHint = TaavFieldHint;
exports.TaavFilterBar = TaavFilterBar;
exports.TaavFormDescription = TaavFormDescription;
exports.TaavFormField = TaavFormField;
exports.TaavFormMessage = TaavFormMessage;
exports.TaavInput = TaavInput;
exports.TaavKeyValue = TaavKeyValue;
exports.TaavLabel = TaavLabel;
exports.TaavOptionCard = TaavOptionCard;
exports.TaavPageHeader = TaavPageHeader;
exports.TaavPageShell = TaavPageShell;
exports.TaavPagination = TaavPagination;
exports.TaavPopover = TaavPopover;
exports.TaavPopoverAnchor = TaavPopoverAnchor;
exports.TaavPopoverClose = TaavPopoverClose;
exports.TaavPopoverContent = TaavPopoverContent;
exports.TaavPopoverTrigger = TaavPopoverTrigger;
exports.TaavProgressSummary = TaavProgressSummary;
exports.TaavRadio = TaavRadio;
exports.TaavRadioGroup = TaavRadioGroup;
exports.TaavRequiredMark = TaavRequiredMark;
exports.TaavSection = TaavSection;
exports.TaavSegmentedControl = TaavSegmentedControl;
exports.TaavSelect = TaavSelect;
exports.TaavSettingsSection = TaavSettingsSection;
exports.TaavSidebarPanel = TaavSidebarPanel;
exports.TaavSkeleton = TaavSkeleton;
exports.TaavStatsCard = TaavStatsCard;
exports.TaavStatusBadge = TaavStatusBadge;
exports.TaavStepper = TaavStepper;
exports.TaavStickyActionBar = TaavStickyActionBar;
exports.TaavSwitch = TaavSwitch;
exports.TaavTableActions = TaavTableActions;
exports.TaavTableBody = TaavTableBody;
exports.TaavTableCell = TaavTableCell;
exports.TaavTableHead = TaavTableHead;
exports.TaavTableHeader = TaavTableHeader;
exports.TaavTableRow = TaavTableRow;
exports.TaavTableShell = TaavTableShell;
exports.TaavTabs = TaavTabs;
exports.TaavTabsContent = TaavTabsContent;
exports.TaavTabsList = TaavTabsList;
exports.TaavTabsTrigger = TaavTabsTrigger;
exports.TaavTextarea = TaavTextarea;
exports.TaavTooltip = TaavTooltip;
exports.TaavTooltipProvider = TaavTooltipProvider;
exports.TagPills = TagPills;
exports.cn = cn;
exports.compactTextareaStyle = compactTextareaStyle;
exports.formControlMutedDisabledStyle = formControlMutedDisabledStyle;
exports.formControlStyle = formControlStyle;
exports.formErrorStyle = formErrorStyle;
exports.formLabelStyle = formLabelStyle;
exports.formMetaLabelStyle = formMetaLabelStyle;
exports.formStyles = formStyles_exports;
exports.normalizeDevDocLabels = normalizeDevDocLabels;
exports.normalizeDevDocThreadPriority = normalizeDevDocThreadPriority;
exports.normalizeDevDocThreadStatus = normalizeDevDocThreadStatus;
exports.outlineButtonStyle = outlineButtonStyle;
exports.primaryButtonStyle = primaryButtonStyle;
exports.rulePanelNumericInputClassName = rulePanelNumericInputClassName;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map