import { ASSET_VERSION, FORM_FIELDS, PATHS, QUERY_PARAMS } from './constants';

const FAIRY_LIGHT_COUNT = 40;
const ADMIN_EMAIL = 'jeremymnagel@gmail.com';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

interface LayoutOptions {
  title: string;
  eyebrow: string;
  subtitle: string;
  body: string;
  scripts?: string[];
}

function layout({ title, eyebrow, subtitle, body, scripts = [] }: LayoutOptions): string {
  const scriptTags = ['/js/countdown.js', ...scripts]
    .map((src) => `<script src="${src}?v=${ASSET_VERSION}"></script>`)
    .join('\n    ');
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎁</text></svg>" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="/index.css?v=${ASSET_VERSION}" rel="stylesheet" />
  </head>
  <body>
    <div class="snow" aria-hidden="true"></div>
    <ul class="lights" aria-hidden="true">${'<li></li>'.repeat(FAIRY_LIGHT_COUNT)}</ul>
    <div class="page">
      <header class="masthead">
        <p class="masthead__eyebrow">${escapeHtml(eyebrow)}</p>
        <h1 class="masthead__title"><a href="/">Kris Kringle</a></h1>
        <p class="masthead__subtitle">${subtitle}</p>
        <p class="countdown" data-countdown></p>
      </header>
      ${body}
    </div>
    <footer class="footer">Made with tinsel &amp; questionable algorithms 🦌</footer>
    ${scriptTags}
  </body>
</html>`;
}

export function krisKringleUrl(origin: string, accountId: string, isAdmin: boolean): string {
  const url = new URL(PATHS.KRIS_KRINGLE, origin);
  url.searchParams.set(QUERY_PARAMS.ACCOUNT_ID, accountId);
  if (isAdmin) url.searchParams.set(QUERY_PARAMS.ADMIN, '');
  return url.toString();
}

const RULES = [
  { icon: '🙅', text: "Kids don't give to their parents" },
  { icon: '👯', text: "Siblings don't give to each other" },
  { icon: '💑', text: "Partners don't buy for each other" },
  { icon: '🔁', text: 'No swaps: if Bob gives to Jane, Jane can’t give to Bob' },
  { icon: '📅', text: 'Never the same person two years running' },
  { icon: '🎓', text: 'Young adults only give to each other (they’re broke)' },
  { icon: '🍷', text: 'The old guard buy for each other and for the kids' },
  { icon: '🧸', text: 'Kids just get presents — no shopping required' },
];

export function renderHomePage(): string {
  const rules = RULES.map(
    (rule) => `<li><span class="rules__icon" aria-hidden="true">${rule.icon}</span><span>${rule.text}</span></li>`,
  ).join('');
  return layout({
    title: 'Kris Kringle Generator',
    eyebrow: 'Secret Santa for big families',
    subtitle: 'Is your extended family burgeoning out of control? Losing hair every December over who buys for whom? The elves have got this.',
    body: `<section class="card">
        <h2 class="card__title"><span aria-hidden="true">📜</span> The rules of the sleigh</h2>
        <p class="card__lead">We analyse your family tree and draw matches that keep everyone happy:</p>
        <ul class="rules">${rules}</ul>
      </section>
      <section class="card">
        <h2 class="card__title"><span aria-hidden="true">✨</span> Start your family's Kris Kringle</h2>
        <p class="card__lead">You'll get a private admin link to build your family tree and a link to share with everyone else.</p>
        <form class="signup" action="${PATHS.ACCOUNTS}" method="post">
          <div class="signup__field">
            <label for="${FORM_FIELDS.ACCOUNT_NAME}">Family name</label>
            <input id="${FORM_FIELDS.ACCOUNT_NAME}" name="${FORM_FIELDS.ACCOUNT_NAME}" type="text" placeholder="e.g. The Claus Family" required />
          </div>
          <button class="button" type="submit">🎁 Create my Kris Kringle</button>
        </form>
      </section>`,
  });
}

export function renderAccountPage(origin: string, accountName: string, accountId: string): string {
  const adminUrl = escapeHtml(krisKringleUrl(origin, accountId, true));
  const shareUrl = escapeHtml(krisKringleUrl(origin, accountId, false));
  return layout({
    title: `${accountName} — Kris Kringle`,
    eyebrow: 'Your workshop is ready',
    subtitle: `Welcome, ${escapeHtml(accountName || 'elf')}! Bookmark these links — they're the only way back in.`,
    body: `<section class="card">
        <h2 class="card__title"><span aria-hidden="true">🗝️</span> Your links</h2>
        <p class="card__lead">Your unique account ID is <strong>${escapeHtml(accountId)}</strong>. Don't lose it!</p>
        <div class="share">
          <p class="share__label"><label>Admin link — keep this one to yourself</label></p>
          <a class="share__url" href="${adminUrl}">${adminUrl}</a>
        </div>
        <div class="share">
          <p class="share__label"><label>Family link — share this with everyone</label></p>
          <a class="share__url" href="${shareUrl}">${shareUrl}</a>
        </div>
      </section>`,
  });
}

