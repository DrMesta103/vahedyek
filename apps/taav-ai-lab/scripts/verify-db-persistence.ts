/**
 * Local infrastructure verification for taav-ai-lab PostgreSQL persistence.
 * Usage: npx tsx scripts/verify-db-persistence.ts
 */
const BASE = process.env.TAAV_AI_LAB_BASE_URL ?? 'http://localhost:3070';

type CookieJar = Map<string, string>;

function parseSetCookie(header: string | null, jar: CookieJar) {
  if (!header) return;
  const [pair] = header.split(';');
  const eq = pair.indexOf('=');
  if (eq === -1) return;
  jar.set(pair.slice(0, eq), pair.slice(eq + 1));
}

function cookieHeader(jar: CookieJar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

async function request(
  path: string,
  options: { method?: string; body?: unknown; jar?: CookieJar } = {},
) {
  const jar = options.jar ?? new Map<string, string>();
  const response = await fetch(`${BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(jar.size ? { Cookie: cookieHeader(jar) } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  parseSetCookie(response.headers.get('set-cookie'), jar);
  const json = await response.json().catch(() => null);
  return { response, json, jar };
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const results: string[] = [];
  const log = (msg: string) => {
    results.push(msg);
    console.log(msg);
  };

  log('1. Login with seeded demo user');
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: { identifier: 'admin@local.dev', password: '123456' },
  });
  assert(login.response.ok, `Login failed: ${JSON.stringify(login.json)}`);
  log('   OK: login returned 200');

  const jar = login.jar;
  const me = await request('/api/auth/me', { jar });
  assert(me.response.ok && me.json?.user?.id, 'GET /api/auth/me failed');
  const userId = me.json.user.id as string;
  log(`   OK: session user id=${userId}`);

  log('2. Create business (tenant)');
  const businessName = `Verify Biz ${Date.now()}`;
  const createBiz = await request('/api/businesses', {
    method: 'POST',
    jar,
    body: { name: businessName, logoUrl: '', tokenLimit: 100000 },
  });
  assert(createBiz.response.status === 201, `Create business failed: ${JSON.stringify(createBiz.json)}`);
  assert(createBiz.json?.source === 'database', 'Expected source=database');
  const tenantId = createBiz.json.business.id as string;
  log(`   OK: tenant created id=${tenantId}`);

  log('3. List businesses from DB');
  const tenants = await request('/api/auth/tenants', { jar });
  assert(tenants.response.ok, 'List tenants failed');
  const found = (tenants.json?.tenants as { id: string }[] | undefined)?.some((t) => t.id === tenantId);
  assert(found, 'Created tenant not in tenant list');
  log('   OK: tenant appears in list');

  log('4. Create Taavia brand');
  const brandRes = await request(`/api/businesses/${tenantId}/taavia/brands`, {
    method: 'POST',
    jar,
    body: { name: 'Verify Brand' },
  });
  assert(brandRes.response.ok, `Create brand failed: ${JSON.stringify(brandRes.json)}`);
  const brandId = brandRes.json.brand.id as string;
  log(`   OK: brand created id=${brandId}`);

  log('5. List brands (tenant-scoped)');
  const brandsList = await request(`/api/businesses/${tenantId}/taavia/brands`, { jar });
  assert(brandsList.response.ok, 'List brands failed');
  const brandFound = (brandsList.json?.brands as { id: string }[] | undefined)?.some((b) => b.id === brandId);
  assert(brandFound, 'Brand not in list');
  log('   OK: brand in tenant list');

  log('6. Load admin agent conversation');
  const conv = await request(`/api/businesses/${tenantId}/taavia/brands/${brandId}/admin-agent/conversation`, { jar });
  assert(conv.response.ok, `Conversation GET failed: ${JSON.stringify(conv.json)}`);
  const messages = conv.json?.conversation?.messages as unknown[] | undefined;
  assert(Array.isArray(messages) && messages.length > 0, 'Expected seeded assistant message');
  log(`   OK: conversation has ${messages.length} message(s)`);

  log('6b. Send admin agent message with simulated reply');
  const sendMsg = await request(`/api/businesses/${tenantId}/taavia/brands/${brandId}/admin-agent/messages`, {
    method: 'POST',
    jar,
    body: {
      content: 'برند ما در حوزه فروش آنلاین محصولات دیجیتال فعالیت می‌کند.',
      conversationId: conv.json?.conversation?.id,
    },
  });
  assert(sendMsg.response.status === 201, `Send message failed: ${JSON.stringify(sendMsg.json)}`);
  assert(sendMsg.json?.userMessage?.role === 'user', 'Expected user message');
  assert(sendMsg.json?.assistantMessage?.role === 'assistant', 'Expected simulated assistant reply');
  log('   OK: user + assistant messages persisted');

  log('7. Create OCR job');
  const ocr = await request(`/api/businesses/${tenantId}/ai-tools/ocr`, {
    method: 'POST',
    jar,
    body: {
      sourceType: 'sample',
      sampleId: 'id-card',
      sourceName: 'melli-taav-front.jpg',
      fileType: 'image/jpeg',
    },
  });
  assert(ocr.response.ok, `OCR create failed: ${JSON.stringify(ocr.json)}`);
  const jobId = ocr.json.job.id as string;
  log(`   OK: OCR job created id=${jobId}`);

  log('8. List OCR jobs');
  const ocrList = await request(`/api/businesses/${tenantId}/ai-tools/ocr`, { jar });
  assert(ocrList.response.ok, 'OCR list failed');
  const jobFound = (ocrList.json?.jobs as { id: string }[] | undefined)?.some((j) => j.id === jobId);
  assert(jobFound, 'OCR job not in list');
  log('   OK: OCR job persisted');

  log('9. Global settings from DB');
  const settings = await request('/api/settings/global', { jar });
  assert(settings.response.ok && settings.json?.source === 'database', 'Settings GET failed');
  log('   OK: global settings loaded');

  log('10. Settings admin gate (admin / 123456)');
  const admin = await request('/api/settings/admin-verify', {
    method: 'POST',
    jar,
    body: { username: 'admin', password: '123456' },
  });
  assert(admin.response.ok, `Admin verify failed: ${JSON.stringify(admin.json)}`);
  log('   OK: platform admin credential works');

  log('\nAll persistence checks passed.');
}

main().catch((error) => {
  console.error('\nVerification failed:', error);
  process.exit(1);
});
