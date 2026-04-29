import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GeometricSkeletonVariant = 'card' | 'list' | 'text' | 'image';

@Component({
  selector: 'app-geometric-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './geometric-skeleton.component.html',
  styleUrls: ['./geometric-skeleton.component.scss']
})
export class GeometricSkeletonComponent {
  @Input() variant: GeometricSkeletonVariant = 'card';
}

