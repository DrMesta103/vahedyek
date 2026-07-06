import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_SALT = 'taav-ai-lab-api-keys-v1';

/**
 * Prefer a dedicated encryption secret in production.
 * TODO: Set AI_ACCOUNT_ENCRYPTION_KEY (32+ random bytes as base64 or long string) in production
 * instead of reusing AUTH_JWT_SECRET.
 */
function resolveEncryptionSecret() {
  const dedicated = process.env.AI_ACCOUNT_ENCRYPTION_KEY?.trim();
  if (dedicated) return dedicated;

  const jwtSecret = process.env.AUTH_JWT_SECRET?.trim();
  if (jwtSecret) return jwtSecret;

  if (process.env.NODE_ENV === 'development') {
    return 'dev-insecure-ai-account-encryption-secret';
  }

  throw new Error('AI_ACCOUNT_ENCRYPTION_KEY or AUTH_JWT_SECRET must be configured for API key encryption.');
}

function getEncryptionKey() {
  return scryptSync(resolveEncryptionSecret(), KEY_SALT, 32);
}

export function encryptSecret(plaintext: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

export function decryptSecret(ciphertext: string) {
  const payload = Buffer.from(ciphertext, 'base64');
  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
