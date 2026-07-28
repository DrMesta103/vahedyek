export const HEADER_CARD_TOKEN_STORAGE_KEY = 'taav-business-header-card-tokens';

export const HEADER_CARD_TOKEN_DEFAULTS = {
  radius: 16,
  radiusCompact: 14,
  iconRadius: 16,
  actionRadius: 14,
  titleSize: 18,
  descSize: 12.5,
  actionSize: 14,
  searchSize: 12.5,
  surface: '#ffffff',
  surfaceHover: '#fafcfd',
  border: 'rgba(145, 170, 190, 0.5)',
  titleColor: '#30343b',
  descriptionColor: '#5f6f80',
  accent: '#008f8f',
  iconBg: 'rgba(0, 143, 143, 0.1)',
  actionText: '#ffffff',
  searchBg: '#dfe4ea',
  searchText: '#64748b',
} as const;

export type HeaderCardTokenValues = {
  radius: number;
  radiusCompact: number;
  iconRadius: number;
  actionRadius: number;
  titleSize: number;
  descSize: number;
  actionSize: number;
  searchSize: number;
  surface: string;
  surfaceHover: string;
  border: string;
  titleColor: string;
  descriptionColor: string;
  accent: string;
  iconBg: string;
  actionText: string;
  searchBg: string;
  searchText: string;
};

export type HeaderCardNumericTokenKey =
  | 'radius'
  | 'radiusCompact'
  | 'iconRadius'
  | 'actionRadius'
  | 'titleSize'
  | 'descSize'
  | 'actionSize'
  | 'searchSize';

export type HeaderCardColorTokenKey =
  | 'surface'
  | 'surfaceHover'
  | 'border'
  | 'titleColor'
  | 'descriptionColor'
  | 'accent'
  | 'iconBg'
  | 'actionText'
  | 'searchBg'
  | 'searchText';

export const HEADER_CARD_CSS_VARS = {
  radius: '--taav-business-header-card-radius',
  radiusCompact: '--taav-business-header-card-radius-compact',
  iconRadius: '--taav-business-header-card-icon-radius',
  actionRadius: '--taav-business-header-card-action-radius',
  titleSize: '--taav-business-header-card-title-size',
  titleLeading: '--taav-business-header-card-title-leading',
  titleLeadingTight: '--taav-business-header-card-title-leading-tight',
  descSize: '--taav-business-header-card-desc-size',
  descLeading: '--taav-business-header-card-desc-leading',
  descLeadingTight: '--taav-business-header-card-desc-leading-tight',
  actionSize: '--taav-business-header-card-action-size',
  searchSize: '--taav-business-header-card-search-size',
  surface: '--taav-business-header-card-surface',
  surfaceHover: '--taav-business-header-card-surface-hover',
  border: '--taav-business-header-card-border',
  titleColor: '--taav-business-header-card-title-color',
  descriptionColor: '--taav-business-header-card-description-color',
  accent: '--taav-business-header-card-accent',
  iconBg: '--taav-business-header-card-icon-bg',
  actionText: '--taav-business-header-card-action-text',
  actionHover: '--taav-business-header-card-action-hover',
  actionActive: '--taav-business-header-card-action-active',
  actionFocus: '--taav-business-header-card-action-focus',
  searchBg: '--taav-business-header-card-search-bg',
  searchText: '--taav-business-header-card-search-text',
} as const;

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function parseHexColor(input: string): { r: number; g: number; b: number } | null {
  const value = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return {
      r: Number.parseInt(value[0] + value[0], 16),
      g: Number.parseInt(value[1] + value[1], 16),
      b: Number.parseInt(value[2] + value[2], 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) {
    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16),
    };
  }
  return null;
}

function mixWithBlack(hex: string, amount: number) {
  const rgb = parseHexColor(hex);
  if (!rgb) return hex;
  const mix = (channel: number) => Math.round(channel * (1 - amount));
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
  return `#${toHex(mix(rgb.r))}${toHex(mix(rgb.g))}${toHex(mix(rgb.b))}`;
}

export function deriveLeadings(values: Pick<HeaderCardTokenValues, 'titleSize' | 'descSize'>) {
  return {
    titleLeading: round1(values.titleSize * (26 / 18)),
    titleLeadingTight: round1(values.titleSize * (22 / 18)),
    descLeading: round1(values.descSize * (22 / 12.5)),
    descLeadingTight: round1(values.descSize * (20 / 12.5)),
  };
}

export function deriveAccentShades(accent: string) {
  return {
    actionHover: mixWithBlack(accent, 0.12),
    actionActive: mixWithBlack(accent, 0.22),
    actionFocus: `color-mix(in srgb, ${accent} 22%, transparent)`,
  };
}

