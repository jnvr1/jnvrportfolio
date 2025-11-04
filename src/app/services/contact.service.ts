/* Lightweight Email sending via EmailJS REST API (no extra deps) */
import { EMAILJS_CONFIG } from '../config/contact.config';

export interface ContactMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

interface EmailJsPayload {
  service_id: string;
  template_id: string;
  user_id: string; // public key
  template_params: Record<string, string>;
}

export async function sendContactEmail(payload: ContactMessage): Promise<void> {
  const { serviceId, templateId, publicKey } = EMAILJS_CONFIG;

  if (
    !serviceId ||
    !templateId ||
    !publicKey ||
    serviceId.includes('YOUR_EMAILJS_') ||
    templateId.includes('YOUR_EMAILJS_') ||
    publicKey.includes('YOUR_EMAILJS_') 
  ) {
    throw new Error(
      'Faltan claves de EmailJS. Edita src/app/config/contact.config.ts y rellena serviceId, templateId y publicKey.'
    );
  }

  const now = new Date();
  // Formateo compatible con TS/Intl sin usar dateStyle/timeStyle
  const dateStr = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  } as Intl.DateTimeFormatOptions);
  const timeStr = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  } as Intl.DateTimeFormatOptions);
  const formattedTime = `${dateStr} ${timeStr}`;

  const body: EmailJsPayload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      // Compatibilidad EmailJS y tu plantilla
      // Tu HTML usa: name, email, subject, message, time
      name: payload.name,
      email: payload.email,
      subject: payload.subject ?? 'Nuevo mensaje de tu portafolio',
      message: payload.message,
      time: formattedTime,

      // Alias comunes en EmailJS por si los usas en el dashboard
      from_name: payload.name,
      reply_to: payload.email,
      time_iso: now.toISOString(),
    },
  };

  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `No se pudo enviar el mensaje (HTTP ${res.status}). ${text}`.trim()
    );
  }
}
