import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageKey = 'cre.theme';

  private readonly _mode = signal<ThemeMode>(this.readInitial());
  readonly mode = this._mode.asReadonly();

  constructor() {
    effect(() => {
      const m = this._mode();
      if (!this.isBrowser) return;
      const root = document.documentElement;
      root.dataset['theme'] = m;
      // Puente Bootstrap: sincroniza data-bs-theme para que sus componentes
      // (cards, tablas, form-control) respondan al mismo modo. Se elimina en Fase 5.
      root.setAttribute('data-bs-theme', m);
      // Mantiene la barra de navegador / PWA en color con el tema.
      const themeColor = m === 'dark' ? '#0a0a0b' : '#fafafa';
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', themeColor);
      try {
        localStorage.setItem(this.storageKey, m);
      } catch {
        /* storage may be unavailable */
      }
    });
  }

  toggle(): void {
    this._mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  set(mode: ThemeMode): void {
    this._mode.set(mode);
  }

  private readInitial(): ThemeMode {
    if (!this.isBrowser) return 'light';
    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
