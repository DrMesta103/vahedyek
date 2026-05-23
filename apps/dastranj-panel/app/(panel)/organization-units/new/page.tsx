import { redirect } from 'next/navigation';

export default function NewOrganizationUnitPage() {
  redirect('/organization-units?create=1');
}
