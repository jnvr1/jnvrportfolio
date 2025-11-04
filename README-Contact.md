Contacto 100% funcional (EmailJS)

Resumen
- Añadí un formulario de contacto reutilizable y un servicio que envía correos usando EmailJS sin dependencias extra.
- Archivos clave:
  - `src/app/shared/contact-form/contact-form.component.ts|html|scss`
  - `src/app/services/contact.service.ts`
  - `src/app/config/contact.config.ts`

Configurar EmailJS
1) Crea una cuenta en https://www.emailjs.com/
2) Crea un Email Service (Service ID)
3) Crea una Template (Template ID) con variables: `from_name`, `reply_to`, `subject`, `message`
4) Copia tu Public Key (Key pública)
5) Edita `src/app/config/contact.config.ts` y pega tus `serviceId`, `templateId`, `publicKey`.

Usar el formulario en una página existente (Angular standalone)
1) Abre la página donde quieras mostrar el formulario (por ejemplo `src/app/pages/home/home.page.ts`).
2) Importa el componente:
   `import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';`
3) Añádelo en `@Component({ imports: [ContactFormComponent, ...] })`.
4) En el HTML de la página, inserta `<app-contact-form></app-contact-form>` donde corresponda.

Usar con módulos (NgModule clásico)
1) Declara `ContactFormComponent` en el módulo de la página o en `app.module.ts`.
2) Asegúrate de tener `ReactiveFormsModule` importado en el módulo.
3) Usa `<app-contact-form></app-contact-form>` en el HTML.

Notas
- El formulario valida nombre, correo y mensaje. Muestra estados de envío/éxito/error.
- Si prefieres no usar EmailJS, puedo cambiar a Formspree, Resend u otra API.
- En `contact-form.component.html` cambia el `mailto:tu-correo@ejemplo.com` por tu correo para enlace alternativo.

