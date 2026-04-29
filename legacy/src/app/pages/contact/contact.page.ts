import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { drawLine, nodesPulse } from '../../animations/geometric.animations';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, ContactFormComponent],
  animations: [drawLine, nodesPulse]
})
export class ContactPage {
  constructor() {}
}

