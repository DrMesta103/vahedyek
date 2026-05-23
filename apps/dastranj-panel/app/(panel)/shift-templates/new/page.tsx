import { redirect } from 'next/navigation';

type NewShiftTemplatePageProps = {
  searchParams?: Promise<{
    type?: string;
  }>;
};

export default async function NewShiftTemplatePage({ searchParams }: NewShiftTemplatePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const type = resolvedSearchParams?.type;
  const query = new URLSearchParams({ create: '1' });
  if (type) query.set('type', type);
  redirect(`/shift-templates?${query.toString()}`);
}
