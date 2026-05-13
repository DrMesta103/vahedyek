import PanelLayout from '../../../../../components/PanelLayout';
import { AppendixEditorShell } from '../../../../../components/contracts/appendices/AppendixEditorShell';

export default function ContractAppendixEditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelLayout>
      <AppendixEditorShell>{children}</AppendixEditorShell>
    </PanelLayout>
  );
}
