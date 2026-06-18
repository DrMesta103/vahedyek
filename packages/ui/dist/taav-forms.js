'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var jsxRuntime = require('react/jsx-runtime');
var classVarianceAuthority = require('class-variance-authority');
var react = require('react');

// src/utils/cn.ts
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

// src/primitives/shared/interaction.ts
var TAAV_INTERACTION = {
  base: [
    "transition-[background-color,border-color,color,box-shadow,transform,opacity]",
    "duration-[var(--taav-duration-normal)]",
    "ease-[var(--taav-ease-standard)]"
  ].join(" "),
  iconSlot: "inline-flex shrink-0 [&_svg]:pointer-events-none"
};
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
function LoadingSpinner() {
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
        loading ? /* @__PURE__ */ jsxRuntime.jsx(LoadingSpinner, {}) : null,
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
  const [internalValue, setInternalValue] = react.useState(defaultValue?.toString() ?? "");
  const currentValue = value !== void 0 ? value.toString() : internalValue;
  const count = currentValue.length;
  const resolvedRows = react.useMemo(() => {
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
  const inputRef = react.useRef(null);
  react.useEffect(() => {
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
  const [internalValue, setInternalValue] = react.useState(defaultValue ?? options[0]?.value ?? "");
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

exports.TAAV_BUTTON_HEIGHT = TAAV_BUTTON_HEIGHT;
exports.TAAV_DURATION = TAAV_DURATION;
exports.TAAV_RADIUS = TAAV_RADIUS;
exports.TAAV_SHADOW = TAAV_SHADOW;
exports.TAAV_SPACING = TAAV_SPACING;
exports.TAAV_TOKEN_CATALOG = TAAV_TOKEN_CATALOG;
exports.TAAV_TOKEN_SECTIONS = TAAV_TOKEN_SECTIONS;
exports.TAAV_TONE_LABELS = TAAV_TONE_LABELS;
exports.TaavCheckbox = TaavCheckbox;
exports.TaavFormDescription = TaavFormDescription;
exports.TaavFormField = TaavFormField;
exports.TaavFormMessage = TaavFormMessage;
exports.TaavInput = TaavInput;
exports.TaavLabel = TaavLabel;
exports.TaavOptionCard = TaavOptionCard;
exports.TaavRadio = TaavRadio;
exports.TaavRadioGroup = TaavRadioGroup;
exports.TaavRequiredMark = TaavRequiredMark;
exports.TaavSegmentedControl = TaavSegmentedControl;
exports.TaavSelect = TaavSelect;
exports.TaavSwitch = TaavSwitch;
exports.TaavTextarea = TaavTextarea;
exports.cn = cn;
//# sourceMappingURL=taav-forms.js.map
//# sourceMappingURL=taav-forms.js.map