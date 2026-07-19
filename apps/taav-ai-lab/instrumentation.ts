export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { applyCurrentDatabaseUrl } = await import('./app/config/database');
    applyCurrentDatabaseUrl();

    const { ensureAiProviderSeedData } = await import('./app/lib/ai-provider-runtime-seed');
    const { ensureAiProviderV2SeedData } = await import('./app/lib/ai-provider-v2-runtime-seed');

    await ensureAiProviderSeedData().catch((error) => {
      console.error('[instrumentation] AI provider seed failed:', error);
    });
    await ensureAiProviderV2SeedData().catch((error) => {
      console.error('[instrumentation] AI provider v2 seed failed:', error);
    });
  }
}