export function toCssPixel(value: number) {
  return `${round1(value)}px`;
}

export function normalizeHeaderCardTokens(input: Partial<HeaderCardTokenValues> | null | undefined): HeaderCardTokenValues {
  return {
    radius: Number(input?.radius ?? HEADER_CARD_TOKEN_DEFAULTS.radius),
    radiusCompact: Number(input?.radiusCompact ?? HEADER_CARD_TOKEN_DEFAULTS.radiusCompact),
    iconRadius: Number(input?.iconRadius ?? HEADER_CARD_TOKEN_DEFAULTS.iconRadius),
    actionRadius: Number(input?.actionRadius ?? HEADER_CARD_TOKEN_DEFAULTS.actionRadius),
    titleSize: Number(input?.titleSize ?? HEADER_CARD_TOKEN_DEFAULTS.titleSize),
    descSize: Number(input?.descSize ?? HEADER_CARD_TOKEN_DEFAULTS.descSize),
    actionSize: Number(input?.actionSize ?? HEADER_CARD_TOKEN_DEFAULTS.actionSize),
    searchSize: Number(input?.searchSize ?? HEADER_CARD_TOKEN_DEFAULTS.searchSize),
    surface: String(input?.surface ?? HEADER_CARD_TOKEN_DEFAULTS.surface),
    surfaceHover: String(input?.surfaceHover ?? HEADER_CARD_TOKEN_DEFAULTS.surfaceHover),
    border: String(input?.border ?? HEADER_CARD_TOKEN_DEFAULTS.border),
    titleColor: String(input?.titleColor ?? HEADER_CARD_TOKEN_DEFAULTS.titleColor),
    descriptionColor: String(input?.descriptionColor ?? HEADER_CARD_TOKEN_DEFAULTS.descriptionColor),
    accent: String(input?.accent ?? HEADER_CARD_TOKEN_DEFAULTS.accent),
    iconBg: String(input?.iconBg ?? HEADER_CARD_TOKEN_DEFAULTS.iconBg),
    actionText: String(input?.actionText ?? HEADER_CARD_TOKEN_DEFAULTS.actionText),
    searchBg: String(input?.searchBg ?? HEADER_CARD_TOKEN_DEFAULTS.searchBg),
    searchText: String(input?.searchText ?? HEADER_CARD_TOKEN_DEFAULTS.searchText),
  };
}

export function applyHeaderCardTokens(values: HeaderCardTokenValues, target: HTMLElement = document.documentElement) {
  const leadings = deriveLeadings(values);
  const accentShades = deriveAccentShades(values.accent);

  target.style.setProperty(HEADER_CARD_CSS_VARS.radius, toCssPixel(values.radius));
  target.style.setProperty(HEADER_CARD_CSS_VARS.radiusCompact, toCssPixel(values.radiusCompact));
  target.style.setProperty(HEADER_CARD_CSS_VARS.iconRadius, toCssPixel(values.iconRadius));
  target.style.setProperty(HEADER_CARD_CSS_VARS.actionRadius, toCssPixel(values.actionRadius));
  target.style.setProperty(HEADER_CARD_CSS_VARS.titleSize, toCssPixel(values.titleSize));
  target.style.setProperty(HEADER_CARD_CSS_VARS.titleLeading, toCssPixel(leadings.titleLeading));
  target.style.setProperty(HEADER_CARD_CSS_VARS.titleLeadingTight, toCssPixel(leadings.titleLeadingTight));
  target.style.setProperty(HEADER_CARD_CSS_VARS.descSize, toCssPixel(values.descSize));
  target.style.setProperty(HEADER_CARD_CSS_VARS.descLeading, toCssPixel(leadings.descLeading));
  target.style.setProperty(HEADER_CARD_CSS_VARS.descLeadingTight, toCssPixel(leadings.descLeadingTight));
  target.style.setProperty(HEADER_CARD_CSS_VARS.actionSize, toCssPixel(values.actionSize));
  target.style.setProperty(HEADER_CARD_CSS_VARS.searchSize, toCssPixel(values.searchSize));

  target.style.setProperty(HEADER_CARD_CSS_VARS.surface, values.surface);
  target.style.setProperty(HEADER_CARD_CSS_VARS.surfaceHover, values.surfaceHover);
  target.style.setProperty(HEADER_CARD_CSS_VARS.border, values.border);
  target.style.setProperty(HEADER_CARD_CSS_VARS.titleColor, values.titleColor);
  target.style.setProperty(HEADER_CARD_CSS_VARS.descriptionColor, values.descriptionColor);
  target.style.setProperty(HEADER_CARD_CSS_VARS.accent, values.accent);
  target.style.setProperty(HEADER_CARD_CSS_VARS.iconBg, values.iconBg);
  target.style.setProperty(HEADER_CARD_CSS_VARS.actionText, values.actionText);
  target.style.setProperty(HEADER_CARD_CSS_VARS.actionHover, accentShades.actionHover);
  target.style.setProperty(HEADER_CARD_CSS_VARS.actionActive, accentShades.actionActive);
  target.style.setProperty(HEADER_CARD_CSS_VARS.actionFocus, accentShades.actionFocus);
  target.style.setProperty(HEADER_CARD_CSS_VARS.searchBg, values.searchBg);
  target.style.setProperty(HEADER_CARD_CSS_VARS.searchText, values.searchText);
}

