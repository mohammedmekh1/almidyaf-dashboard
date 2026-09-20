import { clearSessionCookie, isAuthenticated, managerName, sessionCookie } from "./_auth";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    return res.status(200).json({ authenticated: isAuthenticated(req), manager: managerName() });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const action = req.body?.action || "login";
  if (action === "logout") {
    res.setHeader("Set-Cookie", clearSessionCookie());
    return res.status(200).json({ authenticated: false });
  }
  const code = String(req.body?.code || "");
  const configured = process.env.DASHBOARD_ACCESS_CODE;
  if (!configured) return res.status(503).json({ error: "لم يتم إعداد رمز دخول اللوحة بعد" });
  if (code !== configured) return res.status(401).json({ error: "رمز الدخول غير صحيح" });
  res.setHeader("Set-Cookie", sessionCookie());
  return res.status(200).json({ authenticated: true, manager: managerName() });
}
