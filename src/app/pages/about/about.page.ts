import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonCardSubtitle, IonHeader, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
  standalone: true,
  imports: [IonImg, IonCardContent, IonCard, CommonModule, FormsModule]
})
export class AboutPage implements OnInit, OnDestroy {

  // Texto completo a mostrar
  fullText: string = "My name is Jonathan Noe Viramontes Ramirez, a software engineer passionate about technology and innovation. I love to create interactive applications and lead projects that make a positive impact.";

  // Array de palabras en formato HTML
  wordsEls: string[] = [];

  // Variable que se inyecta en el template mediante [innerHTML]
  displayedText: string = '';
  private timeouts: any[] = [];

  ngOnInit() {
    // Separamos el texto en palabras y las envolvemos en un span con clase "word"
    this.wordsEls = this.fullText.split(' ').map(word => `<span class="word">${word}</span> `);

    // Función recursiva para ir agregando la clase "visible" a cada palabra con un retraso
    const updateArrayWithDelay = (index = 0) => {
      if (index < this.wordsEls.length) {
        // Reemplazamos el span sin clase por uno que tenga "visible"
        this.wordsEls[index] = this.wordsEls[index].replace('class="word"', 'class="word visible"');
        // Actualizamos el contenido a mostrar
        this.displayedText = this.wordsEls.join('');
        const id = setTimeout(() => {
          updateArrayWithDelay(index + 1);
        }, 100); // Ajusta este valor (30ms) según la velocidad deseada
        this.timeouts.push(id);
      }
    };

    // Iniciamos la animación con un pequeño retraso
    const startId = setTimeout(() => {
      updateArrayWithDelay();
    }, 60);
    this.timeouts.push(startId);
  }

  ngOnDestroy() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

}
