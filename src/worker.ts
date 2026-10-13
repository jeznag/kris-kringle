import {
  ACCOUNT_ID_LENGTH,
  ACCOUNT_PAGE_PATTERN,
  BASE58_ALPHABET,
  FAMILY_MEMBER_JSON_PATTERN,
  FORM_FIELDS,
  HTTP_STATUS,
  MIN_ADMIN_PASSWORD_LENGTH,
  PATHS,
  QUERY_PARAMS,
} from './constants';
import {
  type Account,
  createAccount,
  createFamilyMember,
  deleteFamilyMember,
  findAccount,
  listFamilyMembers,
  listGiftExchanges,
  replaceGiftExchangesForYear,
  setAdminPasswordHash,
  updateFamilyMember,
} from './db';
import { InvalidRequestError, parseFamilyMemberBody, parseGiftExchangesBody } from './parse';
import {
  krisKringleUrl,
  renderAccountPage,
  renderAdminLoginPage,
  renderAdminUnavailablePage,
  renderHomePage,
  renderKrisKringlePage,
  renderNoAccountPage,
} from './pages';
import { hashPassword, verifyPassword } from './password';
import {
  clearedSessionCookie,
  createAdminSession,
  endAdminSession,
  endAllAdminSessions,
  hasAdminSession,
} from './session';

const BYTE_RANGE = 256;
// Largest multiple of the alphabet size that fits in a byte; rejecting bytes above it
// keeps every character equally likely.
const UNBIASED_BYTE_LIMIT = BYTE_RANGE - (BYTE_RANGE % BASE58_ALPHABET.length);

const PASSWORD_TOO_SHORT_MESSAGE = `Admin password needs at least ${MIN_ADMIN_PASSWORD_LENGTH} characters.`;
const WRONG_PASSWORD_MESSAGE = "That's not the magic word. Try again.";
const TOO_MANY_ATTEMPTS_MESSAGE = 'Too many attempts — wait a minute and try again.';

function generateAccountId(): string {
  let accountId = '';
  while (accountId.length < ACCOUNT_ID_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(ACCOUNT_ID_LENGTH))) {
      if (byte < UNBIASED_BYTE_LIMIT && accountId.length < ACCOUNT_ID_LENGTH) {
        accountId += BASE58_ALPHABET[byte % BASE58_ALPHABET.length];
      }
    }
  }
  return accountId;
}

function html(body: string, status: number = HTTP_STATUS.OK): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function redirect(location: string, setCookie?: string): Response {
  const headers = new Headers({ Location: location });
  if (setCookie) headers.set('Set-Cookie', setCookie);
  return new Response(null, { status: HTTP_STATUS.SEE_OTHER, headers });
}

function notFound(): Response {
  return new Response('Not found', { status: HTTP_STATUS.NOT_FOUND });
}

function methodNotAllowed(): Response {
  return new Response('Method not allowed', { status: HTTP_STATUS.METHOD_NOT_ALLOWED });
}

function forbidden(): Response {
  return new Response('Forbidden', { status: HTTP_STATUS.FORBIDDEN });
}

// Admin auth rides on a cookie, so state-changing requests from other sites must be refused.
function isCrossOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('Origin');
  return origin !== null && origin !== url.origin;
}

function formString(form: FormData, field: string): string {
  return String(form.get(field) ?? '').trim();
}

function isValidAdminPassword(password: string): boolean {
  return password.length >= MIN_ADMIN_PASSWORD_LENGTH;
}

async function handleCreateAccount(request: Request, env: Env, url: URL): Promise<Response> {
  const form = await request.formData();
  const adminPassword = formString(form, FORM_FIELDS.ADMIN_PASSWORD);
  if (!isValidAdminPassword(adminPassword)) return html(renderHomePage(PASSWORD_TOO_SHORT_MESSAGE), HTTP_STATUS.BAD_REQUEST);

  const accountId = generateAccountId();
  await createAccount(env.DB, formString(form, FORM_FIELDS.ACCOUNT_NAME), accountId, await hashPassword(adminPassword));
  const sessionCookie = await createAdminSession(env.DB, accountId);
  return redirect(new URL(`${PATHS.ACCOUNTS}/${accountId}`, url.origin).toString(), sessionCookie);
}

async function handleAccountPage(env: Env, url: URL, accountId: string): Promise<Response> {
  const account = await findAccount(env.DB, accountId);
  if (!account) return html(renderNoAccountPage(), HTTP_STATUS.NOT_FOUND);
  return html(renderAccountPage(url.origin, account.account_name ?? '', account.account_id));
}

