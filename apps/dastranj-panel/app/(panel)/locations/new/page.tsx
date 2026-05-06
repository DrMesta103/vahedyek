import { LocationForm } from '../../../components/LocationForm';
import { createLocationAction } from '../../../lib/actions';
import { FormCard, PageIntro } from '@repo/ui/server';

export default function NewLocationPage() {
  return (
    <div className="page-stack">
      <PageIntro title="افزودن محل کار" description="محل کار را همراه با مختصات و شعاع مجاز ثبت کنید." />
      <FormCard title="مشخصات محل">
        <LocationForm action={createLocationAction} submitLabel="ثبت محل کار" />
      </FormCard>
    </div>
  );
}