export function clearHeaderCardTokenOverrides(target: HTMLElement = document.documentElement) {
  Object.values(HEADER_CARD_CSS_VARS).forEach((cssVar) => {
    target.style.removeProperty(cssVar);
  });
}

export function readStoredHeaderCardTokens(): HeaderCardTokenValues | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(HEADER_CARD_TOKEN_STORAGE_KEY);
    if (!raw) return null;
    return normalizeHeaderCardTokens(JSON.parse(raw) as Partial<HeaderCardTokenValues>);
  } catch {
    return null;
  }
}

export function storeHeaderCardTokens(values: HeaderCardTokenValues) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HEADER_CARD_TOKEN_STORAGE_KEY, JSON.stringify(values));
}

export function clearStoredHeaderCardTokens() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(HEADER_CARD_TOKEN_STORAGE_KEY);
}

export function colorInputValue(value: string) {
  const rgb = parseHexColor(value);
  if (!rgb) return '#000000';
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function buildTokenCssSnippet(values: HeaderCardTokenValues) {
  const leadings = deriveLeadings(values);
  const accentShades = deriveAccentShades(values.accent);
  return [
    `${HEADER_CARD_CSS_VARS.radius}: ${toCssPixel(values.radius)};`,
    `${HEADER_CARD_CSS_VARS.radiusCompact}: ${toCssPixel(values.radiusCompact)};`,
    `${HEADER_CARD_CSS_VARS.iconRadius}: ${toCssPixel(values.iconRadius)};`,
    `${HEADER_CARD_CSS_VARS.actionRadius}: ${toCssPixel(values.actionRadius)};`,
    `${HEADER_CARD_CSS_VARS.titleSize}: ${toCssPixel(values.titleSize)};`,
    `${HEADER_CARD_CSS_VARS.titleLeading}: ${toCssPixel(leadings.titleLeading)};`,
    `${HEADER_CARD_CSS_VARS.titleLeadingTight}: ${toCssPixel(leadings.titleLeadingTight)};`,
    `${HEADER_CARD_CSS_VARS.descSize}: ${toCssPixel(values.descSize)};`,
    `${HEADER_CARD_CSS_VARS.descLeading}: ${toCssPixel(leadings.descLeading)};`,
    `${HEADER_CARD_CSS_VARS.descLeadingTight}: ${toCssPixel(leadings.descLeadingTight)};`,
    `${HEADER_CARD_CSS_VARS.actionSize}: ${toCssPixel(values.actionSize)};`,
    `${HEADER_CARD_CSS_VARS.searchSize}: ${toCssPixel(values.searchSize)};`,
    `${HEADER_CARD_CSS_VARS.surface}: ${values.surface};`,
    `${HEADER_CARD_CSS_VARS.surfaceHover}: ${values.surfaceHover};`,
    `${HEADER_CARD_CSS_VARS.border}: ${values.border};`,
    `${HEADER_CARD_CSS_VARS.titleColor}: ${values.titleColor};`,
    `${HEADER_CARD_CSS_VARS.descriptionColor}: ${values.descriptionColor};`,
    `${HEADER_CARD_CSS_VARS.accent}: ${values.accent};`,
    `${HEADER_CARD_CSS_VARS.iconBg}: ${values.iconBg};`,
    `${HEADER_CARD_CSS_VARS.actionText}: ${values.actionText};`,
    `${HEADER_CARD_CSS_VARS.actionHover}: ${accentShades.actionHover};`,
    `${HEADER_CARD_CSS_VARS.actionActive}: ${accentShades.actionActive};`,
    `${HEADER_CARD_CSS_VARS.actionFocus}: ${accentShades.actionFocus};`,
    `${HEADER_CARD_CSS_VARS.searchBg}: ${values.searchBg};`,
    `${HEADER_CARD_CSS_VARS.searchText}: ${values.searchText};`,
  ].join('\n');
}
