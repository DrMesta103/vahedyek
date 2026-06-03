'use strict';

var Link = require('next/link');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Link__default = /*#__PURE__*/_interopDefault(Link);

// src/components/DastranjPrimitives.tsx
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

exports.DataTable = DataTable;
exports.EmptyState = EmptyState;
exports.FormCard = FormCard;
exports.PageIntro = PageIntro;
exports.PrimaryLink = PrimaryLink;
exports.StatGrid = StatGrid;
//# sourceMappingURL=server.js.map
//# sourceMappingURL=server.js.map