import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MetricasService } from '../../core/services/metricas.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

interface Conteo {
  nombre: string;
  total: number;
}
interface Promedio {
  nombre: string;
  promedioHoras: number;
  muestras: number;
}

/**
 * P1 §7 — Dashboard de monitoreo en tiempo real del administrador:
 * trámites por estado (+activos/cerrados), tiempo promedio de atención por
 * departamento y por política, y departamentos con mayor carga.
 * (Los cuellos de botella tienen su propia vista en /admin/analitica/metricas.)
 */
@Component({
  selector: 'app-dashboard',
  imports: [PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header eyebrow="Inicio" title="Dashboard" description="Monitoreo en tiempo real de la operación.">
      <button header-actions class="oi-btn oi-btn-secondary oi-btn-sm" type="button" (click)="cargar()">
        Actualizar
      </button>
    </app-page-header>

    @if (error()) {
      <div class="alert alert-danger">{{ error() }}</div>
    }

    @if (data(); as d) {
      <!-- KPIs -->
      <div class="dash-kpis">
        <div class="oi-card dash-kpi">
          <span class="dash-kpi-num oi-mono">{{ d.totalTramites }}</span>
          <span class="dash-kpi-label">Trámites totales</span>
        </div>
        <div class="oi-card dash-kpi">
          <span class="dash-kpi-num oi-mono accent">{{ d.activos }}</span>
          <span class="dash-kpi-label">Activos</span>
        </div>
        <div class="oi-card dash-kpi">
          <span class="dash-kpi-num oi-mono success">{{ d.cerrados }}</span>
          <span class="dash-kpi-label">Cerrados</span>
        </div>
      </div>

      <div class="dash-grid">
        <!-- Trámites por estado -->
        <div class="oi-card dash-panel">
          <header class="dash-panel-head">Trámites por estado</header>
          <div class="dash-panel-body">
            @for (b of barras(d.porEstado); track b.nombre) {
              <div class="bar-row">
                <span class="bar-label" [title]="b.nombre">{{ b.nombre }}</span>
                <span class="bar-track"><span class="bar-fill" [style.--w]="b.pct + '%'"></span></span>
                <span class="bar-val oi-mono">{{ b.total }}</span>
              </div>
            } @empty {
              <span class="dash-empty">Sin datos.</span>
            }
          </div>
        </div>

        <!-- Carga por departamento -->
        <div class="oi-card dash-panel">
          <header class="dash-panel-head">Carga actual por departamento</header>
          <div class="dash-panel-body">
            @for (b of barras(d.cargaPorDepartamento); track b.nombre) {
              <div class="bar-row">
                <span class="bar-label" [title]="b.nombre">{{ b.nombre }}</span>
                <span class="bar-track"><span class="bar-fill warn" [style.--w]="b.pct + '%'"></span></span>
                <span class="bar-val oi-mono">{{ b.total }}</span>
              </div>
            } @empty {
              <span class="dash-empty">Sin trámites activos.</span>
            }
          </div>
        </div>

        <!-- Promedio por departamento -->
        <div class="oi-card dash-panel">
          <header class="dash-panel-head">Tiempo promedio por departamento (h)</header>
          <div class="dash-panel-body">
            @for (p of d.promedioPorDepartamento; track p.nombre) {
              <div class="kv-row">
                <span class="kv-name">{{ p.nombre }}</span>
                <span class="kv-val"><strong class="oi-mono">{{ p.promedioHoras }}</strong> h <span class="dash-muted oi-mono">({{ p.muestras }})</span></span>
              </div>
            } @empty {
              <span class="dash-empty">Aún no hay métricas de actividades completadas.</span>
            }
          </div>
        </div>

        <!-- Promedio por política -->
        <div class="oi-card dash-panel">
          <header class="dash-panel-head">Tiempo promedio por política (h)</header>
          <div class="dash-panel-body">
            @for (p of d.promedioPorPolitica; track p.nombre) {
              <div class="kv-row">
                <span class="kv-name">{{ p.nombre }}</span>
                <span class="kv-val"><strong class="oi-mono">{{ p.promedioHoras }}</strong> h <span class="dash-muted oi-mono">({{ p.muestras }})</span></span>
              </div>
            } @empty {
              <span class="dash-empty">Aún no hay métricas de actividades completadas.</span>
            }
          </div>
        </div>
      </div>
    } @else if (!error()) {
      <div class="dash-loading">
        <span class="spinner-border spinner-border-sm me-2"></span>Cargando métricas…
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .dash-kpis {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .dash-kpi {
      padding: 1.25rem 1.35rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .dash-kpi-num {
      font-size: 2rem;
      font-weight: 600;
      line-height: 1;
      color: var(--cre-text);
      letter-spacing: -0.02em;
    }
    .dash-kpi-num.accent { color: var(--cre-accent); }
    .dash-kpi-num.success { color: var(--cre-success-600); }
    .dash-kpi-label {
      font-size: 0.8125rem;
      color: var(--cre-text-muted);
    }

    .dash-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .dash-panel { overflow: hidden; }
    .dash-panel-head {
      padding: 0.85rem 1.1rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--cre-text);
      border-bottom: 1px solid var(--cre-border);
    }
    .dash-panel-body { padding: 1rem 1.1rem; }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.6rem;
    }
    .bar-row:last-child { margin-bottom: 0; }
    .bar-label {
      width: 32%;
      flex-shrink: 0;
      font-size: 0.8125rem;
      color: var(--cre-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bar-track {
      flex: 1;
      height: 0.65rem;
      background: var(--cre-bg-muted);
      border-radius: 999px;
      overflow: hidden;
    }
    .bar-fill {
      display: block;
      height: 100%;
      width: var(--w, 0%);
      background: var(--cre-accent);
      border-radius: 999px;
      transition: width 500ms var(--cre-ease);
    }
    .bar-fill.warn { background: var(--cre-warning-500); }
    .bar-val {
      width: 2.5rem;
      text-align: right;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--cre-text);
    }

    .kv-row {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.45rem 0;
      border-bottom: 1px solid var(--cre-border);
      font-size: 0.8125rem;
    }
    .kv-row:last-child { border-bottom: none; }
    .kv-name {
      color: var(--cre-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .kv-val { color: var(--cre-text); white-space: nowrap; }
    .dash-muted { color: var(--cre-text-subtle); }
    .dash-empty { font-size: 0.8125rem; color: var(--cre-text-muted); }
    .dash-loading { text-align: center; color: var(--cre-text-muted); padding: 3rem 0; }

    @media (max-width: 768px) {
      .dash-kpis { grid-template-columns: 1fr; }
      .dash-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent {
  private readonly metricas = inject(MetricasService);

  readonly data = signal<any | null>(null);
  readonly error = signal('');

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.error.set('');
    this.metricas.getDashboard().subscribe({
      next: (d) => this.data.set(d),
      error: () => this.error.set('No se pudieron cargar las métricas del dashboard.'),
    });
  }

  /** Normaliza una lista {nombre,total} a barras con % relativo al máximo. */
  barras(lista: Conteo[] | undefined): (Conteo & { pct: number })[] {
    const l = lista ?? [];
    const max = Math.max(1, ...l.map((x) => x.total));
    return l.map((x) => ({ ...x, pct: Math.round((x.total / max) * 100) }));
  }
}
