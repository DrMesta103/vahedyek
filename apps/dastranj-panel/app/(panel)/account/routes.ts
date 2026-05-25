export const BUSINESS_PROFILE_ROOT = '/business-settings/profile';
export const BUSINESS_PROFILE_OWNERSHIP = `${BUSINESS_PROFILE_ROOT}/ownership`;
export const BUSINESS_PROFILE_BANK_ACCOUNTS = `${BUSINESS_PROFILE_ROOT}/bank-accounts`;
export const BUSINESS_PROFILE_BRANDING = `${BUSINESS_PROFILE_ROOT}/branding`;
export const BUSINESS_PROFILE_SHAREHOLDERS = `${BUSINESS_PROFILE_ROOT}/shareholders`;
export const BUSINESS_PROFILE_REPRESENTATIVES = `${BUSINESS_PROFILE_ROOT}/representatives`;
export const BUSINESS_PROFILE_BOARD_MEMBERS = `${BUSINESS_PROFILE_ROOT}/board-members`;

export function getBusinessProfileBankAccountNewPath(returnTo?: string) {
  return returnTo ? `${BUSINESS_PROFILE_BANK_ACCOUNTS}/new?returnTo=${encodeURIComponent(returnTo)}` : `${BUSINESS_PROFILE_BANK_ACCOUNTS}/new`;
}

export function getBusinessProfileBankAccountEditPath(accountId: string, returnTo?: string) {
  const path = `${BUSINESS_PROFILE_BANK_ACCOUNTS}/${accountId}/edit`;
  return returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path;
}

export function getSelectTenantPath(nextPath: string) {
  return `/select-tenant?next=${encodeURIComponent(nextPath)}`;
}
