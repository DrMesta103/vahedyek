'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../../utils/cn';
import {
  taavTabsContentClass,
  taavTabsListVariants,
  taavTabsTriggerVariants,
  type TaavTabsOrientation,
  type TaavTabsSize,
  type TaavTabsTone,
  type TaavTabsVariant,
} from '../shared/navigation.variants';

export const TaavTabs = TabsPrimitive.Root;

export type TaavTabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  variant?: TaavTabsVariant;
  size?: TaavTabsSize;
  tone?: TaavTabsTone;
  orientation?: TaavTabsOrientation;
};

export function TaavTabsList({
  variant = 'underline',
  size = 'md',
  tone = 'brand',
  orientation = 'horizontal',
  className,
  ...props
}: TaavTabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(taavTabsListVariants({ variant, orientation }), className)}
      {...props}
    />
  );
}

export type TaavTabsTriggerProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
  variant?: TaavTabsVariant;
  size?: TaavTabsSize;
  tone?: TaavTabsTone;
};

export function TaavTabsTrigger({
  variant = 'underline',
  size = 'md',
  tone = 'brand',
  className,
  ...props
}: TaavTabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(taavTabsTriggerVariants({ variant, size, tone }), className)}
      {...props}
    />
  );
}

export function TaavTabsContent({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn(taavTabsContentClass, className)} {...props} />;
}
