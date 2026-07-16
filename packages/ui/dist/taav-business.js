'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
var classVarianceAuthority = require('class-variance-authority');
var TooltipPrimitive = require('@radix-ui/react-tooltip');

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
var activationSwitchRoot = classVarianceAuthority.cva(
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
var activationSwitchSegment = classVarianceAuthority.cva(
  [
    "inline-flex min-w-0 items-center justify-center border-0",
    "rounded-[var(--taav-activation-switch-segment-radius)]",
    "font-semibold leading-none whitespace-nowrap",
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
        false: "bg-transparent text-[var(--taav-activation-switch-inactive-text)] hover:bg-transparent"
      }
    },
    defaultVariants: {
      size: "md",
      selected: false
    }
  }
);
var activationSwitchTone = classVarianceAuthority.cva("", {
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
  const [internalValue, setInternalValue] = react.useState(defaultValue);
  const isControlled = value !== void 0;
  const currentValue = isControlled ? value : internalValue;
  const setValue = (next) => {
    if (disabled || loading) return;
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntime.jsx(
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
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
        /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsx(
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
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, className, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 4l4 4-4 4", stroke: "currentColor", strokeWidth: "2.8", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function BusinessIntroCardBuildingIcon({ className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, className, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M5 20V10l7-4 7 4v10",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 20v-5h6v5", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9.5 12.5h1.2M13.3 12.5h1.2M9.5 9.5h1.2M13.3 9.5h1.2", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })
  ] });
}
var businessIntroCardRoot = classVarianceAuthority.cva(
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
        sm: "min-h-[var(--taav-business-intro-card-min-height-sm)] p-[var(--taav-business-intro-card-padding-sm)]",
        md: "min-h-[var(--taav-business-intro-card-min-height-md)] p-[var(--taav-business-intro-card-padding-md)]",
        lg: "min-h-[var(--taav-business-intro-card-min-height-lg)] p-[var(--taav-business-intro-card-padding-lg)]"
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
var businessIntroCardLayout = classVarianceAuthority.cva("flex items-center justify-between gap-[var(--taav-business-intro-card-gap)]");
var businessIntroCardLeading = classVarianceAuthority.cva("flex min-w-0 flex-1 items-center gap-[var(--taav-business-intro-card-leading-gap)]");
var businessIntroCardIconBox = classVarianceAuthority.cva(
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
var businessIntroCardTitle = classVarianceAuthority.cva(
  "m-0 text-right font-semibold leading-[var(--taav-business-intro-card-title-line-height)] text-[var(--taav-business-intro-card-title)]",
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
var businessIntroCardDescription = classVarianceAuthority.cva(
  "m-0 text-right font-normal leading-[var(--taav-business-intro-card-description-line-height)] text-[var(--taav-business-intro-card-description)]",
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
var businessIntroCardCopy = classVarianceAuthority.cva("grid min-w-0 flex-1 gap-[var(--taav-business-intro-card-copy-gap)]");
var businessIntroCardAction = classVarianceAuthority.cva(
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
var businessIntroCardTone = classVarianceAuthority.cva("", {
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
var businessIntroCardHubRoot = classVarianceAuthority.cva(
  [
    "relative overflow-hidden",
    "bg-[var(--taav-business-intro-card-hub-surface)]",
    "shadow-[var(--taav-business-intro-card-hub-shadow)]"
  ],
  {
    variants: {
      size: {
        sm: "",
        md: "",
        lg: ""
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var businessIntroCardHubPattern = classVarianceAuthority.cva(
  "pointer-events-none absolute inset-0 opacity-[var(--taav-business-intro-card-hub-pattern-opacity)] [background-image:var(--taav-business-intro-card-hub-pattern)]"
);
var businessIntroCardHubContent = classVarianceAuthority.cva("relative z-[1] grid gap-[var(--taav-business-intro-card-hub-content-gap)]");
var businessIntroCardHubTop = classVarianceAuthority.cva("flex items-center justify-between gap-[var(--taav-space-3)]");
var businessIntroCardEyebrow = classVarianceAuthority.cva(
  "inline-flex min-h-[28px] items-center rounded-[var(--taav-radius-pill)] border border-solid px-[10px] text-[length:var(--taav-text-xs)] font-extrabold",
  {
    variants: {
      tone: {
        brand: "border-[color:var(--taav-business-intro-card-eyebrow-border)] bg-[var(--taav-business-intro-card-eyebrow-bg)] text-[var(--taav-business-intro-card-eyebrow-text)]",
        neutral: "border-[color:var(--taav-business-intro-card-badge-border)] bg-[var(--taav-business-intro-card-badge-bg)] text-[var(--taav-business-intro-card-badge-text)]",
        success: "",
        warning: "",
        danger: "",
        info: ""
      }
    },
    defaultVariants: {
      tone: "brand"
    }
  }
);
var businessIntroCardBadge = classVarianceAuthority.cva(
  "inline-flex min-h-[28px] items-center whitespace-nowrap rounded-[var(--taav-radius-pill)] border border-solid px-[10px] text-[length:var(--taav-text-xs)] font-extrabold border-[color:var(--taav-business-intro-card-badge-border)] bg-[var(--taav-business-intro-card-badge-bg)] text-[var(--taav-business-intro-card-badge-text)]"
);
var businessIntroCardFootnote = classVarianceAuthority.cva(
  "m-0 rounded-[var(--taav-radius-lg)] border border-solid px-[14px] py-[12px] text-right text-[length:var(--taav-text-xs)] font-semibold leading-[var(--taav-leading-relaxed)] border-[color:var(--taav-business-intro-card-footnote-border)] bg-[var(--taav-business-intro-card-footnote-bg)] text-[var(--taav-business-intro-card-footnote-text)]"
);
var businessIntroCardHubTitleRow = classVarianceAuthority.cva("flex items-start gap-[var(--taav-business-intro-card-leading-gap)]");
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
  eyebrow,
  badge,
  footnote,
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
  layout = "standard",
  headingLevel,
  showPattern = true,
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
  const resolvedHeadingLevel = headingLevel ?? (layout === "hub" ? "h1" : "h2");
  const HeadingTag = resolvedHeadingLevel;
  const resolvedWidth = layout === "hub" && width === "normal" ? "full" : width;
  const rootClass = cn(
    businessIntroCardRoot({ size, width: resolvedWidth, variant, loading }),
    layout === "hub" ? businessIntroCardHubRoot({ size }) : null,
    businessIntroCardTone({ tone }),
    wrapperClassName,
    unsafeClassName
  );
  const actionContent = actionIcon ?? /* @__PURE__ */ jsxRuntime.jsx(BusinessIntroCardActionIcon, {});
  const actionNode = hasAction ? href ? /* @__PURE__ */ jsxRuntime.jsx(
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
  ) : /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      className: cn(businessIntroCardAction({ disabled: false }), actionClassName),
      "aria-label": resolvedActionLabel,
      onClick: onAction,
      children: actionContent
    }
  ) : null;
  const titleBlock = loading ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title", width: "55%", contentClassName: "h-6" }) : /* @__PURE__ */ jsxRuntime.jsx(HeadingTag, { className: businessIntroCardTitle({ size }), children: title });
  const descriptionBlock = description && !loading ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: businessIntroCardDescription({ size }), children: description }) : null;
  const iconBlock = loading ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 48, height: 48, radius: "lg" }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessIntroCardIconBox({ size }), "aria-hidden": showDefaultIcon, children: icon ?? /* @__PURE__ */ jsxRuntime.jsx(BusinessIntroCardBuildingIcon, {}) });
  const standardBody = loading ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardLayout(), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardLeading(), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 48, height: 48, radius: "lg" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(businessIntroCardCopy(), "flex-1"), children: [
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title", width: "42%", contentClassName: "h-5" }),
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { lines: 2, size: "sm" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 36, height: 36, radius: "md" })
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardLayout(), children: [
    actionNode,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(businessIntroCardLeading(), contentClassName), children: [
      iconBlock,
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardCopy(), children: [
        titleBlock,
        descriptionBlock,
        children
      ] })
    ] })
  ] });
  const hubBody = loading ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardHubContent(), children: [
    /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 140, height: 28, radius: "pill" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardHubTitleRow(), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 52, height: 52, radius: "lg" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(businessIntroCardCopy(), "flex-1"), children: [
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title", width: "48%", contentClassName: "h-6" }),
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { lines: 2, size: "sm" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: "100%", height: 52, radius: "lg" })
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardHubContent(), children: [
    eyebrow || badge ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardHubTop(), children: [
      eyebrow ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessIntroCardEyebrow({ tone: "brand" }), children: eyebrow }) : /* @__PURE__ */ jsxRuntime.jsx("span", {}),
      badge ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessIntroCardBadge(), children: badge }) : null
    ] }) : null,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardLayout(), children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(businessIntroCardHubTitleRow(), "min-w-0 flex-1", contentClassName), children: [
        iconBlock,
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessIntroCardCopy(), children: [
          titleBlock,
          descriptionBlock,
          children
        ] })
      ] }),
      actionNode
    ] }),
    footnote ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: businessIntroCardFootnote(), children: footnote }) : null
  ] });
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "article",
    {
      ...rest,
      "data-taav-business-intro-card": true,
      "data-layout": layout,
      "data-size": size,
      "data-width": resolvedWidth,
      "data-tone": tone,
      "data-variant": variant,
      "data-loading": loading || void 0,
      "data-disabled": disabled || void 0,
      ...themeMode !== "auto" ? { "data-taav-business-intro-card-theme": themeMode } : {},
      className: rootClass,
      "aria-busy": loading || void 0,
      "aria-disabled": disabled || void 0,
      children: [
        layout === "hub" && showPattern ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessIntroCardHubPattern(), "aria-hidden": true }) : null,
        layout === "hub" ? hubBody : standardBody
      ]
    }
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
var Icon = react.forwardRef(
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
    return react.createElement(
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
        ...iconNode.map(([tag, attrs]) => react.createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// ../../node_modules/lucide-react/dist/esm/createLucideIcon.js
var createLucideIcon = (iconName, iconNode) => {
  const Component = react.forwardRef(
    ({ className, ...props }, ref) => react.createElement(Icon, {
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

// ../../node_modules/lucide-react/dist/esm/icons/building-2.js
var __iconNode = [
  ["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }],
  ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }],
  ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }],
  ["path", { d: "M10 6h4", key: "1itunk" }],
  ["path", { d: "M10 10h4", key: "tcdvrf" }],
  ["path", { d: "M10 14h4", key: "kelpxr" }],
  ["path", { d: "M10 18h4", key: "1ulq68" }]
];
var Building2 = createLucideIcon("building-2", __iconNode);

// ../../node_modules/lucide-react/dist/esm/icons/check.js
var __iconNode2 = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
var Check = createLucideIcon("check", __iconNode2);

// ../../node_modules/lucide-react/dist/esm/icons/chevron-right.js
var __iconNode3 = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
var ChevronRight = createLucideIcon("chevron-right", __iconNode3);

// ../../node_modules/lucide-react/dist/esm/icons/circle-dot.js
var __iconNode4 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }]
];
var CircleDot = createLucideIcon("circle-dot", __iconNode4);

// ../../node_modules/lucide-react/dist/esm/icons/earth.js
var __iconNode5 = [
  ["path", { d: "M21.54 15H17a2 2 0 0 0-2 2v4.54", key: "1djwo0" }],
  [
    "path",
    {
      d: "M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17",
      key: "1tzkfa"
    }
  ],
  ["path", { d: "M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05", key: "14pb5j" }],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
var Earth = createLucideIcon("earth", __iconNode5);

// ../../node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js
var __iconNode6 = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }],
  ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }]
];
var EllipsisVertical = createLucideIcon("ellipsis-vertical", __iconNode6);

// ../../node_modules/lucide-react/dist/esm/icons/info.js
var __iconNode7 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
var Info = createLucideIcon("info", __iconNode7);

// ../../node_modules/lucide-react/dist/esm/icons/landmark.js
var __iconNode8 = [
  ["line", { x1: "3", x2: "21", y1: "22", y2: "22", key: "j8o0r" }],
  ["line", { x1: "6", x2: "6", y1: "18", y2: "11", key: "10tf0k" }],
  ["line", { x1: "10", x2: "10", y1: "18", y2: "11", key: "54lgf6" }],
  ["line", { x1: "14", x2: "14", y1: "18", y2: "11", key: "380y" }],
  ["line", { x1: "18", x2: "18", y1: "18", y2: "11", key: "1kevvc" }],
  ["polygon", { points: "12 2 20 7 4 7", key: "jkujk7" }]
];
var Landmark = createLucideIcon("landmark", __iconNode8);

// ../../node_modules/lucide-react/dist/esm/icons/mail.js
var __iconNode9 = [
  ["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }],
  ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]
];
var Mail = createLucideIcon("mail", __iconNode9);

// ../../node_modules/lucide-react/dist/esm/icons/map-pinned.js
var __iconNode10 = [
  [
    "path",
    {
      d: "M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0",
      key: "11u0oz"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "2", key: "1822b1" }],
  [
    "path",
    {
      d: "M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712",
      key: "q8zwxj"
    }
  ]
];
var MapPinned = createLucideIcon("map-pinned", __iconNode10);

// ../../node_modules/lucide-react/dist/esm/icons/pencil.js
var __iconNode11 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
var Pencil = createLucideIcon("pencil", __iconNode11);

// ../../node_modules/lucide-react/dist/esm/icons/phone-call.js
var __iconNode12 = [
  [
    "path",
    {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
      key: "foiqr5"
    }
  ],
  ["path", { d: "M14.05 2a9 9 0 0 1 8 7.94", key: "vmijpz" }],
  ["path", { d: "M14.05 6A5 5 0 0 1 18 10", key: "13nbpp" }]
];
var PhoneCall = createLucideIcon("phone-call", __iconNode12);

// ../../node_modules/lucide-react/dist/esm/icons/phone.js
var __iconNode13 = [
  [
    "path",
    {
      d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
      key: "foiqr5"
    }
  ]
];
var Phone = createLucideIcon("phone", __iconNode13);

// ../../node_modules/lucide-react/dist/esm/icons/plus.js
var __iconNode14 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
var Plus = createLucideIcon("plus", __iconNode14);

// ../../node_modules/lucide-react/dist/esm/icons/printer.js
var __iconNode15 = [
  [
    "path",
    {
      d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
      key: "143wyd"
    }
  ],
  ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6", key: "1itne7" }],
  ["rect", { x: "6", y: "14", width: "12", height: "8", rx: "1", key: "1ue0tg" }]
];
var Printer = createLucideIcon("printer", __iconNode15);

// ../../node_modules/lucide-react/dist/esm/icons/refresh-cw.js
var __iconNode16 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
var RefreshCw = createLucideIcon("refresh-cw", __iconNode16);

// ../../node_modules/lucide-react/dist/esm/icons/search.js
var __iconNode17 = [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
];
var Search = createLucideIcon("search", __iconNode17);

// ../../node_modules/lucide-react/dist/esm/icons/sliders-horizontal.js
var __iconNode18 = [
  ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
  ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
  ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
  ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
  ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
  ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
  ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
  ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
  ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }]
];
var SlidersHorizontal = createLucideIcon("sliders-horizontal", __iconNode18);

