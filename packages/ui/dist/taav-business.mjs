import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, Fragment as Fragment$1 } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { cva } from 'class-variance-authority';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

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

// src/primitives/shared/interaction.ts
var TAAV_INTERACTION = {
  base: [
    "transition-[background-color,border-color,color,box-shadow,transform,opacity]",
    "duration-[var(--taav-duration-normal)]",
    "ease-[var(--taav-ease-standard)]"
  ].join(" "),
  pressable: "active:scale-[0.98] active:brightness-[0.97] disabled:active:scale-100 disabled:active:brightness-100",
  focus: "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]"};

// src/business/TaavActivationSwitch/taav-activation-switch.variants.ts
var activationSwitchRoot = cva(
  [
    "inline-flex shrink-0 items-stretch overflow-hidden",
    "rounded-[var(--taav-activation-switch-radius)]",
    "border border-solid border-[color:var(--taav-activation-switch-border)]",
    "bg-[var(--taav-activation-switch-track-bg)]",
    "p-[var(--taav-activation-switch-padding)]",
    TAAV_INTERACTION.base
  ],
  {
    variants: {
      size: {
        sm: "gap-[var(--taav-activation-switch-gap-sm)]",
        md: "gap-[var(--taav-activation-switch-gap-md)]",
        lg: "gap-[var(--taav-activation-switch-gap-lg)]"
      },
      disabled: {
        true: "pointer-events-none opacity-[var(--taav-activation-switch-disabled-opacity)]",
        false: ""
      },
      loading: {
        true: "pointer-events-none",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      disabled: false,
      loading: false
    }
  }
);
var activationSwitchSegment = cva(
  [
    "inline-flex min-w-0 items-center justify-center border-0",
    "rounded-[var(--taav-activation-switch-segment-radius)]",
    "font-bold leading-none whitespace-nowrap",
    "transition-[background-color,color,box-shadow] duration-[var(--taav-duration-normal)]",
    TAAV_INTERACTION.focus
  ],
  {
    variants: {
      size: {
        sm: "min-w-[var(--taav-activation-switch-segment-min-width-sm)] px-[var(--taav-activation-switch-segment-px-sm)] py-[var(--taav-activation-switch-segment-py-sm)] text-[length:var(--taav-activation-switch-text-sm)]",
        md: "min-w-[var(--taav-activation-switch-segment-min-width-md)] px-[var(--taav-activation-switch-segment-px-md)] py-[var(--taav-activation-switch-segment-py-md)] text-[length:var(--taav-activation-switch-text-md)]",
        lg: "min-w-[var(--taav-activation-switch-segment-min-width-lg)] px-[var(--taav-activation-switch-segment-px-lg)] py-[var(--taav-activation-switch-segment-py-lg)] text-[length:var(--taav-activation-switch-text-lg)]"
      },
      selected: {
        true: "bg-[var(--taav-activation-switch-active-bg)] text-[var(--taav-activation-switch-active-text)] shadow-[var(--taav-activation-switch-active-shadow)]",
        false: "bg-[var(--taav-activation-switch-inactive-bg)] text-[var(--taav-activation-switch-inactive-text)] hover:bg-[var(--taav-activation-switch-inactive-hover-bg)]"
      }
    },
    defaultVariants: {
      size: "md",
      selected: false
    }
  }
);
var activationSwitchTone = cva("", {
  variants: {
    tone: {
      brand: "",
      success: "[--taav-activation-switch-active-bg:var(--taav-activation-switch-active-bg-success)] [--taav-activation-switch-active-text:var(--taav-activation-switch-active-text-on-tone)]",
      warning: "[--taav-activation-switch-active-bg:var(--taav-activation-switch-active-bg-warning)] [--taav-activation-switch-active-text:var(--taav-activation-switch-active-text-on-tone)]",
      danger: "[--taav-activation-switch-active-bg:var(--taav-activation-switch-active-bg-danger)] [--taav-activation-switch-active-text:var(--taav-activation-switch-active-text-on-tone)]",
      neutral: "[--taav-activation-switch-active-bg:var(--taav-activation-switch-active-bg-neutral)] [--taav-activation-switch-active-text:var(--taav-activation-switch-active-text-on-tone)]"
    }
  },
  defaultVariants: {
    tone: "brand"
  }
});
function TaavActivationSwitch({
  value,
  defaultValue = "inactive",
  onValueChange,
  activeLabel = "\u0641\u0639\u0627\u0644",
  inactiveLabel = "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644",
  disabled = false,
  loading = false,
  size = "md",
  tone = "brand",
  ariaLabel = "\u0648\u0636\u0639\u06CC\u062A \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC",
  wrapperClassName,
  unsafeClassName
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== void 0;
  const currentValue = isControlled ? value : internalValue;
  const setValue = (next) => {
    if (disabled || loading) return;
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };
  if (loading) {
    return /* @__PURE__ */ jsx(
      TaavSkeleton,
      {
        variant: "custom",
        width: size === "sm" ? 120 : size === "lg" ? 168 : 144,
        height: size === "sm" ? 32 : size === "lg" ? 40 : 36,
        radius: "pill",
        wrapperClassName
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "radiogroup",
      "aria-label": ariaLabel,
      "data-taav-activation-switch": true,
      "data-value": currentValue,
      "data-size": size,
      "data-tone": tone,
      className: cn(
        activationSwitchRoot({ size, disabled, loading }),
        activationSwitchTone({ tone }),
        wrapperClassName,
        unsafeClassName
      ),
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": currentValue === "active",
            disabled,
            className: activationSwitchSegment({ size, selected: currentValue === "active" }),
            onClick: () => setValue("active"),
            children: activeLabel
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": currentValue === "inactive",
            disabled,
            className: activationSwitchSegment({ size, selected: currentValue === "inactive" }),
            onClick: () => setValue("inactive"),
            children: inactiveLabel
          }
        )
      ]
    }
  );
}
function BusinessIntroCardActionIcon({ className }) {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, className, children: /* @__PURE__ */ jsx("path", { d: "M6 4l4 4-4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function BusinessIntroCardBuildingIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, className, children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M5 20V10l7-4 7 4v10",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsx("path", { d: "M9 20v-5h6v5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M9.5 12.5h1.2M13.3 12.5h1.2M9.5 9.5h1.2M13.3 9.5h1.2", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })
  ] });
}
var businessIntroCardRoot = cva(
  [
    "mx-auto w-full border border-solid",
    "bg-[var(--taav-business-intro-card-surface)]",
    "border-[color:var(--taav-business-intro-card-border)]",
    "rounded-[var(--taav-business-intro-card-radius)]",
    "shadow-[var(--taav-business-intro-card-shadow)]",
    TAAV_INTERACTION.base
  ],
  {
    variants: {
      size: {
        sm: "p-[var(--taav-business-intro-card-padding-sm)]",
        md: "p-[var(--taav-business-intro-card-padding-md)]",
        lg: "p-[var(--taav-business-intro-card-padding-lg)]"
      },
      width: {
        normal: "max-w-[var(--taav-business-intro-card-max-width-normal)]",
        wide: "max-w-[var(--taav-business-intro-card-max-width-wide)]",
        full: "max-w-none"
      },
      variant: {
        default: "",
        soft: "bg-[var(--taav-business-intro-card-surface-soft)]",
        outlined: "bg-transparent shadow-none"
      },
      loading: {
        true: "pointer-events-none",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      width: "normal",
      variant: "default",
      loading: false
    }
  }
);
var businessIntroCardLayout = cva("flex items-center justify-between gap-[var(--taav-business-intro-card-gap)]");
var businessIntroCardLeading = cva("flex min-w-0 flex-1 items-start gap-[var(--taav-business-intro-card-leading-gap)]");
var businessIntroCardIconBox = cva(
  [
    "inline-flex shrink-0 items-center justify-center",
    "rounded-[var(--taav-business-intro-card-icon-radius)]",
    "bg-[var(--taav-business-intro-card-icon-bg)]",
    "text-[var(--taav-business-intro-card-icon-color)]",
    "[&_svg]:h-[var(--taav-business-intro-card-icon-glyph-size)]",
    "[&_svg]:w-[var(--taav-business-intro-card-icon-glyph-size)]"
  ],
  {
    variants: {
      size: {
        sm: "h-[var(--taav-business-intro-card-icon-size-sm)] w-[var(--taav-business-intro-card-icon-size-sm)]",
        md: "h-[var(--taav-business-intro-card-icon-size-md)] w-[var(--taav-business-intro-card-icon-size-md)]",
        lg: "h-[var(--taav-business-intro-card-icon-size-lg)] w-[var(--taav-business-intro-card-icon-size-lg)]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var businessIntroCardTitle = cva(
  "m-0 text-right font-black leading-[var(--taav-leading-tight)] text-[var(--taav-business-intro-card-title)]",
  {
    variants: {
      size: {
        sm: "text-[length:var(--taav-business-intro-card-title-sm)]",
        md: "text-[length:var(--taav-business-intro-card-title-md)]",
        lg: "text-[length:var(--taav-business-intro-card-title-lg)]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var businessIntroCardDescription = cva(
  "m-0 text-right font-normal leading-[var(--taav-leading-relaxed)] text-[var(--taav-business-intro-card-description)]",
  {
    variants: {
      size: {
        sm: "text-[length:var(--taav-business-intro-card-description-sm)]",
        md: "text-[length:var(--taav-business-intro-card-description-md)]",
        lg: "text-[length:var(--taav-business-intro-card-description-lg)]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var businessIntroCardCopy = cva("grid min-w-0 flex-1 gap-[var(--taav-business-intro-card-copy-gap)]");
var businessIntroCardAction = cva(
  [
    "inline-flex shrink-0 items-center justify-center",
    "h-[var(--taav-business-intro-card-action-size)] w-[var(--taav-business-intro-card-action-size)]",
    "rounded-[var(--taav-business-intro-card-action-radius)]",
    "border-0 bg-transparent p-0",
    "text-[var(--taav-business-intro-card-action-color)]",
    "hover:bg-[var(--taav-business-intro-card-action-hover-bg)]",
    "hover:text-[var(--taav-business-intro-card-action-hover-color)]",
    "[&_svg]:h-[var(--taav-business-intro-card-action-icon-size)]",
    "[&_svg]:w-[var(--taav-business-intro-card-action-icon-size)]",
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus
  ],
  {
    variants: {
      disabled: {
        true: "pointer-events-none opacity-[var(--taav-business-intro-card-disabled-opacity)]",
        false: ""
      }
    },
    defaultVariants: {
      disabled: false
    }
  }
);
var businessIntroCardTone = cva("", {
  variants: {
    tone: {
      brand: "",
      neutral: "[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-neutral)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-neutral)]",
      success: "[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-success)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-success)]",
      warning: "[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-warning)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-warning)]",
      danger: "[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-danger)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-danger)]",
      info: "[--taav-business-intro-card-icon-bg:var(--taav-business-intro-card-icon-bg-info)] [--taav-business-intro-card-icon-color:var(--taav-business-intro-card-icon-color-info)]"
    }
  },
  defaultVariants: {
    tone: "brand"
  }
});
function resolveHasAction({
  href,
  onAction,
  disabled,
  loading
}) {
  return !disabled && !loading && Boolean(href || onAction);
}
function TaavBusinessIntroCard({
  title,
  description,
  icon,
  actionIcon,
  actionLabel,
  href,
  onAction,
  disabled = false,
  loading = false,
  size = "md",
  width = "normal",
  tone = "brand",
  variant = "default",
  themeMode = "auto",
  children,
  wrapperClassName,
  contentClassName,
  actionClassName,
  unsafeClassName,
  ...rest
}) {
  const hasAction = resolveHasAction({ href, onAction, disabled, loading });
  const showDefaultIcon = icon === void 0;
  const resolvedActionLabel = actionLabel ?? (hasAction ? "\u0628\u0627\u0632\u06AF\u0634\u062A" : void 0);
  const rootClass = cn(
    businessIntroCardRoot({ size, width, variant, loading }),
    businessIntroCardTone({ tone }),
    wrapperClassName,
    unsafeClassName
  );
  const actionContent = actionIcon ?? /* @__PURE__ */ jsx(BusinessIntroCardActionIcon, {});
  const actionNode = hasAction ? href ? /* @__PURE__ */ jsx(
    "a",
    {
      href,
      className: cn(businessIntroCardAction({ disabled: false }), actionClassName),
      "aria-label": resolvedActionLabel,
      onClick: (event) => {
        if (onAction) {
          event.preventDefault();
          onAction();
        }
      },
      children: actionContent
    }
  ) : /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: cn(businessIntroCardAction({ disabled: false }), actionClassName),
      "aria-label": resolvedActionLabel,
      onClick: onAction,
      children: actionContent
    }
  ) : null;
  const body = loading ? /* @__PURE__ */ jsxs("div", { className: businessIntroCardLayout(), children: [
    /* @__PURE__ */ jsxs("div", { className: businessIntroCardLeading(), children: [
      /* @__PURE__ */ jsx(TaavSkeleton, { variant: "custom", width: 48, height: 48, radius: "lg" }),
      /* @__PURE__ */ jsxs("div", { className: cn(businessIntroCardCopy(), "flex-1"), children: [
        /* @__PURE__ */ jsx(TaavSkeleton, { variant: "title", width: "42%", contentClassName: "h-5" }),
        /* @__PURE__ */ jsx(TaavSkeleton, { lines: 2, size: "sm" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(TaavSkeleton, { variant: "custom", width: 36, height: 36, radius: "md" })
  ] }) : /* @__PURE__ */ jsxs("div", { className: businessIntroCardLayout(), children: [
    /* @__PURE__ */ jsxs("div", { className: cn(businessIntroCardLeading(), contentClassName), children: [
      /* @__PURE__ */ jsx("span", { className: businessIntroCardIconBox({ size }), "aria-hidden": showDefaultIcon, children: icon ?? /* @__PURE__ */ jsx(BusinessIntroCardBuildingIcon, {}) }),
      /* @__PURE__ */ jsxs("div", { className: businessIntroCardCopy(), children: [
        /* @__PURE__ */ jsx("h2", { className: businessIntroCardTitle({ size }), children: title }),
        description ? /* @__PURE__ */ jsx("p", { className: businessIntroCardDescription({ size }), children: description }) : null,
        children
      ] })
    ] }),
    actionNode
  ] });
  return /* @__PURE__ */ jsx(
    "article",
    {
      ...rest,
      "data-taav-business-intro-card": true,
      "data-size": size,
      "data-width": width,
      "data-tone": tone,
      "data-variant": variant,
      "data-loading": loading || void 0,
      "data-disabled": disabled || void 0,
      ...themeMode !== "auto" ? { "data-taav-business-intro-card-theme": themeMode } : {},
      className: rootClass,
      "aria-busy": loading || void 0,
      "aria-disabled": disabled || void 0,
      children: body
    }
  );
}
var detailsLinkRoot = cva(
  [
    "inline-flex max-w-full items-center gap-[var(--taav-details-link-gap)]",
    "border-0 bg-transparent p-0 text-right font-medium",
    "text-[var(--taav-details-link-text)]",
    "decoration-[var(--taav-details-link-underline)] decoration-[length:var(--taav-details-link-underline-thickness)]",
    "underline-offset-[var(--taav-details-link-underline-offset)]",
    "hover:text-[var(--taav-details-link-text-hover)]",
    "hover:decoration-[var(--taav-details-link-underline-hover)]",
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus
  ],
  {
    variants: {
      size: {
        sm: "text-[length:var(--taav-details-link-text-sm)]",
        md: "text-[length:var(--taav-details-link-text-md)]",
        lg: "text-[length:var(--taav-details-link-text-lg)]"
      },
      underline: {
        always: "underline",
        hover: "no-underline hover:underline",
        none: "no-underline"
      },
      disabled: {
        true: "pointer-events-none opacity-[var(--taav-details-link-disabled-opacity)]",
        false: "cursor-pointer"
      }
    },
    defaultVariants: {
      size: "md",
      underline: "always",
      disabled: false
    }
  }
);
var detailsLinkTone = cva("", {
  variants: {
    tone: {
      neutral: "",
      brand: "[--taav-details-link-text:var(--taav-details-link-text-brand)] [--taav-details-link-text-hover:var(--taav-details-link-text-brand-hover)]",
      info: "[--taav-details-link-text:var(--taav-details-link-text-info)] [--taav-details-link-text-hover:var(--taav-details-link-text-info-hover)]"
    }
  },
  defaultVariants: {
    tone: "neutral"
  }
});
function TaavDetailsLink({
  children,
  href,
  onClick,
  disabled = false,
  icon,
  tone = "neutral",
  size = "md",
  underline = "always",
  ariaLabel,
  wrapperClassName,
  unsafeClassName
}) {
  const className = cn(
    detailsLinkRoot({ size, underline, disabled }),
    detailsLinkTone({ tone }),
    wrapperClassName,
    unsafeClassName
  );
  const label = ariaLabel ?? (typeof children === "string" ? children : void 0);
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    icon ? /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-[1em] [&_svg]:w-[1em]", children: icon }) : null,
    /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate", children })
  ] });
  if (href && !disabled) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        href,
        className,
        "aria-label": label,
        onClick: (event) => {
          if (onClick) {
            event.preventDefault();
            onClick();
          }
        },
        children: content
      }
    );
  }
  if (onClick && !disabled) {
    return /* @__PURE__ */ jsx("button", { type: "button", className, "aria-label": label, onClick, children: content });
  }
  return /* @__PURE__ */ jsx("span", { className, "aria-disabled": disabled || void 0, "aria-label": label, children: content });
}
function RecommendationCardActionIcon({ className }) {
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, className, children: /* @__PURE__ */ jsx("path", { d: "M10 4 6 8l4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function RecommendationCardDefaultIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, className, children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M8.5 11.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M7 14.5c1.2 1.4 2.7 2 4 2s2.8-.6 4-2",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M12 4.5v2.2M10.2 5.2 9 3.8M13.8 5.2 15 3.8",
        stroke: "currentColor",
        strokeWidth: "1.4",
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M6.5 18.5h11",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M8 18.5V16a4 4 0 0 1 8 0v2.5",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "9.5", r: "3.2", stroke: "currentColor", strokeWidth: "1.6" }),
    /* @__PURE__ */ jsx("path", { d: "M12 7.1v2.4M10.8 8.3h2.4", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })
  ] });
}
var recommendationCardRoot = cva(
  [
    "mx-auto w-full border border-solid",
    "bg-[var(--taav-recommendation-card-surface)]",
    "border-[color:var(--taav-recommendation-card-border)]",
    "rounded-[var(--taav-recommendation-card-radius)]",
    "shadow-[var(--taav-recommendation-card-shadow)]",
    TAAV_INTERACTION.base
  ],
  {
    variants: {
      size: {
        sm: "p-[var(--taav-recommendation-card-padding-sm)]",
        md: "p-[var(--taav-recommendation-card-padding-md)]",
        lg: "p-[var(--taav-recommendation-card-padding-lg)]"
      },
      width: {
        normal: "max-w-[var(--taav-recommendation-card-max-width-normal)]",
        wide: "max-w-[var(--taav-recommendation-card-max-width-wide)]",
        full: "max-w-none"
      },
      variant: {
        default: "",
        soft: "bg-[var(--taav-recommendation-card-surface-soft)]",
        outlined: "bg-transparent shadow-none"
      },
      loading: {
        true: "pointer-events-none",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      width: "wide",
      variant: "default",
      loading: false
    }
  }
);
var recommendationCardLayout = cva(
  "flex flex-col gap-[var(--taav-recommendation-card-gap)] md:flex-row md:items-center md:justify-between"
);
var recommendationCardLeading = cva(
  "flex min-w-0 flex-1 items-start gap-[var(--taav-recommendation-card-leading-gap)]"
);
var recommendationCardIconBox = cva(
  [
    "inline-flex shrink-0 items-center justify-center",
    "rounded-[var(--taav-recommendation-card-icon-radius)]",
    "bg-[var(--taav-recommendation-card-icon-bg)]",
    "text-[var(--taav-recommendation-card-icon-color)]",
    "[&_svg]:h-[var(--taav-recommendation-card-icon-glyph-size)]",
    "[&_svg]:w-[var(--taav-recommendation-card-icon-glyph-size)]"
  ],
  {
    variants: {
      size: {
        sm: "h-[var(--taav-recommendation-card-icon-size-sm)] w-[var(--taav-recommendation-card-icon-size-sm)]",
        md: "h-[var(--taav-recommendation-card-icon-size-md)] w-[var(--taav-recommendation-card-icon-size-md)]",
        lg: "h-[var(--taav-recommendation-card-icon-size-lg)] w-[var(--taav-recommendation-card-icon-size-lg)]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var recommendationCardAction = cva(
  [
    "inline-flex shrink-0 items-center justify-center self-start",
    "text-[var(--taav-recommendation-card-action-color)]",
    "[&_svg]:h-[var(--taav-recommendation-card-action-icon-size)]",
    "[&_svg]:w-[var(--taav-recommendation-card-action-icon-size)]",
    "hover:text-[var(--taav-recommendation-card-action-hover-color)]",
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus
  ],
  {
    variants: {
      disabled: {
        true: "pointer-events-none opacity-[var(--taav-recommendation-card-disabled-opacity)]",
        false: ""
      }
    },
    defaultVariants: {
      disabled: false
    }
  }
);
var recommendationCardCopy = cva("grid min-w-0 flex-1 gap-[var(--taav-recommendation-card-copy-gap)]");
var recommendationCardTitle = cva(
  "m-0 text-right font-black leading-[var(--taav-leading-tight)] text-[var(--taav-recommendation-card-title)]",
  {
    variants: {
      size: {
        sm: "text-[length:var(--taav-recommendation-card-title-sm)]",
        md: "text-[length:var(--taav-recommendation-card-title-md)]",
        lg: "text-[length:var(--taav-recommendation-card-title-lg)]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var recommendationCardDescription = cva(
  "m-0 text-right font-normal leading-[var(--taav-leading-relaxed)] text-[var(--taav-recommendation-card-description)]",
  {
    variants: {
      size: {
        sm: "text-[length:var(--taav-recommendation-card-description-sm)]",
        md: "text-[length:var(--taav-recommendation-card-description-md)]",
        lg: "text-[length:var(--taav-recommendation-card-description-lg)]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var recommendationCardTrailing = cva(
  "flex shrink-0 flex-wrap items-center justify-end gap-[var(--taav-recommendation-card-trailing-gap)] md:justify-start"
);
var recommendationCardTone = cva("", {
  variants: {
    tone: {
      brand: "",
      neutral: "[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-neutral)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-neutral)] [--taav-recommendation-card-action-color:var(--taav-recommendation-card-action-color-neutral)]",
      success: "[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-success)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-success)]",
      warning: "[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-warning)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-warning)]",
      danger: "[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-danger)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-danger)]",
      info: "[--taav-recommendation-card-icon-bg:var(--taav-recommendation-card-icon-bg-info)] [--taav-recommendation-card-icon-color:var(--taav-recommendation-card-icon-color-info)]"
    }
  },
  defaultVariants: {
    tone: "brand"
  }
});
function resolveHasAction2({
  href,
  onAction,
  disabled,
  loading
}) {
  return !disabled && !loading && Boolean(href || onAction);
}
function mapSwitchSize(size) {
  return size;
}
function TaavBusinessRecommendationCard({
  title,
  description,
  icon,
  actionIcon,
  actionLabel,
  href,
  onAction,
  activationValue,
  defaultActivationValue = "inactive",
  onActivationChange,
  activeLabel = "\u0641\u0639\u0627\u0644",
  inactiveLabel = "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644",
  activationDisabled = false,
  detailsLabel,
  detailsHref,
  onDetailsClick,
  disabled = false,
  loading = false,
  size = "md",
  width = "wide",
  tone = "brand",
  variant = "default",
  themeMode = "auto",
  wrapperClassName,
  contentClassName,
  actionClassName,
  unsafeClassName,
  ...rest
}) {
  const hasAction = resolveHasAction2({ href, onAction, disabled, loading });
  const resolvedActionLabel = actionLabel ?? (hasAction ? "\u0645\u0634\u0627\u0647\u062F\u0647 \u062C\u0632\u0626\u06CC\u0627\u062A" : void 0);
  const showDefaultIcon = icon === void 0;
  const switchDisabled = disabled || activationDisabled || loading;
  const detailsDisabled = disabled || loading;
  const hasDetails = Boolean(detailsLabel && (detailsHref || onDetailsClick));
  const actionContent = actionIcon ?? /* @__PURE__ */ jsx(RecommendationCardActionIcon, {});
  const actionNode = hasAction ? href ? /* @__PURE__ */ jsx(
    "a",
    {
      href,
      className: cn(recommendationCardAction({ disabled: false }), actionClassName),
      "aria-label": resolvedActionLabel,
      onClick: (event) => {
        if (onAction) {
          event.preventDefault();
          onAction();
        }
      },
      children: actionContent
    }
  ) : /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: cn(recommendationCardAction({ disabled: false }), actionClassName),
      "aria-label": resolvedActionLabel,
      onClick: onAction,
      children: actionContent
    }
  ) : null;
  const body = loading ? /* @__PURE__ */ jsxs("div", { className: recommendationCardLayout(), children: [
    /* @__PURE__ */ jsxs("div", { className: recommendationCardLeading(), children: [
      /* @__PURE__ */ jsx(TaavSkeleton, { variant: "custom", width: 16, height: 16, radius: "sm" }),
      /* @__PURE__ */ jsx(TaavSkeleton, { variant: "custom", width: 48, height: 48, radius: "lg" }),
      /* @__PURE__ */ jsxs("div", { className: cn(recommendationCardCopy(), "flex-1"), children: [
        /* @__PURE__ */ jsx(TaavSkeleton, { variant: "title", width: "70%", contentClassName: "h-5" }),
        /* @__PURE__ */ jsx(TaavSkeleton, { lines: 2, size: "sm" }),
        /* @__PURE__ */ jsx(TaavSkeleton, { variant: "text", width: "34%" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(TaavSkeleton, { variant: "custom", width: 144, height: 36, radius: "pill" })
  ] }) : /* @__PURE__ */ jsxs("div", { className: recommendationCardLayout(), children: [
    /* @__PURE__ */ jsxs("div", { className: cn(recommendationCardLeading(), contentClassName), children: [
      actionNode,
      /* @__PURE__ */ jsx("span", { className: recommendationCardIconBox({ size }), "aria-hidden": showDefaultIcon, children: icon ?? /* @__PURE__ */ jsx(RecommendationCardDefaultIcon, {}) }),
      /* @__PURE__ */ jsxs("div", { className: recommendationCardCopy(), children: [
        /* @__PURE__ */ jsx("h2", { className: recommendationCardTitle({ size }), children: title }),
        description ? /* @__PURE__ */ jsx("p", { className: recommendationCardDescription({ size }), children: description }) : null,
        hasDetails ? /* @__PURE__ */ jsx(
          TaavDetailsLink,
          {
            href: detailsHref,
            onClick: onDetailsClick,
            disabled: detailsDisabled,
            size: size === "lg" ? "md" : size === "sm" ? "sm" : "md",
            children: detailsLabel
          }
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: recommendationCardTrailing(), children: /* @__PURE__ */ jsx(
      TaavActivationSwitch,
      {
        value: activationValue,
        defaultValue: defaultActivationValue,
        onValueChange: onActivationChange,
        activeLabel,
        inactiveLabel,
        disabled: switchDisabled,
        size: mapSwitchSize(size),
        tone: tone === "info" ? "brand" : tone === "danger" ? "danger" : tone === "warning" ? "warning" : tone === "success" ? "success" : tone === "neutral" ? "neutral" : "brand",
        ariaLabel: "\u0648\u0636\u0639\u06CC\u062A \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u062A\u0646\u0638\u06CC\u0645"
      }
    ) })
  ] });
  return /* @__PURE__ */ jsx(
    "article",
    {
      ...rest,
      "data-taav-business-recommendation-card": true,
      "data-size": size,
      "data-width": width,
      "data-tone": tone,
      "data-variant": variant,
      "data-loading": loading || void 0,
      "data-disabled": disabled || void 0,
      ...themeMode !== "auto" ? { "data-taav-business-recommendation-card-theme": themeMode } : {},
      className: cn(
        recommendationCardRoot({ size, width, variant, loading }),
        recommendationCardTone({ tone }),
        wrapperClassName,
        unsafeClassName
      ),
      "aria-busy": loading || void 0,
      "aria-disabled": disabled || void 0,
      children: body
    }
  );
}
function TaavTooltipProvider({ children }) {
  return /* @__PURE__ */ jsx(TooltipPrimitive.Provider, { delayDuration: 200, skipDelayDuration: 100, children });
}
function TaavTooltip({
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
  children,
  contentClassName
}) {
  return /* @__PURE__ */ jsxs(TooltipPrimitive.Root, { delayDuration, children: [
    /* @__PURE__ */ jsx(TooltipPrimitive.Trigger, { asChild: true, children: /* @__PURE__ */ jsx("span", { className: "inline-flex rounded-[var(--taav-radius-sm)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]", children }) }),
    /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
      TooltipPrimitive.Content,
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
          /* @__PURE__ */ jsx(
            TooltipPrimitive.Arrow,
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
var businessSidebarRoot = cva(
  [
    "flex h-full min-h-0 shrink-0 flex-col overflow-hidden backdrop-blur-[18px]",
    "transition-[width] duration-[var(--taav-duration-slow)] ease-[var(--taav-ease-standard)]"
  ],
  {
    variants: {
      variant: {
        dastranj: ["bg-[var(--taav-business-sidebar-bg)]", "text-[var(--taav-business-sidebar-text)]"],
        default: ["bg-[var(--taav-surface-elevated)]", "text-[var(--taav-text-body)]"]
      },
      placement: {
        right: [
          "border-l",
          "rounded-[0_var(--taav-business-sidebar-radius)_var(--taav-business-sidebar-radius)_0]",
          "shadow-[var(--taav-business-sidebar-shadow-right)]"
        ],
        left: [
          "border-r",
          "rounded-[var(--taav-business-sidebar-radius)_0_0_var(--taav-business-sidebar-radius)]",
          "shadow-[var(--taav-business-sidebar-shadow-left)]"
        ]
      },
      width: {
        compact: "w-[var(--taav-business-sidebar-width-compact)]",
        default: "w-[var(--taav-business-sidebar-width-default)]",
        wide: "w-[var(--taav-business-sidebar-width-wide)]"
      },
      collapsed: {
        true: "w-[var(--taav-business-sidebar-width-collapsed)]",
        false: ""
      }
    },
    defaultVariants: {
      variant: "dastranj",
      placement: "right",
      width: "default",
      collapsed: false
    },
    compoundVariants: [
      {
        variant: "dastranj",
        class: "border-[color:var(--taav-business-sidebar-border)]"
      },
      {
        variant: "default",
        class: "border-[color:var(--taav-border)]"
      }
    ]
  }
);
var businessSidebarNavScroll = (collapsed) => [
  "taav-scrollarea taav-scrollarea--minimal taav-sidebar-scrollarea",
  "min-h-0 flex-1 shrink basis-0",
  collapsed ? "pt-1" : "pt-2"
].join(" ");
var businessSidebarProfileRow = cva(
  "flex shrink-0 items-center border-b border-[color:var(--taav-business-sidebar-section-border)] px-[var(--taav-business-sidebar-section-px)] py-[var(--taav-business-sidebar-profile-py)] transition-[padding] duration-[var(--taav-duration-slow)]",
  {
    variants: {
      collapsed: {
        true: "justify-center px-2 py-2",
        false: ""
      }
    },
    defaultVariants: {
      collapsed: false
    }
  }
);
var businessSidebarMenuItem = cva(
  [
    "relative flex w-full items-center gap-[7px] border-0 bg-transparent text-right",
    "text-[length:var(--taav-business-sidebar-menu-text)] transition-[background,color] duration-200",
    "px-3 py-[7px] my-0.5 no-underline",
    "text-[var(--taav-business-sidebar-text-muted)]",
    "hover:bg-[var(--taav-business-sidebar-item-hover-bg)]",
    "hover:text-[var(--taav-business-sidebar-text)]",
    "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]"
  ],
  {
    variants: {
      placement: {
        right: "",
        left: ""
      },
      active: {
        true: "font-bold text-[var(--taav-business-sidebar-text)]",
        false: ""
      },
      disabled: {
        true: "cursor-not-allowed opacity-50 pointer-events-none",
        false: "cursor-pointer"
      },
      collapsed: {
        true: [
          "mx-2 justify-center rounded-[14px] px-2",
          "min-h-[var(--taav-business-sidebar-collapsed-item-height)]",
          "py-[var(--taav-business-sidebar-collapsed-item-py)]",
          "[&_svg]:h-[var(--taav-business-sidebar-collapsed-icon-size)]",
          "[&_svg]:w-[var(--taav-business-sidebar-collapsed-icon-size)]"
        ],
        false: ""
      }
    },
    defaultVariants: {
      placement: "right",
      active: false,
      disabled: false,
      collapsed: false
    },
    compoundVariants: [
      {
        placement: "right",
        active: true,
        collapsed: false,
        class: [
          "rounded-[var(--taav-business-sidebar-active-radius-right)]",
          "bg-[var(--taav-business-sidebar-active-bg)]"
        ]
      },
      {
        placement: "left",
        active: true,
        collapsed: false,
        class: [
          "rounded-[var(--taav-business-sidebar-active-radius-left)]",
          "bg-[var(--taav-business-sidebar-active-bg)]"
        ]
      },
      {
        active: true,
        collapsed: true,
        class: [
          "rounded-[14px]",
          "bg-[var(--taav-business-sidebar-collapsed-active-bg)]",
          "text-[var(--taav-business-sidebar-icon-active)]",
          "shadow-[inset_0_0_0_1px_var(--taav-business-sidebar-collapsed-active-border)]"
        ]
      }
    ]
  }
);
var businessSidebarQuickAction = cva(
  "relative inline-flex items-center justify-center border-0 bg-transparent p-0 text-[var(--taav-business-sidebar-icon)] transition-colors focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
  {
    variants: {
      active: {
        true: "text-[var(--taav-business-sidebar-icon-active)]",
        false: ""
      },
      collapsed: {
        true: "h-[var(--taav-business-sidebar-collapsed-action-size)] w-[var(--taav-business-sidebar-collapsed-action-size)] [&_svg]:h-[var(--taav-business-sidebar-collapsed-icon-size)] [&_svg]:w-[var(--taav-business-sidebar-collapsed-icon-size)]",
        false: "h-8 w-8 [&_svg]:h-[15px] [&_svg]:w-[15px]"
      }
    },
    defaultVariants: {
      active: false,
      collapsed: false
    }
  }
);
var businessSidebarCollapsedToolbar = cva(
  "flex shrink-0 flex-col items-center gap-1 bg-[var(--taav-business-sidebar-toolbar-bg)] px-1 py-1.5"
);
var businessSidebarCollapsedTenantStrip = cva(
  "flex shrink-0 items-center justify-center px-2 py-3"
);
var businessSidebarShell = cva(
  "flex h-full min-h-0 w-full flex-row",
  {
    variants: {
      placement: {
        right: "py-[var(--taav-business-sidebar-shell-py)] pr-[var(--taav-business-sidebar-shell-pr)] pl-0",
        left: "py-[var(--taav-business-sidebar-shell-py)] pl-[var(--taav-business-sidebar-shell-pr)] pr-0"
      }
    },
    defaultVariants: {
      placement: "right"
    }
  }
);
var businessSidebarContentColumn = cva(
  "relative flex min-w-0 flex-1 flex-col overflow-hidden"
);
var businessSidebarContentBody = cva("relative min-h-0 flex-1 overflow-hidden");
var businessSidebarRailWrap = cva("flex h-full shrink-0 self-stretch");
var businessSidebarNavPathRoot = cva(
  [
    "flex w-full shrink-0 items-center justify-start",
    "min-h-[var(--taav-business-nav-path-height)]",
    "border-b border-[color:var(--taav-business-nav-path-border)]",
    "bg-[var(--taav-business-nav-path-bg)]",
    "px-[var(--taav-business-nav-path-px)] py-[var(--taav-business-nav-path-py)]"
  ].join(" ")
);
var businessSidebarNavPathList = cva(
  "m-0 flex min-w-0 list-none flex-wrap items-center justify-start gap-[var(--taav-business-nav-path-gap)] p-0"
);
var businessSidebarNavPathLink = cva(
  [
    "inline-flex min-w-0 items-center border-0 bg-transparent p-0 no-underline",
    "text-[length:var(--taav-business-nav-path-text-size)] leading-tight",
    "text-[var(--taav-business-nav-path-text)]",
    "transition-colors hover:text-[var(--taav-business-nav-path-text-hover)]",
    "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]"
  ].join(" ")
);
var businessSidebarNavPathCurrent = cva(
  [
    "inline-flex min-w-0 items-center truncate",
    "text-[length:var(--taav-business-nav-path-text-size)] font-bold leading-tight",
    "text-[var(--taav-business-nav-path-text-current)]"
  ].join(" ")
);
var businessSidebarNavPathSeparator = cva(
  "inline-flex shrink-0 text-[var(--taav-business-nav-path-separator)] [&_svg]:h-3 [&_svg]:w-3"
);
var DEFAULT_BUSINESS_SIDEBAR_NAV_PATH = [
  { label: "\u062E\u0627\u0646\u0647", id: "home" }
];
var DEFAULT_BUSINESS_NAV_PATH = DEFAULT_BUSINESS_SIDEBAR_NAV_PATH;
function PathSeparator() {
  return /* @__PURE__ */ jsx("span", { className: businessSidebarNavPathSeparator(), children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M10 4 6 8l4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) });
}
function BusinessSidebarNavPath({
  items,
  className,
  listClassName,
  ...props
}) {
  const pathItems = items.length > 0 ? items : DEFAULT_BUSINESS_SIDEBAR_NAV_PATH;
  return /* @__PURE__ */ jsx(
    "nav",
    {
      dir: "rtl",
      "aria-label": "\u0645\u0633\u06CC\u0631 \u0635\u0641\u062D\u0647",
      className: cn(businessSidebarNavPathRoot(), className),
      ...props,
      children: /* @__PURE__ */ jsx("ol", { className: cn(businessSidebarNavPathList(), listClassName), children: pathItems.map((item, index) => {
        const isCurrent = index === pathItems.length - 1;
        const key = item.id ?? `${item.label}-${index}`;
        return /* @__PURE__ */ jsxs(Fragment$1, { children: [
          index > 0 ? /* @__PURE__ */ jsx("li", { className: "inline-flex shrink-0 items-center", "aria-hidden": true, children: /* @__PURE__ */ jsx(PathSeparator, {}) }) : null,
          /* @__PURE__ */ jsx("li", { className: "inline-flex min-w-0 max-w-full items-center", children: isCurrent ? /* @__PURE__ */ jsx("span", { className: businessSidebarNavPathCurrent(), "aria-current": "page", children: item.label }) : item.href ? /* @__PURE__ */ jsx("a", { href: item.href, className: businessSidebarNavPathLink(), onClick: item.onClick, children: /* @__PURE__ */ jsx("span", { className: "truncate", children: item.label }) }) : /* @__PURE__ */ jsx("button", { type: "button", className: businessSidebarNavPathLink(), onClick: item.onClick, children: /* @__PURE__ */ jsx("span", { className: "truncate", children: item.label }) }) })
        ] }, key);
      }) })
    }
  );
}
function SidebarBadge({ value }) {
  return /* @__PURE__ */ jsx("span", { className: "absolute -left-2 -top-1.5 min-w-[16px] rounded-[10px] bg-[var(--taav-business-sidebar-badge-bg)] px-[5px] py-0.5 text-center text-[10px] font-bold leading-none text-white", children: value });
}
function SidebarIconButton({
  label,
  icon,
  active,
  badge,
  href,
  onClick,
  className,
  collapsed = false
}) {
  const classes = cn(businessSidebarQuickAction({ active, collapsed }), className);
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "inline-flex", children: icon }),
    badge !== void 0 ? /* @__PURE__ */ jsx(SidebarBadge, { value: badge }) : null
  ] });
  const wrapped = collapsed ? /* @__PURE__ */ jsx(TaavTooltip, { content: label, side: "left", children: /* @__PURE__ */ jsx("span", { className: "inline-flex", children: content }) }) : content;
  if (href) {
    return /* @__PURE__ */ jsx("a", { href, title: label, "aria-label": label, className: classes, onClick, children: wrapped });
  }
  return /* @__PURE__ */ jsx("button", { type: "button", title: label, "aria-label": label, className: classes, onClick, children: wrapped });
}
function SidebarNavItem({
  item,
  active,
  collapsed,
  placement,
  onNavigate
}) {
  const classes = businessSidebarMenuItem({
    active,
    disabled: item.disabled,
    collapsed,
    placement
  });
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-[14px] [&_svg]:w-[14px]", children: item.icon }),
    !collapsed ? /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate whitespace-nowrap", children: item.label }) : null,
    !collapsed && item.badge !== void 0 ? /* @__PURE__ */ jsx("span", { className: "mr-auto rounded-[10px] bg-[var(--taav-business-sidebar-badge-bg)] px-1.5 py-0.5 text-[10px] font-bold text-white", children: item.badge }) : null
  ] });
  const wrapped = collapsed ? /* @__PURE__ */ jsx(TaavTooltip, { content: item.label, side: "left", children: /* @__PURE__ */ jsx("span", { className: "inline-flex w-full", children: content }) }) : content;
  if (item.disabled) {
    return /* @__PURE__ */ jsx("div", { className: classes, "aria-disabled": "true", title: item.label, "aria-label": item.label, children: wrapped });
  }
  if (item.href) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        href: item.href,
        className: classes,
        title: item.label,
        "aria-label": item.label,
        "aria-current": active ? "page" : void 0,
        onClick: (event) => {
          if (onNavigate) {
            event.preventDefault();
            onNavigate(item);
          }
        },
        children: wrapped
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      className: classes,
      title: item.label,
      "aria-label": item.label,
      "aria-current": active ? "page" : void 0,
      onClick: () => onNavigate?.(item),
      children: wrapped
    }
  );
}
function tenantStatusLabel(tenant) {
  if (tenant.statusLabel) return tenant.statusLabel;
  switch (tenant.status) {
    case "loading":
      return "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC...";
    case "inactive":
      return "tenant \u063A\u06CC\u0631\u0641\u0639\u0627\u0644";
    case "error":
      return "\u062E\u0637\u0627 \u062F\u0631 tenant";
    case "active":
    default:
      return tenant.label || "tenant \u0641\u0639\u0627\u0644";
  }
}
function TaavBusinessSidebar({
  user,
  tenant,
  quickActions,
  items,
  activeItemId,
  version,
  width = "default",
  variant = "dastranj",
  placement: placementProp,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  collapsible = true,
  lockCollapsed = false,
  loading = false,
  navPath = DEFAULT_BUSINESS_SIDEBAR_NAV_PATH,
  showNavPath = true,
  children,
  shellClassName,
  contentClassName,
  navPathClassName,
  onNavigate,
  onTenantSwitch,
  onTenantPanelClick,
  onLogout,
  onCollapsedChange,
  className,
  ...props
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? internalCollapsed;
  const placement = placementProp ?? "right";
  const setCollapsed = (value) => {
    if (!collapsible || lockCollapsed) return;
    if (collapsedProp === void 0) {
      setInternalCollapsed(value);
    }
    onCollapsedChange?.(value);
  };
  const canToggleCollapse = collapsible && !lockCollapsed;
  const tenantPanelBackground = tenant.status === "loading" ? "var(--taav-business-sidebar-tenant-loading-bg)" : tenant.status === "inactive" ? "var(--taav-business-sidebar-tenant-inactive-bg)" : tenant.status === "error" ? "var(--taav-business-sidebar-tenant-error-bg)" : "var(--taav-business-sidebar-tenant-active-bg)";
  const isItemActive = (item) => item.active ?? (activeItemId !== void 0 && item.id === activeItemId);
  const userInitial = user.avatarFallback ?? user.name.slice(0, 1);
  const tenantInitial = tenant.avatarText ?? tenant.name.slice(0, 3).toUpperCase();
  const sidebarRail = /* @__PURE__ */ jsx(TaavTooltipProvider, { children: /* @__PURE__ */ jsx("div", { className: businessSidebarRailWrap(), children: /* @__PURE__ */ jsxs(
    "aside",
    {
      dir: "rtl",
      "data-taav-business-sidebar": true,
      "data-variant": variant,
      "data-placement": placement,
      "data-collapsed": collapsed ? "true" : "false",
      className: cn(
        businessSidebarRoot({
          variant,
          placement,
          width: collapsed ? void 0 : width,
          collapsed
        }),
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx("div", { className: businessSidebarProfileRow({ collapsed }), children: (() => {
          const avatar = /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-black",
                collapsed ? "h-[var(--taav-business-sidebar-collapsed-avatar-size)] w-[var(--taav-business-sidebar-collapsed-avatar-size)] text-[9px]" : "ml-2 h-8 w-8 text-[10px]",
                variant === "dastranj" ? "bg-[var(--taav-business-sidebar-user-avatar-bg)] text-[#03121c]" : "bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]"
              ),
              children: user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                /* @__PURE__ */ jsx("img", { src: user.avatarUrl, alt: "", className: "h-full w-full object-cover" })
              ) : userInitial
            }
          );
          if (collapsed) {
            return /* @__PURE__ */ jsx(TaavTooltip, { content: user.name, side: "left", children: /* @__PURE__ */ jsx("span", { className: "inline-flex", children: avatar }) });
          }
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            avatar,
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 text-[11px] leading-tight", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate", children: loading ? "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC..." : user.name }),
              user.subtitle ? /* @__PURE__ */ jsx("div", { className: "mt-0.5 truncate text-[9px] text-[var(--taav-business-sidebar-text-muted)]", children: user.subtitle }) : null
            ] })
          ] });
        })() }),
        /* @__PURE__ */ jsx("div", { className: businessSidebarProfileRow({ collapsed }), children: (() => {
          const avatar = /* @__PURE__ */ jsx(
            "div",
            {
              className: cn(
                "flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-extrabold",
                collapsed ? "h-[var(--taav-business-sidebar-collapsed-avatar-size)] w-[var(--taav-business-sidebar-collapsed-avatar-size)] text-[8px]" : "ml-2 h-8 w-8 text-[10px]",
                variant === "dastranj" ? "bg-[var(--taav-business-sidebar-tenant-avatar-bg)] text-[var(--taav-business-sidebar-tenant-avatar-text)]" : "bg-[var(--taav-surface-muted)] text-[var(--taav-text-muted)]"
              ),
              children: tenantInitial
            }
          );
          if (collapsed) {
            return /* @__PURE__ */ jsx(TaavTooltip, { content: tenant.name, side: "left", children: /* @__PURE__ */ jsx("span", { className: "inline-flex", children: avatar }) });
          }
          return /* @__PURE__ */ jsxs(Fragment, { children: [
            avatar,
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 text-[11px] leading-tight text-[var(--taav-business-sidebar-tenant-name)]", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate", children: loading ? "tenant" : tenant.name }),
              tenant.label ? /* @__PURE__ */ jsx("div", { className: "mt-0.5 truncate text-[9px] text-[var(--taav-business-sidebar-text-muted)]", children: tenant.label }) : null
            ] }),
            onTenantSwitch ? /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                title: "\u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0633\u0628 \u0648 \u06A9\u0627\u0631",
                "aria-label": "\u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0633\u0628 \u0648 \u06A9\u0627\u0631",
                onClick: onTenantSwitch,
                className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-[var(--taav-business-sidebar-switch-bg)] text-[var(--taav-business-sidebar-switch-text)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
                children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" }) })
              }
            ) : null
          ] });
        })() }),
        quickActions && quickActions.length > 0 ? /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              collapsed ? businessSidebarCollapsedToolbar() : "flex shrink-0 items-center justify-around bg-[var(--taav-business-sidebar-toolbar-bg)] px-1.5 py-2"
            ),
            children: [
              collapsed && canToggleCollapse ? /* @__PURE__ */ jsx(TaavTooltip, { content: "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0645\u0646\u0648", side: "left", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "inline-flex h-[var(--taav-business-sidebar-collapsed-footer-btn-size)] w-[var(--taav-business-sidebar-collapsed-footer-btn-size)] items-center justify-center rounded-[10px] border border-[color:var(--taav-business-sidebar-collapse-border)] bg-[var(--taav-business-sidebar-collapse-bg)] text-[var(--taav-business-sidebar-collapse-text)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
                  "aria-label": "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0645\u0646\u0648",
                  title: "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0645\u0646\u0648",
                  onClick: () => setCollapsed(false),
                  children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "m13 17 5-5-5-5M6 17l5-5-5-5" }) })
                }
              ) }) : null,
              quickActions.map(({ id, ...action }) => /* @__PURE__ */ jsx(SidebarIconButton, { ...action, collapsed }, id)),
              onLogout && !quickActions.some((action) => action.id === "logout") ? /* @__PURE__ */ jsx(
                SidebarIconButton,
                {
                  label: "\u062E\u0631\u0648\u062C",
                  collapsed,
                  icon: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "scale-x-[-1]", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" }) }),
                  onClick: onLogout
                }
              ) : null
            ]
          }
        ) : null,
        /* @__PURE__ */ jsx("nav", { className: businessSidebarNavScroll(collapsed), "aria-label": "\u0645\u0646\u0648\u06CC \u0627\u0635\u0644\u06CC", children: items.map((item) => /* @__PURE__ */ jsx(
          SidebarNavItem,
          {
            item,
            active: isItemActive(item),
            collapsed,
            placement,
            onNavigate
          },
          item.id
        )) }),
        collapsed ? /* @__PURE__ */ jsx("div", { className: "shrink-0", style: variant === "dastranj" ? { background: tenantPanelBackground } : void 0, children: /* @__PURE__ */ jsx(TaavTooltip, { content: `${tenantStatusLabel(tenant)} \u2014 ${tenant.name}`, side: "left", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: cn(
              businessSidebarCollapsedTenantStrip(),
              "w-full border-0 focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
              onTenantPanelClick ? "cursor-pointer" : "cursor-default"
            ),
            style: { minHeight: "var(--taav-business-sidebar-collapsed-tenant-strip-height)" },
            "aria-label": `${tenantStatusLabel(tenant)}: ${tenant.name}`,
            onClick: onTenantPanelClick,
            children: /* @__PURE__ */ jsx(
              "span",
              {
                className: cn(
                  "inline-flex h-2 w-2 rounded-full",
                  tenant.status === "error" ? "bg-[var(--taav-danger)]" : tenant.status === "loading" ? "animate-pulse bg-[var(--taav-brand)]" : "bg-[var(--taav-brand)]"
                ),
                "aria-hidden": true
              }
            )
          }
        ) }) }) : /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "shrink-0 px-3 py-3.5 text-center",
              variant === "default" && "bg-[var(--taav-surface-soft)]",
              onTenantPanelClick && "cursor-pointer"
            ),
            style: variant === "dastranj" ? { background: tenantPanelBackground } : void 0,
            role: onTenantPanelClick ? "button" : void 0,
            tabIndex: onTenantPanelClick ? 0 : void 0,
            onClick: onTenantPanelClick,
            onKeyDown: (event) => {
              if (onTenantPanelClick && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onTenantPanelClick();
              }
            },
            children: [
              /* @__PURE__ */ jsx(
                "p",
                {
                  className: cn(
                    "m-0 mb-2.5 text-[10px]",
                    variant === "dastranj" ? "text-[var(--taav-business-sidebar-tenant-text)]" : "text-[var(--taav-text-muted)]",
                    tenant.status === "loading" && "animate-pulse"
                  ),
                  children: tenantStatusLabel(tenant)
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: cn(
                    "w-full rounded-[10px] border-0 px-3 text-[11px] font-bold",
                    "min-h-[var(--taav-business-sidebar-menu-item-height)]",
                    "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
                    variant === "dastranj" ? "text-[var(--taav-business-sidebar-tenant-btn-text)]" : "bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)]"
                  ),
                  style: variant === "dastranj" ? { background: "var(--taav-business-sidebar-tenant-btn-bg)" } : void 0,
                  onClick: (event) => {
                    event.stopPropagation();
                    onTenantPanelClick?.();
                  },
                  children: loading ? "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC..." : tenant.name
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "flex shrink-0 items-center justify-between px-3 py-2 text-[10px]",
              variant === "dastranj" ? "bg-[var(--taav-business-sidebar-footer-bg)] text-[var(--taav-business-sidebar-footer-text)]" : "border-t border-[color:var(--taav-border-subtle)] text-[var(--taav-text-muted)]",
              collapsed && "justify-center px-2"
            ),
            children: [
              canToggleCollapse ? /* @__PURE__ */ jsx(TaavTooltip, { content: collapsed ? "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631" : "\u062C\u0645\u0639 \u06A9\u0631\u062F\u0646 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631", side: "left", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: cn(
                    "inline-flex items-center justify-center border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
                    collapsed && "h-[var(--taav-business-sidebar-collapsed-footer-btn-size)] w-[var(--taav-business-sidebar-collapsed-footer-btn-size)] rounded-[10px] border border-[color:var(--taav-business-sidebar-collapse-border)] bg-[var(--taav-business-sidebar-collapse-bg)] text-[var(--taav-business-sidebar-collapse-text)]"
                  ),
                  title: collapsed ? "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631" : "\u062C\u0645\u0639 \u06A9\u0631\u062F\u0646 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631",
                  "aria-label": collapsed ? "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631" : "\u062C\u0645\u0639 \u06A9\u0631\u062F\u0646 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631",
                  "aria-expanded": !collapsed,
                  onClick: () => setCollapsed(!collapsed),
                  children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: "2", children: collapsed ? /* @__PURE__ */ jsx("path", { d: "m13 17 5-5-5-5M6 17l5-5-5-5" }) : /* @__PURE__ */ jsx("path", { d: "m11 17-5-5 5-5M18 17l-5-5 5-5" }) })
                }
              ) }) : null,
              !collapsed && version ? /* @__PURE__ */ jsx("span", { children: version }) : null
            ]
          }
        )
      ]
    }
  ) }) });
  const contentColumn = /* @__PURE__ */ jsxs("div", { className: cn(businessSidebarContentColumn(), contentClassName), dir: "rtl", children: [
    showNavPath ? /* @__PURE__ */ jsx("div", { className: "relative z-[1] shrink-0", children: /* @__PURE__ */ jsx(BusinessSidebarNavPath, { items: navPath, className: navPathClassName }) }) : null,
    /* @__PURE__ */ jsx("div", { className: businessSidebarContentBody(), children })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: cn(businessSidebarShell({ placement }), shellClassName), dir: "ltr", children: [
    placement === "left" ? sidebarRail : null,
    contentColumn,
    placement === "right" ? sidebarRail : null
  ] });
}
function ModuleCardArrowIcon({ direction = "enter", className }) {
  const path = direction === "back" ? "M6 4l4 4-4 4" : "M10 4 6 8l4 4";
  return /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, className, children: /* @__PURE__ */ jsx("path", { d: path, stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
var moduleCardRoot = cva(
  [
    "group/taav-module-card relative flex min-h-0 w-full flex-col overflow-hidden border border-solid",
    "bg-[var(--taav-module-card-surface)] text-[var(--taav-module-card-title)]",
    "border-[color:var(--taav-module-card-border)]",
    "rounded-[var(--taav-module-card-radius)] shadow-[var(--taav-module-card-shadow)]",
    TAAV_INTERACTION.base
  ],
  {
    variants: {
      size: {
        sm: "min-h-[var(--taav-module-card-min-height-sm)]",
        md: "min-h-[var(--taav-module-card-min-height-md)]",
        lg: "min-h-[var(--taav-module-card-min-height-lg)]"
      },
      width: {
        auto: "",
        full: "w-full"
      },
      variant: {
        default: "",
        setup: "",
        imageHeader: "",
        compact: "[--taav-module-card-header-height:var(--taav-module-card-header-height-compact)]",
        flat: "shadow-none"
      },
      interactive: {
        true: [
          "cursor-pointer",
          "hover:border-[color:var(--taav-module-card-border-hover)]",
          "hover:bg-[var(--taav-module-card-surface-hover)]",
          "hover:shadow-[var(--taav-module-card-shadow-hover)]",
          TAAV_INTERACTION.pressable,
          TAAV_INTERACTION.focus
        ],
        false: ""
      },
      selected: {
        true: [
          "border-[color:var(--taav-module-card-border-selected)]",
          "bg-[var(--taav-module-card-surface-selected)]",
          "shadow-[var(--taav-module-card-shadow-selected)]",
          "ring-1 ring-[color:var(--taav-module-card-ring-selected)]"
        ],
        false: ""
      },
      disabled: {
        true: "cursor-not-allowed opacity-[var(--taav-module-card-disabled-opacity)]",
        false: ""
      },
      loading: {
        true: "pointer-events-none",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      width: "auto",
      variant: "setup",
      interactive: false,
      selected: false,
      disabled: false,
      loading: false
    }
  }
);
var moduleCardHeader = cva(
  [
    "relative flex shrink-0 items-center justify-between gap-[var(--taav-space-3)]",
    "h-[var(--taav-module-card-header-height)] px-[var(--taav-module-card-header-px)]",
    "border-b border-solid border-[color:var(--taav-module-card-header-border)]",
    "bg-[var(--taav-module-card-header-bg)]"
  ],
  {
    variants: {
      pattern: {
        geometric: "taav-module-card-header-pattern--geometric",
        subtle: "taav-module-card-header-pattern--subtle",
        none: ""
      }
    },
    defaultVariants: {
      pattern: "geometric"
    }
  }
);
var moduleCardTitle = cva("relative z-[1] m-0 min-w-0 flex-1 text-right font-black leading-[var(--taav-leading-tight)]", {
  variants: {
    size: {
      sm: "text-[length:var(--taav-module-card-title-sm)]",
      md: "text-[length:var(--taav-module-card-title-md)]",
      lg: "text-[length:var(--taav-module-card-title-lg)]"
    }
  },
  defaultVariants: {
    size: "md"
  }
});
var moduleCardBody = cva("relative flex w-full flex-1 flex-col", {
  variants: {
    size: {
      sm: "p-[var(--taav-module-card-body-padding-sm)]",
      md: "p-[var(--taav-module-card-body-padding-md)]",
      lg: "p-[var(--taav-module-card-body-padding-lg)]"
    },
    align: {
      start: "items-start text-right",
      center: "items-center text-center",
      end: "items-end text-right"
    }
  },
  defaultVariants: {
    size: "md",
    align: "start"
  }
});
var moduleCardDescription = cva(
  "m-0 w-full font-normal leading-[var(--taav-leading-relaxed)] text-[var(--taav-module-card-description)]",
  {
    variants: {
      size: {
        sm: "text-[length:var(--taav-module-card-description-sm)]",
        md: "text-[length:var(--taav-module-card-description-md)]",
        lg: "text-[length:var(--taav-module-card-description-lg)]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var moduleCardArrow = cva(
  [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "text-[var(--taav-module-card-arrow)]",
    "[&_svg]:h-[var(--taav-module-card-arrow-size)] [&_svg]:w-[var(--taav-module-card-arrow-size)]"
  ],
  {
    variants: {
      disabled: {
        true: "opacity-50",
        false: ""
      }
    },
    defaultVariants: {
      disabled: false
    }
  }
);
var moduleCardStatusTone = cva("", {
  variants: {
    status: {
      default: "",
      active: "border-[color:var(--taav-module-card-border-selected)]",
      complete: "border-[color:var(--taav-success-border)]",
      incomplete: "border-[color:var(--taav-module-card-border-incomplete)]",
      locked: "border-[color:var(--taav-border-subtle)]",
      disabled: "",
      warning: "border-[color:var(--taav-warning-border)]",
      error: "border-[color:var(--taav-danger-border)]"
    },
    tone: {
      neutral: "",
      brand: "[--taav-module-card-header-bg:var(--taav-module-card-header-bg-brand)]",
      success: "[--taav-module-card-header-bg:var(--taav-module-card-header-bg-success)]",
      warning: "[--taav-module-card-header-bg:var(--taav-module-card-header-bg-warning)]",
      danger: "[--taav-module-card-header-bg:var(--taav-module-card-header-bg-danger)]",
      info: "[--taav-module-card-header-bg:var(--taav-module-card-header-bg-info)]"
    }
  },
  defaultVariants: {
    status: "default",
    tone: "neutral"
  }
});
function resolveDisabled(status, disabled) {
  return Boolean(disabled || status === "disabled" || status === "locked");
}
function resolveInteractive({
  href,
  onClick,
  disabled,
  loading
}) {
  return !disabled && !loading && Boolean(href || onClick);
}
function TaavModuleCard({
  title,
  description,
  eyebrow,
  status = "default",
  statusLabel,
  icon,
  arrowIcon,
  href,
  onClick,
  disabled: disabledProp,
  loading = false,
  selected = false,
  variant = "setup",
  tone = "neutral",
  themeMode = "auto",
  size = "md",
  width = "auto",
  headerPattern = "geometric",
  align = "start",
  direction = "enter",
  ariaLabel,
  className,
  headerClassName,
  bodyClassName,
  ...rest
}) {
  const disabled = resolveDisabled(status, disabledProp);
  const interactive = resolveInteractive({ href, onClick, disabled, loading });
  const isSelected = selected || status === "active";
  const rootClass = cn(
    moduleCardRoot({
      size,
      width,
      variant,
      interactive,
      selected: isSelected,
      disabled,
      loading
    }),
    moduleCardStatusTone({ status, tone }),
    className
  );
  const content = loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: cn(moduleCardHeader({ pattern: "none" }), headerClassName), children: [
      /* @__PURE__ */ jsx(TaavSkeleton, { variant: "title", width: "55%", contentClassName: "h-5" }),
      /* @__PURE__ */ jsx(TaavSkeleton, { variant: "custom", width: 16, height: 16, radius: "sm" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: cn(moduleCardBody({ size, align }), bodyClassName), children: /* @__PURE__ */ jsx(TaavSkeleton, { lines: 2, size: "sm" }) })
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: cn(moduleCardHeader({ pattern: headerPattern }), headerClassName), children: [
      /* @__PURE__ */ jsx("h3", { className: moduleCardTitle({ size }), children: title }),
      /* @__PURE__ */ jsx("span", { className: moduleCardArrow({ disabled }), "aria-hidden": true, children: arrowIcon ?? /* @__PURE__ */ jsx(ModuleCardArrowIcon, { direction }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: cn(moduleCardBody({ size, align }), bodyClassName), children: [
      eyebrow ? /* @__PURE__ */ jsx("p", { className: "m-0 mb-1 w-full text-[length:var(--taav-text-xs)] text-[var(--taav-module-card-eyebrow)]", children: eyebrow }) : null,
      statusLabel ? /* @__PURE__ */ jsx("p", { className: "m-0 mb-1 w-full text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-module-card-status-label)]", children: statusLabel }) : null,
      icon ? /* @__PURE__ */ jsx("span", { className: "mb-2 inline-flex text-[var(--taav-module-card-icon)]", children: icon }) : null,
      description ? /* @__PURE__ */ jsx("p", { className: cn(moduleCardDescription({ size }), align === "center" ? "text-center" : "text-right"), children: description }) : null
    ] })
  ] });
  const sharedProps = {
    "data-taav-module-card": true,
    "data-variant": variant,
    "data-status": status,
    "data-tone": tone,
    "data-size": size,
    "data-theme-mode": themeMode,
    "data-selected": isSelected || void 0,
    "data-loading": loading || void 0,
    ...themeMode !== "auto" ? { "data-taav-module-card-theme": themeMode } : {},
    className: rootClass,
    "aria-label": ariaLabel,
    "aria-disabled": disabled || void 0,
    "aria-busy": loading || void 0,
    ...rest
  };
  if (href && !disabled) {
    return /* @__PURE__ */ jsx(
      "a",
      {
        ...sharedProps,
        href,
        onClick: (event) => {
          if (onClick) {
            event.preventDefault();
            onClick();
          }
        },
        children: content
      }
    );
  }
  if (interactive) {
    return /* @__PURE__ */ jsx("button", { type: "button", ...sharedProps, disabled, onClick, children: content });
  }
  return /* @__PURE__ */ jsx("article", { ...sharedProps, children: content });
}
var moduleCardGridRoot = cva("grid w-full", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
    },
    gap: {
      sm: "gap-[var(--taav-module-card-grid-gap-sm)]",
      md: "gap-[var(--taav-module-card-grid-gap-md)]",
      lg: "gap-[var(--taav-module-card-grid-gap-lg)]",
      xl: "gap-[var(--taav-module-card-grid-gap-xl)]"
    },
    density: {
      compact: "[--taav-module-card-grid-gap-sm:var(--taav-space-3)] [--taav-module-card-grid-gap-md:var(--taav-space-3)] [--taav-module-card-grid-gap-lg:var(--taav-space-4)] [--taav-module-card-grid-gap-xl:var(--taav-space-5)]",
      comfortable: "",
      spacious: "[--taav-module-card-grid-gap-sm:var(--taav-space-4)] [--taav-module-card-grid-gap-md:var(--taav-space-5)] [--taav-module-card-grid-gap-lg:var(--taav-space-6)] [--taav-module-card-grid-gap-xl:var(--taav-space-8)]"
    },
    responsive: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      columns: 2,
      responsive: false,
      className: "grid-cols-2"
    },
    {
      columns: 3,
      responsive: false,
      className: "grid-cols-3"
    },
    {
      columns: 4,
      responsive: false,
      className: "grid-cols-4"
    }
  ],
  defaultVariants: {
    columns: 2,
    gap: "md",
    density: "comfortable",
    responsive: true
  }
});
var moduleCardGridItem = cva("min-w-0", {
  variants: {
    span: {
      1: "",
      2: "col-span-1 md:col-span-2",
      3: "col-span-1 md:col-span-2 xl:col-span-3",
      4: "col-span-full"
    },
    spanResponsive: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    { span: 2, spanResponsive: false, className: "col-span-2" },
    { span: 3, spanResponsive: false, className: "col-span-3" },
    { span: 4, spanResponsive: false, className: "col-span-4" }
  ],
  defaultVariants: {
    span: 1,
    spanResponsive: true
  }
});
function TaavModuleCardGrid({
  columns = 2,
  gap = "md",
  density = "comfortable",
  responsive = true,
  children,
  className,
  ...rest
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-taav-module-card-grid": true,
      "data-columns": columns,
      className: cn(moduleCardGridRoot({ columns, gap, density, responsive }), className),
      ...rest,
      children
    }
  );
}
function TaavModuleCardGridItem({
  span = 1,
  responsive = true,
  children,
  className,
  ...rest
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-taav-module-card-grid-item": true,
      "data-span": span,
      className: cn(moduleCardGridItem({ span, spanResponsive: responsive }), className),
      ...rest,
      children
    }
  );
}

export { DEFAULT_BUSINESS_NAV_PATH, DEFAULT_BUSINESS_SIDEBAR_NAV_PATH, TAAV_BUTTON_HEIGHT, TAAV_DURATION, TAAV_RADIUS, TAAV_SHADOW, TAAV_SPACING, TAAV_TOKEN_CATALOG, TAAV_TOKEN_SECTIONS, TAAV_TONE_LABELS, TaavActivationSwitch, TaavBusinessIntroCard, TaavBusinessRecommendationCard, TaavBusinessSidebar, TaavDetailsLink, TaavModuleCard, TaavModuleCardGrid, TaavModuleCardGridItem, cn };
//# sourceMappingURL=taav-business.mjs.map
//# sourceMappingURL=taav-business.mjs.map