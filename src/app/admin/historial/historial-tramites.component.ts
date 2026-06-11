import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportesService } from '../../core/services/reportes.service';
import { mensajeAmigable } from '../../core/utils/error-messages';
import { TableComponent } from '../../shared/ui/table/table.component';
import { ColumnTemplateDirective } from '../../shared/ui/table/column.directive';
import { ColumnDef } from '../../shared/ui/table/column-def';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { estadoVariant } from '../../shared/ui/estado-visual';

@Component({
  selector: 'app-historial-tramites',
  imports: [RouterLink, TableComponent, ColumnTemplateDirective, StatusBadgeComponent],
  templateUrl: './historial-tramites.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialTramitesComponent {
  private readonly reportesSvc = inject(ReportesService);

  readonly tramites = signal<any[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly descargando = signal(false);

  protected readonly estadoVariant = estadoVariant;

  readonly columnas: ColumnDef[] = [
    { key: 'codigo', label: 'Código', width: '110px' },
    { key: 'politicaNombre', label: 'Política' },
    { key: 'estadoActual', label: 'Estado' },
    { key: 'fechaInicio', label: 'Inicio' },
    { key: 'fechaCierreReal', label: 'Actualización' },
    { key: 'clienteNombre', label: 'Cliente' },
    { key: 'acciones', label: '', sortable: false, searchable: false, align: 'center', width: '90px' },
  ];

  // Filtros
  readonly filtroEstado = signal('');
  readonly filtroDesde = signal('');
  readonly filtroHasta = signal('');

  readonly estados = [
    { valor: 'En curso',   label: 'En curso' },
    { valor: 'Observado',  label: 'Observados / Devueltos' },
    { valor: 'Aprobado',   label: 'Aprobados' },
    { valor: 'Rechazado',  label: 'Rechazados' },
    { valor: 'Cancelado',  label: 'Cancelados' },
  ];

  constructor() {
    this.buscarHistorial();
  }

  buscarHistorial(): void {
    this.loading.set(true);
    this.error.set('');

    this.reportesSvc
      .getHistorialTramites(this.filtroEstado(), this.filtroDesde(), this.filtroHasta())
      .subscribe({
        next: (data) => {
          this.tramites.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(mensajeAmigable(err));
          this.loading.set(false);
        },
      });
  }

  limpiarFiltros(): void {
    this.filtroEstado.set('');
    this.filtroDesde.set('');
    this.filtroHasta.set('');
    this.buscarHistorial();
  }

  // CU-26: generar → descargar en dos pasos
  exportar(formato: 'PDF' | 'EXCEL' | 'CSV'): void {
    if (this.tramites().length === 0) return;
    this.descargando.set(true);
    this.error.set('');

    const body = {
      filtros: {
        estado: this.filtroEstado(),
        desde: this.filtroDesde(),
        hasta: this.filtroHasta(),
      },
      formato,
    };

    this.reportesSvc.generarReporte(body).subscribe({
      next: (reporte) => {
        this.reportesSvc.descargarReporte(reporte.id).subscribe({
          next: (blob) => {
            const ext = formato === 'PDF' ? 'pdf' : formato === 'EXCEL' ? 'xlsx' : 'csv';
            this.triggerDownload(blob, `Reporte_Tramites.${ext}`);
            this.descargando.set(false);
          },
          error: (err) => {
            this.error.set(mensajeAmigable(err));
            this.descargando.set(false);
          },
        });
      },
      error: (err) => {
        this.error.set(mensajeAmigable(err));
        this.descargando.set(false);
      },
    });
  }

  setFiltroEstado(ev: Event): void {
    this.filtroEstado.set((ev.target as HTMLSelectElement).value);
  }

  setFiltroDesde(ev: Event): void {
    this.filtroDesde.set((ev.target as HTMLInputElement).value);
  }

  setFiltroHasta(ev: Event): void {
    this.filtroHasta.set((ev.target as HTMLInputElement).value);
  }

  formatearFecha(iso: string | undefined): string {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('es-BO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
