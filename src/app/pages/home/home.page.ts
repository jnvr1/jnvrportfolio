import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { IonContent, IonCardContent, IonImg, IonCard } from '@ionic/angular/standalone';
import { ExperiencePage } from "../experience/experience.page";
import { ContactPage } from '../contact/contact.page';
import { ProjectsPage } from '../projects/projects.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  // Se agrega CommonModule para habilitar *ngFor y [ngClass]
  imports: [CommonModule, IonContent, ExperiencePage, ContactPage, ProjectsPage, IonCardContent, IonImg, IonCard],
})
export class HomePage implements OnInit {
  // Texto completo a mostrar
  fullText: string = "Soy Jonathan Noe Viramontes Ramirez, Ingeniero de Software apasionado por la innovación. Me especializo en desarrollar microservicios con FastAPI, crear dashboards interactivos en Power BI y enseñar Python de forma remota. He colaborado con empresas como Fletes México, Museo La Rodadora, IA-Center y Bloomotion, transformando ideas en soluciones tecnológicas efectivas.";

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
