import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../utils/cn';

export type TaavDividerProps = Omit<ComponentPropsWithoutRef<'hr'>, 'color'> & {
  unsafeClassName?: string;
};

export function TaavDivider({ unsafeClassName, ...props }: TaavDividerProps) {
  return (
    <hr
      aria-orientation="horizontal"
      {...props}
      className={cn('m-0 h-[2px] w-full shrink-0 border-0 bg-[#a6b9c1]', unsafeClassName)}
    />
  );
}
