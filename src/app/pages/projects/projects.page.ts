import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonChip, IonIcon, IonModal, IonButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent } from '@ionic/angular/standalone';
import { GeometricCardComponent } from '../../components/geometric-card/geometric-card.component';
import { GeometricSkeletonComponent } from '../../components/geometric-skeleton/geometric-skeleton.component';
import { InViewDirective } from '../../directives/in-view.directive';
import { LazyImgDirective } from '../../directives/lazy-img.directive';
import { fadeInUpStagger } from '../../animations/geometric.animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  categories: Array<'Web' | 'Mobile' | 'Design'>;
  variant?: 'default' | 'featured' | 'minimal';
  badge?: string;
  icon?: string;
  size?: 'wide' | 'tall' | 'large' | 'default';
  link: string;
  details?: {
    about?: string;
    features?: string[];
    links?: { demo?: string; repo?: string; caso?: string };
    role?: string;
    period?: string;
    outcomes?: string[];
    screenshots?: string[];
  };
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    // Ionic standalone components used in the template
    IonChip,
    IonIcon,
    IonModal,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    // Shared components
    GeometricCardComponent,
    GeometricSkeletonComponent,
    InViewDirective,
    LazyImgDirective,
  ],
  animations: [fadeInUpStagger]
})
export class ProjectsPage implements OnInit, OnDestroy {
  filters: Array<'All' | 'Web' | 'Mobile' | 'Design'> = ['All', 'Web', 'Mobile', 'Design'];
  selectedFilter: 'All' | 'Web' | 'Mobile' | 'Design' = 'All';
  hoveredId: string | null = null;

  projects: ProjectItem[] = [
    {
      id: 'vida',
      title: 'Vida Saludable',
      description: 'Plataforma móvil y web para registro detallado y análisis.',
      image: 'assets/proyectos/vida-saludable.png',
      tags: ['Ionic', 'Angular', 'Firebase'],
      categories: ['Web', 'Mobile'],
      variant: 'featured',
      badge: 'App',
      icon: 'star',
      size: 'large',
      link: '/projects#vida-saludable',
      details: {
        about: 'Registro de hábitos, alimentación, actividad y métricas de salud con panel de análisis y notificaciones. Interfaz unificada móvil/web con sincronización en tiempo real.',
        role: 'Full‑stack (Ionic + Firebase)',
        period: '2023–2024',
        features: ['Registro diario multi‑categoría', 'Gráficas y tendencias', 'Auth y sync en Firebase'],
        outcomes: ['+1K registros de hábitos cargados en piloto', 'Retención semanal > 60% en usuarios de prueba'],
        links: { demo: '#projects', caso: '#projects' },
        screenshots: ['assets/proyectos/vida-saludable.png']
      }
    },
    {
      id: 'centinela',
      title: 'Centinela Accesos',
      description: 'Control de accesos con suscripciones (Stripe/Mercado Pago).',
      image: 'assets/proyectos/centinela.png',
      tags: ['Ionic', 'Stripe', 'Subs'],
      categories: ['Mobile'],
      badge: 'SaaS',
      icon: 'shield',
      size: 'wide',
      link: '/projects#centinela',
      details: {
        about: 'App de control de accesos con planes de suscripción y pagos integrados. Módulos para administrar residentes, guardias y bitácoras.',
        role: 'Frontend + Integraciones de pago',
        period: '2022–2023',
        features: ['Planes con Stripe/MercadoPago', 'Roles y permisos', 'Reportes de accesos'],
        outcomes: ['Reducción 40% en incidencias de acceso por automatización', 'Cobranza recurrente con dunning básico'],
        links: { demo: '#projects', repo: '#', caso: '#projects' },
        screenshots: ['assets/proyectos/centinela.png']
      }
    },
    {
      id: 'fletes',
      title: 'Fletes México',
      description: 'Operaciones: operadores, gastos, diesel, tickets, docs.',
      image: 'assets/proyectos/fletes-mexico.png',
      tags: ['FastAPI', 'Ionic', 'BI'],
      categories: ['Web', 'Mobile', 'Design'],
      badge: 'Ops',
      icon: 'cube',
      size: 'tall',
      link: '/projects#fletes-mexico',
      details: {
        about: 'Suite de operación logística: operadores, gastos, combustible, evidencias y analítica. Backend de microservicios + BI.',
        role: 'Arquitectura y backend (FastAPI) + BI',
        period: '2021–2024',
        features: ['Módulos de costos y diesel', 'Carga de tickets/archivos', 'Tableros BI'],
        outcomes: ['Tiempos de conciliación -65%', 'Reporte operativo diario automatizado'],
        links: { demo: '#projects', caso: '#projects' },
        screenshots: ['assets/proyectos/fletes-mexico.png']
      }
    },
    {
      id: 'teotech',
      title: 'Teotech',
      description: 'CRMs personalizados para ventas y gestión escolar.',
      image: 'assets/proyectos/cropped-cropped-Sin-titulo-2.png.webp',
      tags: ['PHP', 'HTML', 'JS', 'SQL'],
      categories: ['Web', 'Design'],
      variant: 'minimal',
      badge: 'CRM',
      icon: 'construct',
      size: 'default',
      link: '/projects#teotech',
      details: {
        about: 'CRMs a medida para ventas y gestión académica con flujos y perfiles personalizados. Enfoque en usabilidad y operatividad.',
        role: 'Full‑stack (PHP/JS + SQL)',
        period: '2019–2022',
        features: ['Pipeline de ventas', 'Control escolar', 'Reportes y exportaciones'],
        outcomes: ['Adopción por 3 equipos comerciales', 'Tiempo de registro de oportunidad -50%'],
        links: { demo: '#projects', repo: '#', caso: '#projects' },
        screenshots: ['assets/proyectos/cropped-cropped-Sin-titulo-2.png.webp']
      }
    },
  ];

