/** Typography + chrome shared by contract-rules / loan-settings panels (CSS theme variables). */

export const RULE_PANEL_FIELD_FOCUS =
  'focus:!border-[color:var(--theme-action-border)] focus:!ring-2 focus:!ring-[color:var(--theme-action-bg)]/20';

/** Single-line text fields without a leading suffix chip. */
export const RULE_PANEL_TEXT_INPUT_CLASSNAME = [
  '!h-14 w-full !rounded-xl !border-[color:var(--border-color)] !bg-[color:var(--surface)] !px-4 !py-0 !text-right',
  '!text-lg !font-bold !text-[color:var(--text-strong)] !shadow-none !outline-none transition',
  RULE_PANEL_FIELD_FOCUS,
].join(' ');

/** Native `<select>` in the same panels. */
export const RULE_PANEL_SELECT_CLASSNAME =
  'h-14 w-full rounded-xl border border-[color:var(--border-color)] bg-[color:var(--surface)] px-4 py-0 text-right text-lg font-bold text-[color:var(--text-strong)] outline-none transition focus:border-[color:var(--theme-action-border)] focus:ring-2 focus:ring-[color:var(--theme-action-bg)]/20';

/**
 * Numeric / formatted amount fields; optional gutter on the physical left (`left-4`) for `%` / `تومان` chip text.
 */
export function rulePanelNumericInputClassName(hasLeadingSuffixLabel: boolean): string {
  return [
    '!h-14 w-full !rounded-xl !border-[color:var(--border-color)] !bg-[color:var(--surface)]',
    hasLeadingSuffixLabel ? '!pl-20 !pr-4' : '!px-4',
    '!text-right !text-lg !font-bold !text-[color:var(--text-strong)] !shadow-none !outline-none transition',
    RULE_PANEL_FIELD_FOCUS,
  ].join(' ');
}
