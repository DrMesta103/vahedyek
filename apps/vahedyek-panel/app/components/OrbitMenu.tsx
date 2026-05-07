'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { APP_MENU_ITEMS } from '../lib/navigation';
import { MenuIcon } from './MenuIcon';

type OrbitMenuProps = {
  activeItem?: string;
};

/** Stable px/angle strings so SSR and browser hydration match (avoids float serialization drift). */
function orbitPx(n: number) {
  return `${Math.round(n * 10_000) / 10_000}px`;
}
function orbitRad(r: number) {
  return `${Math.round(r * 1e12) / 1e12}rad`;
}

export default function OrbitMenu({ activeItem }: OrbitMenuProps) {
  const router = useRouter();
  const gearRef = useRef<HTMLDivElement | null>(null);
  const dragMovedRef = useRef(false);
  const totalItems = APP_MENU_ITEMS.length;
  const stepAngle = (Math.PI * 2) / totalItems;
  const activeIndexFromRoute = Math.max(APP_MENU_ITEMS.findIndex((item) => item.id === activeItem), 0);

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

  const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
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
    const item = APP_MENU_ITEMS[index];
    if (!item || item.disabled || item.href === '#') return;
    router.push(item.href);
  };

  return (
    <div className="main-wrapper">
      <div ref={gearRef} className="gear-system" onMouseDown={handleMouseDown}>
        <div className="orbit-line" style={{ transform: `rotate(${orbitRad(currentRotation)})` }}>
          {APP_MENU_ITEMS.map((item, index) => {
            const angle = index * stepAngle;
            const x = Math.cos(angle) * 260 + 260 - 27;
            const y = Math.sin(angle) * 260 + 260 - 27;
            const isActive = index === activeIndex;
            const isNeighbor = index === prevIndex || index === nextIndex;

            return (
              <button
                key={item.id}
                type="button"
                className={`node${isActive ? ' active' : ''}${isNeighbor ? ' neighbor' : ''}`}
                style={{ left: orbitPx(x), top: orbitPx(y), transform: `rotate(${orbitRad(-currentRotation)})` }}
                onMouseDown={handleMouseDown}
                onClick={() => navigateTo(index)}
                disabled={item.disabled}
              >
                <MenuIcon name={item.icon} />
                <span className="node-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