  loaded: Record<string, boolean> = {};
  isDetailOpen = false;
  selected?: ProjectItem;
  private qpSub?: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Deep link: abre/cierra modal según ?project=
    this.qpSub = this.route.queryParamMap.subscribe((params) => {
      const id = params.get('project');
      if (id) {
        const p = this.projects.find(x => x.id === id);
        if (p) {
          this.selected = p;
          this.isDetailOpen = true;
          this.hoveredId = id;
          // Espera al render y centra la tarjeta en vista
          setTimeout(() => this.scrollToProject(id), 0);
          return;
        }
      }
      // Si no hay project o no coincide, cierra
      this.isDetailOpen = false;
      this.selected = undefined;
      this.hoveredId = null;
    });
  }

  get filteredProjects(): ProjectItem[] {
    const f = this.selectedFilter;
    if (f === 'All') {
      return this.projects;
    }
    return this.projects.filter(p => p.categories.includes(f));
  }

  selectFilter(f: 'All' | 'Web' | 'Mobile' | 'Design') {
    this.selectedFilter = f;
  }

  onCardClick(ev: Event, p: ProjectItem) {
    ev.preventDefault();
    this.openDetail(p);
  }

  openDetail(p: ProjectItem) {
    // Actualiza query param y fragment para deep link
    this.hoveredId = p.id;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { project: p.id },
      queryParamsHandling: 'merge',
      fragment: p.id,
      replaceUrl: false,
    });
    setTimeout(() => this.scrollToProject(p.id), 0);
  }

  closeDetail() {
    // Quita el query param ?project y el fragment para cerrar
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { project: null },
      queryParamsHandling: 'merge',
      fragment: '' as any,
      replaceUrl: false,
    });
  }

  shareTagsWith(a: ProjectItem, bId: string | null): boolean {
    if (!bId) return false;
    const b = this.projects.find(x => x.id === bId);
    if (!b) return false;
    return a.tags.some(t => b.tags.includes(t));
  }

  onCardImageLoaded(id: string) {
    this.loaded[id] = true;
  }

  onModalDidDismiss() {
    this.selected = undefined;
    this.hoveredId = null;
  }

  ngOnDestroy(): void {
    this.qpSub?.unsubscribe();
  }

  private scrollToProject(id: string) {
    const el = document.getElementById('project-' + id);
    if (el) {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
      try { (el as HTMLElement).focus({ preventScroll: true }); } catch {}
    }
  }
}

