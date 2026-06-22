'use client';

import type { TaavBusinessSidebarNavPathItem } from '@repo/ui/taav/business';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type DastRanjNavPathContextValue = {
  tail: TaavBusinessSidebarNavPathItem[];
  override: TaavBusinessSidebarNavPathItem[] | null;
  setTail: (items: TaavBusinessSidebarNavPathItem[]) => void;
  setOverride: (items: TaavBusinessSidebarNavPathItem[] | null) => void;
};

const DastRanjNavPathContext = createContext<DastRanjNavPathContextValue | null>(null);

export function DastRanjNavPathProvider({ children }: { children: ReactNode }) {
  const [tail, setTail] = useState<TaavBusinessSidebarNavPathItem[]>([]);
  const [override, setOverride] = useState<TaavBusinessSidebarNavPathItem[] | null>(null);

  const value = useMemo(
    () => ({
      tail,
      override,
      setTail,
      setOverride,
    }),
    [tail, override],
  );

  return <DastRanjNavPathContext.Provider value={value}>{children}</DastRanjNavPathContext.Provider>;
}

export function useDastRanjNavPathContext() {
  return useContext(DastRanjNavPathContext);
}

export function DastRanjNavPathTail({ items }: { items: TaavBusinessSidebarNavPathItem[] }) {
  const context = useDastRanjNavPathContext();

  useEffect(() => {
    if (!context) return;
    context.setTail(items);
    return () => context.setTail([]);
  }, [context, items]);

  return null;
}

export function DastRanjNavPathOverride({ items }: { items: TaavBusinessSidebarNavPathItem[] }) {
  const context = useDastRanjNavPathContext();

  useEffect(() => {
    if (!context) return;
    context.setOverride(items);
    return () => context.setOverride(null);
  }, [context, items]);

  return null;
}

export function DastRanjNavPath({
  tail,
  items,
}: {
  tail?: TaavBusinessSidebarNavPathItem[];
  items?: TaavBusinessSidebarNavPathItem[];
}) {
  if (items && items.length > 0) return <DastRanjNavPathOverride items={items} />;
  if (tail && tail.length > 0) return <DastRanjNavPathTail items={tail} />;
  return null;
}
