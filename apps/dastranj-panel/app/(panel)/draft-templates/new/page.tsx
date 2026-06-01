import { redirect } from 'next/navigation';

export default function NewDraftTemplatePage() {
  redirect('/draft-templates?create=1');
}
