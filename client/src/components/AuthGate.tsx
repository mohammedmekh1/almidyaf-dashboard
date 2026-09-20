import { FormEvent, useEffect, useState } from "react";
import { Crown, LockKeyhole, ShieldCheck } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [manager, setManager] = useState("ياسر");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetch("/api/auth").then((response) => response.json()).then((payload) => { setAuthenticated(Boolean(payload.authenticated)); setManager(payload.manager || "ياسر"); setReady(true); }).catch(() => setReady(true)); }, []);
  async function login(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const response = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "تعذر تسجيل الدخول"); setManager(payload.manager || "ياسر"); setAuthenticated(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر تسجيل الدخول"); } finally { setBusy(false); } }
  if (!ready) return <div className="auth-screen"><div className="auth-card"><Crown size={28} className="text-[#B38E46]" /><p>جاري التحقق من الجلسة...</p></div></div>;
  if (authenticated) return <>{children}</>;
  return <div className="auth-screen" dir="rtl"><div className="auth-card"><div className="auth-brand"><span><Crown size={21} /></span><div><b>MONTNERO</b><small>غرفة القيادة التنفيذية</small></div></div><div className="auth-seal"><LockKeyhole size={22} /></div><p className="section-kicker">SECURE EXECUTIVE ACCESS</p><h1>مرحباً، {manager}</h1><p className="auth-description">أدخل رمز الدخول المشترك للوصول إلى بيانات العملاء والعمليات.</p><form onSubmit={login} className="space-y-3"><label className="auth-label">رمز الدخول<input autoFocus type="password" value={code} onChange={(event) => setCode(event.target.value)} placeholder="أدخل الرمز" /></label>{error && <p className="auth-error">{error}</p>}<button disabled={busy || !code} className="auth-submit" type="submit"><ShieldCheck size={17} />{busy ? "جارٍ التحقق..." : "دخول آمن"}</button></form><p className="auth-note">الجلسة محمية وتستمر لمدة ٨ ساعات.</p></div></div>;
}
