export const SESSION_COOKIE = "nas_erp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
