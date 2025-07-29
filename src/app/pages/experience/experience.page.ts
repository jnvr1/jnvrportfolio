import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonChip, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.page.html',
  styleUrls: ['./experience.page.scss'],
  standalone: true,
  imports: [IonChip,  CommonModule, FormsModule, IonLabel]
})
export class ExperiencePage {

  constructor() { }


}
