/** Next can normalize request.url to localhost; compare the browser's actual Host. */
export function sameOrigin(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    const protocol = process.env.VERCEL === '1'
      ? 'https:'
      : new URL(request.url).protocol;
    return origin === parsed.origin && parsed.host === host && parsed.protocol === protocol;
  } catch { return false; }
}
