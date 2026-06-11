import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  Notificacion,
  NotificacionesService,
} from '../../core/services/notificaciones.service';
import { PageHeaderComponent } from '../ui/page-header/page-header.component';
import { StatusBadgeComponent, StatusVariant } from '../ui/status-badge/status-badge.component';
import { EmptyStateComponent } from '../ui/empty-state/empty-state.component';

interface GrupoNotif {
  label: string;
  items: Notificacion[];
}

/**
 * P1 §7 — Panel de notificaciones internas de la plataforma web.
 * El funcionario ve aquí cuándo un trámite llega a su área, alertas de SLA
 * vencido, riesgo de demora, etc. Marca leídas y navega al trámite.
 */
@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe, RouterLink, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="nt">
      <app-page-header
        eyebrow="Avisos"
        title="Notificaciones"
        description="Trámites que llegan a tu área, SLA, riesgo y documentos."
      >
        <div header-actions class="d-flex gap-2">
          @if (hayNoLeidas()) {
            <button class="oi-btn oi-btn-ghost oi-btn-sm" type="button" (click)="marcarTodas()">Marcar todas</button>
          }
          <button class="oi-btn oi-btn-secondary oi-btn-sm" type="button" (click)="svc.refrescar()">Actualizar</button>
        </div>
      </app-page-header>

      @if (svc.lista().length === 0) {
        <app-empty-state title="Sin notificaciones" description="No tienes avisos por ahora." />
      } @else {
        @for (grupo of grupos(); track grupo.label) {
          <div class="nt-grupo">
            <h2 class="oi-eyebrow nt-grupo-label">{{ grupo.label }}</h2>
            <div class="nt-list">
              @for (n of grupo.items; track n.id) {
                <article class="nt-item" [class.unread]="!n.leida">
                  <app-status-badge [variant]="varianteTipo(n)">{{ etiquetaDe(n) }}</app-status-badge>
                  <div class="nt-body">
                    <div class="nt-row">
                      <span class="nt-title" [class.read]="n.leida">{{ n.titulo }}</span>
                      <span class="nt-time oi-mono">{{ n.fechaCreacion | date: 'dd/MM/yy HH:mm' }}</span>
                    </div>
                    <div class="nt-msg">{{ n.mensaje }}</div>
                    <div class="nt-actions">
                      @if (esFuncionario() && n.tramiteId) {
                        <a class="nt-link" [routerLink]="['/funcionario/tramites', n.tramiteId]" (click)="marcar(n)">
                          Ver trámite
                        </a>
                      }
                      @if (!n.leida) {
                        <button type="button" class="nt-link" (click)="marcar(n)">Marcar leída</button>
                      }
                    </div>
                  </div>
                </article>
              }
            </div>
          </div>
        }
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .nt { max-width: 800px; margin: 0 auto; }
    .nt-grupo { margin-bottom: 1.25rem; }
    .nt-grupo-label { display: block; margin-bottom: 0.5rem; }
    .nt-list {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--cre-border);
      border-radius: var(--cre-radius-lg);
      overflow: hidden;
      background: var(--cre-surface);
    }
    .nt-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--cre-border);
      position: relative;
    }
    .nt-item:last-child { border-bottom: none; }
    .nt-item.unread { background: var(--cre-accent-tint); }
    .nt-item.unread::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 2px;
      background: var(--cre-accent);
    }
    .nt-body { flex: 1; min-width: 0; }
    .nt-row { display: flex; justify-content: space-between; gap: 0.75rem; }
    .nt-title { font-size: 0.875rem; font-weight: 600; color: var(--cre-text); }
    .nt-title.read { font-weight: 500; color: var(--cre-text-muted); }
    .nt-time { font-size: 0.72rem; color: var(--cre-text-subtle); white-space: nowrap; }
    .nt-msg { font-size: 0.8125rem; color: var(--cre-text-muted); margin-top: 0.15rem; }
    .nt-actions { display: flex; gap: 1rem; margin-top: 0.5rem; }
    .nt-link {
      font-size: 0.78rem;
      color: var(--cre-accent);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      text-decoration: none;
    }
    .nt-link:hover { text-decoration: underline; }
  `],
})
export class NotificacionesComponent {
  readonly svc = inject(NotificacionesService);
  private readonly auth = inject(AuthService);

  readonly esFuncionario = computed(() => this.auth.isFuncionario());
  readonly hayNoLeidas = computed(() => this.svc.lista().some((n) => !n.leida));

  /** Agrupa por día (Hoy / Ayer / fecha), más reciente primero. */
  readonly grupos = computed<GrupoNotif[]>(() => {
    const items = this.svc.lista();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const map = new Map<number, GrupoNotif>();
    for (const n of items) {
      const d = new Date(n.fechaCreacion);
      const floor = new Date(d);
      floor.setHours(0, 0, 0, 0);
      const t = floor.getTime();
      if (!map.has(t)) {
        let label: string;
        if (t === hoy.getTime()) label = 'Hoy';
        else if (t === ayer.getTime()) label = 'Ayer';
        else label = d.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
        map.set(t, { label, items: [] });
      }
      map.get(t)!.items.push(n);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0] - a[0])
      .map((e) => e[1]);
  });

  constructor() {
    this.svc.refrescar();
  }

  marcar(n: Notificacion): void {
    if (n.leida) return;
    this.svc.marcarLeida(n.id).subscribe({
      next: () => this.svc.refrescar(),
      error: () => {},
    });
  }

  marcarTodas(): void {
    for (const n of this.svc.lista()) {
      if (!n.leida) {
        this.svc.marcarLeida(n.id).subscribe({ next: () => this.svc.refrescar(), error: () => {} });
      }
    }
  }

  varianteTipo(n: Notificacion): StatusVariant {
    switch (n.tipo) {
      case 'sla_vencido':
        return 'danger';
      case 'riesgo_demora_alto':
      case 'anomalia_detectada':
        return 'warning';
      case 'asignacion':
      case 'asignacion_auto':
        return 'brand';
      case 'documento':
      case 'documentos_pendientes':
      case 'cambio_estado':
        return 'info';
      default:
        return 'neutral';
    }
  }

  etiquetaDe(n: Notificacion): string {
    switch (n.tipo) {
      case 'sla_vencido':
        return 'SLA';
      case 'riesgo_demora_alto':
        return 'Riesgo';
      case 'asignacion':
      case 'asignacion_auto':
        return 'Bandeja';
      case 'documento':
      case 'documentos_pendientes':
        return 'Docs';
      case 'anomalia_detectada':
        return 'Anomalía';
      case 'cambio_estado':
        return 'Estado';
      default:
        return 'Aviso';
    }
  }
}
