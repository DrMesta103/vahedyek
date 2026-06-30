'use client';

import type { MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Beaker, Boxes, Building2, Cpu, Home, ScanText, Settings, Sparkles } from 'lucide-react';
import type { AiLabNavItem } from '@/app/lib/navigation';

type OrbitMenuItem = AiLabNavItem & {
  href: string;
};

type OrbitMenuProps = {
  items: OrbitMenuItem[];
  activeItem?: string;
};

const ICONS = {
  home: Home,
  beaker: Beaker,
  cpu: Cpu,
  boxes: Boxes,
  scan: ScanText,
  building: Building2,
  sparkles: Sparkles,
  settings: Settings,
} as const;

function formatOrbitNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/\.?0+$/, '');
}

function OrbitIcon({ iconKey }: { iconKey: AiLabNavItem['iconKey'] }) {
  const Icon = ICONS[iconKey];
  return <Icon className="h-[18px] w-[18px]" aria-hidden />;
}

export function OrbitMenu({ items, activeItem }: OrbitMenuProps) {
  const router = useRouter();
  const gearRef = useRef<HTMLDivElement | null>(null);
  const dragMovedRef = useRef(false);
  const totalItems = items.length;
  const stepAngle = (Math.PI * 2) / totalItems;
  const activeIndexFromRoute = Math.max(items.findIndex((item) => item.id === activeItem), 0);

  const [currentRotation, setCurrentRotation] = useState(-(activeIndexFromRoute * stepAngle));
  const [dragState, setDragState] = useState<{ dragging: boolean; startAngle: number }>({
    dragging: false,
    startAngle: 0,
  });

  useEffect(() => {
    setCurrentRotation(-(activeIndexFromRoute * stepAngle));
  }, [activeIndexFromRoute, stepAngle]);

  const activeIndex = useMemo(() => {
    let normalizedRot = (-currentRotation) % (Math.PI * 2);
    if (normalizedRot < 0) normalizedRot += Math.PI * 2;
    return Math.round(normalizedRot / stepAngle) % totalItems;
  }, [currentRotation, stepAngle, totalItems]);

  const prevIndex = (activeIndex - 1 + totalItems) % totalItems;
  const nextIndex = (activeIndex + 1) % totalItems;

  useEffect(() => {
    if (!dragState.dragging) return;

    const handleMove = (event: MouseEvent) => {
      if (!gearRef.current) return;
      const rect = gearRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      dragMovedRef.current = true;
      setCurrentRotation(angle - dragState.startAngle);
    };

    const handleUp = () => {
      setDragState((state) => ({ ...state, dragging: false }));
      setCurrentRotation((rotation) => -(Math.round((-rotation) / stepAngle) * stepAngle));
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragState, stepAngle]);

  const handleMouseDown = (event: ReactMouseEvent<HTMLElement>) => {
    if (!gearRef.current) return;
    dragMovedRef.current = false;
    const rect = gearRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    setDragState({
      dragging: true,
      startAngle: angle - currentRotation,
    });
  };

  const navigateTo = (index: number) => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }

    const item = items[index];
    if (!item || item.disabled || !item.href) return;
    router.push(item.href);
  };

  return (
    <div className="ai-lab-orbit-wrapper">
      <div ref={gearRef} className="ai-lab-gear-system" onMouseDown={handleMouseDown}>
        <div className="ai-lab-orbit-line" style={{ transform: `rotate(${formatOrbitNumber(currentRotation)}rad)` }}>
          {items.map((item, index) => {
            const angle = index * stepAngle;
            const x = Math.round((Math.cos(angle) * 260 + 260 - 27) * 10000) / 10000;
            const y = Math.round((Math.sin(angle) * 260 + 260 - 27) * 10000) / 10000;
            const isActive = index === activeIndex;
            const isNeighbor = index === prevIndex || index === nextIndex;

            return (
              <button
                key={item.id}
                type="button"
                className={`ai-lab-orbit-node${isActive ? ' active' : ''}${isNeighbor ? ' neighbor' : ''}`}
                style={{
                  left: `${formatOrbitNumber(x)}px`,
                  top: `${formatOrbitNumber(y)}px`,
                  transform: `rotate(${formatOrbitNumber(-currentRotation)}rad)`,
                }}
                onMouseDown={handleMouseDown}
                onClick={() => navigateTo(index)}
                disabled={item.disabled}
              >
                <OrbitIcon iconKey={item.iconKey} />
                <span className="ai-lab-orbit-node-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
