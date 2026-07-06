import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ accountId: string }>;
};

export default async function AiAccountModelsRedirectPage({ params }: PageProps) {
  await params;
  redirect('/settings/ai-accounts');
}
