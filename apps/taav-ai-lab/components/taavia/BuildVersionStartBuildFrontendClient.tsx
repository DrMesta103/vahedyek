'use client';

import {
  START_BUILD_FRONTEND_CARDS,
  START_BUILD_FRONTEND_OVERVIEW_NOTE,
  START_BUILD_FRONTEND_OVERVIEW_STEPS,
} from '@/app/lib/taavia-build-version-start-build-from-frontend';
import { BuildVersionStepDocClient } from '@/components/taavia/BuildVersionStepDocClient';

/** @deprecated Prefer BuildVersionStepDocClient with step config props */
export function BuildVersionStartBuildFrontendClient() {
  return (
    <BuildVersionStepDocClient
      cards={START_BUILD_FRONTEND_CARDS}
      overviewSteps={START_BUILD_FRONTEND_OVERVIEW_STEPS}
      overviewNote={START_BUILD_FRONTEND_OVERVIEW_NOTE}
    />
  );
}
