import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonIcon, IonList, IonCardContent, IonCardTitle, IonCardHeader, IonCard } from '@ionic/angular/standalone';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonIcon, IonLabel, IonItem, CommonModule, FormsModule]
})
export class ContactPage {

  constructor() { }


}
