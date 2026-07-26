import { redirect } from 'next/navigation';

export default async function TaaviaPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  redirect(`/businesses/${businessId}/products/taavia/brands`);
}
