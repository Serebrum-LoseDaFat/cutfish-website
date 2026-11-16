// Sign-in for the private app preview (/app-preview). Vercel runs this before
// serving those paths; the rest of the site stays public.
//
// People sign in with an email and a password on a Cutfish-styled page:
//  - Allowed emails: ALLOWED_EMAILS below, or a comma-separated PREVIEW_EMAILS
//    environment variable if set.
//  - The password lives only in the PREVIEW_PASSWORD environment variable
//    (Vercel → Project → Settings → Environment Variables). Never commit it.
//  - A successful sign-in sets a signed cookie for 7 days. Changing the
//    password signs everyone out.
// With no PREVIEW_PASSWORD set, the preview stays locked for everyone.

export const config = { matcher: ['/app-preview', '/app-preview/:path*'] };

const ALLOWED_EMAILS = ['partners@vygor.health', 'krishna@serebrumhq.com'];
const COOKIE = 'cutfish_preview';
const MAX_AGE = 7 * 24 * 60 * 60; // seconds
const BASE = '/app-preview';

const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));

function allowedEmails() {
  const env = process.env.PREVIEW_EMAILS;
  const list = env ? env.split(',') : ALLOWED_EMAILS;
  return list.map((e) => e.trim().toLowerCase()).filter(Boolean);
}

function safeEqual(a, b) {
  // Compare without leaking where the strings differ.
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) | 0) ^ (b.charCodeAt(i) | 0);
  return diff === 0;
}

async function sign(message, password) {
  // The signing key comes from the password, so a new password ends every session.
  const key = await crypto.subtle.importKey('raw', enc.encode(`cutfish-preview:${password}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

async function makeToken(email, password) {
  const payload = b64url(enc.encode(JSON.stringify({ e: email, x: Math.floor(Date.now() / 1000) + MAX_AGE })));
  return `${payload}.${await sign(payload, password)}`;
}

async function validToken(token, password) {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!safeEqual(sig, await sign(payload, password))) return false;
  try {
    const { e, x } = JSON.parse(fromB64url(payload));
    return typeof x === 'number' && x > Date.now() / 1000 && allowedEmails().includes(String(e).toLowerCase());
  } catch {
    return false;
  }
}

function readCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function page(message, email = '', status = 200, locked = false) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow"><title>Sign in · Cutfish app preview</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>
:root{--bg:#0c1118;--surface:#131a24;--line:#253042;--ink:#e8edf4;--muted:#93a0b4;--coral:#ff5b3a;--bad:#f87171;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--ink);font:15px/1.5 "IBM Plex Sans",system-ui,sans-serif;padding:24px max(16px,env(safe-area-inset-left,0px))}
.box{width:min(380px,100%);background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:26px;display:flex;flex-direction:column;gap:14px}
.logo{display:flex;align-items:center;gap:8px;font:700 18px "Bricolage Grotesque",system-ui,sans-serif}.logo i{width:26px;height:26px;border-radius:7px;background:var(--coral);display:grid;place-items:center;font-style:normal;color:#fff;font-size:12px}
h1{font:700 22px "Bricolage Grotesque",system-ui,sans-serif;margin:4px 0 0}p{margin:0;color:var(--muted);font-size:14px}
label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--muted)}
input{font:inherit;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:10px 12px}
input:focus{outline:2px solid var(--coral);outline-offset:1px;border-color:transparent}
button{font:inherit;font-weight:600;color:#fff;background:var(--coral);border:0;border-radius:8px;padding:11px;cursor:pointer}
.err{color:var(--bad);font-size:14px}
</style></head><body>
<form class="box" method="post" action="${BASE}/login">
  <div class="logo"><i>▶</i>cutfish</div>
  <h1>App preview</h1>
  <p>${locked ? 'The preview is locked: no password has been set yet.' : 'Sign in with the email you were invited with.'}</p>
  ${message ? `<p class="err" role="alert">${esc(message)}</p>` : ''}
  <label>Email<input id="email" name="email" type="email" autocomplete="username" required value="${esc(email)}" ${locked ? 'disabled' : ''}></label>
  <label>Password<input id="password" name="password" type="password" autocomplete="current-password" required ${locked ? 'disabled' : ''}></label>
  <button type="submit" ${locked ? 'disabled' : ''}>Sign in</button>
</form></body></html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}

const redirect = (to, cookie) =>
  new Response(null, { status: 303, headers: { Location: to, 'Cache-Control': 'no-store', ...(cookie ? { 'Set-Cookie': cookie } : {}) } });
const cookieHeader = (value, maxAge) => `${COOKIE}=${encodeURIComponent(value)}; Path=${BASE}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

export default async function middleware(request) {
  const password = process.env.PREVIEW_PASSWORD;
  const { pathname } = new URL(request.url);
  if (!password) return page('', '', 503, true);

  if (pathname === `${BASE}/logout`) return redirect(BASE, cookieHeader('', 0));

  if (pathname === `${BASE}/login`) {
    if (request.method !== 'POST') return redirect(BASE);
    let email = '';
    let given = '';
    try {
      const form = await request.formData();
      email = String(form.get('email') || '').trim();
      given = String(form.get('password') || '');
    } catch {
      return page('Something went wrong. Try again.', '', 400);
    }
    const okEmail = allowedEmails().includes(email.toLowerCase());
    const okPass = safeEqual(given, password);
    if (okEmail && okPass) return redirect(BASE, cookieHeader(await makeToken(email.toLowerCase(), password), MAX_AGE));
    // One message for both cases, so the page doesn't reveal which emails are invited.
    return page('That email and password don’t match. Check both and try again.', email, 401);
  }

  if (await validToken(readCookie(request, COOKIE), password)) {
    // Signed in: serve the static preview (same as next() from @vercel/edge).
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }
  return page('', '', 401);
}
