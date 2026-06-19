import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';

// src/utils/cn.ts
function cn(...inputs) {
  return twMerge(clsx(inputs));
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
var taavChipVariants = cva(
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
var taavTableShellVariants = cva(
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
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: "inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70",
      "aria-hidden": true
    }
  );
}
function ChipRemoveButton({ label, onRemove, disabled }) {
  return /* @__PURE__ */ jsx(
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
      children: /* @__PURE__ */ jsx("svg", { "aria-hidden": true, viewBox: "0 0 12 12", className: "h-3 w-3", children: /* @__PURE__ */ jsx("path", { d: "M3 3l6 6M9 3 3 9", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" }) })
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
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    loading ? /* @__PURE__ */ jsx(ChipSpinner, {}) : null,
    !loading && iconStart ? /* @__PURE__ */ jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconStart }) : null,
    children ? /* @__PURE__ */ jsx("span", { className: "truncate", children }) : null,
    !loading && iconEnd ? /* @__PURE__ */ jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconEnd }) : null,
    showRemove ? /* @__PURE__ */ jsx(ChipRemoveButton, { label: removeLabel, onRemove, disabled: isDisabled }) : null
  ] });
  if (!isInteractive) {
    return /* @__PURE__ */ jsx("span", { className, children: content });
  }
  return /* @__PURE__ */ jsx("button", { type: "button", className, disabled: isDisabled, onClick, "aria-pressed": behavior === "selectable" ? selected : void 0, ...props, children: content });
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
var taavBadgeVariants = cva(
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
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: cn(
        taavBadgeVariants({ size: badgeSize, shape: "pill", width: "auto" }),
        getTaavBadgeToneClasses(config.tone, variant),
        wrapperClassName
      ),
      children: [
        withDot ? /* @__PURE__ */ jsx(
          "span",
          {
            className: cn("inline-block shrink-0 rounded-full bg-current opacity-80", dotSizeClass[size]),
            "aria-hidden": true
          }
        ) : null,
        icon ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5", children: icon }) : null,
        /* @__PURE__ */ jsx("span", { className: "truncate", children: text })
      ]
    }
  );
}
var sizePadding = {
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
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex flex-col items-center justify-center text-center",
        sizePadding[size],
        variant !== "compact" && "rounded-[var(--taav-radius-lg)] bg-[var(--taav-empty-surface)]",
        wrapperClassName
      ),
      children: /* @__PURE__ */ jsxs("div", { className: cn("grid max-w-md gap-[var(--taav-space-3)]", contentClassName), children: [
        icon ? /* @__PURE__ */ jsx("div", { className: cn("mx-auto inline-flex items-center justify-center rounded-full bg-[var(--taav-surface-muted)]", iconSize[size], toneSurface[tone]), children: icon }) : null,
        title ? /* @__PURE__ */ jsx("h3", { className: cn("m-0 font-black text-[var(--taav-text-strong)]", isCompact ? "text-[length:var(--taav-text-sm)]" : "text-[length:var(--taav-text-lg)]"), children: title }) : null,
        description ? /* @__PURE__ */ jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]", children: description }) : null,
        children,
        (primaryAction || secondaryAction) && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-[var(--taav-space-2)]", children: [
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
  return /* @__PURE__ */ jsx(
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
    return /* @__PURE__ */ jsx(
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
    return /* @__PURE__ */ jsx("div", { className: cn("grid gap-2", wrapperClassName), children: Array.from({ length: lines }).map((_, index) => /* @__PURE__ */ jsx(
      SkeletonBlock,
      {
        animated,
        className: cn(defaults.height, index === lines - 1 ? "w-4/5" : "w-full", radiusClass[resolvedRadius], contentClassName)
      },
      index
    )) });
  }
  return /* @__PURE__ */ jsx("div", { className: cn("grid gap-2", wrapperClassName), children: Array.from({ length: count }).map((_, index) => /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs("div", { className: cn(taavTableShellVariants({ variant }), wrapperClassName), children: [
    loading ? /* @__PURE__ */ jsx("div", { className: "p-[var(--taav-space-4)]", children: /* @__PURE__ */ jsx(TaavSkeleton, { variant: "table", count: 5 }) }) : empty ? emptyState ?? /* @__PURE__ */ jsx(TaavEmptyState, { variant: "compact", size: "sm", title: "\u0645\u0648\u0631\u062F\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F", description: "\u062F\u0627\u062F\u0647\u200C\u0627\u06CC \u0628\u0631\u0627\u06CC \u0646\u0645\u0627\u06CC\u0634 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F." }) : /* @__PURE__ */ jsx("table", { className: cn("w-full border-collapse text-right", contentClassName), "data-density": density, "data-variant": variant, children }),
    footer ? /* @__PURE__ */ jsx("div", { className: "border-t border-[color:var(--taav-table-border)] p-[var(--taav-space-3)]", children: footer }) : null
  ] });
}
function TaavTableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("thead", { className, ...props });
}
function TaavTableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx("tbody", { className, ...props });
}
function TaavTableRow({ className, striped, ...props }) {
  return /* @__PURE__ */ jsx("tr", { className: cn(taavTableRowClass, className), "data-striped": striped || void 0, ...props });
}
function TaavTableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx("th", { className: cn(taavTableHeadCellClass, className), ...props });
}
function TaavTableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx("td", { className: cn(taavTableCellClass, className), ...props });
}
function TaavTableActions({ className, ...props }) {
  return /* @__PURE__ */ jsx(
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
    return /* @__PURE__ */ jsx("div", { className: cn("grid", wrapperClassName), children });
  }
  const layoutClass = layout === "grid" ? "grid gap-[var(--taav-space-4)] sm:grid-cols-2" : layout === "horizontal" ? "grid gap-[var(--taav-space-3)]" : "grid gap-[var(--taav-space-3)]";
  return /* @__PURE__ */ jsx("dl", { className: cn(layoutClass, wrapperClassName), children: items?.map((item, index) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        layout === "horizontal" ? "flex items-start gap-[var(--taav-space-4)]" : "grid",
        taavKeyValueGapClass[density],
        separator && index > 0 && "border-t border-[color:var(--taav-border-subtle)] pt-[var(--taav-space-3)]",
        contentClassName
      ),
      children: [
        /* @__PURE__ */ jsx(
          "dt",
          {
            className: cn(
              "m-0 font-[var(--taav-font-weight-bold)] text-[var(--taav-text-muted)]",
              taavKeyValueLabelClass[size],
              layout === "horizontal" && "shrink-0"
            ),
            style: labelWidth ? { width: labelWidth } : void 0,
            children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-[var(--taav-space-2)]", children: [
              item.icon ? /* @__PURE__ */ jsx("span", { className: "inline-flex [&_svg]:h-4 [&_svg]:w-4", children: item.icon }) : null,
              item.label
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("dd", { className: cn("m-0 font-[var(--taav-font-weight-medium)]", taavKeyValueValueClass[size], valueToneClass[item.tone ?? "neutral"]), children: [
          item.value ?? emptyText,
          item.description ? /* @__PURE__ */ jsx("span", { className: "mt-1 block text-[length:var(--taav-text-xs)] font-[var(--taav-font-weight-medium)] text-[var(--taav-text-subtle)]", children: item.description }) : null
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
  const [internalValue, setInternalValue] = useState(
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
  return /* @__PURE__ */ jsx(
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
      children: options ? options.map((option) => /* @__PURE__ */ jsx(
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
var taavButtonVariants = cva(
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
  return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs(
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
        loading ? /* @__PURE__ */ jsx(LoadingSpinner, { size }) : null,
        !loading && iconStart ? /* @__PURE__ */ jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconStart }) : null,
        !loading && children ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center leading-none", children }) : null,
        !loading && iconEnd ? /* @__PURE__ */ jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconEnd }) : null
      ]
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-wrap items-center justify-between gap-[var(--taav-space-3)]",
        wrapperClassName
      ),
      dir: "rtl",
      children: [
        showTotal ? /* @__PURE__ */ jsx("p", { className: "m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: totalItems != null ? `${totalItems} \u0645\u0648\u0631\u062F` : `\u0635\u0641\u062D\u0647 ${page} \u0627\u0632 ${totalPages}` }) : /* @__PURE__ */ jsx("span", {}),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: [
          /* @__PURE__ */ jsx(
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
            (item, index) => item === "ellipsis" ? /* @__PURE__ */ jsx("span", { className: "px-1 text-[var(--taav-text-subtle)]", children: "\u2026" }, `ellipsis-${index}`) : /* @__PURE__ */ jsx(
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
          /* @__PURE__ */ jsx(
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
        showPageSize && pageSize != null && onPageSizeChange ? /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: [
          /* @__PURE__ */ jsx("span", { children: "\u062A\u0639\u062F\u0627\u062F" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              className: "h-[var(--taav-pagination-height-md)] rounded-[var(--taav-radius-md)] border border-[color:var(--taav-border)] bg-[var(--taav-surface)] px-2 text-[length:var(--taav-text-sm)]",
              value: pageSize,
              disabled,
              onChange: (event) => onPageSizeChange(Number(event.target.value)),
              children: pageSizeOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option, children: option }, option))
            }
          )
        ] }) : null
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
var taavFieldShellVariants = cva(
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
cva(
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
function LoadingSpinner2() {
  return /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        taavFieldShellVariants({ size, variant, width, radius }),
        getTaavFieldToneClasses(tone, invalid),
        wrapperClassName
      ),
      children: [
        loading ? /* @__PURE__ */ jsx(LoadingSpinner2, {}) : null,
        !loading && iconStart ? /* @__PURE__ */ jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconStart }) : null,
        !loading && prefix ? /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: prefix }) : null,
        /* @__PURE__ */ jsx(
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
        !loading && suffix ? /* @__PURE__ */ jsx("span", { className: "shrink-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-subtle)]", children: suffix }) : null,
        !loading && iconEnd ? /* @__PURE__ */ jsx("span", { className: TAAV_INTERACTION.iconSlot, children: iconEnd }) : null
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
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "rounded-[var(--taav-radius-lg)] border border-solid border-[color:var(--taav-filterbar-border)] bg-[var(--taav-filterbar-surface)]",
        density === "compact" ? "p-[var(--taav-space-3)]" : "p-[var(--taav-space-4)]",
        sticky && "sticky top-0 z-[var(--taav-z-sticky)]",
        wrapperClassName
      ),
      children: [
        /* @__PURE__ */ jsxs(
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
              /* @__PURE__ */ jsxs("div", { className: "grid gap-[var(--taav-filterbar-gap)]", children: [
                showSearch ? loading ? /* @__PURE__ */ jsx(TaavSkeleton, { variant: "row", size: "sm" }) : /* @__PURE__ */ jsx(
                  TaavInput,
                  {
                    size: density === "compact" ? "sm" : "md",
                    placeholder: searchPlaceholder,
                    value: searchValue,
                    onChange: (event) => onSearchChange?.(event.target.value)
                  }
                ) : null,
                filters,
                activeFilters ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-[var(--taav-space-2)]", children: activeFilters }) : null
              ] }),
              resultCount != null ? /* @__PURE__ */ jsx("p", { className: "m-0 self-center text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]", children: loading ? "\u2026" : `${resultCount} \u0646\u062A\u06CC\u062C\u0647` }) : null,
              actions ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-[var(--taav-space-2)]", children: actions }) : null
            ]
          }
        ),
        children
      ]
    }
  );
}

export { TAAV_BUTTON_HEIGHT, TAAV_DURATION, TAAV_RADIUS, TAAV_SHADOW, TAAV_SPACING, TAAV_TOKEN_CATALOG, TAAV_TOKEN_SECTIONS, TAAV_TONE_LABELS, TaavChip, TaavChipGroup, TaavEmptyState, TaavFilterBar, TaavKeyValue, TaavPagination, TaavSkeleton, TaavStatusBadge, TaavTableActions, TaavTableBody, TaavTableCell, TaavTableHead, TaavTableHeader, TaavTableRow, TaavTableShell, cn };
//# sourceMappingURL=taav-data-display-interactive.mjs.map
//# sourceMappingURL=taav-data-display-interactive.mjs.map