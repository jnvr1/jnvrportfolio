import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonItem, IonInput, IonTextarea, IonButton, IonNote } from '@ionic/angular/standalone';
import { sendContactEmail } from '../../services/contact.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonItem, IonInput, IonTextarea, IonButton, IonNote],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
  constructor(private fb: FormBuilder) {}

  loading = signal(false);
  sent = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(254),
      ],
    ],
    subject: ['', [Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  get f() {
    return this.form.controls;
  }

  async onSubmit() {
    this.errorMsg.set(null);
    this.sent.set(false);

    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    try {
      await sendContactEmail({
        name: this.f.name.value!,
        email: this.f.email.value!,
        subject: this.f.subject.value || undefined,
        message: this.f.message.value!,
      });
      this.sent.set(true);
      this.form.reset();
    } catch (err: any) {
      this.errorMsg.set(err?.message || 'Error al enviar. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }
}
