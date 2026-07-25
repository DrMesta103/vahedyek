'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export type ContractDraftReturnContext = {
  href: string;
  draftId: string;
  tab: 'natural_shareholder' | 'legal_shareholder' | 'representative' | 'board_member';
};

export function parseContractDraftReturnContext(rawReturnTo: string | null | undefined): ContractDraftReturnContext | null {
  if (!rawReturnTo?.startsWith('/') || rawReturnTo.startsWith('//')) return null;

  try {
    const url = new URL(rawReturnTo, 'http://vahed-one.local');
    const isContractFlowPath = url.pathname === '/contracts/new' || /^\/contracts\/[^/]+\/edit$/.test(url.pathname);
    const draftId = url.searchParams.get('draftId')?.trim() ?? '';
    const section = url.searchParams.get('section') ?? url.searchParams.get('returnSection');
    const returnSection = url.searchParams.get('returnSection');
    const returnDialog = url.searchParams.get('returnDialog');
    const requestedTab = url.searchParams.get('returnTab');
    const tab =
      requestedTab === 'legal_shareholder' || requestedTab === 'legal-shareholder'
        ? 'legal_shareholder'
        : requestedTab === 'natural_shareholder' || requestedTab === 'natural-shareholder'
          ? 'natural_shareholder'
          : requestedTab === 'board_member' || requestedTab === 'board-member'
            ? 'board_member'
            : requestedTab === 'representative'
              ? 'representative'
          : null;

    const validDialog = returnDialog === 'partyOne' ? tab === 'natural_shareholder' || tab === 'legal_shareholder' : returnDialog === 'relations' ? tab === 'representative' || tab === 'board_member' : false;
    if (!isContractFlowPath || !draftId || section !== 'parties' || returnSection !== 'parties' || !validDialog || !tab) {
      return null;
    }

    return { href: `${url.pathname}${url.search}`, draftId, tab };
  } catch {
    return null;
  }
}

export function ContractDraftReturnButton({ context }: { context: ContractDraftReturnContext }) {
  return (
    <Link
      href={context.href}
      className="mb-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)]"
    >
      <ArrowRight className="h-4 w-4" aria-hidden />
      بازگشت به پیش‌نویس قرارداد
    </Link>
  );
}
