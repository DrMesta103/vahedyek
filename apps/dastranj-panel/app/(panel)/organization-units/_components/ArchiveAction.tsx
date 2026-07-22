'use client';

type ArchiveActionProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  message: string;
  className?: string;
};

export function ArchiveAction({ action, id, label, message, className = 'is-danger' }: ArchiveActionProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value="ARCHIVED" />
      <button className={className} type="submit">{label}</button>
    </form>
  );
}
