/**
 * Contact form submit logic — EmailJS via raw fetch().
 * Extracted as a pure module so it can be unit-tested with vi.fn() mocks.
 *
 * Design decision: No emailjs-com npm package — use fetch() directly.
 * Bundle weight matters on a portfolio; the SDK adds ~10 KB for a single POST call.
 */
import { emailJsConfig, type EmailParams } from '../config/contact';

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send';

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

/**
 * Validate form fields before submission.
 * Returns a map of field → error message, or an empty map if valid.
 */
export function validateContactForm(fields: {
  name: string;
  email: string;
  message: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!fields.name.trim()) {
    errors['name'] = 'nameRequired';
  }

  if (!fields.email.trim()) {
    errors['email'] = 'emailRequired';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors['email'] = 'emailInvalid';
  }

  if (!fields.message.trim()) {
    errors['message'] = 'messageRequired';
  }

  return errors;
}

/**
 * Send the contact form via EmailJS REST API.
 *
 * @param params - Template params: name, from_name, email, reply_to, time, subject, message
 * @param fetchFn - Injectable fetch function (default: global fetch). Used for testing.
 */
export async function submitContactForm(
  params: EmailParams,
  fetchFn: typeof fetch = fetch,
): Promise<SubmitResult> {
  const { serviceId, templateId, publicKey } = emailJsConfig;

  try {
    const response = await fetchFn(EMAILJS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          name: params.name,
          from_name: params.from_name,
          email: params.email,
          reply_to: params.reply_to,
          time: params.time,
          subject: params.subject,
          message: params.message,
        },
      }),
    });

    if (!response.ok) {
      return { ok: false, error: 'httpError' };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'networkError' };
  }
}

/**
 * Apply aria-invalid attributes to form inputs based on validation errors.
 *
 * NOTE: `errors` values are RAW i18n keys (e.g. 'nameRequired'), NOT localized
 * strings. This writes them verbatim to the error element's textContent, so the
 * CALLER MUST pre-map keys → localized strings (via t(locale, `form.${key}`))
 * before passing them in if the text is meant to be shown to users.
 */
export function applyValidationErrors(
  form: HTMLFormElement,
  errors: Record<string, string>,
): void {
  // Clear all previous errors
  form.querySelectorAll<HTMLElement>('[aria-invalid]').forEach((el) => {
    el.setAttribute('aria-invalid', 'false');
    el.removeAttribute('aria-describedby');
  });
  form.querySelectorAll<HTMLElement>('[data-error]').forEach((el) => {
    el.textContent = '';
  });

  // Apply new errors
  for (const [field, errorKey] of Object.entries(errors)) {
    const input = form.querySelector<HTMLElement>(`[name="${field}"]`);
    const errorEl = form.querySelector<HTMLElement>(`[data-error="${field}"]`);
    if (input) {
      input.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
      errorEl.textContent = errorKey;
    }
  }
}