// ../../node_modules/lucide-react/dist/esm/icons/smartphone.js
var __iconNode19 = [
  ["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }]
];
var Smartphone = createLucideIcon("smartphone", __iconNode19);

// ../../node_modules/lucide-react/dist/esm/icons/square-pen.js
var __iconNode20 = [
  ["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }],
  [
    "path",
    {
      d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
      key: "ohrbg2"
    }
  ]
];
var SquarePen = createLucideIcon("square-pen", __iconNode20);

// ../../node_modules/lucide-react/dist/esm/icons/trash-2.js
var __iconNode21 = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
];
var Trash2 = createLucideIcon("trash-2", __iconNode21);

// ../../node_modules/lucide-react/dist/esm/icons/user-round.js
var __iconNode22 = [
  ["circle", { cx: "12", cy: "8", r: "5", key: "1hypcn" }],
  ["path", { d: "M20 21a8 8 0 0 0-16 0", key: "rfgkzh" }]
];
var UserRound = createLucideIcon("user-round", __iconNode22);

// ../../node_modules/lucide-react/dist/esm/icons/users-round.js
var __iconNode23 = [
  ["path", { d: "M18 21a8 8 0 0 0-16 0", key: "3ypg7q" }],
  ["circle", { cx: "10", cy: "8", r: "5", key: "o932ke" }],
  ["path", { d: "M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3", key: "10s06x" }]
];
var UsersRound = createLucideIcon("users-round", __iconNode23);

// ../../node_modules/lucide-react/dist/esm/icons/x.js
var __iconNode24 = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
var X = createLucideIcon("x", __iconNode24);
function TaavTooltipProvider({ children }) {
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Provider, { delayDuration: 200, skipDelayDuration: 100, children });
}
function TaavTooltip({
  content,
  side = "top",
  align = "center",
  delayDuration = 200,
  sideOffset = 6,
  collisionPadding = 8,
  open,
  defaultOpen,
  onOpenChange,
  showArrow = true,
  children,
  contentClassName,
  arrowClassName
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(TooltipPrimitive__namespace.Root, { delayDuration, open, defaultOpen, onOpenChange, children: [
    /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex rounded-[var(--taav-radius-sm)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]", children }) }),
    /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsxs(
      TooltipPrimitive__namespace.Content,
      {
        side,
        align,
        sideOffset,
        collisionPadding,
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
          showArrow ? /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Arrow, { width: 10, height: 5, className: cn("fill-[var(--taav-surface-elevated)]", arrowClassName) }) : null
        ]
      }
    ) })
  ] });
}
var detailsLinkRoot = classVarianceAuthority.cva(
  [
    "inline-flex max-w-full items-center gap-[var(--taav-details-link-gap)]",
    "border-0 bg-transparent p-0 text-right font-medium",
    "text-[var(--taav-details-link-text)]",
    "decoration-[var(--taav-details-link-underline)] decoration-[length:var(--taav-details-link-underline-thickness)]",
    "underline-offset-[var(--taav-details-link-underline-offset)]",
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
      },
      hoverEffect: {
        true: "hover:text-[var(--taav-details-link-text-hover)] hover:decoration-[var(--taav-details-link-underline-hover)]",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      underline: "always",
      disabled: false,
      hoverEffect: true
    }
  }
);
var detailsLinkTone = classVarianceAuthority.cva("", {
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
  hoverEffect = true,
  ariaLabel,
  wrapperClassName,
  unsafeClassName
}) {
  const className = cn(
    detailsLinkRoot({ size, underline, disabled, hoverEffect }),
    detailsLinkTone({ tone }),
    wrapperClassName,
    unsafeClassName
  );
  const label = ariaLabel ?? (typeof children === "string" ? children : void 0);
  const content = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-[1em] [&_svg]:w-[1em]", children: icon }) : null,
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "min-w-0 truncate", children })
  ] });
  if (href && !disabled) {
    return /* @__PURE__ */ jsxRuntime.jsx(
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
    return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className, "aria-label": label, onClick, children: content });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("span", { className, "aria-disabled": disabled || void 0, "aria-label": label, children: content });
}
var businessHeaderCardRoot = classVarianceAuthority.cva(
  [
    "w-full max-w-[712px] overflow-hidden rounded-none border-0",
    "box-border bg-white shadow-none",
    "transition-[background-color,box-shadow,transform] duration-150",
    "hover:bg-[rgba(250,252,253,1)] hover:shadow-[0_4px_14px_rgba(15,23,42,0.04)]",
    "md:h-[176px] md:min-h-[176px]"
  ],
  {
    variants: {
      variant: {
        navigation: "md:h-[145px] md:min-h-[145px]",
        toggleWithLink: "",
        toggle: "md:h-[96px] md:min-h-[96px] md:max-w-[960px]",
        action: "md:h-[96px] md:min-h-[96px] md:max-w-[960px]",
        actionWithSearch: "md:h-[145px] md:min-h-[145px] md:max-w-[690px] rounded-[14px] border border-[rgba(145,170,190,0.5)]"
      },
      loading: {
        true: "pointer-events-none",
        false: ""
      },
      themeMode: {
        auto: "",
        light: "",
        dark: ""
      }
    },
    defaultVariants: {
      variant: "navigation",
      loading: false,
      themeMode: "auto"
    }
  }
);
var businessHeaderCardBody = classVarianceAuthority.cva("flex h-full min-h-0 flex-col gap-[12px] p-[24px_28px_24px_24px]", {
  variants: {
    variant: {
      navigation: "",
      toggleWithLink: "",
      toggle: "md:p-[20px_28px]",
      action: "md:p-[20px_28px]",
      actionWithSearch: ""
    }
  },
  defaultVariants: { variant: "navigation" }
});
var businessHeaderCardTopRow = classVarianceAuthority.cva("grid min-w-0 grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-[16px]");
var businessHeaderCardArrow = classVarianceAuthority.cva(
  [
    "inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none text-[#008f8f]",
    "appearance-none rounded-none",
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.pressable,
    TAAV_INTERACTION.focus
  ],
  {
    variants: {
      disabled: {
        true: "pointer-events-none opacity-50",
        false: ""
      }
    },
    defaultVariants: {
      disabled: false
    }
  }
);
var businessHeaderCardArrowPlaceholder = classVarianceAuthority.cva("inline-flex h-[26px] w-[26px] shrink-0");
var businessHeaderCardIconBox = classVarianceAuthority.cva([
  "inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[16px]",
  "bg-[rgba(0,143,143,0.10)] text-[#008f8f]",
  "[&_svg]:h-[24px] [&_svg]:w-[24px]"
]);
var businessHeaderCardCopy = classVarianceAuthority.cva("flex min-w-0 flex-col items-end justify-self-end gap-[4px] text-right", {
  variants: {
    variant: {
      navigation: "w-full items-start",
      toggleWithLink: "",
      toggle: "w-full items-start",
      action: "w-full items-start",
      actionWithSearch: ""
    }
  },
  defaultVariants: { variant: "navigation" }
});
var businessHeaderCardTitle = classVarianceAuthority.cva("m-0 text-right text-[18px] font-semibold leading-[26px] text-[#30343b]", {
  variants: {
    variant: {
      navigation: "w-full text-right",
      toggleWithLink: "",
      toggle: "w-full text-right text-[18px] font-bold leading-[26px] text-[#30343b]",
      action: "w-full text-right text-[18px] font-bold leading-[26px] text-[#30343b]",
      actionWithSearch: ""
    }
  },
  defaultVariants: { variant: "navigation" }
});
var businessHeaderCardDescription = classVarianceAuthority.cva(
  "m-0 max-w-[520px] text-right text-[12.5px] font-medium leading-[22px] text-[#5f6f80]",
  {
    variants: {
      variant: {
        navigation: "",
        toggleWithLink: "",
        toggle: "whitespace-nowrap text-[12.5px] font-medium leading-[22px] text-[#6b7280]",
        action: "whitespace-nowrap text-[12.5px] font-medium leading-[22px] text-[#6b7280]",
        actionWithSearch: ""
      }
    },
    defaultVariants: { variant: "navigation" }
  }
);
var businessHeaderCardLink = classVarianceAuthority.cva("mt-[2px] flex w-full justify-start text-right");
var businessHeaderCardToggle = classVarianceAuthority.cva("shrink-0");
var businessHeaderCardAction = classVarianceAuthority.cva("shrink-0");
var businessHeaderCardActionButton = classVarianceAuthority.cva(
  [
    "inline-flex h-[36px] min-w-[148px] items-center justify-center gap-[8px] rounded-[14px]",
    "border-0 bg-[#008f8f] px-[16px] text-[14px] font-bold leading-5 text-white whitespace-nowrap",
    "box-border [direction:rtl] [font-family:inherit]",
    "transition-[background-color,transform,opacity] hover:bg-[#007f7f] active:translate-y-px active:bg-[#006f6f]",
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(0,143,143,0.22)] focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-[0.55]"
  ],
  {
    variants: {
      variant: {
        action: "min-w-[170px] text-[14px] font-bold",
        actionWithSearch: ""
      },
      disabled: {
        true: "pointer-events-none",
        false: ""
      }
    },
    defaultVariants: {
      variant: "actionWithSearch",
      disabled: false
    }
  }
);
var businessHeaderCardActionButtonLabel = classVarianceAuthority.cva("inline-flex items-center");
var businessHeaderCardActionButtonIcon = classVarianceAuthority.cva("inline-flex h-5 w-5 shrink-0 items-center justify-center");
classVarianceAuthority.cva("w-full");
var businessHeaderCardSearchShell = classVarianceAuthority.cva(
  "flex h-[38px] items-center gap-2 rounded-full bg-[#dfe4ea] px-4 text-[#64748b] shadow-none"
);
var businessHeaderCardSearchInput = classVarianceAuthority.cva(
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-[12.5px] font-medium leading-5 text-[#64748b] placeholder:text-[#64748b] focus:outline-none"
);
var businessHeaderCardSearchContainer = classVarianceAuthority.cva("mt-[14px] flex justify-start", {
  variants: {
    variant: {
      navigation: "",
      toggleWithLink: "",
      toggle: "",
      action: "",
      actionWithSearch: "mt-[2px] justify-end"
    }
  },
  defaultVariants: { variant: "navigation" }
});
function HeaderArrowIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(ChevronRight, { className: "h-[26px] w-[26px]", strokeWidth: 2.7 });
}
function HeaderPlusIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(Plus, { className: "h-5 w-5", strokeWidth: 2.4 });
}
function HeaderSearchIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(Search, { className: "h-[19px] w-[19px]", strokeWidth: 1.6 });
}
function HeaderBuildingIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(Building2, { className: "h-[24px] w-[24px]", strokeWidth: 2.2 });
}
function resolveVariant({
  variant,
  action,
  detailLink,
  search,
  enabled,
  defaultEnabled,
  onToggle
}) {
  if (variant) return variant;
  if (action && search) return "actionWithSearch";
  if (action) return "action";
  if (typeof enabled === "boolean" || typeof defaultEnabled === "boolean" || onToggle) {
    return detailLink ? "toggleWithLink" : "toggle";
  }
  return "navigation";
}
function TaavBusinessHeaderCard({
  title,
  description,
  icon,
  variant,
  showArrow = true,
  href,
  onNavigate,
  onClick,
  disabled = false,
  loading = false,
  themeMode = "auto",
  enabled,
  defaultEnabled = false,
  onToggle,
  toggleLabels,
  action,
  detailLink,
  search,
  arrowTooltipDefaultOpen = false,
  className,
  wrapperClassName,
  contentClassName,
  actionClassName,
  searchClassName,
  ...rest
}) {
  const resolvedVariant = resolveVariant({ variant, action, detailLink, search, enabled, defaultEnabled, onToggle });
  const [internalEnabled, setInternalEnabled] = react.useState(defaultEnabled);
  const currentEnabled = enabled ?? internalEnabled;
  const switchDisabled = disabled || loading;
  const actionDisabled = disabled || loading || action?.disabled;
  const detailDisabled = disabled || loading || detailLink?.disabled;
  const searchDisabled = disabled || loading || search?.disabled;
  const toggleLabelsResolved = {
    enabled: toggleLabels?.enabled ?? "\u0641\u0639\u0627\u0644",
    disabled: toggleLabels?.disabled ?? "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644"
  };
  const arrowHandler = onNavigate ?? onClick;
  const shouldShowArrow = showArrow;
  const showToggle = resolvedVariant === "toggle" || resolvedVariant === "toggleWithLink";
  const showAction = resolvedVariant === "action" || resolvedVariant === "actionWithSearch";
  const showSearch = resolvedVariant === "actionWithSearch" || Boolean(search);
  const showDetailLink = Boolean(detailLink) && resolvedVariant === "toggleWithLink";
  const detailLinkIsActive = showDetailLink && currentEnabled && !switchDisabled;
  const updateToggle = (nextValue) => {
    if (switchDisabled) return;
    if (enabled === void 0) {
      setInternalEnabled(nextValue);
    }
    onToggle?.(nextValue);
  };
  const arrowNode = shouldShowArrow ? href && !disabled && !loading ? /* @__PURE__ */ jsxRuntime.jsx(
    TaavTooltip,
    {
      content: "\u0628\u0627\u0632\u06AF\u0634\u062A",
      side: "bottom",
      align: "center",
      sideOffset: 1,
      collisionPadding: 4,
      showArrow: false,
      contentClassName: "border-0 rounded-[8px] bg-[#7b7b7b] px-[10px] py-[6px] text-[11px] font-medium leading-4 text-white shadow-[0_6px_14px_rgba(15,23,42,0.22)]",
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "a",
        {
          href,
          "aria-label": "\u0628\u0627\u0632\u06AF\u0634\u062A",
          className: businessHeaderCardArrow(),
          onClick: (event) => {
            if (arrowHandler) {
              event.preventDefault();
              arrowHandler?.();
            }
          },
          children: /* @__PURE__ */ jsxRuntime.jsx(HeaderArrowIcon, {})
        }
      )
    }
  ) : arrowHandler && !disabled && !loading ? /* @__PURE__ */ jsxRuntime.jsx(
    TaavTooltip,
    {
      content: "\u0628\u0627\u0632\u06AF\u0634\u062A",
      side: "bottom",
      align: "center",
      open: arrowTooltipDefaultOpen || void 0,
      sideOffset: 1,
      collisionPadding: 4,
      showArrow: false,
      contentClassName: "border-0 rounded-[8px] bg-[#7b7b7b] px-[10px] py-[6px] text-[11px] font-medium leading-4 text-white shadow-[0_6px_14px_rgba(15,23,42,0.22)]",
      children: /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", "aria-label": "\u0628\u0627\u0632\u06AF\u0634\u062A", className: businessHeaderCardArrow(), onClick: arrowHandler, children: /* @__PURE__ */ jsxRuntime.jsx(HeaderArrowIcon, {}) })
    }
  ) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessHeaderCardArrowPlaceholder(), "aria-hidden": "true" }) : null;
  const iconNode = loading ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 56, height: 56, radius: "lg" }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessHeaderCardIconBox(), "aria-hidden": icon ? void 0 : true, children: icon ?? /* @__PURE__ */ jsxRuntime.jsx(HeaderBuildingIcon, {}) });
  const titleNode = loading ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title", width: "56%", contentClassName: "h-6" }) : /* @__PURE__ */ jsxRuntime.jsx("h3", { className: businessHeaderCardTitle({ variant: resolvedVariant }), children: title });
  const descriptionNode = loading ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { lines: 2, size: "sm" }) : description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: businessHeaderCardDescription({ variant: resolvedVariant }), children: description }) : null;
  const detailLinkNode = showDetailLink && !loading && detailLink ? /* @__PURE__ */ jsxRuntime.jsx(
    TaavDetailsLink,
    {
      href: detailLinkIsActive ? detailLink.href : void 0,
      onClick: detailLinkIsActive ? detailLink.onClick : void 0,
      disabled: detailDisabled || !detailLinkIsActive,
      size: "sm",
      tone: detailLinkIsActive ? "brand" : "neutral",
      underline: "always",
      hoverEffect: false,
      wrapperClassName: cn(
        "text-[12.5px] font-normal leading-[22px]",
        detailLinkIsActive ? "text-[#2563eb]" : "text-[#5f6f80]",
        businessHeaderCardLink()
      ),
      children: detailLink.label
    }
  ) : null;
  const actionButtonNode = showAction && action ? /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      type: "button",
      disabled: actionDisabled || !action.onClick,
      onClick: action.onClick,
      className: cn(
        businessHeaderCardActionButton({
          variant: resolvedVariant === "action" ? "action" : "actionWithSearch",
          disabled: actionDisabled || !action.onClick
        }),
        actionClassName
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessHeaderCardActionButtonIcon(), "aria-hidden": "true", children: action.icon ?? /* @__PURE__ */ jsxRuntime.jsx(HeaderPlusIcon, {}) }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessHeaderCardActionButtonLabel(), children: action.label })
      ]
    }
  ) : null;
  const toggleNode = showToggle ? /* @__PURE__ */ jsxRuntime.jsx(
    TaavActivationSwitch,
    {
      value: enabled !== void 0 ? currentEnabled ? "active" : "inactive" : void 0,
      defaultValue: currentEnabled ? "active" : "inactive",
      onValueChange: (nextValue) => updateToggle(nextValue === "active"),
      activeLabel: toggleLabelsResolved.enabled,
      inactiveLabel: toggleLabelsResolved.disabled,
      disabled: switchDisabled,
      size: "md",
      wrapperClassName: cn(
        "!h-[36px] !w-[180px] !min-w-[180px] !gap-[4px] !border-0 !bg-[#a9b4c1] !p-[3px] !shadow-none",
        "[&_[role=radio]]:h-[30px] [&_[role=radio]]:min-w-[84px] [&_[role=radio]]:px-[12px] [&_[role=radio]]:py-0",
        "[&_[role=radio]]:text-[13px] [&_[role=radio]]:font-semibold"
      )
    }
  ) : null;
  const searchNode = !loading && showSearch && search ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(businessHeaderCardSearchContainer({ variant: resolvedVariant }), searchClassName), children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full max-w-[228px]", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(businessHeaderCardSearchShell(), searchClassName), dir: "rtl", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": "true", className: "inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsxRuntime.jsx(HeaderSearchIcon, {}) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        value: search.value,
        placeholder: search.placeholder,
        disabled: searchDisabled,
        readOnly: search.value !== void 0 && !search.onChange,
        onChange: (event) => search.onChange?.(event.currentTarget.value),
        "aria-label": search.placeholder ?? (typeof title === "string" ? title : void 0),
        className: cn(businessHeaderCardSearchInput(), searchClassName)
      }
    )
  ] }) }) }) : null;
  const topRow = loading ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessHeaderCardTopRow(), children: [
    /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 26, height: 26, radius: "sm" }),
    /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 56, height: 56, radius: "lg" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid min-w-0 flex-1 gap-[4px] justify-items-end", children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title", width: "62%", contentClassName: "h-6" }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", width: "78%" })
    ] }),
    showToggle ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 180, height: 36, radius: "pill" }) : showAction ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 148, height: 36, radius: "md" }) : null
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(businessHeaderCardTopRow(), contentClassName), children: [
    arrowNode,
    iconNode,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessHeaderCardCopy({ variant: resolvedVariant }), children: [
      titleNode,
      descriptionNode
    ] }),
    toggleNode ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessHeaderCardToggle(), children: toggleNode }) : actionButtonNode ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessHeaderCardAction(), children: actionButtonNode }) : null
  ] });
  const loadingSearchNode = loading && showSearch ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessHeaderCardSearchContainer({ variant: resolvedVariant }), children: /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 228, height: 38, radius: "pill" }) }) : null;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "article",
    {
      ...rest,
      dir: "rtl",
      "data-taav-business-header-card": true,
      "data-variant": resolvedVariant,
      "data-theme-mode": themeMode,
      "data-disabled": disabled || void 0,
      "data-loading": loading || void 0,
      className: cn(businessHeaderCardRoot({ loading, themeMode, variant: resolvedVariant }), wrapperClassName, className),
      "aria-busy": loading || void 0,
      "aria-disabled": disabled || void 0,
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: businessHeaderCardBody({ variant: resolvedVariant }), children: [
        topRow,
        detailLinkNode ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessHeaderCardLink(), children: detailLinkNode }) : null,
        searchNode ?? loadingSearchNode
      ] })
    }
  );
}
function ModuleCardArrowIcon({ direction = "enter", className }) {
  const path = direction === "back" ? "M6.5 4.5 10.5 9l-4 4.5" : "M11.5 4.5 7.5 9l4 4.5";
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 18 18", fill: "none", "aria-hidden": true, className, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: path, stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
var sectionToolbarCardRoot = classVarianceAuthority.cva(
  [
    "w-full max-w-[690px] overflow-hidden rounded-[14px] border border-[color:rgba(145,170,190,0.5)]",
    "box-border bg-[#ffffff] shadow-none",
    "md:h-[145px] md:min-h-[145px]"
  ],
  {
    variants: {
      interactive: {
        true: TAAV_INTERACTION.base,
        false: ""
      }
    },
    defaultVariants: {
      interactive: false
    }
  }
);
var sectionToolbarCardBody = classVarianceAuthority.cva("block p-[22px_26px_22px_32px]");
var sectionToolbarCardHeader = classVarianceAuthority.cva("block");
var sectionToolbarCardLead = classVarianceAuthority.cva("block min-w-0");
var sectionToolbarCardIconBox = classVarianceAuthority.cva([
  "inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[16px]",
  "bg-[rgba(0,143,143,0.1)] text-[#008f8f]",
  "[&_svg]:h-[24px] [&_svg]:w-[24px]"
]);
var sectionToolbarCardCopy = classVarianceAuthority.cva("block min-w-0 w-full");
var sectionToolbarCardTitle = classVarianceAuthority.cva(
  "m-0 text-right text-[18px] font-semibold leading-[28px] text-[#30343b]"
);
var sectionToolbarCardDescription = classVarianceAuthority.cva(
  "m-0 mt-0 text-right text-[12.5px] font-normal leading-[22px] text-[#5f6f80]"
);
var sectionToolbarCardArrow = classVarianceAuthority.cva(
  [
    "inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center text-[#008f8f] justify-self-end mt-[18px]",
    TAAV_INTERACTION.base,
    TAAV_INTERACTION.focus
  ],
  {
    variants: {
      disabled: {
        true: "pointer-events-none opacity-50",
        false: ""
      }
    },
    defaultVariants: {
      disabled: false
    }
  }
);
classVarianceAuthority.cva("block mt-[9px] w-full");
var sectionToolbarCardSearch = classVarianceAuthority.cva("w-full");
var sectionToolbarCardAction = classVarianceAuthority.cva("block");
var sectionToolbarCardSearchShell = classVarianceAuthority.cva(
  "flex h-[38px] items-center gap-2 rounded-full bg-[#dfe4ea] px-4 text-[#64748b] shadow-none"
);
var sectionToolbarCardSearchInput = classVarianceAuthority.cva(
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-[12.5px] font-medium leading-5 text-[#64748b] placeholder:text-[#64748b] focus:outline-none"
);
var sectionToolbarCardActionButton = classVarianceAuthority.cva(
  "taav-business-action-button box-border inline-flex h-[36px] min-w-[148px] items-center justify-center gap-2 border-0 rounded-[14px] bg-[#008f8f] px-[16px] text-[14px] font-bold leading-5 text-white transition-[background-color,transform,opacity] hover:bg-[#007f7f] active:translate-y-px active:bg-[#006f6f] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(0,143,143,0.22)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-[0.55] [direction:rtl] [font-family:inherit] whitespace-nowrap"
);
var sectionToolbarCardActionButtonLabel = classVarianceAuthority.cva("inline-flex items-center");
var sectionToolbarCardActionButtonIcon = classVarianceAuthority.cva("inline-flex h-5 w-5 shrink-0 items-center justify-center");
function ToolbarSearchIcon() {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, className: "h-[1em] w-[1em]", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M11.5 11.5 14 14", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "7", cy: "7", r: "4.25", stroke: "currentColor", strokeWidth: "1.7" })
  ] });
}
function ToolbarPlusIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 20 20", fill: "none", "aria-hidden": true, className: "h-[1em] w-[1em]", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10 4.5v11M4.5 10h11", stroke: "currentColor", strokeWidth: "1.9", strokeLinecap: "round" }) });
}
function TaavBusinessSectionToolbarCard({
  title,
  description,
  icon,
  showArrow = true,
  onArrowClick,
  href,
  search,
  action,
  className,
  ...rest
}) {
  const arrowDisabled = !href && !onArrowClick;
  const showSearch = Boolean(search);
  const showAction = Boolean(action);
  const arrowContent = /* @__PURE__ */ jsxRuntime.jsx("span", { className: sectionToolbarCardArrow({ disabled: arrowDisabled }), "aria-hidden": arrowDisabled || void 0, children: /* @__PURE__ */ jsxRuntime.jsx(ModuleCardArrowIcon, { direction: "back", className: "h-[18px] w-[18px]" }) });
  const arrowNode = showArrow ? href ? /* @__PURE__ */ jsxRuntime.jsx(
    "a",
    {
      href,
      className: sectionToolbarCardArrow({ disabled: false }),
      "aria-label": title,
      onClick: (event) => {
        if (onArrowClick) {
          event.preventDefault();
          onArrowClick();
        }
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(ModuleCardArrowIcon, { direction: "back", className: "h-[18px] w-[18px]" })
    }
  ) : onArrowClick ? /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      className: sectionToolbarCardArrow({ disabled: false }),
      "aria-label": title,
      onClick: onArrowClick,
      children: /* @__PURE__ */ jsxRuntime.jsx(ModuleCardArrowIcon, { direction: "back", className: "h-[18px] w-[18px]" })
    }
  ) : arrowContent : null;
  const actionButtonNode = showAction ? /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      type: "button",
      className: sectionToolbarCardActionButton(),
      onClick: action?.onClick,
      disabled: action?.disabled || !action?.onClick,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: sectionToolbarCardActionButtonIcon(), "aria-hidden": true, children: action?.icon ?? /* @__PURE__ */ jsxRuntime.jsx(ToolbarPlusIcon, {}) }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: sectionToolbarCardActionButtonLabel(), children: action?.label })
      ]
    }
  ) : null;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "article",
    {
      ...rest,
      dir: "rtl",
      "data-taav-business-section-toolbar-card": true,
      className: cn(sectionToolbarCardRoot({ interactive: Boolean(href || onArrowClick) }), className),
      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: sectionToolbarCardBody(), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: sectionToolbarCardHeader(), dir: "rtl", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-[16px]", dir: "rtl", children: [
          arrowNode ?? /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": true, className: "mt-[18px] h-[26px] w-[26px]" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: sectionToolbarCardLead(), dir: "rtl", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-[16px]", dir: "rtl", children: [
            icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: sectionToolbarCardIconBox(), children: icon }) : null,
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: sectionToolbarCardCopy(), children: [
              /* @__PURE__ */ jsxRuntime.jsx("h3", { className: sectionToolbarCardTitle(), children: title }),
              description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: sectionToolbarCardDescription(), children: description }) : null
            ] })
          ] }) }),
          showAction ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: sectionToolbarCardAction(), children: actionButtonNode }) : /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": true, className: "w-[148px]" })
        ] }),
        showSearch ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: sectionToolbarCardSearch(), dir: "rtl", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full max-w-[228px]", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: sectionToolbarCardSearchShell(), dir: "rtl", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": true, className: "inline-flex h-[19px] w-[19px] shrink-0 items-center justify-center text-[#64748b]", children: /* @__PURE__ */ jsxRuntime.jsx(ToolbarSearchIcon, {}) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              value: search?.value,
              placeholder: search?.placeholder,
              readOnly: search?.value !== void 0 && !search?.onChange,
              onChange: (event) => search?.onChange?.(event.currentTarget.value),
              "aria-label": search?.placeholder ?? title,
              className: sectionToolbarCardSearchInput()
            }
          )
        ] }) }) }) }) : null
      ] }) })
    }
  );
}
function SummaryIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      className: "inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[17px] bg-[rgba(0,143,143,0.10)] text-[#008f8f]",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsxRuntime.jsx(Building2, { className: "h-[24px] w-[24px]", strokeWidth: 2.2 })
    }
  );
}
function SummaryArrow() {
  return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center text-[#008f8f]", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsx(ChevronRight, { className: "h-[30px] w-[30px]", strokeWidth: 2.8 }) });
}
function TaavBusinessProfileSummaryCard({
  title,
  description,
  icon,
  href,
  onClick,
  disabled = false,
  className,
  children,
  ...rest
}) {
  const rootClassName = cn(
    "group relative flex min-h-[101px] w-full max-w-[696px] items-center overflow-hidden rounded-[15px] border border-[rgba(145,170,190,0.5)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,247,249,0.98)_100%)] px-[28px] py-[17px] text-right shadow-[0_4px_10px_rgba(15,23,42,0.03)]",
    className
  );
  const content = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "ml-[16px] shrink-0", children: /* @__PURE__ */ jsxRuntime.jsx(SummaryArrow, {}) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "ml-[22px] shrink-0", children: icon ?? /* @__PURE__ */ jsxRuntime.jsx(SummaryIcon, {}) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid min-w-0 max-w-[520px] gap-[6px] text-right", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "m-0 text-[18px] font-semibold leading-[26px] text-[#3f3f46]", children: title }),
      description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 max-w-[520px] text-[12.5px] font-normal leading-[22px] text-[#52657a]", children: description }) : null,
      children
    ] })
  ] });
  if (href && !disabled) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "a",
      {
        ...rest,
        href,
        className: rootClassName,
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
  if (!disabled && onClick) {
    return /* @__PURE__ */ jsxRuntime.jsx("button", { ...rest, type: "button", className: rootClassName, onClick, children: content });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("article", { ...rest, className: rootClassName, "aria-disabled": disabled || void 0, children: content });
}
function TaavBusinessOwnershipCard({
  title = "\u0646\u0648\u0639 \u0645\u0627\u0644\u06A9\u06CC\u062A \u0648 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u067E\u0627\u06CC\u0647",
  description = "\u0648\u0631\u0648\u062F \u0627\u06CC\u0646 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062F\u0631 \u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0636\u0631\u0648\u0631\u06CC \u0627\u0633\u062A",
  value,
  defaultValue = "individual",
  onValueChange,
  individualLabel = "\u062D\u0642\u06CC\u0642\u06CC",
  legalLabel = "\u062D\u0642\u0648\u0642\u06CC",
  individualIcon,
  legalIcon,
  infoLabel = "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062F\u0631\u0628\u0627\u0631\u0647 \u0646\u0648\u0639 \u0645\u0627\u0644\u06A9\u06CC\u062A",
  onInfoClick,
  continueLabel = "\u0627\u062F\u0627\u0645\u0647",
  continueHref,
  onContinue,
  disabled = false,
  loading = false,
  className,
  ...rest
}) {
  const groupId = react.useId();
  const [internalValue, setInternalValue] = react.useState(defaultValue);
  const selectedValue = value ?? internalValue;
  const selectValue = (nextValue) => {
    if (disabled || loading) return;
    if (value === void 0) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };
  const continueContent = /* @__PURE__ */ jsxRuntime.jsx(ChevronRight, { className: "h-7 w-7", strokeWidth: 1.7, "aria-hidden": "true" });
  const continueNode = continueHref ? /* @__PURE__ */ jsxRuntime.jsx("a", { href: continueHref, "aria-label": continueLabel, onClick: onContinue, className: "text-[#009ca6] transition-colors hover:text-[#007f86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]", children: continueContent }) : /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", "aria-label": continueLabel, onClick: onContinue, disabled: !onContinue || disabled || loading, className: "text-[#009ca6] transition-colors hover:text-[#007f86] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed disabled:opacity-50", children: continueContent });
  return /* @__PURE__ */ jsxRuntime.jsx(
    "article",
    {
      ...rest,
      dir: "rtl",
      "data-taav-business-ownership-card": true,
      "data-value": selectedValue,
      "data-disabled": disabled || void 0,
      "data-loading": loading || void 0,
      className: cn("w-full max-w-[690px] overflow-hidden rounded-[2px] border border-[#eef1f2] bg-white px-[18px] pb-[12px] pt-[14px] text-right shadow-[0_4px_14px_rgba(15,23,42,0.03)]", disabled ? "opacity-60" : "", className),
      children: loading ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-5", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 52, height: 52, radius: "lg" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid flex-1 justify-items-end gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title", width: "38%" }),
            /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", width: "55%" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: "100%", height: 58 }),
          /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: "100%", height: 58 })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("header", { className: "flex items-start justify-start gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
            continueNode,
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex h-[56px] w-[56px] items-center justify-center rounded-[20px] bg-[rgba(0,156,166,0.10)] text-[#009ca6]", title: infoLabel, children: onInfoClick ? /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", "aria-label": infoLabel, onClick: onInfoClick, className: "rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]", children: /* @__PURE__ */ jsxRuntime.jsx(Info, { className: "h-6 w-6", strokeWidth: 1.7 }) }) : /* @__PURE__ */ jsxRuntime.jsx(Info, { className: "h-6 w-6", strokeWidth: 1.7, "aria-hidden": "true" }) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 pt-[2px] text-right", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "m-0 text-[18px] font-bold leading-7 text-[#4b4b4b]", children: title }),
            description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mt-[2px] text-[13px] leading-6 text-[#777777]", children: description }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { role: "radiogroup", "aria-label": typeof title === "string" ? title : "\u0646\u0648\u0639 \u0645\u0627\u0644\u06A9\u06CC\u062A", className: "mt-[12px] grid grid-cols-2 gap-[10px]", children: [
          /* @__PURE__ */ jsxRuntime.jsx(OwnershipOption, { id: `${groupId}-legal`, value: "legal", selectedValue, label: legalLabel, icon: legalIcon ?? /* @__PURE__ */ jsxRuntime.jsx(UsersRound, { className: "h-6 w-6", strokeWidth: 1.25 }), disabled, onSelect: selectValue }),
          /* @__PURE__ */ jsxRuntime.jsx(OwnershipOption, { id: `${groupId}-individual`, value: "individual", selectedValue, label: individualLabel, icon: individualIcon ?? /* @__PURE__ */ jsxRuntime.jsx(UserRound, { className: "h-6 w-6", strokeWidth: 1.25 }), disabled, onSelect: selectValue })
        ] })
      ] })
    }
  );
}
function OwnershipOption({ id, value, selectedValue, label, icon, disabled, onSelect }) {
  const selected = value === selectedValue;
  return /* @__PURE__ */ jsxRuntime.jsxs("button", { id, type: "button", role: "radio", "aria-checked": selected, disabled, onClick: () => onSelect(value), className: cn("flex min-h-[64px] flex-col items-center justify-center gap-1 border-b-2 border-transparent px-3 py-1 text-[13px] text-[#666666] transition-[border-color,color,background-color] hover:bg-[#fafcfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]", selected ? "border-[#4f4f4f] text-[#4f4f4f]" : ""), children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[#777777]", "aria-hidden": "true", children: icon }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { children: label })
  ] });
}
function TaavBusinessFormDialogCard({
  title,
  description,
  fields,
  secondaryToggle,
  confirmLabel = "\u062B\u0628\u062A",
  cancelLabel = "\u0644\u063A\u0648",
  onConfirm,
  onCancel,
  disabled = false,
  loading = false,
  themeMode = "auto",
  className,
  ...rest
}) {
  const titleId = react.useId();
  const [toggleState, setToggleState] = react.useState(Boolean(secondaryToggle?.defaultSelected));
  const toggleSelected = secondaryToggle?.selected ?? toggleState;
  const updateToggle = () => {
    if (disabled || loading || !secondaryToggle) return;
    const next = !toggleSelected;
    if (secondaryToggle.selected === void 0) setToggleState(next);
    secondaryToggle.onChange?.(next);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("article", { ...rest, dir: "rtl", "aria-labelledby": titleId, "data-taav-business-form-dialog-card": true, "data-theme-mode": themeMode, className: cn("flex min-h-[440px] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] border border-[var(--taav-business-form-dialog-border)] bg-[var(--taav-business-form-dialog-surface)] text-right text-[var(--taav-business-form-dialog-body)] shadow-[var(--taav-business-form-dialog-shadow)]", disabled ? "opacity-60" : "", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-1 flex-col px-[24px] pb-[22px] pt-[22px]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { id: titleId, className: "m-0 text-[22px] font-bold leading-8 text-[var(--taav-business-form-dialog-title)]", children: title }),
      description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mt-[18px] text-[13px] leading-6 text-[var(--taav-business-form-dialog-body)]", children: description }) : null,
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-[16px] grid gap-[16px]", children: [
        fields.map((field) => /* @__PURE__ */ jsxRuntime.jsx(DialogField, { field, disabled: disabled || loading }, field.id)),
        secondaryToggle ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-[var(--taav-business-form-dialog-divider)] pt-[16px]", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "ltr", className: "flex items-end gap-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", role: "checkbox", "aria-checked": toggleSelected, onClick: updateToggle, disabled: disabled || loading, className: cn("inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[var(--taav-business-form-dialog-field-border)] text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]", toggleSelected ? "border-[var(--taav-business-form-dialog-accent)] bg-[var(--taav-business-form-dialog-accent)]" : "bg-transparent"), children: toggleSelected ? /* @__PURE__ */ jsxRuntime.jsx(Check, { className: "h-6 w-6", strokeWidth: 2, "aria-hidden": "true" }) : null }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { dir: "rtl", className: "min-w-0 flex-1", children: /* @__PURE__ */ jsxRuntime.jsx(DialogField, { field: { id: `${titleId}-secondary`, label: secondaryToggle.label ?? "\u067E\u0644\u0627\u06A9 \u0641\u0631\u0639\u06CC", required: true, helperText: "\u0644\u0637\u0641\u0627\u064B \u0639\u062F\u062F \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F." }, disabled: disabled || loading, compact: true, active: toggleSelected }) })
        ] }) }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("footer", { className: "flex items-center justify-start gap-[42px] border-t border-[var(--taav-business-form-dialog-footer-border)] bg-[var(--taav-business-form-dialog-footer)] px-[30px] py-[21px] text-[16px] font-semibold text-[var(--taav-business-form-dialog-accent)]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: onConfirm, disabled: disabled || loading, className: "transition-colors hover:text-[#007f86] focus-visible:outline-none focus-visible:underline disabled:opacity-50", children: confirmLabel }),
      /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: onCancel, disabled: disabled || loading, className: "transition-colors hover:text-[#007f86] focus-visible:outline-none focus-visible:underline disabled:opacity-50", children: cancelLabel })
    ] })
  ] });
}
function DialogField({ field, disabled, compact = false, active = false }) {
  const inputId = react.useId();
  const [internalValue, setInternalValue] = react.useState(field.defaultValue ?? "");
  const currentValue = field.value ?? internalValue;
  const change = (next) => {
    if (field.value === void 0) setInternalValue(next);
    field.onChange?.(next);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[5px]", compact ? "gap-[3px]" : ""), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("label", { htmlFor: inputId, className: cn("text-[15px] font-semibold leading-6", active ? "text-[var(--taav-business-form-dialog-accent)]" : "text-[var(--taav-business-form-dialog-label)]"), children: [
      field.label,
      field.required ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mr-1 text-[#ef4444]", "aria-hidden": "true", children: "*" }) : null
    ] }),
    field.multiline ? /* @__PURE__ */ jsxRuntime.jsx("textarea", { id: inputId, value: currentValue, placeholder: field.placeholder, disabled, required: field.required, onChange: (event) => change(event.target.value), className: cn("min-h-[80px] w-full resize-y rounded-[9px] border bg-[var(--taav-business-form-dialog-field-bg)] px-3 py-2 text-[14px] text-[var(--taav-business-form-dialog-field-text)] outline-none focus:border-[var(--taav-business-form-dialog-accent)] focus:ring-2 focus:ring-[rgba(0,156,166,0.12)]", active ? "border-[var(--taav-business-form-dialog-accent)]" : "border-[var(--taav-business-form-dialog-field-border)]") }) : /* @__PURE__ */ jsxRuntime.jsx("input", { id: inputId, value: currentValue, placeholder: field.placeholder, disabled, required: field.required, onChange: (event) => change(event.target.value), className: cn("h-[38px] w-full rounded-[9px] border bg-[var(--taav-business-form-dialog-field-bg)] px-3 text-[14px] text-[var(--taav-business-form-dialog-field-text)] outline-none focus:border-[var(--taav-business-form-dialog-accent)] focus:ring-2 focus:ring-[rgba(0,156,166,0.12)]", active ? "border-[var(--taav-business-form-dialog-accent)]" : "border-[var(--taav-business-form-dialog-field-border)]") }),
    field.helperText ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-between text-[11px] leading-5 text-[var(--taav-business-form-dialog-muted)]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: field.helperText }),
      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
        currentValue.length,
        "/255"
      ] })
    ] }) : null
  ] });
}
function TaavBusinessOwnerCard({
  title = "\u0645\u0627\u0644\u06A9 \u06A9\u0633\u0628 \u0648 \u06A9\u0627\u0631",
  description = "\u062A\u0648\u0635\u06CC\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F \u062F\u0631 \u0635\u0648\u0631\u062A\u06CC \u06A9\u0647 \u06A9\u062F \u0645\u0644\u06CC \u0634\u0645\u0627 \u062F\u0631 \u0633\u0627\u0645\u0627\u0646\u0647 \u062B\u0628\u062A \u0646\u0634\u062F\u0647 \u0627\u0633\u062A\u060C \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0648\u06CC\u0631\u0627\u06CC\u0634 \u0627\u0642\u062F\u0627\u0645 \u0628\u0647 \u062B\u0628\u062A \u06A9\u062F \u0645\u0644\u06CC \u062E\u0648\u062F \u06A9\u0646\u06CC\u062F.",
  ownerName,
  phone,
  secondaryText = "-",
  avatar,
  editLabel = "\u0648\u06CC\u0631\u0627\u06CC\u0634 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0645\u0627\u0644\u06A9 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
  callLabel = "\u062A\u0645\u0627\u0633 \u0628\u0627 \u0645\u0627\u0644\u06A9 \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631",
  phoneBadge,
  onEdit,
  onCall,
  disabled = false,
  loading = false,
  themeMode = "auto",
  className,
  ...rest
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("article", { ...rest, dir: "rtl", "data-taav-business-owner-card": true, "data-theme-mode": themeMode, "data-disabled": disabled || void 0, "data-loading": loading || void 0, className: cn("w-full max-w-[690px] overflow-hidden rounded-[8px] border border-[var(--taav-business-owner-border)] bg-[var(--taav-business-owner-surface)] text-right shadow-[var(--taav-business-owner-shadow)]", disabled ? "opacity-60" : "", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("header", { className: "border-b border-[var(--taav-business-owner-header-border)] bg-[var(--taav-business-owner-header)] px-[18px] py-[10px] text-[var(--taav-business-owner-header-text)]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "m-0 text-[17px] font-bold leading-7", children: title }),
      description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[12px] font-normal leading-5", children: description }) : null
    ] }),
    loading ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex h-[88px] items-center gap-4 px-[10px]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "h-[70px] w-[70px] animate-pulse rounded-[8px] bg-[var(--taav-business-owner-avatar)]" }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "h-4 w-48 animate-pulse rounded bg-[var(--taav-business-owner-muted)]" })
    ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-h-[88px] items-center justify-between gap-4 px-[10px] py-[8px]", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[8px] bg-[var(--taav-business-owner-avatar)] text-[var(--taav-business-owner-avatar-icon)]", "aria-hidden": avatar ? void 0 : true, children: avatar ?? /* @__PURE__ */ jsxRuntime.jsx(UserRound, { className: "h-12 w-12", strokeWidth: 1.6 }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 text-right text-[var(--taav-business-owner-text)]", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "m-0 truncate text-[16px] font-bold leading-7", children: ownerName }),
          phone ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[12px] leading-5", children: phone }) : null,
          secondaryText ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[12px] leading-5", children: secondaryText }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex shrink-0 items-center gap-5 text-[var(--taav-business-owner-action)]", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", "aria-label": callLabel, onClick: onCall, disabled: disabled || !onCall, className: "relative inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-[var(--taav-business-owner-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntime.jsx(Phone, { className: "h-7 w-7", strokeWidth: 1.6 }),
          phoneBadge ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute bottom-0 right-0 inline-flex min-h-4 min-w-4 translate-x-1/4 translate-y-1/4 items-center justify-center rounded-full bg-[#a8a8a8] px-1 text-[10px] font-bold text-white", children: phoneBadge }) : null
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", "aria-label": editLabel, onClick: onEdit, disabled: disabled || !onEdit, className: "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-[var(--taav-business-owner-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed disabled:opacity-50", children: /* @__PURE__ */ jsxRuntime.jsx(SquarePen, { className: "h-7 w-7", strokeWidth: 1.6 }) })
      ] })
    ] })
  ] });
}
function resolveIndex(value, steps, fallback) {
  if (typeof value === "number") return Math.max(0, Math.min(value, steps.length - 1));
  if (typeof value === "string") {
    const index = steps.findIndex((step) => step.id === value);
    if (index >= 0) return index;
  }
  return fallback;
}
function TaavFormStepIndicator({
  steps,
  activeStep,
  defaultActiveStep = 0,
  completedSteps = [],
  intro,
  onStepChange,
  clickable = false,
  disabled = false,
  themeMode = "auto",
  className,
  ...rest
}) {
  const activeIndex = resolveIndex(activeStep ?? defaultActiveStep, steps, 0);
  const handleStepClick = (step, index) => {
    if (disabled || !clickable) return;
    onStepChange?.(step.id, index);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("nav", { ...rest, dir: "rtl", "aria-label": "\u0645\u0631\u0627\u062D\u0644 \u0641\u0631\u0645", "data-taav-form-step-indicator": true, "data-theme-mode": themeMode, "data-disabled": disabled || void 0, className: cn("w-full border-b border-[var(--taav-form-step-divider)] px-[20px] pb-[14px] pt-[18px] text-right", disabled ? "opacity-60" : "", className), children: [
    intro ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-center text-[13px] leading-6 text-[var(--taav-form-step-intro)]", children: intro }) : null,
    /* @__PURE__ */ jsxRuntime.jsx("ol", { role: "list", className: cn("mx-auto mt-[14px] grid max-w-[420px] items-start", steps.length === 2 ? "grid-cols-2" : ""), children: steps.map((step, index) => {
      const complete = completedSteps.includes(step.id) || index < activeIndex;
      const current = index === activeIndex;
      const stepContent = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border text-[14px] font-normal transition-colors", complete ? "border-[var(--taav-form-step-complete-border)] bg-[var(--taav-form-step-complete-bg)] text-[var(--taav-form-step-complete-text)]" : current ? "border-[var(--taav-form-step-active)] bg-[var(--taav-form-step-active-bg)] text-[var(--taav-form-step-active-text)]" : "border-[var(--taav-form-step-inactive-border)] bg-transparent text-[var(--taav-form-step-inactive-text)]"), children: complete ? /* @__PURE__ */ jsxRuntime.jsx(Check, { className: "h-[17px] w-[17px]", strokeWidth: 2, "aria-hidden": "true" }) : index + 1 }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("mt-[5px] text-[13px] leading-5 transition-colors", current || complete ? "text-[var(--taav-form-step-label-active)]" : "text-[var(--taav-form-step-label-inactive)]"), children: step.label }),
        step.description ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: step.description }) : null
      ] });
      return /* @__PURE__ */ jsxRuntime.jsx("li", { className: "flex justify-center text-center", children: clickable ? /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", "aria-current": current ? "step" : void 0, "aria-label": `\u0645\u0631\u062D\u0644\u0647 ${index + 1}: ${step.label}`, onClick: () => handleStepClick(step, index), disabled, className: "flex min-w-[100px] flex-col items-center rounded-lg px-3 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]", children: stepContent }) : /* @__PURE__ */ jsxRuntime.jsx("div", { "aria-current": current ? "step" : void 0, className: "flex min-w-[100px] flex-col items-center px-3 pb-1", children: stepContent }) }, step.id);
    }) })
  ] });
}
var DEFAULT_CHANNELS = [
  { id: "mobile", label: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646 \u0647\u0645\u0631\u0627\u0647" },
  { id: "landline", label: "\u062A\u0644\u0641\u0646 \u062B\u0627\u0628\u062A" },
  { id: "fax", label: "\u0634\u0645\u0627\u0631\u0647 \u0641\u06A9\u0633" },
  { id: "email", label: "\u0627\u06CC\u0645\u06CC\u0644" },
  { id: "website", label: "\u0648\u0628\u0633\u0627\u06CC\u062A" },
  { id: "social", label: "\u0634\u0628\u06A9\u0647\u200C\u0647\u0627\u06CC \u0627\u062C\u062A\u0645\u0627\u0639\u06CC" }
];
function TaavCommunicationChannels({
  channels = DEFAULT_CHANNELS,
  expandedId,
  defaultExpandedId = "social",
  onExpandedChange,
  onBack,
  backLabel = "\u0628\u0627\u0632\u06AF\u0634\u062A",
  emptyText = "\u0645\u0648\u0631\u062F\u06CC \u0628\u0631\u0627\u06CC \u0646\u0645\u0627\u06CC\u0634 \u0648\u062C\u0648\u062F \u0646\u062F\u0627\u0631\u062F",
  themeMode = "auto",
  disabled = false,
  className,
  ...rest
}) {
  const resolvedExpandedId = expandedId ?? defaultExpandedId;
  return /* @__PURE__ */ jsxRuntime.jsxs("section", { ...rest, dir: "rtl", "aria-label": "\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062A\u0645\u0627\u0633", "data-taav-communication-channels": true, "data-theme-mode": themeMode, className: cn("w-full max-w-[690px] text-right", disabled ? "opacity-60" : "", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid gap-[8px]", children: channels.map((channel) => {
      const isExpanded = resolvedExpandedId === channel.id;
      const channelDisabled = disabled || channel.disabled;
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("overflow-hidden rounded-[12px] border border-[var(--taav-communication-border)] bg-[var(--taav-communication-surface)]", isExpanded ? "min-h-[106px]" : "min-h-[54px]"), children: [
        /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", "aria-expanded": isExpanded, disabled: channelDisabled, onClick: () => onExpandedChange?.(channel.id), className: "flex min-h-[54px] w-full items-center justify-between gap-3 px-[14px] text-[16px] font-semibold text-[var(--taav-communication-label)] transition-colors hover:bg-[var(--taav-communication-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex min-w-0 items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(CircleDot, { className: "h-[24px] w-[24px] shrink-0 text-[var(--taav-communication-accent)]", strokeWidth: 1.15 }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: channel.label })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(Plus, { className: "h-[22px] w-[22px] shrink-0 text-[var(--taav-communication-accent)]", strokeWidth: 1.6, "aria-hidden": "true" })
        ] }),
        isExpanded ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t border-[var(--taav-communication-divider)] px-[18px] py-[14px] text-center text-[14px] text-[var(--taav-communication-muted)]", children: channel.content ?? channel.emptyText ?? emptyText }) : null
      ] }, channel.id);
    }) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-center pt-[16px]", children: /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: onBack, disabled: disabled || !onBack, className: "rounded-[8px] bg-[var(--taav-communication-button)] px-[10px] py-[6px] text-[14px] font-semibold text-white transition-colors hover:bg-[var(--taav-communication-button-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed disabled:opacity-50", children: backLabel }) })
  ] });
}
var DEFAULT_ITEMS = [
  { id: "mobile", label: "\u0634\u0645\u0627\u0631\u0647 \u062A\u0644\u0641\u0646\u200C\u0647\u0627\u06CC \u0647\u0645\u0631\u0627\u0647", icon: /* @__PURE__ */ jsxRuntime.jsx(Smartphone, {}) },
  { id: "landline", label: "\u062A\u0644\u0641\u0646 \u062B\u0627\u0628\u062A", icon: /* @__PURE__ */ jsxRuntime.jsx(PhoneCall, {}) },
  { id: "fax", label: "\u0634\u0645\u0627\u0631\u0647 \u0641\u06A9\u0633", icon: /* @__PURE__ */ jsxRuntime.jsx(Printer, {}) },
  { id: "email", label: "\u0627\u06CC\u0645\u06CC\u0644", icon: /* @__PURE__ */ jsxRuntime.jsx(Mail, {}) },
  { id: "website", label: "\u0648\u0628\u200C\u0633\u0627\u06CC\u062A", icon: /* @__PURE__ */ jsxRuntime.jsx(Earth, {}) }
];
function TaavCommunicationChannelsCard({
  title = "\u062F\u0641\u062A\u0631 \u0641\u0646\u06CC",
  primaryLabel = "\u0627\u0646\u062A\u062E\u0627\u0628 \u0628\u0647 \u0639\u0646\u0648\u0627\u0646 \u0631\u0627\u0647 \u0627\u0631\u062A\u0628\u0627\u0637 \u0627\u0635\u0644\u06CC",
  primaryDescription = "\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0628\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u0631\u0627\u0647 \u0627\u0631\u062A\u0628\u0627\u0637 \u0627\u0635\u0644\u06CC\u060C \u062A\u0645\u0627\u0633\u200C\u0647\u0627\u060C \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0648 \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC\u200C\u0647\u0627\u06CC \u0627\u06CC\u0646 \u0628\u062E\u0634 \u0631\u0627 \u0627\u0632 \u0637\u0631\u06CC\u0642 \u0622\u0646 \u062F\u0631\u06CC\u0627\u0641\u062A \u06A9\u0646\u06CC\u062F.",
  primaryEnabled = false,
  onPrimaryChange,
  postalCode = "-",
  mapLabel = "\u0645\u0634\u0627\u0647\u062F\u0647 \u0631\u0648\u06CC \u0646\u0642\u0634\u0647",
  onMapClick,
  location = "-",
  phoneBadge,
  items = DEFAULT_ITEMS,
  onMenuClick,
  disabled = false,
  loading = false,
  themeMode = "auto",
  className,
  ...rest
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("article", { ...rest, dir: "rtl", "data-taav-communication-channels-card": true, "data-theme-mode": themeMode, className: cn("w-full max-w-[690px] overflow-hidden rounded-[12px] border border-[var(--taav-communication-card-border)] bg-[var(--taav-communication-card-surface)] px-[8px] pb-[18px] pt-[12px] text-right shadow-[var(--taav-communication-card-shadow)]", disabled ? "opacity-60" : "", className), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("header", { className: "flex items-start justify-between gap-4 px-[8px]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "m-0 text-[20px] font-bold leading-8 text-[var(--taav-communication-card-title)]", children: title }),
      /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", onClick: onMenuClick, disabled: disabled || loading || !onMenuClick, "aria-label": "\u06AF\u0632\u06CC\u0646\u0647\u200C\u0647\u0627\u06CC \u0628\u06CC\u0634\u062A\u0631", className: "text-[var(--taav-communication-card-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:opacity-50", children: /* @__PURE__ */ jsxRuntime.jsx(EllipsisVertical, { className: "h-6 w-6" }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-[8px] pt-[8px]", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "ltr", className: "flex items-start justify-between gap-5", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Switch, { checked: primaryEnabled, onChange: onPrimaryChange, disabled: disabled || loading }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "rtl", className: "min-w-0 text-right", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "m-0 text-[15px] font-semibold leading-6 text-[var(--taav-communication-card-title)]", children: primaryLabel }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mt-[2px] text-[12px] leading-5 text-[var(--taav-communication-card-muted)]", children: primaryDescription })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-[14px] min-h-[128px] border-t border-[var(--taav-communication-card-divider)] pt-[10px]", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between text-[13px] text-[var(--taav-communication-card-muted)]", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex w-[145px] shrink-0 flex-col items-end gap-0.5 text-right", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-full text-right", children: location }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-full text-right", children: "\u06A9\u062F\u067E\u0633\u062A\u06CC" })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "w-[145px] shrink-0 text-left", children: postalCode })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", onClick: onMapClick, disabled: disabled || loading || !onMapClick, className: "mx-auto mt-[10px] flex items-center gap-1 text-[14px] font-semibold text-[var(--taav-communication-card-map)] opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9] disabled:cursor-not-allowed", children: [
          /* @__PURE__ */ jsxRuntime.jsx(MapPinned, { className: "h-6 w-6" }),
          mapLabel
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-[12px] border-t border-[var(--taav-communication-card-divider)] px-[8px] pt-[10px]", children: /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "m-0 grid list-none gap-[5px] p-0", children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsxs("li", { className: "flex items-center justify-between gap-4 text-[15px] leading-7 text-[var(--taav-communication-card-text)]", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: item.label }),
      /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "relative inline-flex h-7 w-7 items-center justify-center text-[var(--taav-communication-card-icon)]", children: [
        item.icon,
        item.id === "mobile" && phoneBadge ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--taav-communication-card-accent)] px-1 text-[10px] leading-none text-white", children: phoneBadge }) : null
      ] })
    ] }, item.id)) }) })
  ] });
}
function Switch({ checked, onChange, disabled }) {
  return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", role: "switch", "aria-checked": checked, onClick: () => onChange?.(!checked), disabled, className: cn("relative inline-flex h-[18px] w-[38px] shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80d7d9]", checked ? "bg-[#9adbd9]" : "bg-[#c8ced7]"), children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("absolute left-0 h-[20px] w-[20px] rounded-full shadow-[0_1px_3px_rgba(15,23,42,0.16)] transition-transform", checked ? "bg-[var(--taav-communication-card-accent)] translate-x-0" : "bg-white translate-x-[18px]") }) });
}
function RecommendationCardActionIcon({ className }) {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, className, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 4l4 4-4 4", stroke: "currentColor", strokeWidth: "2.7", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function RecommendationCardDefaultIcon({ className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, className, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M8.5 11.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M7 14.5c1.2 1.4 2.7 2 4 2s2.8-.6 4-2",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M12 4.5v2.2M10.2 5.2 9 3.8M13.8 5.2 15 3.8",
        stroke: "currentColor",
        strokeWidth: "1.4",
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M6.5 18.5h11",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M8 18.5V16a4 4 0 0 1 8 0v2.5",
        stroke: "currentColor",
        strokeWidth: "1.6",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "9.5", r: "3.2", stroke: "currentColor", strokeWidth: "1.6" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 7.1v2.4M10.8 8.3h2.4", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round" })
  ] });
}
var recommendationCardRoot = classVarianceAuthority.cva(
  [
    "mx-auto w-[712px] max-w-none border-0",
    "bg-[var(--taav-recommendation-card-surface)]",
    "rounded-none shadow-none",
    TAAV_INTERACTION.base
  ],
  {
    variants: {
      size: {
        sm: "h-[var(--taav-recommendation-card-height-sm)] p-[var(--taav-recommendation-card-padding-sm)]",
        md: "h-[var(--taav-recommendation-card-height-md)] p-[var(--taav-recommendation-card-padding-md)]",
        lg: "h-[var(--taav-recommendation-card-height-lg)] p-[var(--taav-recommendation-card-padding-lg)]"
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
var recommendationCardLayout = classVarianceAuthority.cva(
  "flex items-start justify-between gap-[var(--taav-recommendation-card-gap)]"
);
var recommendationCardLeading = classVarianceAuthority.cva(
  "flex min-w-0 flex-1 items-start gap-[var(--taav-recommendation-card-leading-gap)]"
);
var recommendationCardIconBox = classVarianceAuthority.cva(
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
var recommendationCardAction = classVarianceAuthority.cva(
  [
    "mt-[15px] inline-flex shrink-0 items-center justify-center self-start",
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
var recommendationCardCopy = classVarianceAuthority.cva("grid min-w-0 max-w-[370px] flex-1 justify-items-end gap-[var(--taav-recommendation-card-copy-gap)]");
var recommendationCardTitle = classVarianceAuthority.cva(
  "m-0 text-right font-semibold leading-[var(--taav-recommendation-card-title-line-height)] text-[var(--taav-recommendation-card-title)]",
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
var recommendationCardDescription = classVarianceAuthority.cva(
  "m-0 text-right font-normal leading-[var(--taav-recommendation-card-description-line-height)] text-[var(--taav-recommendation-card-description)]",
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
var recommendationCardTrailing = classVarianceAuthority.cva(
  "mt-0 flex shrink-0 flex-wrap items-center justify-end gap-[var(--taav-recommendation-card-trailing-gap)] self-start"
);
var recommendationCardTone = classVarianceAuthority.cva("", {
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
  const actionContent = actionIcon ?? /* @__PURE__ */ jsxRuntime.jsx(RecommendationCardActionIcon, {});
  const actionNode = hasAction ? href ? /* @__PURE__ */ jsxRuntime.jsx(
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
  ) : /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      className: cn(recommendationCardAction({ disabled: false }), actionClassName),
      "aria-label": resolvedActionLabel,
      onClick: onAction,
      children: actionContent
    }
  ) : null;
  const body = loading ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: recommendationCardLayout(), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: recommendationCardLeading(), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 16, height: 16, radius: "sm" }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 48, height: 48, radius: "lg" }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(recommendationCardCopy(), "flex-1"), children: [
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title", width: "70%", contentClassName: "h-5" }),
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { lines: 2, size: "sm" }),
        /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "text", width: "34%" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 144, height: 36, radius: "pill" })
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: recommendationCardLayout(), children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(recommendationCardLeading(), contentClassName), children: [
      actionNode,
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: recommendationCardIconBox({ size }), "aria-hidden": showDefaultIcon, children: icon ?? /* @__PURE__ */ jsxRuntime.jsx(RecommendationCardDefaultIcon, {}) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: recommendationCardCopy(), children: [
        /* @__PURE__ */ jsxRuntime.jsx("h2", { className: recommendationCardTitle({ size }), children: title }),
        description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: recommendationCardDescription({ size }), children: description }) : null,
        hasDetails ? /* @__PURE__ */ jsxRuntime.jsx(
          TaavDetailsLink,
          {
            href: detailsHref,
            onClick: onDetailsClick,
            disabled: detailsDisabled,
            size: size === "lg" ? "md" : size === "sm" ? "sm" : "md",
            wrapperClassName: "mt-[6px] justify-self-start text-[12.5px] leading-[22px] text-[#7a8a9c]",
            children: detailsLabel
          }
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: recommendationCardTrailing(), children: /* @__PURE__ */ jsxRuntime.jsx(
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
        ariaLabel: "\u0648\u0636\u0639\u06CC\u062A \u0641\u0639\u0627\u0644\u200C\u0633\u0627\u0632\u06CC \u062A\u0646\u0638\u06CC\u0645",
        wrapperClassName: cn(
          "!h-[40px] !w-[180px] !min-w-[180px] !gap-[4px] !border-0 !bg-[var(--taav-activation-switch-track-bg)] !p-[3px]",
          "[&_[role=radio]]:h-[32px] [&_[role=radio]]:min-w-[88px] [&_[role=radio]]:px-[14px] [&_[role=radio]]:py-0",
          "[&_[role=radio]]:text-[13px] [&_[role=radio]]:font-semibold"
        )
      }
    ) })
  ] });
  return /* @__PURE__ */ jsxRuntime.jsx(
    "article",
    {
      ...rest,
      dir: "rtl",
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
var businessSidebarRoot = classVarianceAuthority.cva(
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
var businessSidebarProfileRow = classVarianceAuthority.cva(
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
var businessSidebarMenuItem = classVarianceAuthority.cva(
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
var businessSidebarQuickAction = classVarianceAuthority.cva(
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
var businessSidebarCollapsedToolbar = classVarianceAuthority.cva(
  "flex shrink-0 flex-col items-center gap-1 bg-[var(--taav-business-sidebar-toolbar-bg)] px-1 py-1.5"
);
var businessSidebarCollapsedTenantStrip = classVarianceAuthority.cva(
  "flex shrink-0 items-center justify-center px-2 py-3"
);
var businessSidebarShell = classVarianceAuthority.cva(
  "flex min-h-screen w-full flex-row items-stretch",
  {
    variants: {
      placement: {
        right: "py-0 pr-0 pl-0",
        left: "py-[var(--taav-business-sidebar-shell-py)] pl-[var(--taav-business-sidebar-shell-pr)] pr-0"
      }
    },
    defaultVariants: {
      placement: "right"
    }
  }
);
var businessSidebarContentColumn = classVarianceAuthority.cva(
  "relative flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden"
);
var businessSidebarContentBody = classVarianceAuthority.cva("relative min-h-0 flex-1 overflow-hidden");
var businessSidebarRailWrap = classVarianceAuthority.cva("flex h-full shrink-0 self-stretch");
var businessSidebarNavPathRoot = classVarianceAuthority.cva(
  [
    "flex w-full shrink-0 items-center justify-start",
    "min-h-[var(--taav-business-nav-path-height)]",
    "border-t border-[color:var(--taav-business-nav-path-border-top)]",
    "border-b border-[color:var(--taav-business-nav-path-border)]",
    "bg-[var(--taav-business-nav-path-bg)]",
    "px-[var(--taav-business-nav-path-px)] py-[var(--taav-business-nav-path-py)]"
  ].join(" ")
);
var businessSidebarNavPathList = classVarianceAuthority.cva(
  "m-0 flex min-w-0 list-none flex-wrap items-center justify-start gap-[var(--taav-business-nav-path-gap)] p-0"
);
var businessSidebarNavPathLink = classVarianceAuthority.cva(
  [
    "inline-flex min-w-0 items-center border-0 bg-transparent p-0 no-underline",
    "text-[length:var(--taav-business-nav-path-text-size)] leading-5 tracking-[-0.005em]",
    "text-[var(--taav-business-nav-path-text)]",
    "transition-colors hover:text-[var(--taav-business-nav-path-text-hover)]",
    "focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]"
  ].join(" ")
);
var businessSidebarNavPathCurrent = classVarianceAuthority.cva(
  [
    "inline-flex min-w-0 items-center truncate",
    "text-[length:var(--taav-business-nav-path-text-size)] font-normal leading-5 tracking-[-0.005em]",
    "text-[var(--taav-business-nav-path-text-current)]"
  ].join(" ")
);
var businessSidebarNavPathSeparator = classVarianceAuthority.cva(
  "inline-flex shrink-0 items-center justify-center text-[var(--taav-business-nav-path-separator)] [&_svg]:h-[var(--taav-business-nav-path-separator-size)] [&_svg]:w-[var(--taav-business-nav-path-separator-size)]"
);
var DEFAULT_BUSINESS_SIDEBAR_NAV_PATH = [
  { label: "\u062E\u0627\u0646\u0647", id: "home" }
];
var DEFAULT_BUSINESS_NAV_PATH = DEFAULT_BUSINESS_SIDEBAR_NAV_PATH;
function PathSeparator() {
  return /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessSidebarNavPathSeparator(), children: /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10 4 6 8l4 4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }) });
}
function BusinessSidebarNavPath({
  items,
  className,
  listClassName,
  ...props
}) {
  const pathItems = items.length > 0 ? items : DEFAULT_BUSINESS_SIDEBAR_NAV_PATH;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "nav",
    {
      dir: "rtl",
      "aria-label": "\u0645\u0633\u06CC\u0631 \u0635\u0641\u062D\u0647",
      className: cn(businessSidebarNavPathRoot(), className),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx("ol", { className: cn(businessSidebarNavPathList(), listClassName), children: pathItems.map((item, index) => {
        const isCurrent = index === pathItems.length - 1;
        const key = item.id ? `${item.id}-${index}` : `${item.label}-${index}`;
        return /* @__PURE__ */ jsxRuntime.jsxs(react.Fragment, { children: [
          index > 0 ? /* @__PURE__ */ jsxRuntime.jsx("li", { className: "inline-flex shrink-0 items-center", "aria-hidden": true, children: /* @__PURE__ */ jsxRuntime.jsx(PathSeparator, {}) }) : null,
          /* @__PURE__ */ jsxRuntime.jsx("li", { className: "inline-flex min-w-0 max-w-full items-center", children: isCurrent ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: businessSidebarNavPathCurrent(), "aria-current": "page", children: item.label }) : item.href ? /* @__PURE__ */ jsxRuntime.jsx("a", { href: item.href, className: businessSidebarNavPathLink(), onClick: item.onClick, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: item.label }) }) : /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: businessSidebarNavPathLink(), onClick: item.onClick, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: item.label }) }) })
        ] }, key);
      }) })
    }
  );
}
function SidebarBadge({ value }) {
  return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute -left-2 -top-1.5 min-w-[16px] rounded-[10px] bg-[var(--taav-business-sidebar-badge-bg)] px-[5px] py-0.5 text-center text-[10px] font-bold leading-none text-white", children: value });
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
  const content = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex", children: icon }),
    badge !== void 0 ? /* @__PURE__ */ jsxRuntime.jsx(SidebarBadge, { value: badge }) : null
  ] });
  const wrapped = collapsed ? /* @__PURE__ */ jsxRuntime.jsx(TaavTooltip, { content: label, side: "left", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex", children: content }) }) : content;
  if (href) {
    return /* @__PURE__ */ jsxRuntime.jsx("a", { href, title: label, "aria-label": label, className: classes, onClick, children: wrapped });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", title: label, "aria-label": label, className: classes, onClick, children: wrapped });
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
  const content = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 [&_svg]:h-[14px] [&_svg]:w-[14px]", children: item.icon }),
    !collapsed ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "min-w-0 flex-1 truncate whitespace-nowrap", children: item.label }) : null,
    !collapsed && item.badge !== void 0 ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mr-auto rounded-[10px] bg-[var(--taav-business-sidebar-badge-bg)] px-1.5 py-0.5 text-[10px] font-bold text-white", children: item.badge }) : null
  ] });
  const wrapped = collapsed ? /* @__PURE__ */ jsxRuntime.jsx(TaavTooltip, { content: item.label, side: "left", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex w-full", children: content }) }) : content;
  if (item.disabled) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: classes, "aria-disabled": "true", title: item.label, "aria-label": item.label, children: wrapped });
  }
  if (item.href) {
    return /* @__PURE__ */ jsxRuntime.jsx(
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
  return /* @__PURE__ */ jsxRuntime.jsx(
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
  const [internalCollapsed, setInternalCollapsed] = react.useState(defaultCollapsed);
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
  const sidebarRail = /* @__PURE__ */ jsxRuntime.jsx(TaavTooltipProvider, { children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessSidebarRailWrap(), children: /* @__PURE__ */ jsxRuntime.jsxs(
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
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessSidebarProfileRow({ collapsed }), children: (() => {
          const avatar = /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: cn(
                "flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-black",
                collapsed ? "h-[var(--taav-business-sidebar-collapsed-avatar-size)] w-[var(--taav-business-sidebar-collapsed-avatar-size)] text-[9px]" : "ml-2 h-8 w-8 text-[10px]",
                variant === "dastranj" ? "bg-[var(--taav-business-sidebar-user-avatar-bg)] text-[#03121c]" : "bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]"
              ),
              children: user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                /* @__PURE__ */ jsxRuntime.jsx("img", { src: user.avatarUrl, alt: "", className: "h-full w-full object-cover" })
              ) : userInitial
            }
          );
          if (collapsed) {
            return /* @__PURE__ */ jsxRuntime.jsx(TaavTooltip, { content: user.name, side: "left", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex", children: avatar }) });
          }
          return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            avatar,
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 flex-1 text-[11px] leading-tight", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "truncate", children: loading ? "\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC..." : user.name }),
              user.subtitle ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-0.5 truncate text-[9px] text-[var(--taav-business-sidebar-text-muted)]", children: user.subtitle }) : null
            ] })
          ] });
        })() }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessSidebarProfileRow({ collapsed }), children: (() => {
          const avatar = /* @__PURE__ */ jsxRuntime.jsx(
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
            return /* @__PURE__ */ jsxRuntime.jsx(TaavTooltip, { content: tenant.name, side: "left", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex", children: avatar }) });
          }
          return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            avatar,
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 flex-1 text-[11px] leading-tight text-[var(--taav-business-sidebar-tenant-name)]", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "truncate", children: loading ? "tenant" : tenant.name }),
              tenant.label ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-0.5 truncate text-[9px] text-[var(--taav-business-sidebar-text-muted)]", children: tenant.label }) : null
            ] }),
            onTenantSwitch ? /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                title: "\u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0633\u0628 \u0648 \u06A9\u0627\u0631",
                "aria-label": "\u062A\u063A\u06CC\u06CC\u0631 \u06A9\u0633\u0628 \u0648 \u06A9\u0627\u0631",
                onClick: onTenantSwitch,
                className: "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-[var(--taav-business-sidebar-switch-bg)] text-[var(--taav-business-sidebar-switch-text)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
                children: /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", className: "h-3.5 w-3.5", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" }) })
              }
            ) : null
          ] });
        })() }),
        quickActions && quickActions.length > 0 ? /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: cn(
              collapsed ? businessSidebarCollapsedToolbar() : "flex shrink-0 items-center justify-around bg-[var(--taav-business-sidebar-toolbar-bg)] px-1.5 py-2"
            ),
            children: [
              collapsed && canToggleCollapse ? /* @__PURE__ */ jsxRuntime.jsx(TaavTooltip, { content: "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0645\u0646\u0648", side: "left", children: /* @__PURE__ */ jsxRuntime.jsx(
                "button",
                {
                  type: "button",
                  className: "inline-flex h-[var(--taav-business-sidebar-collapsed-footer-btn-size)] w-[var(--taav-business-sidebar-collapsed-footer-btn-size)] items-center justify-center rounded-[10px] border border-[color:var(--taav-business-sidebar-collapse-border)] bg-[var(--taav-business-sidebar-collapse-bg)] text-[var(--taav-business-sidebar-collapse-text)] focus-visible:outline-none focus-visible:shadow-[var(--taav-focus-ring)]",
                  "aria-label": "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0645\u0646\u0648",
                  title: "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0645\u0646\u0648",
                  onClick: () => setCollapsed(false),
                  children: /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m13 17 5-5-5-5M6 17l5-5-5-5" }) })
                }
              ) }) : null,
              quickActions.map(({ id, ...action }) => /* @__PURE__ */ jsxRuntime.jsx(SidebarIconButton, { ...action, collapsed }, id)),
              onLogout && !quickActions.some((action) => action.id === "logout") ? /* @__PURE__ */ jsxRuntime.jsx(
                SidebarIconButton,
                {
                  label: "\u062E\u0631\u0648\u062C",
                  collapsed,
                  icon: /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", className: "scale-x-[-1]", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" }) }),
                  onClick: onLogout
                }
              ) : null
            ]
          }
        ) : null,
        /* @__PURE__ */ jsxRuntime.jsx("nav", { className: businessSidebarNavScroll(collapsed), "aria-label": "\u0645\u0646\u0648\u06CC \u0627\u0635\u0644\u06CC", children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsx(
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
        collapsed ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "shrink-0", style: variant === "dastranj" ? { background: tenantPanelBackground } : void 0, children: /* @__PURE__ */ jsxRuntime.jsx(TaavTooltip, { content: `${tenantStatusLabel(tenant)} \u2014 ${tenant.name}`, side: "left", children: /* @__PURE__ */ jsxRuntime.jsx(
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
            children: /* @__PURE__ */ jsxRuntime.jsx(
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
        ) }) }) : /* @__PURE__ */ jsxRuntime.jsxs(
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
              /* @__PURE__ */ jsxRuntime.jsx(
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
              /* @__PURE__ */ jsxRuntime.jsx(
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
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: cn(
              "flex shrink-0 items-center justify-between px-3 py-2 text-[10px]",
              variant === "dastranj" ? "bg-[var(--taav-business-sidebar-footer-bg)] text-[var(--taav-business-sidebar-footer-text)]" : "border-t border-[color:var(--taav-border-subtle)] text-[var(--taav-text-muted)]",
              collapsed && "justify-center px-2"
            ),
            children: [
              canToggleCollapse ? /* @__PURE__ */ jsxRuntime.jsx(TaavTooltip, { content: collapsed ? "\u0628\u0627\u0632 \u06A9\u0631\u062F\u0646 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631" : "\u062C\u0645\u0639 \u06A9\u0631\u062F\u0646 \u0633\u0627\u06CC\u062F\u0628\u0627\u0631", side: "left", children: /* @__PURE__ */ jsxRuntime.jsx(
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
                  children: /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: "2", children: collapsed ? /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m13 17 5-5-5-5M6 17l5-5-5-5" }) : /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m11 17-5-5 5-5M18 17l-5-5 5-5" }) })
                }
              ) }) : null,
              !collapsed && version ? /* @__PURE__ */ jsxRuntime.jsx("span", { children: version }) : null
            ]
          }
        )
      ]
    }
  ) }) });
  const contentColumn = /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(businessSidebarContentColumn(), contentClassName), dir: "rtl", children: [
    showNavPath ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative z-[1] shrink-0", children: /* @__PURE__ */ jsxRuntime.jsx(BusinessSidebarNavPath, { items: navPath, className: navPathClassName }) }) : null,
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: businessSidebarContentBody(), children })
  ] });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(businessSidebarShell({ placement }), shellClassName), dir: "ltr", children: [
    placement === "left" ? sidebarRail : null,
    contentColumn,
    placement === "right" ? sidebarRail : null
  ] });
}
function normalizeMobileNumber(value) {
  return value.replace(/\D/g, "").slice(0, 50);
}
function isPotentiallyValidIranMobile(value) {
  if (!value) return true;
  return /^09\d{0,9}$/.test(value) || /^9\d{0,9}$/.test(value);
}
function MobileCardIcon({ icon }) {
  return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex h-[86px] w-[86px] shrink-0 items-center justify-center text-[#174154]", "aria-hidden": "true", children: icon ?? /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 86 86", className: "h-[86px] w-[86px]", role: "img", "aria-label": "\u0646\u0634\u0627\u0646 \u0648\u0627\u062D\u062F\u06CC\u06A9", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M31 14 47 18v51l-16 4Z", fill: "#174154" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M47 18c13 1 20 7 20 16 0 7-5 12-13 15 8-4 13-9 13-15 0-8-7-14-20-16Z", fill: "#18b86b" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M30 74c10 2 19 1 27-3-8 6-18 8-29 5Z", fill: "#18b86b" }),
    /* @__PURE__ */ jsxRuntime.jsx("text", { x: "43", y: "82", textAnchor: "middle", fill: "#18b86b", fontSize: "6", fontFamily: "Tahoma", children: "\u0648\u0627\u062D\u062F\u06CC\u06A9" })
  ] }) });
}
function ClearButton({ onClick }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      type: "button",
      onClick,
      "aria-label": "\u067E\u0627\u06A9 \u06A9\u0631\u062F\u0646 \u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644",
      className: "inline-flex h-8 w-8 items-center justify-center rounded-full text-[#777777] transition-colors hover:bg-[#f1f1f1] hover:text-[#555555] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,143,143,0.24)]",
      children: /* @__PURE__ */ jsxRuntime.jsx(X, { className: "h-[17px] w-[17px]", strokeWidth: 2.3 })
    }
  );
}
function TaavMobileNumberInputCard({
  title = "\u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644",
  description = "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u06A9\u0627\u0631\u0628\u0631 \u0628\u0631\u0627\u06CC \u062B\u0628\u062A \u0648 \u0627\u0631\u062A\u0628\u0627\u0637 \u062F\u0631 \u0641\u0631\u0645\u200C\u0647\u0627\u06CC \u06A9\u0633\u0628\u200C\u0648\u06A9\u0627\u0631\u06CC \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u0645\u06CC\u200C\u0634\u0648\u062F.",
  label = "\u0645\u0648\u0628\u0627\u06CC\u0644 \u06CC\u0627 \u0627\u06CC\u0645\u06CC\u0644",
  placeholder = "",
  value,
  defaultValue = "",
  onValueChange,
  helperText = "\u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u06CC\u0627 \u0627\u06CC\u0645\u06CC\u0644 \u0628\u0631\u0627\u06CC \u062B\u0628\u062A \u06A9\u0627\u0631\u0628\u0631 \u0636\u0631\u0648\u0631\u06CC \u0645\u06CC\u200C\u0628\u0627\u0634\u062F.",
  error,
  required = true,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  loading = false,
  maxLength = 50,
  icon,
  className,
  wrapperClassName,
  inputClassName,
  ...rest
}) {
  const inputId = react.useId();
  const [internalValue, setInternalValue] = react.useState(defaultValue);
  const [isFocused, setIsFocused] = react.useState(false);
  const currentValue = value !== void 0 ? value : internalValue;
  const resolvedValue = react.useMemo(() => normalizeMobileNumber(currentValue ?? ""), [currentValue]);
  const touched = resolvedValue.length > 0;
  const invalidFormat = touched && !isPotentiallyValidIranMobile(resolvedValue);
  const isRequiredError = required && touched && !resolvedValue;
  const showError = Boolean(error) || invalidFormat || isRequiredError;
  const shownError = error ?? (isRequiredError ? "\u0648\u0627\u0631\u062F \u06A9\u0631\u062F\u0646 \u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." : invalidFormat ? "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644 \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." : null);
  const showClear = Boolean(resolvedValue) && !disabled && !readOnly && !loading;
  const counter = `${resolvedValue.length}/${maxLength}`;
  const handleChange = (nextValue) => {
    const sanitized = normalizeMobileNumber(nextValue).slice(0, maxLength);
    if (value === void 0) setInternalValue(sanitized);
    onValueChange?.(sanitized);
  };
  const clearValue = () => {
    if (disabled || readOnly || loading) return;
    if (value === void 0) setInternalValue("");
    onValueChange?.("");
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "article",
    {
      ...rest,
      dir: "rtl",
      "data-taav-mobile-number-input-card": true,
      className: cn("w-full max-w-[690px] overflow-hidden rounded-[18px] border border-[#d5dde2] bg-white px-[16px] pb-[18px] pt-[20px] text-right shadow-[0_3px_10px_rgba(15,23,42,0.04)]", className),
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("grid gap-[10px]", wrapperClassName), children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(MobileCardIcon, { icon: loading ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "h-[24px] w-[24px] rounded-full bg-[rgba(0,143,143,0.18)]" }) : icon }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "sr-only", children: [
          /* @__PURE__ */ jsxRuntime.jsx("h3", { children: title }),
          description ? /* @__PURE__ */ jsxRuntime.jsx("p", { children: description }) : null
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("label", { htmlFor: inputId, dir: "rtl", className: cn("flex w-full items-center justify-start gap-[3px] text-right text-[16px] font-semibold leading-6 transition-colors", isFocused ? "text-[#008f8f]" : "text-[#454545]"), children: [
          label,
          required ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[18px] leading-none text-[#ef4444]", "aria-hidden": "true", children: "*" }) : null
        ] }),
        loading ? /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: "100%", height: 40, radius: "lg" }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("relative", disabled ? "opacity-75" : ""), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("relative flex min-h-[40px] items-center overflow-hidden rounded-[13px] border border-[#666666] bg-white transition-[border-color,box-shadow,background-color] duration-150", "focus-within:border-[color:#008f8f] focus-within:shadow-[0_0_0_3px_rgba(0,143,143,0.10)]", disabled ? "bg-[rgba(248,250,252,0.95)]" : ""), children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "absolute left-1 top-1/2 z-10 inline-flex -translate-y-1/2 items-center gap-0 text-[#777777]", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(Search, { className: "h-[19px] w-[19px]", strokeWidth: 1.6 }) }),
            showClear ? /* @__PURE__ */ jsxRuntime.jsx(ClearButton, { onClick: clearValue }) : null
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              id: inputId,
              value: resolvedValue,
              placeholder,
              disabled,
              readOnly,
              autoFocus,
              required,
              maxLength,
              inputMode: "numeric",
              autoComplete: "tel",
              "aria-label": typeof label === "string" ? label : "\u0634\u0645\u0627\u0631\u0647 \u0645\u0648\u0628\u0627\u06CC\u0644",
              "aria-invalid": showError || void 0,
              onFocus: () => setIsFocused(true),
              onBlur: () => setIsFocused(false),
              onChange: (event) => handleChange(event.target.value),
              className: cn("h-[40px] w-full border-0 bg-transparent px-[12px] py-0 text-right text-[16px] font-normal leading-5 text-[#555555] placeholder:text-[#9a9a9a] focus:outline-none", showClear ? "pl-[76px]" : "pl-[44px]", inputClassName),
              dir: "rtl"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start justify-between gap-4 text-[12px] leading-5", dir: "rtl", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "min-w-0 text-right", children: showError ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[#dc2626]", children: shownError }) : helperText ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[#777777]", children: helperText }) : null }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-left font-normal text-[#777777]", "aria-label": `\u0645\u0648\u0631\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 ${counter}`, children: counter })
        ] })
      ] })
    }
  );
}
var moduleCardRoot = classVarianceAuthority.cva(
  [
    "group/taav-module-card relative flex min-h-0 w-full flex-col overflow-hidden border border-solid",
    "bg-[var(--taav-module-card-surface)] text-[var(--taav-module-card-title)]",
    "border-[color:var(--taav-module-card-border)]",
    "rounded-[15px] shadow-none",
    TAAV_INTERACTION.base
  ],
  {
    variants: {
      size: {
        sm: "min-h-[176px]",
        md: "min-h-[192px]",
        lg: "min-h-[212px]"
      },
      width: {
        auto: "w-full max-w-[460px]",
        full: "w-full max-w-none"
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
var moduleCardHeader = classVarianceAuthority.cva(
  [
    "relative flex shrink-0 items-center justify-between gap-[var(--taav-space-3)]",
    "h-[64px] pr-[20px] pl-[20px]",
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
var moduleCardTitle = classVarianceAuthority.cva("relative z-[1] m-0 min-w-0 flex-1 text-right font-medium leading-[26px] text-[var(--taav-module-card-title)]", {
  variants: {
    size: {
      sm: "text-[length:var(--taav-module-card-title-sm)]",
      md: "text-[18px]",
      lg: "text-[length:var(--taav-module-card-title-lg)]"
    }
  },
  defaultVariants: {
    size: "md"
  }
});
var moduleCardBody = classVarianceAuthority.cva("relative flex w-full flex-1 flex-col", {
  variants: {
    size: {
      sm: "px-[18px] pt-[16px] pb-[18px]",
      md: "px-[20px] pt-[17px] pb-[20px]",
      lg: "px-[24px] pt-[19px] pb-[22px]"
    },
    align: {
      start: "items-start text-right",
      center: "items-center text-center",
      end: "items-end text-right"
    }
  },
  defaultVariants: {
    size: "md",
    align: "center"
  }
});
var moduleCardDescription = classVarianceAuthority.cva(
  "m-0 w-full max-w-[520px] font-normal text-center leading-[22px] text-[var(--taav-module-card-description)]",
  {
    variants: {
      size: {
        sm: "text-[12px]",
        md: "text-[12.5px]",
        lg: "text-[13px]"
      }
    },
    defaultVariants: {
      size: "md"
    }
  }
);
var moduleCardArrow = classVarianceAuthority.cva(
  [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "text-[#334155]",
    "[&_svg]:h-[18px] [&_svg]:w-[18px]"
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
var moduleCardStatusTone = classVarianceAuthority.cva("", {
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
  const content = loading ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(moduleCardHeader({ pattern: "none" }), headerClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "title", width: "55%", contentClassName: "h-5" }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { variant: "custom", width: 16, height: 16, radius: "sm" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(moduleCardBody({ size, align }), bodyClassName), children: /* @__PURE__ */ jsxRuntime.jsx(TaavSkeleton, { lines: 2, size: "sm" }) })
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(moduleCardHeader({ pattern: headerPattern }), headerClassName), children: [
      /* @__PURE__ */ jsxRuntime.jsx("h3", { className: moduleCardTitle({ size }), children: title }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: moduleCardArrow({ disabled }), "aria-hidden": true, children: arrowIcon ?? /* @__PURE__ */ jsxRuntime.jsx(ModuleCardArrowIcon, { direction }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn(moduleCardBody({ size, align }), bodyClassName), children: [
      eyebrow ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mb-1 w-full text-[length:var(--taav-text-xs)] text-[var(--taav-module-card-eyebrow)]", children: eyebrow }) : null,
      statusLabel ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mb-1 w-full text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-module-card-status-label)]", children: statusLabel }) : null,
      icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mb-2 inline-flex text-[var(--taav-module-card-icon)]", children: icon }) : null,
      description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: cn(moduleCardDescription({ size }), align === "center" ? "text-center" : "text-right"), children: description }) : null
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
    return /* @__PURE__ */ jsxRuntime.jsx(
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
    return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", ...sharedProps, disabled, onClick, children: content });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("article", { ...sharedProps, children: content });
}
var moduleCardGridRoot = classVarianceAuthority.cva("grid w-full", {
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
var moduleCardGridItem = classVarianceAuthority.cva("min-w-0", {
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
  return /* @__PURE__ */ jsxRuntime.jsx(
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
  return /* @__PURE__ */ jsxRuntime.jsx(
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
function ArrowIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 18 18", fill: "none", "aria-hidden": "true", className: "h-[18px] w-[18px]", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m10.5 4.5-4 4.5 4 4.5", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function ModuleLinkItem({ item }) {
  const disabled = Boolean(item.disabled);
  const interactive = Boolean((item.href || item.onClick) && !disabled);
  const className = cn(
    "group/module-link flex min-w-0 flex-row items-start gap-4 px-0 py-2 text-right",
    "text-[var(--taav-business-module-link-text)] transition-colors duration-150",
    interactive && "cursor-pointer hover:bg-[var(--taav-business-module-link-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-focus-ring)]",
    disabled && "cursor-not-allowed opacity-50"
  );
  const content = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mt-1 shrink-0 text-[var(--taav-business-module-link-arrow)] transition-transform duration-150 group-hover/module-link:-translate-x-0.5", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsx(ArrowIcon, {}) }),
    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "min-w-0 flex-1", dir: "rtl", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center justify-start gap-2 text-[length:var(--taav-business-module-link-title-size)] font-semibold leading-6", children: [
        item.icon ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 text-[var(--taav-business-module-link-icon)]", "aria-hidden": "true", children: item.icon }) : null,
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: item.title })
      ] }),
      item.description ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mt-1 block text-[length:var(--taav-business-module-link-description-size)] leading-6 text-[var(--taav-business-module-link-description)]", children: item.description }) : null
    ] })
  ] });
  if (item.href && !disabled) {
    return /* @__PURE__ */ jsxRuntime.jsx("a", { href: item.href, dir: "ltr", className, "aria-label": item.ariaLabel, children: content });
  }
  if (interactive) {
    return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", dir: "ltr", className, onClick: item.onClick, "aria-label": item.ariaLabel, children: content });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("div", { dir: "ltr", className, "aria-disabled": disabled || void 0, children: content });
}
function TaavBusinessModuleLinkGrid({ items, columns = 2, gap = "md", className, ...rest }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      ...rest,
      dir: "rtl",
      "data-taav-business-module-link-grid": true,
      "data-columns": columns,
      className: cn(
        "grid w-full",
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
        gap === "sm" ? "gap-x-6 gap-y-3" : gap === "lg" ? "gap-x-16 gap-y-10" : "gap-x-12 gap-y-7",
        className
      ),
      children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsx(ModuleLinkItem, { item }, item.id))
    }
  );
}
function TaavBusinessAccountInfoCard({
  bankName = "\u0631\u0641\u0627\u0647",
  contractLabel = "\u062E\u0633\u0627\u0631\u062A\u200C\u0647\u0627\u06CC \u0642\u0631\u0627\u0631\u062F\u0627\u062F\u06CC",
  logo,
  formattedAccountNumber = "\u06F0\u06F5\u06F9\u06F4 \u06F6\u06F3\u06F1\u06F1 \u06F4\u06F5\u06F0\u06F5 \u06F0\u06F5\u06F1\u06F9",
  accountNumber = "\u06F3\u06F3\u06F5\u06F2\u06F6\u06F5\u06F4\u06F5\u06F1\u06F1\u06F2",
  iban = "IR\u06F3\u06F0 \u06F0\u06F5\u06F5\u06F5 \u06F4\u06F5\u06F4\u06F1 \u06F1\u06F2\u06F5\u06F5 \u06F5\u06F5\u06F5\u06F5 \u06F5\u06F5\u06F5\u06F5 \u06F4\u06F3",
  accountLabel = "\u0634\u0645\u0627\u0631\u0647 \u062D\u0633\u0627\u0628",
  ibanLabel = "\u0634\u0645\u0627\u0631\u0647 \u0634\u0628\u0627",
  displayLabel = "\u0627\u0645\u06A9\u0627\u0646 \u0646\u0645\u0627\u06CC\u0634 \u062F\u0631 \u0642\u0631\u0627\u0631\u062F\u0627\u062F",
  displayDescription = "\u062F\u0631 \u0635\u0648\u0631\u062A \u062A\u0623\u06CC\u06CC\u062F \u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u06CC\u062F \u0627\u0632 \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0627\u06CC\u0646 \u062D\u0633\u0627\u0628 \u0628\u0627\u0646\u06A9\u06CC \u062F\u0631 \u0645\u062A\u0646 \u0642\u0631\u0627\u0631\u062F\u0627\u062F \u0627\u0633\u062A\u0641\u0627\u062F\u0647 \u06A9\u0646\u06CC\u062F.",
  showInContract = false,
  onShowInContractChange,
  ownerLabel = "\u0646\u0627\u0645 \u0635\u0627\u062D\u0628 / \u0635\u0627\u062D\u0628\u0627\u0646 \u062D\u0633\u0627\u0628",
  ownerName = "\u06F1 - \u0646\u0631\u06AF\u0633 \u0633\u067E\u0647\u0631\u06CC",
  ownerNames,
  onMenuClick,
  onRefresh,
  onEdit,
  onDelete,
  disabled = false,
  themeMode = "auto",
  className,
  ...rest
}) {
  const [internalChecked, setInternalChecked] = react.useState(showInContract);
  const [menuOpen, setMenuOpen] = react.useState(false);
  const menuButtonRef = react.useRef(null);
  const menuPanelRef = react.useRef(null);
  const checked = onShowInContractChange ? showInContract : internalChecked;
  const renderedOwnerNames = ownerNames ?? (Array.isArray(ownerName) ? ownerName : [ownerName]);
  react.useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuButtonRef.current?.contains(target) || menuPanelRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, [menuOpen]);
  const handleSwitchChange = (value) => {
    if (!onShowInContractChange) setInternalChecked(value);
    onShowInContractChange?.(value);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "article",
    {
      ...rest,
      dir: "rtl",
      "data-taav-business-account-info-card": true,
      "data-theme-mode": themeMode,
      className: cn(
        "relative w-full max-w-[740px] overflow-hidden rounded-[10px] border border-[var(--taav-business-account-border)] bg-[var(--taav-business-account-surface)] px-[16px] pb-[18px] pt-[12px] text-right shadow-[var(--taav-business-account-shadow)]",
        disabled ? "opacity-60" : "",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("header", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex h-10 w-10 items-center justify-center text-[var(--taav-business-account-brand)]", children: logo ?? /* @__PURE__ */ jsxRuntime.jsx(Landmark, { className: "h-9 w-9", strokeWidth: 1.6 }) }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "m-0 text-[17px] font-bold leading-7 text-[var(--taav-business-account-title)]", children: bankName }),
              /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[13px] leading-6 text-[var(--taav-business-account-contract)]", children: contractLabel })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative flex items-center gap-4 text-[var(--taav-business-account-action)]", children: [
            onRefresh ? /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", "aria-label": "\u0628\u0627\u0632\u0646\u0634\u0627\u0646\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062D\u0633\u0627\u0628", onClick: onRefresh, disabled, className: "inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-40", children: /* @__PURE__ */ jsxRuntime.jsx(RefreshCw, { className: "h-6 w-6" }) }) : null,
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                "aria-label": "\u06AF\u0632\u06CC\u0646\u0647\u200C\u0647\u0627\u06CC \u0628\u06CC\u0634\u062A\u0631",
                "aria-expanded": menuOpen,
                ref: menuButtonRef,
                onClick: () => {
                  setMenuOpen((value) => !value);
                  onMenuClick?.();
                },
                disabled,
                className: "inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-40",
                children: /* @__PURE__ */ jsxRuntime.jsx(EllipsisVertical, { className: "h-6 w-6" })
              }
            ),
            menuOpen ? /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: menuPanelRef, role: "menu", className: "absolute left-0 top-[30px] z-20 w-[104px] overflow-hidden rounded-[14px] border border-[var(--taav-business-account-border)] bg-[var(--taav-business-account-surface)] py-1 text-right shadow-[0_8px_22px_rgba(15,23,42,0.16)]", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", role: "menuitem", onClick: () => {
                setMenuOpen(false);
                onEdit?.();
              }, className: "flex w-full items-center gap-2 px-3 py-3 text-[13px] text-[var(--taav-business-account-title)] hover:bg-[var(--taav-business-account-hover)]", children: [
                /* @__PURE__ */ jsxRuntime.jsx(Pencil, { className: "h-4 w-4" }),
                "\u0648\u06CC\u0631\u0627\u06CC\u0634"
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", role: "menuitem", onClick: () => {
                setMenuOpen(false);
                onDelete?.();
              }, className: "flex w-full items-center gap-2 px-3 py-3 text-[13px] text-[var(--taav-business-account-title)] hover:bg-[var(--taav-business-account-hover)]", children: [
                /* @__PURE__ */ jsxRuntime.jsx(Trash2, { className: "h-4 w-4" }),
                "\u062D\u0630\u0641"
              ] })
            ] }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-[10px] text-center text-[18px] font-semibold tracking-[0.12em] text-[var(--taav-business-account-number)]", children: formattedAccountNumber }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-[10px] flex flex-col gap-0 text-[14px] leading-7 text-[var(--taav-business-account-text)]", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "ltr", className: "flex items-center justify-between gap-6", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "min-w-0 flex-1 text-left", dir: "ltr", children: accountNumber }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-right text-[var(--taav-business-account-link)]", dir: "rtl", children: accountLabel })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "ltr", className: "flex items-center justify-between gap-6", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "min-w-0 flex-1 text-left", dir: "ltr", children: iban }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "shrink-0 text-right text-[var(--taav-business-account-link)]", dir: "rtl", children: ibanLabel })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-[6px] border-t border-[var(--taav-business-account-divider)] pt-[10px]", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "ltr", className: "flex items-start justify-between gap-5", children: [
          /* @__PURE__ */ jsxRuntime.jsx(AccountSwitch, { checked, onChange: handleSwitchChange, disabled }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "rtl", className: "min-w-0 text-right", children: [
            /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "m-0 text-[15px] font-semibold leading-6 text-[var(--taav-business-account-title)]", children: displayLabel }),
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 text-[12px] leading-5 text-[var(--taav-business-account-muted)]", children: displayDescription })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-[12px] text-right text-[14px] font-semibold leading-6 text-[var(--taav-business-account-title)]", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { children: ownerLabel }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { children: renderedOwnerNames.map((name, index) => /* @__PURE__ */ jsxRuntime.jsx("div", { children: name }, index)) })
        ] })
      ]
    }
  );
}
function AccountSwitch({ checked, onChange, disabled }) {
  return /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", role: "switch", "aria-checked": checked, onClick: () => onChange?.(!checked), disabled, className: cn("relative inline-flex h-[16px] w-[34px] shrink-0 items-center rounded-full transition-colors", checked ? "bg-[#9adbd9]" : "bg-[#c8ced7]"), children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("absolute left-0 h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.16)] transition-transform", checked ? "translate-x-0" : "translate-x-[16px]") }) });
}
function TaavBusinessIconChoiceGroup({ items, selected, defaultSelected, onSelectedChange, ariaLabel = "\u0627\u0646\u062A\u062E\u0627\u0628 \u06AF\u0632\u06CC\u0646\u0647", themeMode = "auto", className, ...rest }) {
  const [internalSelected, setInternalSelected] = react.useState(defaultSelected ?? items.find((item) => !item.disabled)?.value ?? "");
  const current = selected ?? internalSelected;
  const columns = Math.min(Math.max(items.length, 1), 4);
  const isScrollable = items.length > 4;
  const select = (value, disabled) => {
    if (disabled) return;
    if (selected === void 0) setInternalSelected(value);
    onSelectedChange?.(value);
  };
  return /* @__PURE__ */ jsxRuntime.jsx("div", { ...rest, dir: "rtl", "data-taav-business-icon-option-selector": true, "data-theme-mode": themeMode, "data-count": items.length, className: cn("w-full overflow-hidden rounded-[10px] border border-[var(--taav-icon-option-card-border)] bg-[var(--taav-icon-option-card-surface)] px-3 pt-2", className), children: /* @__PURE__ */ jsxRuntime.jsx("div", { role: "radiogroup", "aria-label": ariaLabel, className: cn("grid min-w-0 border-b border-[var(--taav-icon-option-divider)]", isScrollable ? "grid-flow-col auto-cols-[minmax(120px,1fr)] overflow-x-auto" : ""), style: isScrollable ? void 0 : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }, children: items.map((item) => {
    const isSelected = current === item.value;
    return /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", role: "radio", "aria-checked": isSelected, "aria-label": typeof item.label === "string" ? item.label : void 0, disabled: item.disabled, onClick: () => select(item.value, item.disabled), className: cn("group relative flex min-h-[112px] min-w-0 flex-col items-center justify-start gap-2 px-2 pt-2 text-center outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--taav-icon-option-focus)]", item.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer", isScrollable ? "w-[120px]" : "w-full"), children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("flex h-12 w-12 items-center justify-center rounded-full border text-[var(--taav-icon-option-icon)] transition-colors", isSelected ? "border-[var(--taav-icon-option-selected)] bg-[var(--taav-icon-option-selected)] text-[var(--taav-icon-option-selected-icon)]" : "border-[var(--taav-icon-option-border)] bg-transparent group-hover:border-[var(--taav-icon-option-hover)] group-hover:text-[var(--taav-icon-option-hover)]"), children: item.icon }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("max-w-full truncate text-[13px] leading-6", isSelected ? "font-bold text-[var(--taav-icon-option-selected-text)]" : "font-normal text-[var(--taav-icon-option-text)]"), children: item.label }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { "aria-hidden": "true", className: cn("absolute inset-x-2 bottom-[-1px] h-[2px] rounded-full transition-colors", isSelected ? "bg-[var(--taav-icon-option-selected)]" : "bg-transparent") })
    ] }, item.value);
  }) }) });
}
function Toggle({ checked, onChange, disabled }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { role: "group", "aria-label": "\u0648\u0636\u0639\u06CC\u062A", className: cn("inline-flex h-9 w-[180px] shrink-0 items-center rounded-full bg-[var(--taav-toggle-card-track)] p-1", disabled && "opacity-50"), children: [
    /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", role: "switch", "aria-checked": checked, disabled, onClick: () => onChange(true), className: cn("h-7 flex-1 rounded-full px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-toggle-card-focus)]", checked ? "bg-[var(--taav-toggle-card-active)] text-white shadow-sm" : "text-[var(--taav-toggle-card-muted)]"), children: "\u0641\u0639\u0627\u0644" }),
    /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", "aria-pressed": !checked, disabled, onClick: () => onChange(false), className: cn("h-7 flex-1 rounded-full px-3 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-toggle-card-focus)]", !checked ? "bg-[var(--taav-toggle-card-active)] text-white shadow-sm" : "text-[var(--taav-toggle-card-muted)]"), children: "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644" })
  ] });
}
function TaavBusinessToggleCard({ title = "\u0639\u0646\u0648\u0627\u0646 \u0648\u0636\u0639\u06CC\u062A", description, checked, defaultChecked = false, onCheckedChange, variant = "simple", icon = /* @__PURE__ */ jsxRuntime.jsx(SlidersHorizontal, { className: "h-6 w-6" }), onAction, actionLabel = "\u0645\u0634\u0627\u0647\u062F\u0647 \u062C\u0632\u0626\u06CC\u0627\u062A", disabled = false, themeMode = "auto", className, ...rest }) {
  const [internalChecked, setInternalChecked] = react.useState(defaultChecked);
  const current = checked ?? internalChecked;
  const update = (value) => {
    if (disabled) return;
    if (checked === void 0) setInternalChecked(value);
    onCheckedChange?.(value);
  };
  const copy = /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-w-0 flex-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "m-0 text-[16px] font-bold leading-7 text-[var(--taav-toggle-card-title)]", children: title }),
    description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mt-0.5 text-[12px] leading-5 text-[var(--taav-toggle-card-description)]", children: description }) : null
  ] });
  const toggle = /* @__PURE__ */ jsxRuntime.jsx(Toggle, { checked: current, onChange: update, disabled });
  return /* @__PURE__ */ jsxRuntime.jsx("article", { ...rest, dir: "rtl", "data-taav-business-toggle-card": true, "data-variant": variant, "data-theme-mode": themeMode, className: cn("w-full rounded-[14px] border border-[var(--taav-toggle-card-border)] bg-[var(--taav-toggle-card-surface)] text-right text-[var(--taav-toggle-card-text)]", variant === "action" ? "px-5 py-3" : "px-4 py-2.5", disabled && "opacity-60", className), children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("flex items-center gap-5", variant === "action" ? "min-h-[62px]" : "min-h-[46px]"), children: variant === "action" ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", "aria-label": actionLabel, onClick: onAction, disabled: disabled || !onAction, className: "order-1 inline-flex h-8 w-8 shrink-0 items-center justify-center text-[var(--taav-toggle-card-action)] transition-colors hover:text-[var(--taav-toggle-card-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--taav-toggle-card-focus)] disabled:opacity-40", children: /* @__PURE__ */ jsxRuntime.jsx(ChevronRight, { className: "h-7 w-7" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "order-2 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--taav-toggle-card-icon-bg)] text-[var(--taav-toggle-card-icon)]", "aria-hidden": "true", children: icon }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "order-3 flex min-w-0 flex-1", children: copy }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "order-4", children: toggle })
  ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "order-1 flex min-w-0 flex-1", children: copy }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "order-2", children: toggle })
  ] }) }) });
}
function digits(value) {
  return value.replace(/[۰-۹]/g, (char) => String("\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9".indexOf(char))).replace(/\D/g, "");
}
function FieldFrame({ id, label, error, required, helperText, children, className }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { "data-taav-bank-input": true, className: cn("min-w-0", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx("label", { htmlFor: id, dir: "rtl", className: cn("mb-1 block w-full text-right text-[14px] font-semibold leading-6", error ? "text-[var(--taav-bank-input-error)]" : "text-[var(--taav-bank-input-label)]"), children: /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "inline-flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: label }),
      required ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[#dc2626]", children: "*" }) : null
    ] }) }),
    children,
    error ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mt-1 text-right text-[12px] leading-5 text-[var(--taav-bank-input-error)]", children: error }) : helperText ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mt-1 text-right text-[12px] leading-5 text-[var(--taav-bank-input-helper)]", children: helperText }) : null
  ] });
}
function BankIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex shrink-0 items-center justify-center text-[var(--taav-bank-input-icon)]", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsx(Landmark, { className: "h-7 w-7", strokeWidth: 1.5 }) });
}
function baseInputClass(invalid) {
  return cn("h-[38px] w-full rounded-[9px] border bg-[var(--taav-bank-input-surface)] px-3 text-left text-[15px] font-normal tracking-[0.04em] text-[var(--taav-bank-input-text)] outline-none transition-colors placeholder:text-[var(--taav-bank-input-helper)] focus:border-[var(--taav-bank-input-focus)] focus:ring-2 focus:ring-[var(--taav-bank-input-focus-ring)]", invalid ? "border-[var(--taav-bank-input-error)]" : "border-[var(--taav-bank-input-border)]");
}
function TaavBankCardNumberInput({ value, defaultValue = "", onValueChange, label = "\u0634\u0645\u0627\u0631\u0647 \u06A9\u0627\u0631\u062A", helperText, error, required = true, disabled, readOnly, autoFocus, className }) {
  const [internal, setInternal] = react.useState(defaultValue);
  const current = value ?? internal;
  const parts = Array.from({ length: 4 }, (_, index) => digits(current).slice(index * 4, index * 4 + 4));
  const refs = react.useRef([]);
  const id = react.useId();
  const invalid = Boolean(error) || current.length > 0 && digits(current).length !== 16;
  const update = (index, next) => {
    const clean = digits(next).slice(0, 4);
    const nextParts = [...parts];
    nextParts[index] = clean;
    const joined = nextParts.join("");
    if (value === void 0) setInternal(joined);
    onValueChange?.(joined);
    if (clean.length === 4 && index < 3) refs.current[index + 1]?.focus();
  };
  const paste = (event) => {
    const clean = digits(event.clipboardData.getData("text")).slice(0, 16);
    if (!clean) return;
    event.preventDefault();
    if (value === void 0) setInternal(clean);
    onValueChange?.(clean);
    refs.current[Math.min(3, Math.floor((clean.length - 1) / 4))]?.focus();
  };
  return /* @__PURE__ */ jsxRuntime.jsx(FieldFrame, { id: `${id}-0`, label, error: invalid ? error ?? "\u0634\u0645\u0627\u0631\u0647 \u06A9\u0627\u0631\u062A \u0628\u0627\u06CC\u062F \u06F1\u06F6 \u0631\u0642\u0645 \u0628\u0627\u0634\u062F." : void 0, helperText, required, className, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "ltr", className: "flex items-end gap-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx(BankIcon, {}),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid min-w-0 flex-1 grid-cols-4 gap-2", children: parts.map((part, index) => /* @__PURE__ */ jsxRuntime.jsx("input", { ref: (node) => {
      refs.current[index] = node;
    }, id: `${id}-${index}`, value: part, onChange: (event) => update(index, event.target.value), onPaste: paste, autoFocus: autoFocus && index === 0, disabled, readOnly, inputMode: "numeric", maxLength: 4, "aria-label": `${label} \u0628\u062E\u0634 ${index + 1}`, className: baseInputClass(invalid) }, index)) })
  ] }) });
}
function TaavShebaNumberInput({ value, defaultValue = "", onValueChange, label = "\u0634\u0645\u0627\u0631\u0647 \u0634\u0628\u0627", helperText, error, required = true, disabled, readOnly, autoFocus, placeholder = "", className }) {
  const [internal, setInternal] = react.useState(defaultValue);
  const current = value ?? internal;
  const clean = current.toUpperCase().replace(/\s/g, "");
  const numeric = digits(clean.replace(/^IR/, ""));
  const invalid = Boolean(error) || clean.length > 0 && numeric.length !== 24;
  const id = react.useId();
  const update = (next) => {
    const normalized = next.toUpperCase().replace(/\s/g, "").replace(/[^IR\d]/g, "").replace(/(?!^)I|(?<!^)R/g, "").slice(0, 26);
    if (value === void 0) setInternal(normalized);
    onValueChange?.(normalized);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(FieldFrame, { id, label, error: invalid ? error ?? "\u0634\u0645\u0627\u0631\u0647 \u0634\u0628\u0627 \u0648\u0627\u0631\u062F\u0634\u062F\u0647 \u0645\u0639\u062A\u0628\u0631 \u0646\u06CC\u0633\u062A." : void 0, helperText, required, className, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { dir: "ltr", className: "flex items-end gap-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx(BankIcon, {}),
    /* @__PURE__ */ jsxRuntime.jsx("input", { id, value: clean, onChange: (event) => update(event.target.value), autoFocus, disabled, readOnly, inputMode: "text", placeholder, "aria-invalid": invalid || void 0, className: cn(baseInputClass(invalid), "flex-1") })
  ] }) });
}
function TaavBankAccountNumberInput({ value, defaultValue = "", onValueChange, label = "\u0634\u0645\u0627\u0631\u0647 \u062D\u0633\u0627\u0628", helperText = "\u06F0 / \u06F2\u06F0", error, required = true, disabled, readOnly, className, ...props }) {
  const [internal, setInternal] = react.useState(defaultValue);
  const current = value ?? internal;
  const id = react.useId();
  const update = (next) => {
    const normalized = digits(next).slice(0, 20);
    if (value === void 0) setInternal(normalized);
    onValueChange?.(normalized);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(FieldFrame, { id, label, error, helperText, required, className: cn("md:col-span-2", className), children: /* @__PURE__ */ jsxRuntime.jsx("input", { ...props, id, value: current, onChange: (event) => update(event.target.value), disabled, readOnly, inputMode: "numeric", "aria-invalid": Boolean(error) || void 0, className: baseInputClass(Boolean(error)) }) });
}
function TaavBankAccountInfoInputCard({
  title = "\u0648\u0631\u0648\u062F\u06CC \u0627\u0637\u0644\u0627\u0639\u0627\u062A \u062D\u0633\u0627\u0628 \u0628\u0627\u0646\u06A9\u06CC",
  description = "\u0634\u0645\u0627\u0631\u0647 \u06A9\u0627\u0631\u062A\u060C \u0634\u0645\u0627\u0631\u0647 \u0634\u0628\u0627 \u0648 \u0634\u0645\u0627\u0631\u0647 \u062D\u0633\u0627\u0628 \u0628\u0627\u0646\u06A9\u06CC \u0631\u0627 \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F.",
  cardNumber,
  shebaNumber,
  accountNumber,
  variant = "compact",
  themeMode = "auto",
  className,
  ...rest
}) {
  const [card, setCard] = react.useState(cardNumber?.value ?? cardNumber?.defaultValue ?? "");
  const [sheba, setSheba] = react.useState(shebaNumber?.value ?? shebaNumber?.defaultValue ?? "");
  const [account, setAccount] = react.useState(accountNumber?.value ?? accountNumber?.defaultValue ?? "");
  return /* @__PURE__ */ jsxRuntime.jsxs("article", { ...rest, dir: "rtl", "data-taav-bank-account-info-input-card": true, "data-variant": variant, "data-theme-mode": themeMode, className: cn("w-full max-w-[700px] rounded-[18px] border border-[var(--taav-bank-input-card-border)] bg-[var(--taav-bank-input-card-surface)] px-5 py-5 text-right shadow-[var(--taav-bank-input-card-shadow)]", className), children: [
    variant === "showcase" ? /* @__PURE__ */ jsxRuntime.jsxs("header", { className: "mb-5", children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "m-0 text-[20px] font-bold leading-8 text-[var(--taav-bank-input-card-title)]", children: title }),
      description ? /* @__PURE__ */ jsxRuntime.jsx("p", { className: "m-0 mt-1 text-[13px] leading-6 text-[var(--taav-bank-input-card-description)]", children: description }) : null
    ] }) : null,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-x-5 gap-y-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(TaavBankCardNumberInput, { ...cardNumber, value: cardNumber?.value !== void 0 ? cardNumber.value : card, onValueChange: (next) => {
        setCard(next);
        cardNumber?.onValueChange?.(next);
      } }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavShebaNumberInput, { ...shebaNumber, value: shebaNumber?.value !== void 0 ? shebaNumber.value : sheba, onValueChange: (next) => {
        setSheba(next);
        shebaNumber?.onValueChange?.(next);
      } }),
      /* @__PURE__ */ jsxRuntime.jsx(TaavBankAccountNumberInput, { ...accountNumber, value: accountNumber?.value !== void 0 ? accountNumber.value : account, onValueChange: (next) => {
        setAccount(next);
        accountNumber?.onValueChange?.(next);
      }, className: "md:col-span-2" })
    ] })
  ] });
}
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/building-2.js:
lucide-react/dist/esm/icons/check.js:
lucide-react/dist/esm/icons/chevron-right.js:
lucide-react/dist/esm/icons/circle-dot.js:
lucide-react/dist/esm/icons/earth.js:
lucide-react/dist/esm/icons/ellipsis-vertical.js:
lucide-react/dist/esm/icons/info.js:
lucide-react/dist/esm/icons/landmark.js:
lucide-react/dist/esm/icons/mail.js:
lucide-react/dist/esm/icons/map-pinned.js:
lucide-react/dist/esm/icons/pencil.js:
lucide-react/dist/esm/icons/phone-call.js:
lucide-react/dist/esm/icons/phone.js:
lucide-react/dist/esm/icons/plus.js:
lucide-react/dist/esm/icons/printer.js:
lucide-react/dist/esm/icons/refresh-cw.js:
lucide-react/dist/esm/icons/search.js:
lucide-react/dist/esm/icons/sliders-horizontal.js:
lucide-react/dist/esm/icons/smartphone.js:
lucide-react/dist/esm/icons/square-pen.js:
lucide-react/dist/esm/icons/trash-2.js:
lucide-react/dist/esm/icons/user-round.js:
lucide-react/dist/esm/icons/users-round.js:
lucide-react/dist/esm/icons/x.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.487.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

