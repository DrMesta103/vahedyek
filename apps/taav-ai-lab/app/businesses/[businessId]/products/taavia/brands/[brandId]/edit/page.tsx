import { redirect } from 'next/navigation';

export default async function TaaviaBrandEditPage({
  params,
}: {
  params: Promise<{ businessId: string; brandId: string }>;
}) {
  const { businessId, brandId } = await params;
  redirect(`/businesses/${businessId}/products/taavia/brands/${brandId}`);
}
