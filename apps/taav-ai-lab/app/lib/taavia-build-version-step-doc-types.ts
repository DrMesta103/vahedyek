export type BuildVersionStepDocCardTag = 'فرانت' | 'بک' | 'عمومی';

export type BuildVersionStepDocCard =
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'text';
      summaryLines: string[];
      actionLabel?: undefined;
      detail?: undefined;
    }
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'api';
      endpoint: string;
      requestBodyLabel: string;
      actionLabel?: undefined;
      detail?: undefined;
    }
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'lock';
      lockKey: string;
      mechanism: string;
      note: string;
      actionLabel?: undefined;
      detail?: undefined;
    }
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'build-summary';
      summaryItems: string[];
      actionLabel?: string;
      detail?: {
        type: 'kv-list';
        title: string;
        description: string;
        items: Array<{ label: string; value: string }>;
      };
    }
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'event';
      eventName: string;
      eventChips: string[];
      note: string;
      actionLabel: string;
      detail: {
        type: 'json';
        title: string;
        description: string;
        code: string;
      };
    }
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'transaction';
      steps: string[];
      note: string;
      actionLabel?: undefined;
      detail?: undefined;
    }
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'response';
      status: string;
      code: string;
      actionLabel?: undefined;
      detail?: undefined;
    }
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'checklist';
      items: string[];
      actionLabel?: undefined;
      detail?: undefined;
    }
  | {
      id: string;
      order: number;
      title: string;
      tag: BuildVersionStepDocCardTag;
      kind: 'detail-list';
      summaryLines: string[];
      actionLabel: string;
      detail: {
        type: 'bullet-list';
        title: string;
        description: string;
        items: string[];
      };
    };

export type BuildVersionStepDocMeta = {
  slug: string;
  title: string;
  description: string;
  status: string;
  pills: readonly string[];
};
