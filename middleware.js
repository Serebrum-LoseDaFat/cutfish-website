// Password protection for the private app preview (/app-preview).
// Vercel runs this before serving those paths; everything else on the site
// stays public. HTTP Basic Auth: the browser asks for a username and password.
//
// Set two environment variables in Vercel (Project → Settings → Environment
// Variables), then redeploy:
//   PREVIEW_USER       the username to share with Krishna
//   PREVIEW_PASSWORD   the password (never commit it)
// If either is missing, the preview stays locked for everyone.

export const config = { matcher: ['/app-preview', '/app-preview/:path*'] };

const REALM = 'Cutfish app preview';

function safeEqual(a, b) {
  // Compare without leaking where the strings differ.
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) | 0) ^ (b.charCodeAt(i) | 0);
  return diff === 0;
}

function unauthorized(message) {
  return new Response(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export default function middleware(request) {
  const user = process.env.PREVIEW_USER;
  const pass = process.env.PREVIEW_PASSWORD;
  if (!user || !pass) return unauthorized('The app preview is locked: no password is set yet.');

  const header = request.headers.get('authorization') || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme === 'Basic' && encoded) {
    let decoded = '';
    try {
      decoded = atob(encoded);
    } catch {
      return unauthorized('Sign in to see the Cutfish app preview.');
    }
    const i = decoded.indexOf(':');
    const u = decoded.slice(0, i);
    const p = decoded.slice(i + 1);
    if (i > -1 && safeEqual(u, user) && safeEqual(p, pass)) {
      // Let the request through to the static files (same as next() from @vercel/edge).
      return new Response(null, { headers: { 'x-middleware-next': '1' } });
    }
  }
  return unauthorized('Sign in to see the Cutfish app preview.');
}
