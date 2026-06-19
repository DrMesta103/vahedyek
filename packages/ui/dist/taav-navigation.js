'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var TabsPrimitive = require('@radix-ui/react-tabs');
var classVarianceAuthority = require('class-variance-authority');
var jsxRuntime = require('react/jsx-runtime');

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

var TabsPrimitive__namespace = /*#__PURE__*/_interopNamespace(TabsPrimitive);

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

// src/primitives/shared/interaction.ts
var TAAV_INTERACTION = {
  base: [
    "transition-[background-color,border-color,color,box-shadow,transform,opacity]",
    "duration-[var(--taav-duration-normal)]",
    "ease-[var(--taav-ease-standard)]"
  ].join(" ")};

// src/navigation/shared/navigation.variants.ts
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
  const sizeClass = size === "sm" ? "h-[var(--taav-stepper-size-sm)] w-[var(--taav-stepper-size-sm)] text-[length:var(--taav-text-2xs)]" : size === "lg" ? "h-[var(--taav-stepper-size-lg)] w-[var(--taav-stepper-size-lg)] text-[length:var(--taav-text-sm)]" : "h-[var(--taav-stepper-size-md)] w-[var(--taav-stepper-size-md)] text-[length:var(--taav-text-xs)]";
  return [
    "inline-flex shrink-0 items-center justify-center rounded-full border border-solid font-black",
    sizeClass,
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

exports.TAAV_BUTTON_HEIGHT = TAAV_BUTTON_HEIGHT;
exports.TAAV_DURATION = TAAV_DURATION;
exports.TAAV_RADIUS = TAAV_RADIUS;
exports.TAAV_SHADOW = TAAV_SHADOW;
exports.TAAV_SPACING = TAAV_SPACING;
exports.TAAV_TOKEN_CATALOG = TAAV_TOKEN_CATALOG;
exports.TAAV_TOKEN_SECTIONS = TAAV_TOKEN_SECTIONS;
exports.TAAV_TONE_LABELS = TAAV_TONE_LABELS;
exports.TaavStepper = TaavStepper;
exports.TaavTabs = TaavTabs;
exports.TaavTabsContent = TaavTabsContent;
exports.TaavTabsList = TaavTabsList;
exports.TaavTabsTrigger = TaavTabsTrigger;
exports.cn = cn;
//# sourceMappingURL=taav-navigation.js.map
//# sourceMappingURL=taav-navigation.js.map