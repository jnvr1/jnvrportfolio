import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonText, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  imports: [IonButton, CommonModule, IonContent]
})
export class NotFoundPage {
  constructor() {}

  goHome() {
    window.location.href = '/home';
  }
}
