import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkflowService } from '../../core/services/workflow.service';
import { TramiteResumen } from '../../core/models/tramite.model';
import { mensajeAmigable } from '../../core/utils/error-messages';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { estadoVariant } from '../../shared/ui/estado-visual';

@Component({
  selector: 'app-tramites-lista',
  imports: [RouterLink, PageHeaderComponent, StatusBadgeComponent, EmptyStateComponent],
  templateUrl: './tramites-lista.component.html',
  styleUrl: './tramites-lista.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TramitesListaComponent {
  protected readonly estadoVariant = estadoVariant;
  private readonly workflowSvc = inject(WorkflowService);

  readonly tramites = signal<TramiteResumen[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly filtroEstado = signal('');

  readonly estados = ['En curso', 'Observado', 'Aprobado', 'Rechazado', 'Cancelado'];

  readonly tramitesFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const data = this.tramites();
    if (!estado) return data;
    return data.filter((tramite) => tramite.estado === estado);
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.workflowSvc.listarTramites().subscribe({
      next: (tramites) => {
        this.tramites.set(tramites);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeAmigable(err));
        this.loading.set(false);
      },
    });
  }

  setFiltroEstado(estado: string): void {
    this.filtroEstado.set(estado);
  }

  getPrioridadLabel(prioridad: number): string {
    const labels: Record<number, string> = {
      1: 'Baja',
      2: 'Normal',
      3: 'Alta',
      4: 'Urgente',
      5: 'Critica',
    };
    return labels[prioridad] ?? `P${prioridad}`;
  }

  getFiltroButtonClass(estado: string): string {
    const active = this.filtroEstado() === estado;
    return active ? 'oi-btn oi-btn-sm oi-btn-secondary' : 'oi-btn oi-btn-sm oi-btn-ghost';
  }
}
