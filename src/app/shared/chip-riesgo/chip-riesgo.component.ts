import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NivelRiesgo } from '../../core/models/tramite-riesgo.model';

/**
 * CU-43 — Badge visual del nivel de riesgo de un trámite.
 *
 * Uso:
 *   <app-chip-riesgo [nivel]="t.riesgoDemora" [probSla]="t.probSuperarSla" />
 */
@Component({
  selector: 'app-chip-riesgo',
  imports: [DecimalPipe],
  template: `
    <span class="chip {{ clase() }}" [title]="tooltip()">
      <span class="chip-dot" aria-hidden="true"></span>
      {{ label() }}
      @if (mostrarProb() && probSla() != null) {
        <span class="chip-prob oi-mono">{{ (probSla()! * 100) | number: '1.0-0' }}%</span>
      }
    </span>
  `,
  styles: [
    `
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.2rem 0.55rem;
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1.3;
        border-radius: 999px;
        border: 1px solid transparent;
      }
      .chip-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        flex: 0 0 auto;
      }
      .chip-prob { opacity: 0.75; }
      .chip-alto {
        color: var(--cre-danger-500);
        background: color-mix(in srgb, var(--cre-danger-500) 12%, var(--cre-surface));
        border-color: color-mix(in srgb, var(--cre-danger-500) 28%, transparent);
      }
      .chip-medio {
        color: var(--cre-warning-500);
        background: color-mix(in srgb, var(--cre-warning-500) 12%, var(--cre-surface));
        border-color: color-mix(in srgb, var(--cre-warning-500) 28%, transparent);
      }
      .chip-bajo {
        color: var(--cre-success-600);
        background: color-mix(in srgb, var(--cre-success-500) 12%, var(--cre-surface));
        border-color: color-mix(in srgb, var(--cre-success-500) 28%, transparent);
      }
      .chip-desconocido {
        color: var(--cre-text-muted);
        background: var(--cre-surface-2);
        border-color: var(--cre-border);
      }
      /* Halo pulsante SOLO en riesgo alto */
      .chip-alto .chip-dot {
        animation: oi-riesgo-pulse 2s var(--cre-ease, ease) infinite;
      }
      @keyframes oi-riesgo-pulse {
        0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--cre-danger-500) 55%, transparent); }
        70% { box-shadow: 0 0 0 5px transparent; }
        100% { box-shadow: 0 0 0 0 transparent; }
      }
      @media (prefers-reduced-motion: reduce) {
        .chip-alto .chip-dot { animation: none; }
      }
    `,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipRiesgoComponent {
  /** Nivel de riesgo del trámite. Si viene null o '', se trata como desconocido. */
  readonly nivel = input<NivelRiesgo | string | null | undefined>(null);
  /** Probabilidad SLA en [0, 1]. Opcional, se muestra entre paréntesis. */
  readonly probSla = input<number | null | undefined>(null);
  /** Si false, no muestra el porcentaje aunque venga `probSla`. */
  readonly mostrarProb = input<boolean>(true);

  protected readonly nivelNorm = computed<NivelRiesgo>(() => {
    const n = (this.nivel() ?? '').toString().toLowerCase();
    if (n === 'alto' || n === 'medio' || n === 'bajo') return n as NivelRiesgo;
    return 'desconocido';
  });

  protected readonly clase = computed(() => `chip-${this.nivelNorm()}`);

  protected readonly label = computed(() => {
    const n = this.nivelNorm();
    return n.charAt(0).toUpperCase() + n.slice(1);
  });

  protected readonly tooltip = computed(() => {
    const p = this.probSla();
    if (p == null) return `Nivel de riesgo: ${this.nivelNorm()}`;
    return `Probabilidad estimada de superar el SLA: ${(p * 100).toFixed(0)}%`;
  });
}
