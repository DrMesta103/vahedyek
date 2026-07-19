'use client';

import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';

function formSnapshot(form: HTMLFormElement) {
  return JSON.stringify(Array.from(new FormData(form).entries()).map(([key, value]) => [key, typeof value === 'string' ? value : value.name]));
}

export function PolicyImpactForm({ action, groupCount, className, children }: { action: (formData: FormData) => void | Promise<void>; groupCount: number; className?: string; children: ReactNode }) {
  const formRef = useRef<HTMLFormElement>(null);
  const initialSnapshot = useRef('');
  useEffect(() => { if (formRef.current) initialSnapshot.current = formSnapshot(formRef.current); }, []);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (initialSnapshot.current === formSnapshot(event.currentTarget)) { event.preventDefault(); return; }
    if (groupCount > 0 && !window.confirm('این سیاست در گروه‌های کاری استفاده می‌شود. ذخیره این تغییرات می‌تواند قواعد پردازش کارکنان این گروه‌ها را تغییر دهد. آیا از ذخیره تغییرات مطمئن هستید؟')) event.preventDefault();
  };
  return <form ref={formRef} action={action as never} className={className} onSubmit={onSubmit}>{groupCount > 0 ? <div className="policy-info-strip" role="alert"><p>این سیاست کاری در گروه‌های کاری استفاده می‌شود. تغییر قواعد آن می‌تواند بر پردازش تردد، تأخیر، غیبت، اضافه‌کاری و درخواست‌های کارکنان اثر بگذارد.</p></div> : null}{children}</form>;
}
