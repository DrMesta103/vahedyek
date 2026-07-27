import * as react from 'react';
import { ReactNode } from 'react';

declare function PageIntro({ title, description, action, badge, aside, }: {
    title: string;
    description: string;
    action?: ReactNode;
    badge?: ReactNode;
    aside?: ReactNode;
}): react.JSX.Element;
declare function PrimaryLink({ href, children }: {
    href: string;
    children: ReactNode;
}): react.JSX.Element;
declare function EmptyState({ title, description, action }: {
    title: string;
    description: string;
    action?: ReactNode;
}): react.JSX.Element;
declare function StatGrid({ items }: {
    items: Array<{
        label: string;
        value: string | number;
    }>;
}): react.JSX.Element;
declare function DataTable({ columns, rows }: {
    columns: string[];
    rows: ReactNode[][];
}): react.JSX.Element;
declare function FormCard({ title, description, children }: {
    title: string;
    description?: string;
    children: ReactNode;
}): react.JSX.Element;

export { DataTable, EmptyState, FormCard, PageIntro, PrimaryLink, StatGrid };
