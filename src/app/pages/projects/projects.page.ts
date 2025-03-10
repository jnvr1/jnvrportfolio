import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonChip, IonLabel, IonCardContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonLabel, IonChip, IonCardTitle, IonCardHeader, IonCard, CommonModule, FormsModule]
})
export class ProjectsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
