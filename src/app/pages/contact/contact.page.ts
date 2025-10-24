import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, IonItem, IonInput, IonTextarea } from '@ionic/angular/standalone';
import { drawLine, nodesPulse } from '../../animations/geometric.animations';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButton,
    IonIcon,
    IonItem,
    IonInput,
    IonTextarea,
  ],
  animations: [drawLine, nodesPulse]
})
export class ContactPage {
  constructor() {}
}

