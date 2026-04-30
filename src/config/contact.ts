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
 */
export interface EmailParams {
  from_name: string;
  reply_to: string;
  subject: string;
  message: string;
}
