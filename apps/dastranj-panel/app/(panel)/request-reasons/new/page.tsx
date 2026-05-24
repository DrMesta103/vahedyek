import { redirect } from 'next/navigation';

type NewRequestReasonPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function NewRequestReasonPage({ searchParams }: NewRequestReasonPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const category = resolvedSearchParams?.category ?? 'attendance';
  redirect(`/request-reasons?category=${category}&create=1`);
}
