import PanelLayout from '../../../../components/PanelLayout';
import { ProjectTechnicalSpecsPanel } from '../../_components/ProjectDetailPanels';

function normalizeReturnTo(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) return '';
  return candidate;
}

export default async function ProjectTechnicalSpecsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const returnTo = normalizeReturnTo(params.returnTo);

  return (
    <PanelLayout>
      <ProjectTechnicalSpecsPanel returnTo={returnTo} />
    </PanelLayout>
  );
}
