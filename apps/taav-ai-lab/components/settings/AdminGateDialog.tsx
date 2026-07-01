'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavFieldBlock } from '@repo/ui/taav/forms';
import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavInput } from '@repo/ui/taav/forms';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabLabelWithTooltip } from '@/components/AiLabTooltip';

type AdminGateDialogProps = {
  open: boolean;
  error: string | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (username: string, password: string) => boolean | Promise<boolean>;
};

export function AdminGateDialog({ open, error, loading = false, onOpenChange, onSubmit }: AdminGateDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    const success = await onSubmit(username, password);
    if (success) {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="sm" contentClassName="ai-lab-dialog">
        <TaavDialogHeader>
          <TaavDialogTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            تأیید دسترسی مدیر
          </TaavDialogTitle>
          <TaavDialogDescription>
            برای انجام این عملیات، نام کاربری و رمز عبور مدیر را وارد کنید. دسترسی فقط برای چند لحظه معتبر است.
          </TaavDialogDescription>
        </TaavDialogHeader>

        <div className="grid gap-4 py-2">
          <TaavFieldBlock
            label={<AiLabLabelWithTooltip label="نام کاربری" tooltip={AI_LAB_TOOLTIPS.auth.adminUsername} required />}
            required
            htmlFor="admin-username"
          >
            <TaavInput
              id="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </TaavFieldBlock>
          <TaavFieldBlock
            label={<AiLabLabelWithTooltip label="رمز عبور" tooltip={AI_LAB_TOOLTIPS.auth.adminPassword} required />}
            required
            htmlFor="admin-password"
          >
            <TaavInput
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={loading}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleSubmit();
              }}
            />
          </TaavFieldBlock>
          {error ? (
            <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{error}</p>
          ) : null}
        </div>

        <TaavDialogFooter>
          <TaavButton variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
            انصراف
          </TaavButton>
          <TaavButton onClick={() => void handleSubmit()} disabled={loading}>
            {loading ? 'در حال بررسی...' : 'تأیید'}
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
