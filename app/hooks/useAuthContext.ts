'use client';

import { useEffect, useState } from 'react';

type AuthContext = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    brandCode: string;
  } | null;
} | null;

export function useAuthContext() {
  const [data, setData] = useState<AuthContext>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const payload = await response.json();
        if (!mounted) return;
        setData(payload);
      } catch {
        if (!mounted) return;
        setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}
