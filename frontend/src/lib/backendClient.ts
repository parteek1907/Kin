/**
 * Backend Service Client for Next.js Server-side Runtime (Functions / Route Handlers)
 * Automatically consumes the Vercel Service binding variable BACKEND_URL injected at runtime.
 */
export function getBackendUrl(path: string): URL {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(cleanPath, baseUrl);
}

export async function fetchBackend(path: string, init?: RequestInit): Promise<Response> {
  const targetUrl = getBackendUrl(path);
  return fetch(targetUrl.toString(), init);
}
