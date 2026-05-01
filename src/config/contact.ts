/**
 * EmailJS configuration for the contact form.
 * These are PUBLIC client-side keys — safe to expose in source.
 * See: https://www.emailjs.com/docs/sdk/send/
 */
export const emailJsConfig = {
  serviceId: 'service_kn6nd2f',
  templateId: 'template_l96zv27',
  publicKey: 'ZImFvPBUGE-I7sQxa',
} as const;

/**
 * Template parameters expected by the EmailJS template.
 * `email` mirrors the user's typed address so the template can render it in
 * the body, Reply-To, or any other field you configure in the EmailJS dashboard.
 */
export interface EmailParams {
  name: string;
  from_name: string;
  email: string;
  reply_to: string;
  time: string;
  subject: string;
  message: string;
}
