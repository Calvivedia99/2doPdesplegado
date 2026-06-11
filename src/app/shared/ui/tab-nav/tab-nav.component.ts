import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface TabItem {
  label: string;
  link: string;
}

/**
 * Navegación secundaria por pestañas de los hubs (Organización, Flujos, Analítica).
 * Cada pestaña enruta a un hijo del hub; la activa lleva borde inferior iris.
 */
@Component({
  selector: 'app-tab-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="oi-tabs" role="tablist">
      @for (t of tabs(); track t.link) {
        <a
          class="oi-tab"
          [routerLink]="t.link"
          routerLinkActive="active"
          role="tab"
        >{{ t.label }}</a>
      }
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .oi-tabs {
      display: flex;
      gap: 0.25rem;
      border-bottom: 1px solid var(--cre-border);
      margin-bottom: 1.5rem;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .oi-tabs::-webkit-scrollbar { display: none; }
    .oi-tab {
      position: relative;
      padding: 0.6rem 0.85rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--cre-text-muted);
      text-decoration: none;
      white-space: nowrap;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 140ms var(--cre-ease), border-color 140ms var(--cre-ease);
    }
    .oi-tab:hover { color: var(--cre-text); }
    .oi-tab.active {
      color: var(--cre-accent);
      border-bottom-color: var(--cre-accent);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabNavComponent {
  readonly tabs = input.required<TabItem[]>();
}
