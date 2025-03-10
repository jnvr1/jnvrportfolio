import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCardContent, IonImg, IonCard } from '@ionic/angular/standalone';
import { ExperiencePage } from "../experience/experience.page";
import { ContactPage } from '../contact/contact.page';
import { ProjectsPage } from '../projects/projects.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  // Se agrega CommonModule para habilitar *ngFor y [ngClass]
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, ExperiencePage, ContactPage, ProjectsPage, IonCardContent, IonImg, IonCard],
})
export class HomePage implements OnInit {
  // Texto completo a mostrar
  fullText: string = "My name is Jonathan Noe Viramontes Ramirez, a software engineer passionate about technology and innovation. I love to create interactive applications and lead projects that make a positive impact.";

  // Array de palabras a mostrar
  words: string[] = [];
  // Contador de palabras que se han hecho visibles
  visibleWordsCount: number = 0;

  ngOnInit() {
    // Separamos el texto en palabras
    this.words = this.fullText.split(' ');
  }

  ionViewDidEnter() {
    // Iniciamos la animación secuencial
    this.animateWords(0);
  }

  animateWords(index: number) {
    if (index < this.words.length) {
      setTimeout(() => {
        this.visibleWordsCount = index + 1;
        this.animateWords(index + 1);
      }, 100); // Ajusta este valor para modificar la velocidad de aparición de cada palabra
    }
  }
}
