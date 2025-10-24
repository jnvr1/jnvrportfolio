import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, IonButton, IonIcon],
})
export class AppComponent {
  isDark = false;

  constructor() {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      this.setDark(true);
    } else if (stored === 'light') {
      this.setDark(false);
    } else {
      // Respeta el modo del sistema sin persistir, hasta que el usuario cambie.
      this.isDark = document.documentElement.classList.contains('dark');
    }
  }

  toggleTheme() {
    this.setDark(!this.isDark);
  }

  private setDark(enable: boolean) {
    this.isDark = enable;
    document.documentElement.classList.toggle('dark', enable);
    localStorage.setItem('theme', enable ? 'dark' : 'light');
  }
}
