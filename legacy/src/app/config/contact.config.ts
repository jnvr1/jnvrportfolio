export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}


// Crea una cuenta en https://www.emailjs.com/, define un servicio (serviceId),
// una plantilla (templateId) con variables: from_name, reply_to, subject, message
// y copia tu Public Key (publicKey).
export const EMAILJS_CONFIG: EmailJsConfig = {
  serviceId: 'service_kn6nd2f',
  templateId: 'template_l96zv27',
  publicKey: 'ZImFvPBUGE-I7sQxa',
};

