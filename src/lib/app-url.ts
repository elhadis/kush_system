/**
 * Resolve the public app origin for emails and absolute links.
 * Prefer an explicit env URL, then request headers, then Vercel’s host.
 */
export function resolveAppUrl(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }

  if (request) {
    const origin = request.headers.get("origin")?.trim();
    if (origin) {
      return stripTrailingSlash(origin);
    }

    const host =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host")?.trim();

    if (host) {
      const proto =
        request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
        (process.env.NODE_ENV === "production" ? "https" : "http");
      return `${proto}://${host}`;
    }
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }

  return "http://localhost:3000";
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}
