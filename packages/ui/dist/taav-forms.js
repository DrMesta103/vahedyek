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
  { name: "field-block-gap-md", cssVar: "--taav-field-block-gap-md", value: "12px", description: "\u0641\u0627\u0635\u0644\u0647 \u0639\u0645\u0648\u062F\u06CC \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 TaavFieldBlock", category: "spacing", preview: "spacing" },
  { name: "field-block-label-md", cssVar: "--taav-field-block-label-md", value: "14px", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC label business form", category: "typography", preview: "text" },
  { name: "field-block-support-md", cssVar: "--taav-field-block-support-md", value: "13px", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC \u0645\u062A\u0646 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u062B\u0627\u0628\u062A \u0632\u06CC\u0631 \u0641\u06CC\u0644\u062F", category: "typography", preview: "text" },
  { name: "field-block-support-color", cssVar: "--taav-field-block-support-color", value: "theme", description: "\u0631\u0646\u06AF \u0645\u062A\u0646 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC \u062B\u0627\u0628\u062A \u0641\u06CC\u0644\u062F", category: "color", preview: "color", themeAware: true },
  { name: "field-block-error-color", cssVar: "--taav-field-block-error-color", value: "theme", description: "\u0631\u0646\u06AF \u067E\u06CC\u0627\u0645 \u062E\u0637\u0627 \u062F\u0631 business field block", category: "color", preview: "color", themeAware: true },
  { name: "field-grid-gap-md", cssVar: "--taav-field-grid-gap-md", value: "16px", description: "\u06AF\u062A\u0631 \u0627\u0641\u0642\u06CC \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 TaavFieldGrid", category: "spacing", preview: "spacing" },
  { name: "field-grid-responsive-gap", cssVar: "--taav-field-grid-responsive-gap", value: "16px", description: "\u0641\u0627\u0635\u0644\u0647 \u0631\u06CC\u0633\u067E\u0627\u0646\u0633\u06CC\u0648 business forms", category: "spacing", preview: "spacing" },
  { name: "choice-chip-height-md", cssVar: "--taav-choice-chip-height-md", value: "40px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 TaavChoiceChip", category: "component", preview: "spacing" },
  { name: "choice-chip-px-md", cssVar: "--taav-choice-chip-px-md", value: "16px", description: "\u067E\u062F\u06CC\u0646\u06AF \u0627\u0641\u0642\u06CC TaavChoiceChip", category: "component", preview: "spacing" },
  { name: "choice-chip-radius-pill", cssVar: "--taav-choice-chip-radius-pill", value: "9999px", description: "\u0634\u0639\u0627\u0639 pill \u0628\u0631\u0627\u06CC TaavChoiceChip", category: "radius", preview: "radius" },
  { name: "choice-chip-bg", cssVar: "--taav-choice-chip-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u062D\u0627\u0644\u062A \u0639\u0627\u062F\u06CC choice chip", category: "color", preview: "color", themeAware: true },
  { name: "choice-chip-border", cssVar: "--taav-choice-chip-border", value: "theme", description: "\u0645\u0631\u0632 \u062D\u0627\u0644\u062A \u0639\u0627\u062F\u06CC choice chip", category: "color", preview: "color", themeAware: true },
  { name: "choice-chip-text", cssVar: "--taav-choice-chip-text", value: "theme", description: "\u0631\u0646\u06AF \u0645\u062A\u0646 \u062D\u0627\u0644\u062A \u0639\u0627\u062F\u06CC choice chip", category: "color", preview: "color", themeAware: true },
  { name: "choice-chip-gap", cssVar: "--taav-choice-chip-gap", value: "8px", description: "\u0641\u0627\u0635\u0644\u0647 \u0628\u06CC\u0646 \u0622\u06CC\u06A9\u0646 \u062A\u06CC\u06A9 \u0648 \u0645\u062A\u0646 \u062F\u0627\u062E\u0644 choice chip", category: "spacing", preview: "spacing" },
  { name: "choice-chip-selected-bg", cssVar: "--taav-choice-chip-selected-bg", value: "#ccfbf1", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 choice chip", category: "color", preview: "color", themeAware: true },
  { name: "choice-chip-selected-border", cssVar: "--taav-choice-chip-selected-border", value: "transparent", description: "\u0645\u0631\u0632 \u062D\u0627\u0644\u062A \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 choice chip", category: "color", preview: "color" },
  { name: "choice-chip-selected-text", cssVar: "--taav-choice-chip-selected-text", value: "theme", description: "\u0631\u0646\u06AF \u0645\u062A\u0646 \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 choice chip", category: "color", preview: "color", themeAware: true },
  { name: "choice-chip-selected-icon", cssVar: "--taav-choice-chip-selected-icon", value: "theme", description: "\u0631\u0646\u06AF \u0622\u06CC\u06A9\u0646 \u062A\u06CC\u06A9 \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647", category: "color", preview: "color", themeAware: true },
  { name: "choice-chip-hover-bg", cssVar: "--taav-choice-chip-hover-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 hover \u062D\u0627\u0644\u062A \u0639\u0627\u062F\u06CC choice chip", category: "color", preview: "color", themeAware: true },
  { name: "choice-chip-focus-ring", cssVar: "--taav-choice-chip-focus-ring", value: "brand ring", description: "\u062D\u0644\u0642\u0647 \u0641\u0648\u06A9\u0648\u0633 TaavChoiceChip", category: "focus", preview: "none", themeAware: true },
  { name: "choice-chip-group-gap-md", cssVar: "--taav-choice-chip-group-gap-md", value: "12px", description: "\u0641\u0627\u0635\u0644\u0647 \u0628\u06CC\u0646 choice chip\u0647\u0627 \u062F\u0631 \u06AF\u0631\u0648\u0647", category: "spacing", preview: "spacing" },
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
  { name: "progress-fill-brand", cssVar: "--taav-progress-fill-brand", value: "theme", description: "\u0631\u0646\u06AF fill progress brand", category: "color", preview: "color", themeAware: true },
  /* Business sidebar tokens */
  { name: "business-sidebar-width-default", cssVar: "--taav-business-sidebar-width-default", value: "192px", description: "\u0639\u0631\u0636 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631 (DastRanj)", category: "business-sidebar", preview: "spacing" },
  { name: "business-sidebar-width-collapsed", cssVar: "--taav-business-sidebar-width-collapsed", value: "52px", description: "\u0639\u0631\u0636 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631 \u062C\u0645\u0639\u200C\u0634\u062F\u0647", category: "business-sidebar", preview: "spacing" },
  { name: "business-sidebar-bg", cssVar: "--taav-business-sidebar-bg", value: "rgba navy", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631 enterprise", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-border", cssVar: "--taav-business-sidebar-border", value: "rgba line", description: "\u0645\u0631\u0632 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-text", cssVar: "--taav-business-sidebar-text", value: "#eef6ff", description: "\u0645\u062A\u0646 \u0627\u0635\u0644\u06CC \u0633\u0627\u06CC\u062F\u0628\u0627\u0631", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-text-muted", cssVar: "--taav-business-sidebar-text-muted", value: "#97adc7", description: "\u0645\u062A\u0646 muted \u0645\u0646\u0648", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-icon", cssVar: "--taav-business-sidebar-icon", value: "#14b8a6", description: "\u0631\u0646\u06AF \u0622\u06CC\u06A9\u0648\u0646 toolbar", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-active-bg", cssVar: "--taav-business-sidebar-active-bg", value: "teal tint", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0622\u06CC\u062A\u0645 \u0641\u0639\u0627\u0644", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-toolbar-bg", cssVar: "--taav-business-sidebar-toolbar-bg", value: "teal tint", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0646\u0648\u0627\u0631 \u0645\u06CC\u0627\u0646\u0628\u0631", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-menu-item-height", cssVar: "--taav-business-sidebar-menu-item-height", value: "32px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 \u0622\u06CC\u062A\u0645 \u0645\u0646\u0648", category: "business-sidebar", preview: "spacing" },
  { name: "business-sidebar-tenant-active-bg", cssVar: "--taav-business-sidebar-tenant-active-bg", value: "gradient", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u067E\u0646\u0644 tenant \u0641\u0639\u0627\u0644", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-tenant-btn-bg", cssVar: "--taav-business-sidebar-tenant-btn-bg", value: "gradient", description: "\u062F\u06A9\u0645\u0647 tenant", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-footer-bg", cssVar: "--taav-business-sidebar-footer-bg", value: "teal tint", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 footer \u0646\u0633\u062E\u0647", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-badge-bg", cssVar: "--taav-business-sidebar-badge-bg", value: "#ef4444", description: "\u0646\u0634\u0627\u0646 \u0627\u0639\u0644\u0627\u0646 \u0642\u0631\u0645\u0632", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-scroll-thumb", cssVar: "--taav-business-sidebar-scroll-thumb", value: "rgba subtle", description: "\u0631\u0646\u06AF thumb scrollbar \u0645\u0646\u0648", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-scroll-thumb-hover", cssVar: "--taav-business-sidebar-scroll-thumb-hover", value: "rgba subtle", description: "hover thumb scrollbar \u0645\u0646\u0648", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-header-back-bg", cssVar: "--taav-business-sidebar-header-back-bg", value: "teal tint", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u062F\u06A9\u0645\u0647 \u0628\u0627\u0632\u06AF\u0634\u062A \u0647\u062F\u0631 \u0645\u0633\u06CC\u0631", category: "business-sidebar", preview: "color", themeAware: true },
  { name: "business-sidebar-header-text", cssVar: "--taav-business-sidebar-header-text", value: "theme", description: "\u0645\u062A\u0646 \u0628\u0631\u0686\u0633\u0628 \u0645\u0633\u06CC\u0631 \u062F\u0631 \u0647\u062F\u0631", category: "business-sidebar", preview: "color", themeAware: true },
  { name: "business-nav-path-bg", cssVar: "--taav-business-nav-path-bg", value: "#f4f7f8", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 breadcrumb \u06A9\u0646\u0627\u0631 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631", category: "business-sidebar", preview: "color", themeAware: true },
  { name: "business-nav-path-text-current", cssVar: "--taav-business-nav-path-text-current", value: "theme", description: "\u0645\u062A\u0646 \u0635\u0641\u062D\u0647 \u0641\u0639\u0644\u06CC \u062F\u0631 breadcrumb", category: "business-sidebar", preview: "color", themeAware: true },
  { name: "business-sidebar-preview-bg", cssVar: "--taav-business-sidebar-preview-bg", value: "#0a1018", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 mock viewport \u062F\u0631 Lab", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-preview-border", cssVar: "--taav-business-sidebar-preview-border", value: "rgba line", description: "\u0645\u0631\u0632 mock viewport \u062F\u0631 Lab", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-collapsed-item-height", cssVar: "--taav-business-sidebar-collapsed-item-height", value: "36px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 \u0622\u06CC\u062A\u0645 \u0645\u0646\u0648 \u062F\u0631 collapsed", category: "business-sidebar", preview: "spacing" },
  { name: "business-sidebar-collapsed-icon-size", cssVar: "--taav-business-sidebar-collapsed-icon-size", value: "14px", description: "\u0627\u0646\u062F\u0627\u0632\u0647 \u0622\u06CC\u06A9\u0648\u0646 collapsed", category: "business-sidebar", preview: "spacing" },
  { name: "business-sidebar-collapsed-active-bg", cssVar: "--taav-business-sidebar-collapsed-active-bg", value: "teal tint", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0622\u06CC\u062A\u0645 \u0641\u0639\u0627\u0644 collapsed", category: "business-sidebar", preview: "color" },
  { name: "business-sidebar-collapsed-tenant-strip-height", cssVar: "--taav-business-sidebar-collapsed-tenant-strip-height", value: "36px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 \u0646\u0648\u0627\u0631 tenant \u062F\u0631 collapsed", category: "business-sidebar", preview: "spacing" },
  { name: "scroll-minimal-size", cssVar: "--taav-scroll-minimal-size", value: "3px", description: "\u0639\u0631\u0636 scrollbar \u0645\u06CC\u0646\u06CC\u0645\u0627\u0644", category: "business-sidebar", preview: "spacing" },
  { name: "scroll-minimal-thumb", cssVar: "--taav-scroll-minimal-thumb", value: "rgba low", description: "thumb scrollbar \u0645\u06CC\u0646\u06CC\u0645\u0627\u0644", category: "business-sidebar", preview: "color" },
  { name: "scroll-minimal-thumb-hover", cssVar: "--taav-scroll-minimal-thumb-hover", value: "rgba hover", description: "hover thumb scrollbar \u0645\u06CC\u0646\u06CC\u0645\u0627\u0644", category: "business-sidebar", preview: "color" },
  { name: "scroll-thumb", cssVar: "--taav-scroll-thumb", value: "rgba subtle", description: "thumb \u0639\u0645\u0648\u0645\u06CC taav-scrollarea", category: "component", preview: "color" },
  { name: "module-card-surface", cssVar: "--taav-module-card-surface", value: "theme", description: "\u0633\u0637\u062D \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644 ERP", category: "module-card", preview: "color", themeAware: true },
  { name: "module-card-border", cssVar: "--taav-module-card-border", value: "theme", description: "\u0645\u0631\u0632 \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "color", themeAware: true },
  { name: "module-card-radius", cssVar: "--taav-module-card-radius", value: "var(--taav-radius-lg)", description: "\u0634\u0639\u0627\u0639 \u06AF\u0648\u0634\u0647 \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "radius" },
  { name: "module-card-shadow", cssVar: "--taav-module-card-shadow", value: "theme", description: "\u0633\u0627\u06CC\u0647 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "shadow", themeAware: true },
  { name: "module-card-shadow-hover", cssVar: "--taav-module-card-shadow-hover", value: "theme", description: "\u0633\u0627\u06CC\u0647 hover \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "shadow", themeAware: true },
  { name: "module-card-header-height", cssVar: "--taav-module-card-header-height", value: "52px", description: "\u0627\u0631\u062A\u0641\u0627\u0639 \u0647\u062F\u0631 \u0627\u0644\u06AF\u0648\u06CC\u06CC \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "spacing" },
  { name: "module-card-header-pattern-geometric", cssVar: "--taav-module-card-header-pattern-geometric", value: "gradient", description: "\u0627\u0644\u06AF\u0648\u06CC \u0647\u0646\u062F\u0633\u06CC \u0647\u062F\u0631 (light/dark)", category: "module-card", preview: "color", themeAware: true },
  { name: "module-card-title-md", cssVar: "--taav-module-card-title-md", value: "var(--taav-text-md)", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC \u0639\u0646\u0648\u0627\u0646 \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "text" },
  { name: "module-card-description-md", cssVar: "--taav-module-card-description-md", value: "var(--taav-text-sm)", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC \u062A\u0648\u0636\u06CC\u062D \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "text" },
  { name: "module-card-body-padding-md", cssVar: "--taav-module-card-body-padding-md", value: "18px 18px 20px", description: "padding \u0628\u062F\u0646\u0647 \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "spacing" },
  { name: "module-card-surface-hover", cssVar: "--taav-module-card-surface-hover", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 hover \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "color", themeAware: true },
  { name: "module-card-surface-selected", cssVar: "--taav-module-card-surface-selected", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0627\u0646\u062A\u062E\u0627\u0628\u200C\u0634\u062F\u0647 \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "color", themeAware: true },
  { name: "module-card-disabled-opacity", cssVar: "--taav-module-card-disabled-opacity", value: "0.58", description: "\u0634\u0641\u0627\u0641\u06CC\u062A \u062D\u0627\u0644\u062A disabled/locked", category: "module-card", preview: "none" },
  { name: "module-card-grid-gap-md", cssVar: "--taav-module-card-grid-gap-md", value: "var(--taav-space-4)", description: "\u0641\u0627\u0635\u0644\u0647 \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u06AF\u0631\u06CC\u062F \u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644", category: "module-card", preview: "spacing" },
  { name: "module-card-preview-bg-dark", cssVar: "--taav-module-card-preview-bg-dark", value: "#0a1018", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 mock \u062A\u06CC\u0631\u0647 \u062F\u0631 Lab", category: "module-card", preview: "color" },
  { name: "module-card-preview-bg-light", cssVar: "--taav-module-card-preview-bg-light", value: "#f2f5f7", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 mock \u0631\u0648\u0634\u0646 \u062F\u0631 Lab", category: "module-card", preview: "color" },
  { name: "business-intro-card-surface", cssVar: "--taav-business-intro-card-surface", value: "theme", description: "\u0633\u0637\u062D \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC \u0628\u062E\u0634 \u0628\u06CC\u0632\u06CC\u0646\u0633\u06CC", category: "business-intro-card", preview: "color", themeAware: true },
  { name: "business-intro-card-border", cssVar: "--taav-business-intro-card-border", value: "theme", description: "\u0645\u0631\u0632 \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC \u0628\u062E\u0634", category: "business-intro-card", preview: "color", themeAware: true },
  { name: "business-intro-card-radius", cssVar: "--taav-business-intro-card-radius", value: "var(--taav-radius-xl)", description: "\u0634\u0639\u0627\u0639 \u06AF\u0648\u0634\u0647 \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC", category: "business-intro-card", preview: "radius" },
  { name: "business-intro-card-padding-md", cssVar: "--taav-business-intro-card-padding-md", value: "18px 20px", description: "padding \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC", category: "business-intro-card", preview: "spacing" },
  { name: "business-intro-card-title-md", cssVar: "--taav-business-intro-card-title-md", value: "var(--taav-text-lg)", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC \u0639\u0646\u0648\u0627\u0646 \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC", category: "business-intro-card", preview: "text" },
  { name: "business-intro-card-description-md", cssVar: "--taav-business-intro-card-description-md", value: "var(--taav-text-sm)", description: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC \u062A\u0648\u0636\u06CC\u062D \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC", category: "business-intro-card", preview: "text" },
  { name: "business-intro-card-icon-bg", cssVar: "--taav-business-intro-card-icon-bg", value: "teal tint", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0622\u06CC\u06A9\u0648\u0646 \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC", category: "business-intro-card", preview: "color", themeAware: true },
  { name: "business-intro-card-icon-color", cssVar: "--taav-business-intro-card-icon-color", value: "brand strong", description: "\u0631\u0646\u06AF \u0622\u06CC\u06A9\u0648\u0646 \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC", category: "business-intro-card", preview: "color", themeAware: true },
  { name: "business-intro-card-action-color", cssVar: "--taav-business-intro-card-action-color", value: "theme", description: "\u0631\u0646\u06AF \u0627\u06A9\u0634\u0646 \u0628\u0631\u06AF\u0634\u062A/\u0648\u0631\u0648\u062F", category: "business-intro-card", preview: "color", themeAware: true },
  { name: "business-intro-card-action-hover-bg", cssVar: "--taav-business-intro-card-action-hover-bg", value: "theme", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 hover \u0627\u06A9\u0634\u0646", category: "business-intro-card", preview: "color", themeAware: true },
  { name: "business-intro-card-max-width-normal", cssVar: "--taav-business-intro-card-max-width-normal", value: "720px", description: "\u0639\u0631\u0636 \u0645\u062D\u062F\u0648\u062F \u067E\u06CC\u0634\u200C\u0641\u0631\u0636 \u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC", category: "business-intro-card", preview: "spacing" },
  { name: "business-intro-card-preview-bg-dark", cssVar: "--taav-business-intro-card-preview-bg-dark", value: "#0a1018", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 mock \u062A\u06CC\u0631\u0647 \u062F\u0631 Lab", category: "business-intro-card", preview: "color" },
  { name: "activation-switch-active-bg", cssVar: "--taav-activation-switch-active-bg", value: "#14b8a6", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0633\u06AF\u0645\u0646\u062A \u0641\u0639\u0627\u0644", category: "activation-switch", preview: "color", themeAware: true },
  { name: "activation-switch-inactive-bg", cssVar: "--taav-activation-switch-inactive-bg", value: "gray", description: "\u067E\u0633\u200C\u0632\u0645\u06CC\u0646\u0647 \u0633\u06AF\u0645\u0646\u062A \u063A\u06CC\u0631\u0641\u0639\u0627\u0644", category: "activation-switch", preview: "color", themeAware: true },
  { name: "details-link-text", cssVar: "--taav-details-link-text", value: "muted gray", description: "\u0645\u062A\u0646 \u0644\u06CC\u0646\u06A9 \u062C\u0632\u0626\u06CC\u0627\u062A", category: "details-link", preview: "color", themeAware: true },
  { name: "recommendation-card-surface", cssVar: "--taav-recommendation-card-surface", value: "theme", description: "\u0633\u0637\u062D \u06A9\u0627\u0631\u062A \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u062A\u0646\u0638\u06CC\u0645\u0627\u062A", category: "recommendation-card", preview: "color", themeAware: true },
  { name: "recommendation-card-border", cssVar: "--taav-recommendation-card-border", value: "theme", description: "\u0645\u0631\u0632 \u06A9\u0627\u0631\u062A \u067E\u06CC\u0634\u0646\u0647\u0627\u062F", category: "recommendation-card", preview: "color", themeAware: true },
  { name: "recommendation-card-max-width-wide", cssVar: "--taav-recommendation-card-max-width-wide", value: "1040px", description: "\u0639\u0631\u0636 wide \u06A9\u0627\u0631\u062A \u067E\u06CC\u0634\u0646\u0647\u0627\u062F", category: "recommendation-card", preview: "spacing" }
];
var TAAV_TOKEN_SECTIONS = [
  { id: "semantic", title: "Semantic Colors", titleFa: "\u0631\u0646\u06AF\u200C\u0647\u0627\u06CC \u0645\u0639\u0646\u0627\u06CC\u06CC", categories: ["semantic", "color"] },
  { id: "typography", title: "Typography", titleFa: "\u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC", categories: ["typography"] },
  { id: "spacing", title: "Spacing", titleFa: "\u0641\u0627\u0635\u0644\u0647\u200C\u06AF\u0630\u0627\u0631\u06CC", categories: ["spacing"] },
  { id: "radius", title: "Radius", titleFa: "\u0634\u0639\u0627\u0639", categories: ["radius"] },
  { id: "shadow", title: "Shadow", titleFa: "\u0633\u0627\u06CC\u0647", categories: ["shadow"] },
  { id: "focus", title: "Focus Ring", titleFa: "\u062D\u0644\u0642\u0647 \u0641\u0648\u06A9\u0648\u0633", categories: ["focus"] },
  { id: "motion", title: "Motion", titleFa: "\u062D\u0631\u06A9\u062A", categories: ["motion"] },
  { id: "component", title: "Component Sizing", titleFa: "\u0627\u0646\u062F\u0627\u0632\u0647 \u06A9\u0627\u0645\u067E\u0648\u0646\u0646\u062A", categories: ["component"] },
  { id: "business-sidebar", title: "Business Sidebar", titleFa: "\u0633\u0627\u06CC\u062F\u0628\u0627\u0631 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631", categories: ["business-sidebar"] },
  { id: "module-card", title: "Module Card", titleFa: "\u06A9\u0627\u0631\u062A \u0645\u0627\u0698\u0648\u0644 ERP", categories: ["module-card"] },
  { id: "business-intro-card", title: "Business Intro Card", titleFa: "\u06A9\u0627\u0631\u062A \u0645\u0639\u0631\u0641\u06CC \u0628\u062E\u0634", categories: ["business-intro-card"] },
  { id: "activation-switch", title: "Activation Switch", titleFa: "\u0633\u0648\u06CC\u06CC\u0686 \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC", categories: ["activation-switch"] },
  { id: "details-link", title: "Details Link", titleFa: "\u0644\u06CC\u0646\u06A9 \u062C\u0632\u0626\u06CC\u0627\u062A", categories: ["details-link"] },
  { id: "recommendation-card", title: "Recommendation Card", titleFa: "\u06A9\u0627\u0631\u062A \u067E\u06CC\u0634\u0646\u0647\u0627\u062F \u062A\u0646\u0638\u06CC\u0645\u0627\u062A", categories: ["recommendation-card"] }
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
  pressable: "active:scale-[0.98] active:brightness-[0.97] disabled:active:scale-100 disabled:active:brightness-100",
  focus: "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
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
var taavNumericAffixShellVariants = classVarianceAuthority.cva("", {
  variants: {
    size: {
      sm: "gap-[var(--taav-input-affix-gap-sm)]",
      md: "gap-[var(--taav-input-affix-gap-md)]",
      lg: "gap-[var(--taav-input-affix-gap-lg)]"
    }
  },
  defaultVariants: {
    size: "md"
  }
});
var taavNumericAffixLabelVariants = classVarianceAuthority.cva(
  "pointer-events-none shrink-0 select-none font-semibold text-[color:var(--taav-input-affix-color)]",
  {
    variants: {
      size: {
        sm: "min-w-[var(--taav-input-affix-min-width-sm)] text-[length:var(--taav-input-affix-font-size-sm)]",
        md: "min-w-[var(--taav-input-affix-min-width-md)] text-[length:var(--taav-input-affix-font-size-md)]",
        lg: "min-w-[var(--taav-input-affix-min-width-lg)] text-[length:var(--taav-input-affix-font-size-lg)]"
      },
      align: {
        start: "text-start",
        end: "text-end"
      }
    },
    defaultVariants: {
      size: "md",
      align: "start"
    }
  }
);
var taavNumericAffixInputClass = "text-left tabular-nums tracking-normal placeholder:text-[var(--taav-input-placeholder)]";
function taavNumericAffixShellClass(size) {
  return taavFieldShellVariants({ size, width: "full", radius: "xl" });
}

// src/forms/shared/numeric-input.utils.ts
function normalizeDigits(input) {
  return input.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (char) => {
    const code = char.charCodeAt(0);
    return String(code >= 1776 ? code - 1776 : code - 1632);
  });
}
function parsePropNumericValue(value, decimal) {
  if (value === void 0 || value === null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = normalizeDigits(String(value)).replace(decimal ? /[^\d.]/g : /\D/g, "");
  if (!normalized) return null;
  const parsed = decimal ? Number.parseFloat(normalized) : Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}
function formatIntegerInput(raw) {
  const digits = normalizeDigits(raw).replace(/\D/g, "");
  if (!digits) return { display: "", numeric: null };
  const numeric = Number.parseInt(digits, 10);
  return {
    display: numeric.toLocaleString("en-US"),
    numeric
  };
}
function formatDecimalInput(raw) {
  const normalized = normalizeDigits(raw).replace(/[٫,]/g, ".");
  const cleaned = normalized.replace(/[^\d.]/g, "");
  if (!cleaned) return { display: "", numeric: null };
  const [integerPart = "", ...fractionParts] = cleaned.split(".");
  const fractionPart = fractionParts.join("");
  const hasFraction = fractionParts.length > 0;
  const display = hasFraction ? `${integerPart}.${fractionPart}` : integerPart;
  const numeric = Number.parseFloat(display);
  if (!Number.isFinite(numeric)) {
    return { display: hasFraction ? `${integerPart}.` : integerPart, numeric: null };
  }
  return { display, numeric };
}
function formatNumericDisplay(value, decimal) {
  if (value === null) return "";
  if (decimal) return String(value);
  return value.toLocaleString("en-US");
}
function isOutOfRange(value, min, max) {
  if (value === null) return false;
  if (min !== void 0 && value < min) return true;
  if (max !== void 0 && value > max) return true;
  return false;
}
function clampNumericValue(value, min, max) {
  if (value === null) return null;
  let result = value;
  if (min !== void 0 && result < min) result = min;
  if (max !== void 0 && result > max) result = max;
  return result;
}

// src/forms/shared/useTaavNumericInputState.ts
function useTaavNumericInputState({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  decimal = false
}) {
  const isControlled = value !== void 0;
  const formatInput = decimal ? formatDecimalInput : formatIntegerInput;
  const [internalValue, setInternalValue] = react.useState(
    () => parsePropNumericValue(defaultValue, decimal)
  );
  const [displayValue, setDisplayValue] = react.useState(
    () => formatNumericDisplay(parsePropNumericValue(defaultValue, decimal), decimal)
  );
  const [isFocused, setIsFocused] = react.useState(false);
  const [rangeInvalid, setRangeInvalid] = react.useState(false);
  const onValueChangeRef = react.useRef(onValueChange);
  onValueChangeRef.current = onValueChange;
  const resolvedValue = isControlled ? parsePropNumericValue(value, decimal) : internalValue;
  react.useEffect(() => {
    if (isFocused) return;
    setDisplayValue(formatNumericDisplay(resolvedValue, decimal));
    setRangeInvalid(isOutOfRange(resolvedValue, min, max));
  }, [resolvedValue, isFocused, decimal, min, max]);
  const commitValue = react.useCallback(
    (nextValue, notify = true) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      setRangeInvalid(isOutOfRange(nextValue, min, max));
      if (notify) {
        onValueChangeRef.current?.(nextValue);
      }
    },
    [isControlled, min, max]
  );
  const handleFocus = react.useCallback(() => {
    setIsFocused(true);
  }, []);
  const handleChange = react.useCallback(
    (raw) => {
      const { display, numeric } = formatInput(raw);
      setDisplayValue(display);
      commitValue(numeric);
    },
    [commitValue, formatInput]
  );
  const handleBlur = react.useCallback(() => {
    setIsFocused(false);
    const parsed = parsePropNumericValue(displayValue, decimal);
    const clamped = clampNumericValue(parsed, min, max);
    const nextDisplay = formatNumericDisplay(clamped, decimal);
    setDisplayValue(nextDisplay);
    commitValue(clamped);
  }, [commitValue, decimal, displayValue, min, max]);
  return {
    displayValue,
    rangeInvalid,
    handleFocus,
    handleChange,
    handleBlur
  };
}
var CURRENCY_LABELS = {
  rial: "\u0631\u06CC\u0627\u0644",
  toman: "\u062A\u0648\u0645\u0627\u0646"
};
function TaavCurrencyInput({
  value,
  defaultValue,
  onValueChange,
  currency = "rial",
  currencyLabel,
  min,
  max,
  placeholder,
  disabled,
  readOnly,
  invalid = false,
  required,
  size = "md",
  tone = "neutral",
  name,
  id,
  inputMode = "numeric",
  autoComplete,
  ariaLabel,
  wrapperClassName,
  inputClassName,
  unsafeClassName
}) {
  const decimal = inputMode === "decimal";
  const { displayValue, rangeInvalid, handleFocus, handleChange, handleBlur } = useTaavNumericInputState({
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    decimal
  });
  const showInvalid = invalid || rangeInvalid;
  const resolvedCurrencyLabel = currencyLabel ?? CURRENCY_LABELS[currency];
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      dir: "rtl",
      className: cn(
        taavNumericAffixShellClass(size),
        taavNumericAffixShellVariants({ size }),
        getTaavFieldToneClasses(tone, showInvalid),
        wrapperClassName,
        unsafeClassName
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavNumericAffixLabelVariants({ size, align: "end" }), "aria-hidden": "true", children: resolvedCurrencyLabel }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            id,
            name,
            type: "text",
            dir: "ltr",
            value: displayValue,
            placeholder,
            disabled,
            readOnly,
            required,
            inputMode,
            autoComplete,
            "aria-label": ariaLabel,
            "aria-invalid": showInvalid || void 0,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onChange: (event) => handleChange(event.target.value),
            className: cn(taavFieldControlClass, taavNumericAffixInputClass, inputClassName)
          }
        )
      ]
    }
  );
}
function TaavPercentageInput({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  placeholder,
  disabled,
  readOnly,
  invalid = false,
  required,
  size = "md",
  tone = "neutral",
  name,
  id,
  inputMode = "numeric",
  autoComplete,
  ariaLabel,
  wrapperClassName,
  inputClassName,
  unsafeClassName
}) {
  const decimal = inputMode === "decimal";
  const { displayValue, rangeInvalid, handleFocus, handleChange, handleBlur } = useTaavNumericInputState({
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    decimal
  });
  const showInvalid = invalid || rangeInvalid;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      dir: "ltr",
      className: cn(
        taavNumericAffixShellClass(size),
        taavNumericAffixShellVariants({ size }),
        getTaavFieldToneClasses(tone, showInvalid),
        "gap-[4px]",
        wrapperClassName,
        unsafeClassName
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn(taavNumericAffixLabelVariants({ size, align: "start" }), "min-w-[1.25rem]"), "aria-hidden": "true", children: "%" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            id,
            name,
            type: "text",
            dir: "ltr",
            value: displayValue,
            placeholder,
            disabled,
            readOnly,
            required,
            inputMode,
            autoComplete,
            "aria-label": ariaLabel,
            "aria-invalid": showInvalid || void 0,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onChange: (event) => handleChange(event.target.value),
            className: cn(taavFieldControlClass, taavNumericAffixInputClass, inputClassName)
          }
        )
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
var itemAlignmentClass = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch"
};
var textAlignmentClass = {
  start: "text-start justify-start",
  center: "text-center justify-center",
  end: "text-end justify-end"
};
var blockGapClass = {
  sm: "gap-[var(--taav-field-block-gap-sm)]",
  md: "gap-[var(--taav-field-block-gap-md)]",
  lg: "gap-[var(--taav-field-block-gap-lg)]"
};
var labelSizeClass = {
  sm: "text-[length:var(--taav-field-block-label-sm)]",
  md: "text-[length:var(--taav-field-block-label-md)]",
  lg: "text-[length:var(--taav-field-block-label-lg)]"
};
var supportSizeClass = {
  sm: "text-[length:var(--taav-field-block-support-sm)]",
  md: "text-[length:var(--taav-field-block-support-md)]",
  lg: "text-[length:var(--taav-field-block-support-lg)]"
};
var feedbackSizeClass = {
  sm: "text-[length:var(--taav-field-block-feedback-sm)]",
  md: "text-[length:var(--taav-field-block-feedback-md)]",
  lg: "text-[length:var(--taav-field-block-feedback-lg)]"
};
var taavFieldBlockVariants = classVarianceAuthority.cva("grid w-full", {
  variants: {
    size: blockGapClass,
    align: itemAlignmentClass
  },
  defaultVariants: {
    size: "md",
    align: "stretch"
  }
});
var taavFieldBlockLabelVariants = classVarianceAuthority.cva(
  "inline-flex w-full items-center gap-[var(--taav-space-1)] font-[var(--taav-font-weight-black)] leading-[var(--taav-leading-tight)] text-[var(--taav-field-block-label-color)]",
  {
    variants: {
      size: labelSizeClass,
      align: textAlignmentClass
    },
    defaultVariants: {
      size: "md",
      align: "start"
    }
  }
);
var taavFieldBlockControlVariants = classVarianceAuthority.cva("w-full", {
  variants: {
    size: {
      sm: "min-h-[var(--taav-field-block-control-min-height-sm)]",
      md: "min-h-[var(--taav-field-block-control-min-height-md)]",
      lg: "min-h-[var(--taav-field-block-control-min-height-lg)]"
    }
  },
  defaultVariants: {
    size: "md"
  }
});
var taavFieldBlockSupportVariants = classVarianceAuthority.cva(
  "m-0 w-full leading-[var(--taav-leading-relaxed)] text-[var(--taav-field-block-support-color)]",
  {
    variants: {
      size: supportSizeClass,
      align: textAlignmentClass
    },
    defaultVariants: {
      size: "md",
      align: "start"
    }
  }
);
var taavFieldBlockFeedbackVariants = classVarianceAuthority.cva("w-full", {
  variants: {
    size: feedbackSizeClass,
    align: textAlignmentClass
  },
  defaultVariants: {
    size: "md",
    align: "start"
  }
});
var gridGapClass = {
  sm: "[column-gap:var(--taav-field-grid-gap-sm)]",
  md: "[column-gap:var(--taav-field-grid-gap-md)]",
  lg: "[column-gap:var(--taav-field-grid-gap-lg)]",
  xl: "[column-gap:var(--taav-field-grid-gap-xl)]"
};
var gridRowGapClass = {
  compact: "[row-gap:var(--taav-field-grid-row-gap-compact)]",
  comfortable: "[row-gap:var(--taav-field-grid-row-gap-comfortable)]",
  spacious: "[row-gap:var(--taav-field-grid-row-gap-spacious)]"
};
var responsiveColumnsClass = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
};
var staticColumnsClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4"
};
function getTaavFieldGridColumnsClass(columns, responsive) {
  return responsive ? responsiveColumnsClass[columns] : staticColumnsClass[columns];
}
var taavFieldGridVariants = classVarianceAuthority.cva("grid w-full", {
  variants: {
    gap: gridGapClass,
    density: gridRowGapClass,
    responsive: {
      true: "max-md:[row-gap:var(--taav-field-grid-responsive-gap)]",
      false: ""
    }
  },
  defaultVariants: {
    gap: "md",
    density: "comfortable",
    responsive: true
  }
});
function withDescribedBy(children, describedBy, invalid) {
  if (!react.isValidElement(children)) return children;
  const element = children;
  const existingDescribedBy = typeof element.props["aria-describedby"] === "string" ? element.props["aria-describedby"] : void 0;
  const mergedDescribedBy = [existingDescribedBy, describedBy].filter(Boolean).join(" ") || void 0;
  return react.cloneElement(element, {
    "aria-describedby": mergedDescribedBy,
    "aria-invalid": invalid || void 0
  });
}
function TaavFieldBlock({
  label,
  required = false,
  optional = false,
  tooltip,
  hint,
  supportText,
  description,
  error,
  success,
  warning,
  htmlFor,
  disabled = false,
  invalid = false,
  size = "md",
  align = "stretch",
  tooltipAlign = "start",
  labelAlign = "start",
  children,
  wrapperClassName,
  labelClassName,
  controlClassName,
  supportClassName,
  unsafeClassName
}) {
  const generatedId = react.useId();
  const supportId = `${generatedId}-support`;
  const messageId = `${generatedId}-message`;
  const resolvedSupport = supportText ?? hint ?? tooltip ?? description;
  const resolvedStatus = error ?? warning ?? success;
  const resolvedTone = error ? "danger" : warning ? "warning" : success ? "success" : void 0;
  const describedBy = [resolvedSupport ? supportId : null, resolvedStatus ? messageId : null].filter(Boolean).join(" ");
  const isInvalid = invalid || Boolean(error);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(taavFieldBlockVariants({ size, align }), wrapperClassName, unsafeClassName),
      "data-disabled": disabled || void 0,
      "data-invalid": isInvalid || void 0,
      "data-required": required || void 0,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          TaavLabel,
          {
            htmlFor,
            required,
            optional,
            disabled,
            tone: isInvalid ? "danger" : "default",
            wrapperClassName: cn(taavFieldBlockLabelVariants({ size, align: labelAlign }), labelClassName),
            children: label
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(taavFieldBlockControlVariants({ size }), controlClassName), children: withDescribedBy(children, describedBy || void 0, isInvalid) }),
        resolvedSupport ? /* @__PURE__ */ jsxRuntime.jsx(
          TaavFormDescription,
          {
            size: size === "sm" ? "sm" : "md",
            unsafeClassName: cn(taavFieldBlockSupportVariants({ size, align: tooltipAlign }), supportClassName),
            children: /* @__PURE__ */ jsxRuntime.jsx("span", { id: supportId, children: resolvedSupport })
          }
        ) : null,
        resolvedStatus && resolvedTone ? /* @__PURE__ */ jsxRuntime.jsx(
          TaavFormMessage,
          {
            tone: resolvedTone,
            size: size === "sm" ? "sm" : "md",
            unsafeClassName: cn(
              taavFieldBlockFeedbackVariants({ size, align: tooltipAlign }),
              resolvedTone === "danger" && "text-[var(--taav-field-block-error-color)]"
            ),
            children: /* @__PURE__ */ jsxRuntime.jsx("span", { id: messageId, children: resolvedStatus })
          }
        ) : null
      ]
    }
  );
}
function TaavFieldGrid({
  columns = 2,
  gap = "md",
  density = "comfortable",
  responsive = true,
  children
}) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(taavFieldGridVariants({ gap, density, responsive }), getTaavFieldGridColumnsClass(columns, responsive)), children });
}
var selectedToneClass = {
  neutral: "bg-[var(--taav-neutral-soft)] text-[var(--taav-choice-chip-selected-text)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none",
  brand: "bg-[var(--taav-choice-chip-selected-bg)] text-[var(--taav-choice-chip-selected-text)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none",
  success: "bg-[var(--taav-success-muted)] text-[var(--taav-success-strong)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none",
  warning: "bg-[var(--taav-warning-muted)] text-[var(--taav-warning-strong)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none",
  danger: "bg-[var(--taav-danger-muted)] text-[var(--taav-danger-strong)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none",
  info: "bg-[var(--taav-info-muted)] text-[var(--taav-info-strong)] border-[color:var(--taav-choice-chip-selected-border)] shadow-none"
};
var taavChoiceChipVariants = classVarianceAuthority.cva(
  [
    "inline-flex max-w-full items-center justify-center gap-[var(--taav-choice-chip-gap)] border border-solid",
    "font-[var(--taav-font-weight-medium)] leading-none text-[var(--taav-choice-chip-text)]",
    "bg-[var(--taav-choice-chip-bg)] border-[color:var(--taav-choice-chip-border)]",
    "hover:bg-[var(--taav-choice-chip-hover-bg)]",
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus,
    "focus-visible:shadow-[var(--taav-choice-chip-focus-ring)]",
    TAAV_INTERACTION.pressable,
    "disabled:pointer-events-none disabled:opacity-50"
  ],
  {
    variants: {
      size: {
        sm: "h-[var(--taav-choice-chip-height-sm)] px-[var(--taav-choice-chip-px-sm)] text-[length:var(--taav-text-xs)]",
        md: "h-[var(--taav-choice-chip-height-md)] px-[var(--taav-choice-chip-px-md)] text-[length:var(--taav-text-sm)]",
        lg: "h-[var(--taav-choice-chip-height-lg)] px-[var(--taav-choice-chip-px-lg)] text-[length:var(--taav-text-md)]"
      },
      shape: {
        pill: "rounded-[var(--taav-choice-chip-radius-pill)]",
        rounded: "rounded-[var(--taav-choice-chip-radius-rounded)]"
      },
      tone: {
        neutral: "",
        brand: "",
        success: "",
        warning: "",
        danger: "",
        info: ""
      },
      selected: {
        true: "",
        false: ""
      },
      invalid: {
        true: "border-[color:var(--taav-danger-border)]",
        false: ""
      }
    },
    compoundVariants: [
      { selected: true, tone: "neutral", className: selectedToneClass.neutral },
      { selected: true, tone: "brand", className: selectedToneClass.brand },
      { selected: true, tone: "success", className: selectedToneClass.success },
      { selected: true, tone: "warning", className: selectedToneClass.warning },
      { selected: true, tone: "danger", className: selectedToneClass.danger },
      { selected: true, tone: "info", className: selectedToneClass.info }
    ],
    defaultVariants: {
      size: "md",
      shape: "pill",
      selected: false,
      invalid: false
    }
  }
);
var taavChoiceChipCheckClass = "inline-flex shrink-0 text-[var(--taav-choice-chip-selected-icon)] [&_svg]:h-4 [&_svg]:w-4";
var taavChoiceChipIconSlotClass = "inline-flex shrink-0 text-[var(--taav-text-muted)] [&_svg]:h-4 [&_svg]:w-4";
var taavChoiceChipGroupGapClass = {
  sm: "gap-[var(--taav-choice-chip-group-gap-sm)]",
  md: "gap-[var(--taav-choice-chip-group-gap-md)]",
  lg: "gap-[var(--taav-choice-chip-group-gap-lg)]"
};
var taavChoiceChipGroupShellClass = "grid w-full gap-[var(--taav-choice-chip-group-shell-gap)]";
var choiceChipGroupLabelSizeClass = {
  sm: "text-[length:var(--taav-text-sm)]",
  md: "text-[length:var(--taav-text-md)]",
  lg: "text-[length:var(--taav-text-lg)]"
};
var choiceChipGroupDescriptionSizeClass = {
  sm: "text-[length:var(--taav-text-xs)]",
  md: "text-[length:var(--taav-text-sm)]",
  lg: "text-[length:var(--taav-text-md)]"
};
function taavChoiceChipGroupLabelClass(size = "md") {
  return [
    "m-0 inline-flex w-full items-center gap-[var(--taav-space-1)] font-[var(--taav-font-weight-black)] leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)]",
    choiceChipGroupLabelSizeClass[size]
  ].join(" ");
}
function taavChoiceChipGroupDescriptionClass(size = "md") {
  return [
    "m-0 leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]",
    choiceChipGroupDescriptionSizeClass[size]
  ].join(" ");
}
var taavChoiceChipGroupOptionsClass = "flex w-full";
function ChoiceCheckIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { "aria-hidden": true, viewBox: "0 0 16 16", fill: "none", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4 8.25 6.6 10.8 12 5.5", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
var TaavChoiceChip = react.forwardRef(function TaavChoiceChip2({
  children,
  selected = false,
  disabled = false,
  invalid = false,
  size = "md",
  tone = "brand",
  shape = "pill",
  showCheck,
  iconStart,
  iconEnd,
  value,
  type = "button",
  onClick,
  checked,
  role,
  wrapperClassName,
  unsafeClassName,
  ...props
}, ref) {
  const isSelected = selected || checked || false;
  const shouldShowCheck = showCheck === true;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      ref,
      type,
      value,
      disabled,
      onClick,
      role,
      "aria-checked": role ? isSelected : void 0,
      "aria-pressed": !role ? isSelected : void 0,
      "aria-invalid": invalid || void 0,
      "data-state": isSelected ? "selected" : "unselected",
      className: cn(
        taavChoiceChipVariants({ size, shape, selected: isSelected, invalid, tone }),
        "whitespace-nowrap",
        wrapperClassName,
        unsafeClassName
      ),
      ...props,
      children: [
        shouldShowCheck ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceChipCheckClass, "aria-hidden": true, children: /* @__PURE__ */ jsxRuntime.jsx(ChoiceCheckIcon, {}) }) : iconStart ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceChipIconSlotClass, children: iconStart }) : null,
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "min-w-0 truncate", children }),
        iconEnd ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: taavChoiceChipIconSlotClass, children: iconEnd }) : null
      ]
    }
  );
});
function normalizeValue(value) {
  if (value === void 0) return [];
  return Array.isArray(value) ? value : value ? [value] : [];
}
var alignClass = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end"
};
function TaavChoiceChipGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  selectionMode = "single",
  label,
  description,
  hint,
  required = false,
  size = "md",
  tone = "brand",
  disabled = false,
  invalid = false,
  wrap = true,
  gap = "md",
  align = "start",
  ariaLabel,
  className,
  labelClassName,
  descriptionClassName
}) {
  const generatedLabelId = react.useId();
  const descriptionId = react.useId();
  const visibleLabelId = react.useId();
  const supportText = description ?? hint;
  const [internalValue, setInternalValue] = react.useState(
    defaultValue ?? (selectionMode === "multiple" ? [] : "")
  );
  const buttonRefs = react.useRef([]);
  const isControlled = value !== void 0;
  const currentValue = isControlled ? value : internalValue;
  const selectedValues = react.useMemo(() => normalizeValue(currentValue), [currentValue]);
  const accessibleName = label ?? ariaLabel;
  const updateValue = (nextValues) => {
    const next = selectionMode === "multiple" ? nextValues : nextValues[0] ?? "";
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };
  const toggleValue = (optionValue) => {
    if (selectionMode === "multiple") {
      const nextValues = selectedValues.includes(optionValue) ? selectedValues.filter((valueItem) => valueItem !== optionValue) : [...selectedValues, optionValue];
      updateValue(nextValues);
      return;
    }
    updateValue([optionValue]);
  };
  const focusNext = (currentIndex, direction) => {
    const enabledIndexes = options.map((option, index) => ({ option, index })).filter(({ option }) => !(disabled || option.disabled)).map(({ index }) => index);
    const activeListIndex = enabledIndexes.indexOf(currentIndex);
    if (activeListIndex === -1) return;
    const nextIndex = enabledIndexes[(activeListIndex + direction + enabledIndexes.length) % enabledIndexes.length];
    buttonRefs.current[nextIndex]?.focus();
  };
  const handleKeyDown = (event, index, optionValue) => {
    if (selectionMode === "single") {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        focusNext(index, 1);
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        focusNext(index, -1);
        return;
      }
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggleValue(optionValue);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(taavChoiceChipGroupShellClass, className), children: [
    label ? /* @__PURE__ */ jsxRuntime.jsxs("div", { id: visibleLabelId, className: cn(taavChoiceChipGroupLabelClass(size), labelClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: label }),
      required ? /* @__PURE__ */ jsxRuntime.jsx(TaavRequiredMark, {}) : null
    ] }) : null,
    supportText ? /* @__PURE__ */ jsxRuntime.jsx("p", { id: descriptionId, className: cn(taavChoiceChipGroupDescriptionClass(size), descriptionClassName), children: supportText }) : null,
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        role: selectionMode === "single" ? "radiogroup" : "group",
        "aria-label": !label ? ariaLabel : void 0,
        "aria-labelledby": label ? visibleLabelId : !ariaLabel ? generatedLabelId : void 0,
        "aria-describedby": supportText ? descriptionId : void 0,
        "aria-invalid": invalid || void 0,
        "aria-required": required || void 0,
        className: cn(
          taavChoiceChipGroupOptionsClass,
          alignClass[align],
          wrap ? "flex-wrap" : "flex-nowrap overflow-x-auto pb-1",
          taavChoiceChipGroupGapClass[gap]
        ),
        children: [
          !accessibleName ? /* @__PURE__ */ jsxRuntime.jsx("span", { id: generatedLabelId, className: "sr-only", children: "\u06AF\u0631\u0648\u0647 \u0627\u0646\u062A\u062E\u0627\u0628 \u06AF\u0632\u06CC\u0646\u0647" }) : null,
          options.map((option, index) => {
            const isSelected = selectedValues.includes(option.value);
            const isDisabled = disabled || option.disabled;
            const showCheck = selectionMode === "multiple" && isSelected;
            return /* @__PURE__ */ jsxRuntime.jsx(
              TaavChoiceChip,
              {
                ref: (node) => {
                  buttonRefs.current[index] = node;
                },
                selected: isSelected,
                showCheck,
                disabled: isDisabled,
                invalid,
                size,
                tone,
                iconStart: showCheck ? void 0 : option.icon,
                role: selectionMode === "single" ? "radio" : "checkbox",
                tabIndex: selectionMode === "single" ? isSelected || !selectedValues.length && index === 0 ? 0 : -1 : 0,
                "aria-label": option.label,
                onClick: () => toggleValue(option.value),
                onKeyDown: (event) => handleKeyDown(event, index, option.value),
                children: option.label
              },
              option.value
            );
          })
        ]
      }
    )
  ] });
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
exports.TaavChoiceChipGroup = TaavChoiceChipGroup;
exports.TaavCurrencyInput = TaavCurrencyInput;
exports.TaavFieldBlock = TaavFieldBlock;
exports.TaavFieldGrid = TaavFieldGrid;
exports.TaavFormDescription = TaavFormDescription;
exports.TaavFormField = TaavFormField;
exports.TaavFormMessage = TaavFormMessage;
exports.TaavInput = TaavInput;
exports.TaavLabel = TaavLabel;
exports.TaavOptionCard = TaavOptionCard;
exports.TaavPercentageInput = TaavPercentageInput;
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