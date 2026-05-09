import PanelLayout from '../../../../components/PanelLayout';
import { getApprovalUsageOption } from '../../_components/approvalProcessConfig';
import ApprovalUsageTypePageClient from './page.client';
import { WorkflowEditorClient } from '../_components/WorkflowEditorClient';

/**
 * Single dynamic segment: usage keys (residential, …) vs workflow IDs share the same path shape;
 * Next.js forbids two sibling folders with different slug names (`[usageType]` vs `[workflowId]`).
 */
export default async function ApprovalProcessDynamicPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const slug = String(id);

  const usage = getApprovalUsageOption(slug);
  if (usage) {
    return (
      <PanelLayout>
        <ApprovalUsageTypePageClient usage={usage} />
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <WorkflowEditorClient workflowId={slug} />
    </PanelLayout>
  );
}
