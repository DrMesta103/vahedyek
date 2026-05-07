'use client';

import { useSearchParams } from 'next/navigation';
import { BusinessShareholderEditorPanel } from './BusinessShareholderEditorPanel';

export function BusinessBuyerEditorPanel({ buyerId }: { buyerId?: string }) {
  const searchParams = useSearchParams();
  
  // Reuse the shareholder editor with buyer entity type
  return <BusinessShareholderEditorPanel shareholderId={buyerId} entity="buyer" />;
}