exports.DEFAULT_BUSINESS_NAV_PATH = DEFAULT_BUSINESS_NAV_PATH;
exports.DEFAULT_BUSINESS_SIDEBAR_NAV_PATH = DEFAULT_BUSINESS_SIDEBAR_NAV_PATH;
exports.TAAV_BUTTON_HEIGHT = TAAV_BUTTON_HEIGHT;
exports.TAAV_DURATION = TAAV_DURATION;
exports.TAAV_RADIUS = TAAV_RADIUS;
exports.TAAV_SHADOW = TAAV_SHADOW;
exports.TAAV_SPACING = TAAV_SPACING;
exports.TAAV_TOKEN_CATALOG = TAAV_TOKEN_CATALOG;
exports.TAAV_TOKEN_SECTIONS = TAAV_TOKEN_SECTIONS;
exports.TAAV_TONE_LABELS = TAAV_TONE_LABELS;
exports.TaavActivationSwitch = TaavActivationSwitch;
exports.TaavBankAccountInfoInputCard = TaavBankAccountInfoInputCard;
exports.TaavBankAccountNumberInput = TaavBankAccountNumberInput;
exports.TaavBankCardNumberInput = TaavBankCardNumberInput;
exports.TaavBusinessAccountInfoCard = TaavBusinessAccountInfoCard;
exports.TaavBusinessFormDialogCard = TaavBusinessFormDialogCard;
exports.TaavBusinessHeaderCard = TaavBusinessHeaderCard;
exports.TaavBusinessIconChoiceGroup = TaavBusinessIconChoiceGroup;
exports.TaavBusinessIntroCard = TaavBusinessIntroCard;
exports.TaavBusinessModuleLinkGrid = TaavBusinessModuleLinkGrid;
exports.TaavBusinessOwnerCard = TaavBusinessOwnerCard;
exports.TaavBusinessOwnershipCard = TaavBusinessOwnershipCard;
exports.TaavBusinessProfileSummaryCard = TaavBusinessProfileSummaryCard;
exports.TaavBusinessRecommendationCard = TaavBusinessRecommendationCard;
exports.TaavBusinessSectionToolbarCard = TaavBusinessSectionToolbarCard;
exports.TaavBusinessSidebar = TaavBusinessSidebar;
exports.TaavBusinessToggleCard = TaavBusinessToggleCard;
exports.TaavCommunicationChannels = TaavCommunicationChannels;
exports.TaavCommunicationChannelsCard = TaavCommunicationChannelsCard;
exports.TaavDetailsLink = TaavDetailsLink;
exports.TaavFormStepIndicator = TaavFormStepIndicator;
exports.TaavMobileNumberInputCard = TaavMobileNumberInputCard;
exports.TaavModuleCard = TaavModuleCard;
exports.TaavModuleCardGrid = TaavModuleCardGrid;
exports.TaavModuleCardGridItem = TaavModuleCardGridItem;
exports.TaavShebaNumberInput = TaavShebaNumberInput;
exports.cn = cn;
//# sourceMappingURL=taav-business.js.map
//# sourceMappingURL=taav-business.js.map