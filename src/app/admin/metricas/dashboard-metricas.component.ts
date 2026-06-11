import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MetricasService } from '../../core/services/metricas.service';
import { DepartamentoService } from '../../core/services/departamento.service';
import { ActividadService } from '../../core/services/actividad.service';
import { Departamento } from '../../core/models/departamento.model';
import { Actividad } from '../../core/models/actividad.model';
import { mensajeAmigable } from '../../core/utils/error-messages';
import { TableComponent } from '../../shared/ui/table/table.component';
import { ColumnTemplateDirective } from '../../shared/ui/table/column.directive';
import { ColumnDef } from '../../shared/ui/table/column-def';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard-metricas',
  imports: [DatePipe, DecimalPipe, TableComponent, ColumnTemplateDirective, StatusBadgeComponent],
  templateUrl: './dashboard-metricas.component.html',
  styleUrl: './dashboard-metricas.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardMetricasComponent {
  readonly columnasMetricas: ColumnDef[] = [
    { key: 'actividadId', label: 'Actividad' },
    { key: 'departamentoId', label: 'Departamento', sortable: false },
    { key: 'tiempoSegundos', label: 'Tiempo real (h)', align: 'right' },
    { key: 'superoSla', label: 'Estatus SLA', sortable: false, align: 'center' },
  ];
  private readonly metricasSvc = inject(MetricasService);
  private readonly deptoSvc = inject(DepartamentoService);
  private readonly actividadSvc = inject(ActividadService);

  readonly cuellosDeBotella = signal<any[]>([]);
  readonly metricas = signal<any[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly departamentos = signal<Map<string, string>>(new Map());
  readonly actividades = signal<Map<string, string>>(new Map());

  // Para buscar métricas de un trámite específico (CU-24)
  readonly tramiteIdBusqueda = signal('');

  constructor() {
    this.cargarCuellos();
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.deptoSvc.listar().subscribe({
      next: (deptos) => {
        const map = new Map(deptos.map(d => [d.id, d.nombre]));
        this.departamentos.set(map);
      },
    });

    this.actividadSvc.listar().subscribe({
      next: (acts) => {
        const map = new Map(acts.map(a => [a.id, a.nombre]));
        this.actividades.set(map);
      },
    });
  }

  cargarCuellos(): void {
    this.loading.set(true);
    this.error.set('');

    this.metricasSvc.getCuellosDeBotella().subscribe({
      next: (data) => {
        this.cuellosDeBotella.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeAmigable(err));
        this.loading.set(false);
      },
    });
  }

  buscarMetricasTramite(): void {
    const id = this.tramiteIdBusqueda().trim();
    if (!id) return;

    this.metricasSvc.getMetricasTramite(id).subscribe({
      next: (data) => this.metricas.set(data),
      error: () => this.error.set('No se encontraron métricas para ese trámite.'),
    });
  }

  setTramiteIdBusqueda(ev: Event): void {
    this.tramiteIdBusqueda.set((ev.target as HTMLInputElement).value);
  }

  formatearHoras(segundos: number): string {
    return (segundos / 3600).toFixed(1);
  }

  getNombreDepartamento(id: string): string {
    return this.departamentos().get(id) || '—';
  }

  getNombreActividad(id: string): string {
    return this.actividades().get(id) || '—';
  }
}
