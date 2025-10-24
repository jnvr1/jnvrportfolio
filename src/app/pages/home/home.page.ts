import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { textReveal, drawLine } from '../../animations/geometric.animations';
import { ProjectsPage } from '../projects/projects.page';
import { ExperiencePage } from '../experience/experience.page';
import { ContactPage } from '../contact/contact.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, ProjectsPage, ExperiencePage, ContactPage],
  animations: [textReveal, drawLine]
})
export class HomePage {}
