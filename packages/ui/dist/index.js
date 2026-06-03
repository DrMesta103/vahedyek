'use strict';

var React = require('react');
var jsxRuntime = require('react/jsx-runtime');
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

var React__namespace = /*#__PURE__*/_interopNamespace(React);
var dynamic__default = /*#__PURE__*/_interopDefault(dynamic);
var persian__default = /*#__PURE__*/_interopDefault(persian);
var persian_fa__default = /*#__PURE__*/_interopDefault(persian_fa);
var Link__default = /*#__PURE__*/_interopDefault(Link);

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
function PageIntro({ title, description, action }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("section", { className: "page-intro", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("h2", { children: title }),
      /* @__PURE__ */ jsxRuntime.jsx("p", { children: description })
    ] }),
    action
  ] });
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
    /* @__PURE__ */ jsxRuntime.jsx("strong", { children: item.value })
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
function cn(...classes) {
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
      className: cn(
        "group relative flex min-w-[168px] flex-1 flex-col items-center justify-center gap-3 px-3 py-5 text-center transition max-sm:min-w-[132px] max-sm:gap-2 max-sm:px-2 max-sm:py-4",
        active ? "text-[color:var(--text-strong)]" : "text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]"
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            className: cn(
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
            className: cn(
              "absolute inset-x-4 bottom-0 h-[2px] transition",
              active ? "bg-[color:var(--theme-action-border)]" : "bg-transparent group-hover:bg-[color:var(--border-color)]"
            )
          }
        )
      ]
    }
  );
}
function cn2(...classes) {
  return classes.filter(Boolean).join(" ");
}
function TagPills({
  options,
  value,
  onChange,
  wrap = true,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn2("flex gap-2", wrap ? "flex-wrap" : "flex-nowrap overflow-x-auto pb-1", className), children: options.map((option) => {
    const active = value === option.value;
    return /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(option.value),
        "data-tag-pill": "true",
        "data-active": active ? "true" : "false",
        className: cn2(
          "inline-flex h-[36px] items-center rounded-full border px-4 text-[12px] font-bold whitespace-nowrap transition-all",
          active ? "border-[color:var(--theme-action-border)] bg-[color:var(--theme-action-bg)] text-[color:var(--theme-action-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25)]" : "border-[color:var(--border-color)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
        ),
        children: option.label
      },
      option.value
    );
  }) });
}
function cn3(...classes) {
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn3("space-y-2", invalid && "rounded-xl border border-rose-300 bg-rose-50/40 p-3", className), children: [
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
          className: cn3(
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
              className: cn3(
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
function cn4(...classes) {
  return classes.filter(Boolean).join(" ");
}
function ShareModePills({
  label = "\u0646\u0648\u0639 \u0633\u0647\u0645",
  value,
  onChange,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn4("flex items-center gap-3", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[12px] font-bold text-slate-700", children: label }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex overflow-hidden rounded-full border border-slate-200 bg-white", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange("percent"),
          className: cn4(
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
          className: cn4(
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
function cn5(...classes) {
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
      className: cn5("flex gap-2 max-sm:max-w-full max-sm:overflow-x-auto max-sm:pb-1", wrap ? "flex-wrap" : "flex-nowrap overflow-x-auto pb-1", className),
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
            className: cn5(
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
function cn6(...classes) {
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
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn6("space-y-2", invalid && "rounded-xl border border-rose-300 bg-rose-50/40 p-2", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx(LabelAs, { className: cn6("text-[12px] font-bold text-[color:var(--text-strong)]", labelClassName), children: label }),
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
exports.TagPills = TagPills;
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