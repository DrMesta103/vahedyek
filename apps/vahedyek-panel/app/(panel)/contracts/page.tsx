'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PanelLayout from '../../components/PanelLayout';
import ContractList from '../../components/contracts/ContractList';
import { getReferenceData } from '../../lib/contractDraftClient';
import type { Block, Buyer, Employee, Partner, Unit } from '../../types/contract';

export default function ContractsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getReferenceData();
        if (!mounted) return;

        setEmployees(data.employees);
        setBlocks(data.blocks.map((block) => ({ id: block.id, name: block.name })));
        setUnits(
          data.blocks.flatMap((block) =>
            block.units.map((unit) => ({
              id: unit.id,
              blockId: block.id,
              floorName: unit.floorName,
              name: unit.name,
              category: unit.category,
              area: unit.area,
              assignedToUnitId: unit.assignedToUnitId,
            })),
          ),
        );
        setPartners([
          ...data.directory.partner.natural.map((item) => ({ ...item, personType: 'natural' as const })),
          ...data.directory.partner.legal.map((item) => ({ ...item, personType: 'legal' as const })),
        ]);
        setBuyers([
          ...data.directory.buyer.natural.map((item) => ({ ...item, personType: 'natural' as const })),
          ...data.directory.buyer.legal.map((item) => ({ ...item, personType: 'legal' as const })),
        ]);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'دریافت اطلاعات قراردادها ناموفق بود.';
        if (message.includes('نیاز به ورود مجدد')) {
          router.push(`/login?next=${encodeURIComponent('/contracts')}`);
          return;
        }
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PanelLayout>
      {loading ? (
        <div className="rounded-[8px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          در حال دریافت اطلاعات قراردادها...
        </div>
      ) : error ? (
        <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-10 text-center text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <ContractList blocks={blocks} units={units} employees={employees} partners={partners} buyers={buyers} />
      )}
    </PanelLayout>
  );
}

