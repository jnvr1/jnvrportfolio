import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyImgDirective } from '../../directives/lazy-img.directive';
import { IonChip, IonIcon } from '@ionic/angular/standalone';

export type GeometricCardVariant = 'default' | 'featured' | 'minimal';

@Component({
  selector: 'app-geometric-card',
  standalone: true,
  imports: [CommonModule, IonChip, IonIcon, LazyImgDirective],
  templateUrl: './geometric-card.component.html',
  styleUrls: ['./geometric-card.component.scss']
})
export class GeometricCardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() image = '';
  @Input() tags: string[] = [];
  @Input() link = '';
  @Input() variant: GeometricCardVariant = 'default';
  @Input() badge?: string;
  @Input() icon?: string; // nombre de ion-icon, ej: 'sparkles', 'star', etc.
  @Output() imageLoaded = new EventEmitter<void>();

  get isExternal(): boolean {
    try {
      // Considera externo si comienza con http(s) o mailto
      return /^https?:\/\//i.test(this.link) || /^mailto:/i.test(this.link);
    } catch {
      return false;
    }
  }
}
