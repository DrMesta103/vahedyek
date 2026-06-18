import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TAAV_INTERACTION } from '../shared/interaction';
import {
  getTaavBadgeToneClasses,
  taavBadgeVariants,
  type TaavBadgeShape,
  type TaavBadgeSize,
  type TaavBadgeTone,
  type TaavBadgeVariant,
  type TaavBadgeWidth,
} from './taav-badge.variants';

export type TaavBadgeProps = {
  tone?: TaavBadgeTone;
  size?: TaavBadgeSize;
  shape?: TaavBadgeShape;
  width?: TaavBadgeWidth;
  variant?: TaavBadgeVariant;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children?: ReactNode;
  unsafeClassName?: string;
};

export function TaavBadge({
  tone = 'neutral',
  size = 'md',
  shape = 'pill',
  width = 'auto',
  variant = 'soft',
  iconStart,
  iconEnd,
  children,
  unsafeClassName,
}: TaavBadgeProps) {
  return (
    <span
      className={cn(
        taavBadgeVariants({ size, shape, width }),
        getTaavBadgeToneClasses(tone, variant),
        unsafeClassName,
      )}
    >
      {iconStart ? <span className={TAAV_INTERACTION.iconSlot}>{iconStart}</span> : null}
      {children ? <span className="truncate text-center">{children}</span> : null}
      {iconEnd ? <span className={TAAV_INTERACTION.iconSlot}>{iconEnd}</span> : null}
    </span>
  );
}
