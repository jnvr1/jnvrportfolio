import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonChip, IonIcon, IonButton } from '@ionic/angular/standalone';
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
    IonChip,
    IonIcon,
    IonButton,
    InViewDirective,
    LazyImgDirective,
  ],
  animations: [fadeInUpStagger]
})
export class ProjectsPage implements OnInit, OnDestroy {
  filters: Array<'All' | 'Web' | 'Mobile' | 'Design'> = ['All', 'Web', 'Mobile', 'Design'];
  selectedFilter: 'All' | 'Web' | 'Mobile' | 'Design' = 'All';

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
  selected?: ProjectItem;
  private qpSub?: Subscription;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.ensureSelection(false);

    this.qpSub = this.route.queryParamMap.subscribe((params) => {
      const id = params.get('project');
      if (id) {
        const match = this.projects.find(x => x.id === id);
        if (match) {
          if (this.selected?.id !== match.id) {
            this.setSelected(match, false, { scroll: true, focus: false });
          }
          return;
        }
      }
      this.ensureSelection(false);
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
    if (this.selectedFilter === f) {
      return;
    }
    this.selectedFilter = f;
    this.ensureSelection(true);
  }

  onSummaryClick(p: ProjectItem) {
    const alreadySelected = this.selected?.id === p.id;
    this.setSelected(p, true, { scroll: true, focus: true });
    if (!alreadySelected && typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setTimeout(() => this.scrollDetailPanelIntoView(), 250);
    }
  }

  onSummaryImageLoaded(id: string) {
    this.loaded[id] = true;
  }

  ngOnDestroy(): void {
    this.qpSub?.unsubscribe();
  }

  private ensureSelection(updateUrl: boolean) {
    const list = this.filteredProjects;
    if (!list.length) {
      this.selected = undefined;
      if (updateUrl) {
        this.updateUrlWithProject(undefined);
      }
      return;
    }

    if (!this.selected || !list.some(item => item.id === this.selected?.id)) {
      this.setSelected(list[0], updateUrl, { scroll: false, focus: false });
    }
  }

  private setSelected(p: ProjectItem, updateUrl = true, opts: { focus?: boolean; scroll?: boolean } = {}) {
    this.selected = p;
    if (updateUrl) {
      this.updateUrlWithProject(p);
    }

    if (opts.scroll || opts.focus) {
      this.scrollToProject(p.id, opts);
    }
  }

  private updateUrlWithProject(p?: ProjectItem) {
    const current = this.route.snapshot.queryParamMap.get('project');
    const next = p?.id ?? null;
    if (current === next) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { project: next },
      queryParamsHandling: 'merge',
      replaceUrl: false,
    });
  }

  private scrollToProject(id: string, opts: { focus?: boolean; scroll?: boolean } = {}) {
    if (typeof document === 'undefined') {
      return;
    }

    const { focus = true, scroll = true } = opts;
    setTimeout(() => {
      const el = document.getElementById('project-' + id);
      if (!el) {
        return;
      }
      if (scroll) {
        try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
      }
      if (focus) {
        try { (el as HTMLElement).focus({ preventScroll: true }); } catch {}
      }
    }, 0);
  }

  private scrollDetailPanelIntoView() {
    if (typeof document === 'undefined') {
      return;
    }
    const detail = document.querySelector('.detail-panel');
    if (!detail) {
      return;
    }
    try {
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
  }
}
