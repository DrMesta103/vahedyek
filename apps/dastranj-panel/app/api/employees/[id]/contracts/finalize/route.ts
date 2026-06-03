import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { finalizeEmployeeContractDraft } from '../../../../../lib/employee-contracts.server';
import { normalizeEmployeeContractDraft } from '../../../../../lib/employee-contract-drafts';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const draft = normalizeEmployeeContractDraft(body?.draft);
    if (!draft) {
      return NextResponse.json({ error: 'invalid_contract_draft' }, { status: 400 });
    }
    const contract = await finalizeEmployeeContractDraft(id, draft);
    revalidatePath('/employees');
    revalidatePath(`/employees/${id}`);
    return NextResponse.json({ contract });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'finalize_failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
