'use client';

import { DevDocThreadsBoard } from '@repo/ui';
import { currentAppConfig } from '../../config/current';

export default function DevDocThreadsPageClient() {
  return (
    <DevDocThreadsBoard
      appName={currentAppConfig.appName}
      listEndpoint="/api/page-threads?scope=app"
      updateEndpoint={(threadId) => `/api/page-threads/${threadId}`}
    />
  );
}
