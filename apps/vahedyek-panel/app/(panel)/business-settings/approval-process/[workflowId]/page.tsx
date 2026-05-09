import PanelLayout from '../../../../components/PanelLayout';
import { WorkflowEditorClient } from '../_components/WorkflowEditorClient';

export default async function BusinessApprovalProcessWorkflowPage(props: { params: Promise<{ workflowId: string }> }) {
  const { workflowId } = await props.params;
  return (
    <PanelLayout>
      <WorkflowEditorClient workflowId={String(workflowId)} />
    </PanelLayout>
  );
}