async function handleKrisKringlePage(request: Request, env: Env, url: URL): Promise<Response> {
  const accountId = url.searchParams.get(QUERY_PARAMS.ACCOUNT_ID);
  const account = accountId ? await findAccount(env.DB, accountId) : null;
  if (!account) return html(renderNoAccountPage(), HTTP_STATUS.NOT_FOUND);

  const pageOptions = {
    origin: url.origin,
    accountId: account.account_id,
    isPasswordChanged: url.searchParams.has(QUERY_PARAMS.PASSWORD_CHANGED),
  };
  if (!url.searchParams.has(QUERY_PARAMS.ADMIN)) return html(renderKrisKringlePage({ ...pageOptions, isAdmin: false }));
  if (await hasAdminSession(request, env.DB, account.account_id)) {
    return html(renderKrisKringlePage({ ...pageOptions, isAdmin: true }));
  }
  if (!account.admin_password_hash) return html(renderAdminUnavailablePage(), HTTP_STATUS.FORBIDDEN);
  return html(renderAdminLoginPage(account.account_name ?? '', account.account_id));
}

/** Resolves the account named in an admin form post, or the response to send instead. */
async function accountFromAdminForm(
  request: Request,
  env: Env,
  url: URL,
): Promise<{ account: Account; form: FormData } | Response> {
  if (isCrossOrigin(request, url)) return forbidden();
  const form = await request.formData();
  const account = await findAccount(env.DB, formString(form, FORM_FIELDS.ACCOUNT_ID));
  if (!account) return html(renderNoAccountPage(), HTTP_STATUS.NOT_FOUND);
  return { account, form };
}

async function handleAdminLogin(request: Request, env: Env, url: URL): Promise<Response> {
  const resolved = await accountFromAdminForm(request, env, url);
  if (resolved instanceof Response) return resolved;
  const { account, form } = resolved;
  const accountName = account.account_name ?? '';

  if (!account.admin_password_hash) return html(renderAdminUnavailablePage(), HTTP_STATUS.FORBIDDEN);
  const { success: isWithinRateLimit } = await env.LOGIN_RATE_LIMITER.limit({ key: account.account_id });
  if (!isWithinRateLimit) {
    return html(renderAdminLoginPage(accountName, account.account_id, TOO_MANY_ATTEMPTS_MESSAGE), HTTP_STATUS.TOO_MANY_REQUESTS);
  }
  const isCorrectPassword = await verifyPassword(formString(form, FORM_FIELDS.ADMIN_PASSWORD), account.admin_password_hash);
  if (!isCorrectPassword) {
    return html(renderAdminLoginPage(accountName, account.account_id, WRONG_PASSWORD_MESSAGE), HTTP_STATUS.UNAUTHORIZED);
  }
  const sessionCookie = await createAdminSession(env.DB, account.account_id);
  return redirect(krisKringleUrl(url.origin, account.account_id, true), sessionCookie);
}

async function handleAdminLogout(request: Request, env: Env, url: URL): Promise<Response> {
  const resolved = await accountFromAdminForm(request, env, url);
  if (resolved instanceof Response) return resolved;
  await endAdminSession(request, env.DB);
  return redirect(krisKringleUrl(url.origin, resolved.account.account_id, false), clearedSessionCookie());
}

async function handleChangeAdminPassword(request: Request, env: Env, url: URL): Promise<Response> {
  const resolved = await accountFromAdminForm(request, env, url);
  if (resolved instanceof Response) return resolved;
  const { account, form } = resolved;

  if (!(await hasAdminSession(request, env.DB, account.account_id))) {
    return html(renderAdminLoginPage(account.account_name ?? '', account.account_id), HTTP_STATUS.UNAUTHORIZED);
  }
  const newPassword = formString(form, FORM_FIELDS.ADMIN_PASSWORD);
  if (!isValidAdminPassword(newPassword)) return new Response(PASSWORD_TOO_SHORT_MESSAGE, { status: HTTP_STATUS.BAD_REQUEST });

  await setAdminPasswordHash(env.DB, account.account_id, await hashPassword(newPassword));
  // Changing the password signs out every other device.
  await endAllAdminSessions(env.DB, account.account_id);
  const sessionCookie = await createAdminSession(env.DB, account.account_id);
  const adminUrl = new URL(krisKringleUrl(url.origin, account.account_id, true));
  adminUrl.searchParams.set(QUERY_PARAMS.PASSWORD_CHANGED, '');
  return redirect(adminUrl.toString(), sessionCookie);
}

