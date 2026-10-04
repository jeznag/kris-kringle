import {
  ACCOUNT_ID_LENGTH,
  ACCOUNT_PAGE_PATTERN,
  BASE58_ALPHABET,
  FAMILY_MEMBER_JSON_PATTERN,
  FORM_FIELDS,
  HTTP_STATUS,
  PATHS,
  QUERY_PARAMS,
} from './constants';
import {
  createAccount,
  createFamilyMember,
  deleteFamilyMember,
  findAccount,
  listFamilyMembers,
  listGiftExchanges,
  replaceGiftExchangesForYear,
  updateFamilyMember,
} from './db';
import { InvalidRequestError, parseFamilyMemberBody, parseGiftExchangesBody } from './parse';
import { renderAccountPage, renderHomePage, renderKrisKringlePage, renderNoAccountPage } from './pages';

const BYTE_RANGE = 256;
// Largest multiple of the alphabet size that fits in a byte; rejecting bytes above it
// keeps every character equally likely.
const UNBIASED_BYTE_LIMIT = BYTE_RANGE - (BYTE_RANGE % BASE58_ALPHABET.length);

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

function notFound(): Response {
  return new Response('Not found', { status: HTTP_STATUS.NOT_FOUND });
}

function methodNotAllowed(): Response {
  return new Response('Method not allowed', { status: HTTP_STATUS.METHOD_NOT_ALLOWED });
}

async function handleCreateAccount(request: Request, env: Env, url: URL): Promise<Response> {
  const form = await request.formData();
  const accountName = String(form.get(FORM_FIELDS.ACCOUNT_NAME) ?? '').trim();
  const accountId = generateAccountId();
  await createAccount(env.DB, accountName, accountId);
  return Response.redirect(new URL(`${PATHS.ACCOUNTS}/${accountId}`, url.origin).toString(), HTTP_STATUS.SEE_OTHER);
}

async function handleAccountPage(env: Env, url: URL, accountId: string): Promise<Response> {
  const account = await findAccount(env.DB, accountId);
  if (!account) return html(renderNoAccountPage(), HTTP_STATUS.NOT_FOUND);
  return html(renderAccountPage(url.origin, account.account_name ?? '', account.account_id));
}

async function handleKrisKringlePage(env: Env, url: URL): Promise<Response> {
  const accountId = url.searchParams.get(QUERY_PARAMS.ACCOUNT_ID);
  const account = accountId ? await findAccount(env.DB, accountId) : null;
  if (!account) return html(renderNoAccountPage(), HTTP_STATUS.NOT_FOUND);
  return html(renderKrisKringlePage(url.origin, account.account_id, url.searchParams.has(QUERY_PARAMS.ADMIN)));
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

/** JSON API routes; the account ID in the query string is the only credential. */
async function handleApi(request: Request, env: Env, url: URL): Promise<Response | null> {
  const familyMemberMatch = url.pathname.match(FAMILY_MEMBER_JSON_PATTERN);
  const isApiPath =
    url.pathname === PATHS.FAMILY_MEMBERS_JSON || url.pathname === PATHS.GIFT_EXCHANGES_JSON || familyMemberMatch;
  if (!isApiPath) return null;

  const accountId = url.searchParams.get(QUERY_PARAMS.ACCOUNT_ID);
  const account = accountId ? await findAccount(env.DB, accountId) : null;
  if (!account) return notFound();

  if (familyMemberMatch) return handleFamilyMember(request, env, account.account_id, Number(familyMemberMatch[1]));
  if (url.pathname === PATHS.FAMILY_MEMBERS_JSON) return handleFamilyMembers(request, env, account.account_id);
  return handleGiftExchanges(request, env, account.account_id);
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  const apiResponse = await handleApi(request, env, url);
  if (apiResponse) return apiResponse;

  if (url.pathname === PATHS.HOME) return html(renderHomePage());

  if (url.pathname === PATHS.ACCOUNTS) {
    return request.method === 'POST' ? handleCreateAccount(request, env, url) : methodNotAllowed();
  }

  const accountPageMatch = url.pathname.match(ACCOUNT_PAGE_PATTERN);
  if (accountPageMatch) return handleAccountPage(env, url, accountPageMatch[1]);

  if (url.pathname === PATHS.KRIS_KRINGLE) return handleKrisKringlePage(env, url);

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
