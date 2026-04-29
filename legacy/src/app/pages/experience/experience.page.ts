import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeometricCardComponent } from '../../components/geometric-card/geometric-card.component';
import { GeometricSkeletonComponent } from '../../components/geometric-skeleton/geometric-skeleton.component';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.page.html',
  styleUrls: ['./experience.page.scss'],
  standalone: true,
  imports: [CommonModule, GeometricCardComponent, GeometricSkeletonComponent]
})
export class ExperiencePage implements OnInit {
  loading = true;

  ngOnInit(): void {
    // Pequeña espera para mostrar esqueleto y animación de construcción
    setTimeout(() => (this.loading = false), 450);
  }
}
