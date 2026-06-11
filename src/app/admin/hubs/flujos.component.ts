import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { TabNavComponent, TabItem } from '../../shared/ui/tab-nav/tab-nav.component';

@Component({
  selector: 'app-hub-flujos',
  imports: [RouterOutlet, PageHeaderComponent, TabNavComponent],
  template: `
    <app-page-header
      eyebrow="Administración"
      title="Flujos"
      description="Políticas de trámite y los diagramas de proceso que las ejecutan."
    />
    <app-tab-nav [tabs]="tabs" />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HubFlujosComponent {
  protected readonly tabs: TabItem[] = [
    { label: 'Políticas', link: 'politicas' },
    { label: 'Diagramas', link: 'diagramas' },
    { label: 'Compartidos conmigo', link: 'compartidos' },
  ];
}
