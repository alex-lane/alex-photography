/**
 * Progressive enhancement for the contact form.
 * Without JS the form still POSTs to /api/contact and the Function 303-redirects
 * to /thank-you. With JS we validate inline, show states, and submit via fetch.
 */
export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>(".contact-form");
  if (!form || form.dataset.enhanced === "true") return;
  form.dataset.enhanced = "true";

  const startedAt = form.querySelector<HTMLInputElement>('input[name="started_at"]');
  if (startedAt) startedAt.value = String(Date.now());

  const status = form.querySelector<HTMLParagraphElement>(".form-status");
  const submit = form.querySelector<HTMLButtonElement>(".form-submit");

  const setStatus = (msg: string, kind: "error" | "success" | "" = "") => {
    if (!status) return;
    status.textContent = msg;
    status.style.color =
      kind === "error" ? "#b4432f" : kind === "success" ? "var(--color-accent-deep)" : "";
  };

  const requiredFields = () =>
    Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      "[required]",
    ));

  const validate = (): boolean => {
    let ok = true;
    for (const field of requiredFields()) {
      const valid = field.value.trim() !== "" && field.checkValidity();
      field.setAttribute("aria-invalid", valid ? "false" : "true");
      if (!valid && ok) {
        field.focus();
        ok = false;
      }
    }
    return ok;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    if (!validate()) {
      setStatus("Please fill in the highlighted fields.", "error");
      return;
    }

    submit?.setAttribute("disabled", "true");
    const original = submit?.textContent ?? "Send inquiry";
    if (submit) submit.textContent = "Sending…";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      if (res.ok) {
        window.location.href = "/thank-you";
        return;
      }

      const data = await res.json().catch(() => ({}) as { error?: string });
      setStatus(
        data.error ?? "Something went wrong sending your inquiry. Please try again.",
        "error",
      );
    } catch {
      setStatus(
        "Couldn't reach the server. Check your connection and try again.",
        "error",
      );
    } finally {
      submit?.removeAttribute("disabled");
      if (submit) submit.textContent = original;
    }
  });
}
