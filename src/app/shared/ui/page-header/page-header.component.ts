import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cabecera de página unificada (Obsidiana Iris).
 * Mata el copy-paste del `d-flex justify-content-between` repetido en 12+ páginas.
 * Slots: [header-actions] (acción primaria + secundarias a la derecha).
 */
@Component({
  selector: 'app-page-header',
  template: `
    <header class="oi-ph">
      <div class="oi-ph-text">
        @if (eyebrow()) { <span class="oi-eyebrow">{{ eyebrow() }}</span> }
        <h1 class="oi-ph-title">{{ title() }}</h1>
        @if (description()) { <p class="oi-ph-desc">{{ description() }}</p> }
      </div>
      <div class="oi-ph-actions">
        <ng-content select="[header-actions]"></ng-content>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; }
    .oi-ph {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .oi-ph-text { min-width: 0; }
    .oi-ph-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--cre-text);
    }
    .oi-ph-desc {
      margin: 0.25rem 0 0;
      font-size: 0.8125rem;
      color: var(--cre-text-muted);
      max-width: 60ch;
    }
    .oi-ph-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly eyebrow = input<string>('');
}
