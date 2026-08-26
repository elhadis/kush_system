import { createHash, randomBytes, timingSafeEqual } from "crypto";

const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

export function generateRandomPassword(length = 12): string {
  const bytes = randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }
  return password;
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, passwordHash?: string): boolean {
  if (!passwordHash) return false;
  const hashed = hashPassword(password);
  try {
    const a = Buffer.from(hashed, "hex");
    const b = Buffer.from(passwordHash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return hashed === passwordHash;
  }
}

export function sanitizeUser<T extends { passwordHash?: string }>(
  user: T
): Omit<T, "passwordHash"> {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

/** Hardcoded Super Admin credentials (requirement). */
export const SUPER_ADMIN_EMAIL = "admin@gmail.com";
export const SUPER_ADMIN_PASSWORD = "htdigital";
export const SUPER_ADMIN_USER_ID = "user-admin";

