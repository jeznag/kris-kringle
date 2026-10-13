export const QUERY_PARAMS = {
  ACCOUNT_ID: 'account_id',
  ADMIN: 'admin',
  PASSWORD_CHANGED: 'password_changed',
} as const;

export const PATHS = {
  HOME: '/',
  ACCOUNTS: '/accounts',
  KRIS_KRINGLE: '/kris_kringle',
  FAMILY_MEMBERS_JSON: '/family_members.json',
  GIFT_EXCHANGES_JSON: '/gift_exchanges.json',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_LOGOUT: '/admin/logout',
  ADMIN_PASSWORD: '/admin/password',
} as const;

// Matches /accounts/<account_id>
export const ACCOUNT_PAGE_PATTERN = /^\/accounts\/([A-Za-z0-9]+)$/;
// Matches /family_members/<id>.json
export const FAMILY_MEMBER_JSON_PATTERN = /^\/family_members\/(\d+)\.json$/;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  SEE_OTHER: 303,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  TOO_MANY_REQUESTS: 429,
} as const;

export const ACCOUNT_ID_LENGTH = 24;
// Same alphabet as Ruby's SecureRandom.base58, which generated the legacy IDs.
export const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export const FORM_FIELDS = {
  ACCOUNT_NAME: 'account_name',
  ACCOUNT_ID: 'account_id',
  ADMIN_PASSWORD: 'admin_password',
} as const;

export const ADMIN_SESSION_COOKIE = 'kk_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
export const MIN_ADMIN_PASSWORD_LENGTH = 8;

// Bump when public/js or public/index.css change so browsers drop cached copies.
export const ASSET_VERSION = '2026.5';
