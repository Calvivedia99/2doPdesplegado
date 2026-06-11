import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { TabNavComponent, TabItem } from '../../shared/ui/tab-nav/tab-nav.component';

@Component({
  selector: 'app-hub-organizacion',
  imports: [RouterOutlet, PageHeaderComponent, TabNavComponent],
  template: `
    <app-page-header
      eyebrow="Administración"
      title="Organización"
      description="Catálogos base del sistema: estructura, requisitos y cuentas."
    />
    <app-tab-nav [tabs]="tabs" />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HubOrganizacionComponent {
  protected readonly tabs: TabItem[] = [
    { label: 'Departamentos', link: 'departamentos' },
    { label: 'Actividades', link: 'actividades' },
    { label: 'Documentos', link: 'documentos' },
    { label: 'Usuarios', link: 'usuarios' },
  ];
}
