/**
 * Thin fetch wrapper for the Django/DRF backend: session-cookie auth plus
 * Django's CSRF double-submit-cookie scheme (fetch a token via
 * GET /api/auth/csrf/, then echo it back as X-CSRFToken on unsafe requests).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfCookie(): Promise<void> {
  if (getCookie("csrftoken")) return;
  await fetch(`${API_BASE}/api/auth/csrf/`, { credentials: "include" });
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (method !== "GET" && method !== "HEAD") {
    await ensureCsrfCookie();
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) headers.set("X-CSRFToken", csrfToken);
  }
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
}

export interface Session {
  email: string;
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await apiFetch("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => ({}));
  return { ok: false, error: data.detail ?? "Invalid credentials." };
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout/", { method: "POST" });
}

export async function getSession(): Promise<Session | null> {
  const res = await apiFetch("/api/auth/session/");
  if (!res.ok) return null;
  return res.json();
}
