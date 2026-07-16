import { ACTIVATE_FIRST_VERSION_META } from '@/app/lib/taavia-build-version-activate-first-version';
import { BUILD_FAILURE_RETRY_RECOVERY_META } from '@/app/lib/taavia-build-version-build-failure-retry-recovery';
import { CREATE_BUILD_AND_OUTBOX_META } from '@/app/lib/taavia-build-version-create-build-and-outbox';
import { GENERATE_KNOWLEDGE_BASE_META } from '@/app/lib/taavia-build-version-generate-knowledge-base';
import { GET_LATEST_BUILD_STATUS_WITH_REST_META } from '@/app/lib/taavia-build-version-get-latest-build-status-with-rest';
import { GET_RESULT_FROM_PYTHON_GRPC_META } from '@/app/lib/taavia-build-version-get-result-from-python-grpc';
import { GET_TEMPORARY_MEDIA_LINK_META } from '@/app/lib/taavia-build-version-get-temporary-media-link';
import { IMPORT_AND_VALIDATION_META } from '@/app/lib/taavia-build-version-import-and-validation';
import { POST_COMPLETION_ACTIONS_META } from '@/app/lib/taavia-build-version-post-completion-actions';
import { PUBLISH_PYTHON_OUTBOX_TO_RABBITMQ_META } from '@/app/lib/taavia-build-version-publish-python-outbox-to-rabbitmq';
import { RECEIVE_BRAND_SOURCES_META } from '@/app/lib/taavia-build-version-receive-brand-sources';
import { RECEIVE_EVENT_AND_CREATE_INBOX_JOB_META } from '@/app/lib/taavia-build-version-receive-event-and-create-inbox-job';
import { RECEIVE_PROGRESS_IN_DOTNET_META } from '@/app/lib/taavia-build-version-receive-progress-in-dotnet';
import { RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META } from '@/app/lib/taavia-build-version-receive-result-ready-and-schedule-import';
import { RESULT_READY_FROM_PYTHON_META } from '@/app/lib/taavia-build-version-result-ready-from-python';
import { SEND_STATUS_TO_FLUTTER_WITH_SIGNALR_META } from '@/app/lib/taavia-build-version-send-status-to-flutter-with-signalr';
import { START_BUILD_FRONTEND_META } from '@/app/lib/taavia-build-version-start-build-from-frontend';
import { START_PROCESSING_AND_SEND_PROGRESS_META } from '@/app/lib/taavia-build-version-start-processing-and-send-progress';
import { START_WORKER_POOL_AND_ATTEMPT_META } from '@/app/lib/taavia-build-version-start-worker-pool-and-attempt';
import type { BuildVersionStepDocMeta } from '@/app/lib/taavia-build-version-step-doc-types';

const BUILD_VERSION_STEP_PAGES: Record<string, BuildVersionStepDocMeta> = {
  [START_BUILD_FRONTEND_META.slug]: START_BUILD_FRONTEND_META,
  [CREATE_BUILD_AND_OUTBOX_META.slug]: CREATE_BUILD_AND_OUTBOX_META,
  [RECEIVE_EVENT_AND_CREATE_INBOX_JOB_META.slug]: RECEIVE_EVENT_AND_CREATE_INBOX_JOB_META,
  [START_WORKER_POOL_AND_ATTEMPT_META.slug]: START_WORKER_POOL_AND_ATTEMPT_META,
  [PUBLISH_PYTHON_OUTBOX_TO_RABBITMQ_META.slug]: PUBLISH_PYTHON_OUTBOX_TO_RABBITMQ_META,
  [RECEIVE_PROGRESS_IN_DOTNET_META.slug]: RECEIVE_PROGRESS_IN_DOTNET_META,
  [SEND_STATUS_TO_FLUTTER_WITH_SIGNALR_META.slug]: SEND_STATUS_TO_FLUTTER_WITH_SIGNALR_META,
  [GET_LATEST_BUILD_STATUS_WITH_REST_META.slug]: GET_LATEST_BUILD_STATUS_WITH_REST_META,
  [RECEIVE_BRAND_SOURCES_META.slug]: RECEIVE_BRAND_SOURCES_META,
  [GET_TEMPORARY_MEDIA_LINK_META.slug]: GET_TEMPORARY_MEDIA_LINK_META,
  [START_PROCESSING_AND_SEND_PROGRESS_META.slug]: START_PROCESSING_AND_SEND_PROGRESS_META,
  [GENERATE_KNOWLEDGE_BASE_META.slug]: GENERATE_KNOWLEDGE_BASE_META,
  [RESULT_READY_FROM_PYTHON_META.slug]: RESULT_READY_FROM_PYTHON_META,
  [RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META.slug]: RECEIVE_RESULT_READY_AND_SCHEDULE_IMPORT_META,
  [GET_RESULT_FROM_PYTHON_GRPC_META.slug]: GET_RESULT_FROM_PYTHON_GRPC_META,
  [IMPORT_AND_VALIDATION_META.slug]: IMPORT_AND_VALIDATION_META,
  [ACTIVATE_FIRST_VERSION_META.slug]: ACTIVATE_FIRST_VERSION_META,
  [POST_COMPLETION_ACTIONS_META.slug]: POST_COMPLETION_ACTIONS_META,
  [BUILD_FAILURE_RETRY_RECOVERY_META.slug]: BUILD_FAILURE_RETRY_RECOVERY_META,
};

export function getBuildVersionStepPageMeta(slug: string): BuildVersionStepDocMeta | null {
  return BUILD_VERSION_STEP_PAGES[slug] ?? null;
}
