/**
 * Decodes a JWT token without verification
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export function decodeJWT<T = any>(token: string): T | null {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Base64 decode - handle URL-safe base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Token payload interface based on your JWT structure
 */
export interface TokenPayload {
  iss: string; // Issuer
  sub: string; // Subject (user ID)
  org: string; // Organization ID
  roles: string[]; // User roles
  iat: number; // Issued at
  exp: number; // Expiration
}

/**
 * Get organization ID from the access token
 */
export function getOrgIdFromToken(): string | null {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  const payload = decodeJWT<TokenPayload>(token);
  return payload?.org || null;
}

/**
 * Get user ID from the access token
 */
export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  const payload = decodeJWT<TokenPayload>(token);
  return payload?.sub || null;
}

/**
 * Get user roles from the access token
 */
export function getUserRolesFromToken(): string[] {
  const token = localStorage.getItem("access_token");
  if (!token) return [];

  const payload = decodeJWT<TokenPayload>(token);
  return payload?.roles || [];
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token?: string): boolean {
  const accessToken = token || localStorage.getItem("access_token");
  if (!accessToken) return true;

  const payload = decodeJWT<TokenPayload>(accessToken);
  if (!payload?.exp) return true;

  // Convert exp to milliseconds and compare with current time
  return Date.now() >= payload.exp * 1000;
}
