import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [IonHeader, IonToolbar, IonIcon, RouterModule]
})
export class HeaderComponent {
  menuOpen = false;
  isDark = false;
  isScrolled = false;

  constructor() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      this.setDark(true);
    } else if (stored === 'light') {
      this.setDark(false);
    } else {
      this.isDark = document.documentElement.classList.contains('dark');
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    document.body.classList.toggle('menu-open', this.menuOpen);
  }

  closeMenu() {
    this.menuOpen = false;
    document.body.classList.remove('menu-open');
  }

  toggleTheme() {
    this.setDark(!this.isDark);
  }

  private setDark(enable: boolean) {
    this.isDark = enable;
    document.documentElement.classList.toggle('dark', enable);
    localStorage.setItem('theme', enable ? 'dark' : 'light');
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 4;
  }
}
