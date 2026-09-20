import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "montnero_session";
const SESSION_TTL = 60 * 60 * 8;

function sessionToken() {
  const secret = process.env.DASHBOARD_ACCESS_CODE;
  if (!secret) return "";
  return createHmac("sha256", secret).update("montnero-dashboard-session").digest("hex");
}

function getCookie(req: any, name: string) {
  const cookies = String(req.headers?.cookie || "").split(";");
  const entry = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : "";
}

export function isAuthenticated(req: any) {
  const received = getCookie(req, COOKIE_NAME);
  const expected = sessionToken();
  if (!received || !expected || received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export function sessionCookie() {
  return `${COOKIE_NAME}=${encodeURIComponent(sessionToken())}; Max-Age=${SESSION_TTL}; Path=/; HttpOnly; SameSite=Lax; Secure`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax; Secure`;
}

export function managerName() {
  return process.env.DASHBOARD_MANAGER_NAME || "ياسر";
}
