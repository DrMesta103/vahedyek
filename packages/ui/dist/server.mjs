import Link from 'next/link';
import { jsxs, jsx } from 'react/jsx-runtime';

// src/components/DastranjPrimitives.tsx
function PageIntro({ title, description, action }) {
  return /* @__PURE__ */ jsxs("section", { className: "page-intro", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { children: title }),
      /* @__PURE__ */ jsx("p", { children: description })
    ] }),
    action
  ] });
}
function PrimaryLink({ href, children }) {
  return /* @__PURE__ */ jsx(Link, { href, className: "primary-link", children });
}
function EmptyState({ title, description, action }) {
  return /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
    /* @__PURE__ */ jsx("h3", { children: title }),
    /* @__PURE__ */ jsx("p", { children: description }),
    action
  ] });
}
function StatGrid({ items }) {
  return /* @__PURE__ */ jsx("div", { className: "stat-grid", children: items.map((item) => /* @__PURE__ */ jsxs("article", { className: "stat-card", children: [
    /* @__PURE__ */ jsx("span", { children: item.label }),
    /* @__PURE__ */ jsx("strong", { children: item.value })
  ] }, item.label)) });
}
function DataTable({ columns, rows }) {
  return /* @__PURE__ */ jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxs("table", { className: "data-table", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((column) => /* @__PURE__ */ jsx("th", { children: column }, column)) }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((row, rowIndex) => /* @__PURE__ */ jsx("tr", { children: row.map((cell, cellIndex) => /* @__PURE__ */ jsx("td", { children: cell }, cellIndex)) }, rowIndex)) })
  ] }) });
}
function FormCard({ title, description, children }) {
  return /* @__PURE__ */ jsxs("section", { className: "form-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "form-card-header", children: [
      /* @__PURE__ */ jsx("h2", { children: title }),
      description ? /* @__PURE__ */ jsx("p", { children: description }) : null
    ] }),
    children
  ] });
}

export { DataTable, EmptyState, FormCard, PageIntro, PrimaryLink, StatGrid };
//# sourceMappingURL=server.mjs.map
//# sourceMappingURL=server.mjs.map