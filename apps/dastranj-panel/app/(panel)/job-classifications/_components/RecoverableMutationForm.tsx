"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";

type Mutation = (formData: FormData) => Promise<unknown>;

export function RecoverableMutationForm({ action, children, className, successMessage }: { action: Mutation; children: ReactNode; className?: string; successMessage?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const payload = new FormData(form);
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      await action(payload);
      setSuccess(successMessage ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "عملیات انجام نشد. دوباره تلاش کنید.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={className} onSubmit={submit} aria-busy={pending}>
      {children}
      {pending ? <p role="status">در حال ذخیره…</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {success ? <p role="status">{success}</p> : null}
    </form>
  );
}