export function renderNoAccountPage(): string {
  return layout({
    title: 'Kris Kringle',
    eyebrow: 'Lost in the snow',
    subtitle: "We couldn't find that Kris Kringle.",
    body: `<section class="card">
        <h2 class="card__title"><span aria-hidden="true">🧭</span> No account ID</h2>
        <p>Looks like you haven't got a valid account ID for your Kris Kringle.</p>
        <p>If you're sure you've set one up, check with your admin to get yours.</p>
        <p>If you're the admin and you've lost your ID, email <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a> to get it back :)</p>
      </section>`,
  });
}

export function renderKrisKringlePage(origin: string, accountId: string, isAdmin: boolean): string {
  const year = new Date().getFullYear();
  const shareUrl = escapeHtml(krisKringleUrl(origin, accountId, false));
  const adminControls = isAdmin
    ? `<div class="share">
          <p class="share__label"><label>Share this link with the family</label></p>
          <span class="share__url" data-share-url>${shareUrl}</span>
          <button class="button button--quiet" type="button" data-copy-share-url>📋 Copy</button>
        </div>`
    : '';
  const generateButton = isAdmin
    ? '<button class="button" id="generate-results" type="button">🎲 Draw names</button>'
    : '';
  const addPersonButton = isAdmin
    ? '<button class="button button--gold" id="add-top-level-person" type="button">➕ Add a branch</button>'
    : '';
  return layout({
    title: `Kris Kringle ${year}`,
    eyebrow: isAdmin ? 'Head elf mode' : `Christmas ${year}`,
    subtitle: isAdmin
      ? 'Tend the family tree, then draw this year’s names.'
      : 'Find your name to see who you’re buying for this year.',
    body: `<script>window.accountID = ${JSON.stringify(accountId)};</script>
      <section class="card">
        <h2 class="card__title"><span aria-hidden="true">🎁</span> Who's buying for whom</h2>
        ${adminControls}
        <div class="toolbar">
          <div class="toolbar__search">
            <label for="filter-results">Find yourself</label>
            <input id="filter-results" type="search" placeholder="Start typing your name…" autocomplete="off" />
          </div>
          ${generateButton}
        </div>
        <div id="results">
          <div class="loading">Checking the list twice…</div>
        </div>
      </section>
      <section class="card">
        <h2 class="card__title"><span aria-hidden="true">🌲</span> The family tree</h2>
        ${addPersonButton}
        <div id="tree" class="tree" data-disabled="${!isAdmin}">
          <div class="loading">Untangling the tinsel…</div>
        </div>
      </section>`,
    scripts: ['/js/algorithm.js', '/js/api.js', '/js/ui.js'],
  });
}
