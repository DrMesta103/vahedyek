import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  deriveAccentShades,
  deriveLeadings,
  HEADER_CARD_CSS_VARS,
  normalizeHeaderCardTokens,
  toCssPixel,
  type HeaderCardTokenValues,
} from '@/lib/header-card-tokens';

function resolveTokensFile() {
  return path.resolve(process.cwd(), '../../packages/ui/src/tokens/taav-tokens.css');
}

function replaceCssVar(source: string, cssVar: string, value: string) {
  const pattern = new RegExp(`(${cssVar}\\s*:\\s*)[^;]+;`);
  if (!pattern.test(source)) {
    throw new Error(`CSS variable not found: ${cssVar}`);
  }
  return source.replace(pattern, `$1${value};`);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<HeaderCardTokenValues>;
    const values = normalizeHeaderCardTokens(body);
    const leadings = deriveLeadings(values);
    const accentShades = deriveAccentShades(values.accent);
    const tokensPath = resolveTokensFile();
    let css = await fs.readFile(tokensPath, 'utf8');

    const replacements: Array<[string, string]> = [
      [HEADER_CARD_CSS_VARS.radius, toCssPixel(values.radius)],
      [HEADER_CARD_CSS_VARS.radiusCompact, toCssPixel(values.radiusCompact)],
      [HEADER_CARD_CSS_VARS.iconRadius, toCssPixel(values.iconRadius)],
      [HEADER_CARD_CSS_VARS.actionRadius, toCssPixel(values.actionRadius)],
      [HEADER_CARD_CSS_VARS.titleSize, toCssPixel(values.titleSize)],
      [HEADER_CARD_CSS_VARS.titleLeading, toCssPixel(leadings.titleLeading)],
      [HEADER_CARD_CSS_VARS.titleLeadingTight, toCssPixel(leadings.titleLeadingTight)],
      [HEADER_CARD_CSS_VARS.descSize, toCssPixel(values.descSize)],
      [HEADER_CARD_CSS_VARS.descLeading, toCssPixel(leadings.descLeading)],
      [HEADER_CARD_CSS_VARS.descLeadingTight, toCssPixel(leadings.descLeadingTight)],
      [HEADER_CARD_CSS_VARS.actionSize, toCssPixel(values.actionSize)],
      [HEADER_CARD_CSS_VARS.searchSize, toCssPixel(values.searchSize)],
      [HEADER_CARD_CSS_VARS.surface, values.surface],
      [HEADER_CARD_CSS_VARS.surfaceHover, values.surfaceHover],
      [HEADER_CARD_CSS_VARS.border, values.border],
      [HEADER_CARD_CSS_VARS.titleColor, values.titleColor],
      [HEADER_CARD_CSS_VARS.descriptionColor, values.descriptionColor],
      [HEADER_CARD_CSS_VARS.accent, values.accent],
      [HEADER_CARD_CSS_VARS.iconBg, values.iconBg],
      [HEADER_CARD_CSS_VARS.actionText, values.actionText],
      [HEADER_CARD_CSS_VARS.actionHover, accentShades.actionHover],
      [HEADER_CARD_CSS_VARS.actionActive, accentShades.actionActive],
      [HEADER_CARD_CSS_VARS.actionFocus, accentShades.actionFocus],
      [HEADER_CARD_CSS_VARS.searchBg, values.searchBg],
      [HEADER_CARD_CSS_VARS.searchText, values.searchText],
    ];

    for (const [cssVar, value] of replacements) {
      css = replaceCssVar(css, cssVar, value);
    }

    await fs.writeFile(tokensPath, css, 'utf8');

    return NextResponse.json({ ok: true, values, leadings, accentShades });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
