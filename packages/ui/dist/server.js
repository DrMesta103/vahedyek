'use strict';

var Link = require('next/link');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Link__default = /*#__PURE__*/_interopDefault(Link);

// src/components/DastranjPrimitives.tsx
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

exports.DataTable = DataTable;
exports.EmptyState = EmptyState;
exports.FormCard = FormCard;
exports.PageIntro = PageIntro;
exports.PrimaryLink = PrimaryLink;
exports.StatGrid = StatGrid;
//# sourceMappingURL=server.js.map
//# sourceMappingURL=server.js.map