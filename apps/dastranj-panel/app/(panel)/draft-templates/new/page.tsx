import { createDraftTemplateAction, saveDraftTemplateStepAction } from '../../../lib/actions';
import { getDraftTemplate } from '../../../lib/data';
import { NewDraftTemplateFlow } from './NewDraftTemplateFlow';

type NewDraftTemplatePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewDraftTemplatePage({ searchParams }: NewDraftTemplatePageProps) {
  const params = searchParams ? await searchParams : {};
  const rawId = params.id ?? params.templateId ?? params.draftId;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const template = id ? await getDraftTemplate(id) : null;

  return (
    <NewDraftTemplateFlow
      createAction={createDraftTemplateAction}
      saveStepAction={saveDraftTemplateStepAction}
      initialTemplate={
        template
          ? {
              id: template.id,
              title: template.title,
              description: template.description,
              body: template.body,
              updatedAt: template.updatedAt.toISOString(),
            }
          : null
      }
    />
  );
}
