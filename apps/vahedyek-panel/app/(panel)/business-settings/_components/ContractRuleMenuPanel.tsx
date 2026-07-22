'use client';

import { CONTRACT_RULE_ITEMS } from '../../../lib/businessContractRules';
import { BusinessSettingsCard } from './BusinessSettingsCard';

const RULE_DISPLAY_ORDER: Record<string, number> = {
  prepayment: 0,
  installments: 1,
  adjustment: 2,
  'additional-costs': 3,
  discount: 4,
  penalty: 5,
  'builder-penalty': 6,
  'builder-cancellation': 7,
  'buyer-cancellation': 8,
  forgiveness: 9,
  interest: 10,
  'loan-settings': 11,
};

const LOAN_CARD = {
  title: 'تنظیمات وام',
  description: 'در این بخش می‌توانید تنظیمات مربوط به وام را انجام دهید.',
  href: '/business-settings/contract-rules/loan-settings',
} as const;

export function ContractRuleMenuPanel() {
  const orderedItems = [...CONTRACT_RULE_ITEMS].sort(
    (a, b) => (RULE_DISPLAY_ORDER[a.id] ?? Number.MAX_SAFE_INTEGER) - (RULE_DISPLAY_ORDER[b.id] ?? Number.MAX_SAFE_INTEGER),
  );

  const cards = [
    ...orderedItems.map((item) => ({
      title: item.title,
      description: item.description,
      href: `/business-settings/contract-rules/${item.id}`,
    })),
    LOAN_CARD,
  ];

  return (
    <section className="business-settings-page">
      <div className="business-settings-grid">
        {cards.map((card) => (
          <BusinessSettingsCard key={card.href} title={card.title} description={card.description} href={card.href} />
        ))}
      </div>
    </section>
  );
}
