import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { TAAV_INTERACTION } from '../shared/interaction';
import {
  getTaavFieldHintToneClasses,
  taavFieldHintVariants,
  type TaavFieldHintSize,
  type TaavFieldHintTone,
} from './taav-field-hint.variants';

export type TaavFieldHintProps = {
  tone?: TaavFieldHintTone;
  size?: TaavFieldHintSize;
  icon?: ReactNode;
  title?: string;
  children?: ReactNode;
  unsafeClassName?: string;
};

export function TaavFieldHint({
  tone = 'neutral',
  size = 'md',
  icon,
  title,
  children,
  unsafeClassName,
}: TaavFieldHintProps) {
  return (
    <div
      role="note"
      className={cn(taavFieldHintVariants({ size }), getTaavFieldHintToneClasses(tone), unsafeClassName)}
    >
      {icon ? <span className={cn(TAAV_INTERACTION.iconSlot, 'mt-0.5')}>{icon}</span> : null}
      <div className="grid min-w-0 flex-1 gap-[var(--taav-space-1)]">
        {title ? (
          <strong className="font-[var(--taav-font-weight-bold)] leading-[var(--taav-leading-tight)]">{title}</strong>
        ) : null}
        {children ? (
          <span className="text-[color:inherit] opacity-90 leading-[var(--taav-leading-relaxed)]">{children}</span>
        ) : null}
      </div>
    </div>
  );
}
