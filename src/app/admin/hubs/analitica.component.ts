import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { TabNavComponent, TabItem } from '../../shared/ui/tab-nav/tab-nav.component';

@Component({
  selector: 'app-hub-analitica',
  imports: [RouterOutlet, PageHeaderComponent, TabNavComponent],
  template: `
    <app-page-header
      eyebrow="Análisis"
      title="Analítica"
      description="Rendimiento, auditoría e inteligencia sobre los trámites."
    />
    <app-tab-nav [tabs]="tabs" />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HubAnaliticaComponent {
  protected readonly tabs: TabItem[] = [
    { label: 'Métricas', link: 'metricas' },
    { label: 'Historial', link: 'historial' },
    { label: 'Anomalías IA', link: 'anomalias' },
    { label: 'Reportes IA', link: 'reportes-naturales' },
  ];
}
