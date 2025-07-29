import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonText } from '@ionic/angular/standalone';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  imports: [CommonModule, IonContent, IonText]
})
export class NotFoundPage {}
