type JwtPayload = {
  sub?: string;
  email?: string;
  [key: string]: unknown;
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(payload);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function getStoredIdToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("goobiez_id_token");
}
