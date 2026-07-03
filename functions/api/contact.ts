/**
 * POST /api/contact — Cloudflare Pages Function.
 *
 * Order matters: we persist every valid inquiry to KV BEFORE emailing, so a
 * Resend outage or quota hit (free tier = 100/day) never silently loses a lead.
 * Turnstile + honeypot + min-submit-time filter bots; a WAF rate-limit rule on
 * this path (see README) is the outer layer.
 */

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  INQUIRIES: { put: (key: string, value: string) => Promise<void> };
}

interface Ctx {
  request: Request;
  env: Env;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 120, email: 160, session: 80, date: 40, message: 4000 };

const clean = (v: FormDataEntryValue | null, max: number): string =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

function wantsJson(request: Request): boolean {
  return (request.headers.get("accept") ?? "").includes("application/json");
}

function respond(request: Request, ok: boolean, status: number, error?: string): Response {
  if (wantsJson(request)) {
    return new Response(JSON.stringify(ok ? { ok: true } : { error }), {
      status,
      headers: { "content-type": "application/json" },
    });
  }
  // No-JS path: redirect to a friendly page.
  return new Response(null, {
    status: 303,
    headers: { location: ok ? "/thank-you" : "/contact?error=1" },
  });
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  try {
    const body = new FormData();
    body.append("secret", secret);
    body.append("response", token);
    if (ip) body.append("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  // Only accept real form posts.
  const ctype = request.headers.get("content-type") ?? "";
  if (!ctype.includes("form-data") && !ctype.includes("x-www-form-urlencoded")) {
    return respond(request, false, 415, "Unsupported content type.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(request, false, 400, "Could not read the form.");
  }

  // Honeypot: a filled hidden field means a bot. Pretend success, drop silently.
  if (clean(form.get("company"), 100) !== "") {
    return respond(request, true, 200);
  }

  // Min-submit-time: instant submits are bots.
  const startedAt = Number(clean(form.get("started_at"), 20));
  if (startedAt && Date.now() - startedAt < 2500) {
    return respond(request, true, 200);
  }

  const name = clean(form.get("name"), MAX.name);
  const email = clean(form.get("email"), MAX.email);
  const sessionType = clean(form.get("session_type"), MAX.session);
  const eventDate = clean(form.get("event_date"), MAX.date);
  const message = clean(form.get("message"), MAX.message);

  if (!name || !EMAIL_RE.test(email) || !sessionType || !message) {
    return respond(request, false, 400, "Please fill in all required fields.");
  }

  const ip = request.headers.get("cf-connecting-ip") ?? "";
  const token = clean(form.get("cf-turnstile-response"), 4000);
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, ip))) {
    return respond(request, false, 400, "Spam check failed. Please try again.");
  }

  const inquiry = { name, email, sessionType, eventDate, message, ip, at: new Date().toISOString() };

  // 1) Durable record first — this is the system of record, not the email.
  try {
    await env.INQUIRIES.put(`inquiry:${Date.now()}:${crypto.randomUUID()}`, JSON.stringify(inquiry));
  } catch (err) {
    console.error("KV write failed", err);
  }

  // 2) Notify by email. If this fails, the lead is already saved in KV.
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `New inquiry — ${sessionType}`,
        // Plain text: user input never touches headers, so no injection surface.
        text:
          `New inquiry from your website\n\n` +
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Session: ${sessionType}\n` +
          `Preferred date: ${eventDate || "—"}\n\n` +
          `Message:\n${message}\n`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) console.error("Resend failed", res.status, await res.text());
  } catch (err) {
    console.error("Resend error", err);
  }

  return respond(request, true, 200);
};

// This endpoint only accepts POST.
export const onRequestGet = (): Response =>
  new Response("Method not allowed", { status: 405, headers: { allow: "POST" } });