async function handleFamilyMembers(request: Request, env: Env, accountId: string): Promise<Response> {
  if (request.method === 'GET') return Response.json(await listFamilyMembers(env.DB, accountId));
  if (request.method !== 'POST') return methodNotAllowed();

  const created = await createFamilyMember(env.DB, accountId, parseFamilyMemberBody(await request.json()));
  return Response.json(created, { status: HTTP_STATUS.CREATED });
}

async function handleFamilyMember(request: Request, env: Env, accountId: string, id: number): Promise<Response> {
  if (request.method === 'DELETE') {
    const isDeleted = await deleteFamilyMember(env.DB, accountId, id);
    return isDeleted ? new Response(null, { status: HTTP_STATUS.NO_CONTENT }) : notFound();
  }
  if (request.method !== 'PATCH' && request.method !== 'PUT') return methodNotAllowed();

  const updated = await updateFamilyMember(env.DB, accountId, id, parseFamilyMemberBody(await request.json()));
  return updated ? Response.json(updated) : notFound();
}

async function handleGiftExchanges(request: Request, env: Env, accountId: string): Promise<Response> {
  if (request.method === 'GET') return Response.json(await listGiftExchanges(env.DB, accountId));
  if (request.method !== 'POST') return methodNotAllowed();

  const { xmasYear, exchanges } = parseGiftExchangesBody(await request.json());
  await replaceGiftExchangesForYear(env.DB, accountId, xmasYear, exchanges);
  return new Response(null, { status: HTTP_STATUS.NO_CONTENT });
}

/** JSON API routes: anyone with the account ID can read; writes need an admin session. */
async function handleApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  const familyMemberMatch = url.pathname.match(FAMILY_MEMBER_JSON_PATTERN);
  const isApiPath =
    url.pathname === PATHS.FAMILY_MEMBERS_JSON || url.pathname === PATHS.GIFT_EXCHANGES_JSON || familyMemberMatch;
  if (!isApiPath) return null;

  const accountId = url.searchParams.get(QUERY_PARAMS.ACCOUNT_ID);
  const account = accountId ? await findAccount(env.DB, accountId) : null;
  if (!account) return notFound();

  if (request.method !== 'GET') {
    if (isCrossOrigin(request, url)) return forbidden();
    if (!(await hasAdminSession(request, env.DB, account.account_id))) {
      return Response.json({ error: 'Admin login required' }, { status: HTTP_STATUS.UNAUTHORIZED });
    }
  }

  if (familyMemberMatch) return handleFamilyMember(request, env, account.account_id, Number(familyMemberMatch[1]));
  if (url.pathname === PATHS.FAMILY_MEMBERS_JSON) return handleFamilyMembers(request, env, account.account_id);
  return handleGiftExchanges(request, env, account.account_id);
}

const ADMIN_FORM_HANDLERS: Record<string, (request: Request, env: Env, url: URL) => Promise<Response>> = {
  [PATHS.ADMIN_LOGIN]: handleAdminLogin,
  [PATHS.ADMIN_LOGOUT]: handleAdminLogout,
  [PATHS.ADMIN_PASSWORD]: handleChangeAdminPassword,
};

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  const apiResponse = await handleApi(request, env, url);
  if (apiResponse) return apiResponse;

  if (url.pathname === PATHS.HOME) return html(renderHomePage());

  if (url.pathname === PATHS.ACCOUNTS) {
    return request.method === 'POST' ? handleCreateAccount(request, env, url) : methodNotAllowed();
  }

  const adminFormHandler = ADMIN_FORM_HANDLERS[url.pathname];
  if (adminFormHandler) return request.method === 'POST' ? adminFormHandler(request, env, url) : methodNotAllowed();

  const accountPageMatch = url.pathname.match(ACCOUNT_PAGE_PATTERN);
  if (accountPageMatch) return handleAccountPage(env, url, accountPageMatch[1]);

  if (url.pathname === PATHS.KRIS_KRINGLE) return handleKrisKringlePage(request, env, url);

  return env.ASSETS.fetch(request);
}

export default {
  async fetch(request, env): Promise<Response> {
    try {
      return await route(request, env);
    } catch (error) {
      if (error instanceof InvalidRequestError || error instanceof SyntaxError) {
        return Response.json({ error: error.message }, { status: HTTP_STATUS.BAD_REQUEST });
      }
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;
