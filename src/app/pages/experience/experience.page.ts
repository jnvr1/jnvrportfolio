import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonAccordion, IonLabel, IonAccordionGroup } from '@ionic/angular/standalone';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.page.html',
  styleUrls: ['./experience.page.scss'],
  standalone: true,
  imports: [IonAccordionGroup, IonLabel, IonAccordion, IonItem, IonList,  IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ExperiencePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
