import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { Usuario } from '../../core/models/usuario.model';
import { Rol } from '../../core/models/rol.model';
import { mensajeAmigable } from '../../core/utils/error-messages';
import { TableComponent } from '../../shared/ui/table/table.component';
import { ColumnTemplateDirective } from '../../shared/ui/table/column.directive';
import { ColumnDef } from '../../shared/ui/table/column-def';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-usuarios-lista',
  imports: [RouterLink, TableComponent, ColumnTemplateDirective, StatusBadgeComponent],
  templateUrl: './usuarios-lista.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosListaComponent {
  private readonly usuarioSvc = inject(UsuarioService);
  private readonly rolSvc = inject(RolService);

  readonly usuarios = signal<Usuario[]>([]);
  readonly roles = signal<Rol[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  readonly columnas: ColumnDef[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'rolId', label: 'Rol', sortable: false },
    { key: 'tipo', label: 'Tipo' },
    { key: 'activo', label: 'Estado', sortable: false },
    { key: 'acciones', label: '', sortable: false, searchable: false, align: 'right' },
  ];

  constructor() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set('');

    this.usuarioSvc.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeAmigable(err));
        this.loading.set(false);
      },
    });

    this.rolSvc.listar().subscribe({
      next: (roles) => this.roles.set(roles),
      error: (err) => this.error.set(mensajeAmigable(err)),
    });
  }

  getNombreRol(rolId: string): string {
    return this.roles().find((rol) => rol.id === rolId)?.nombre ?? '—';
  }

  toggleActivo(usuario: Usuario): void {
    this.usuarioSvc.toggleActivo(usuario.id, !usuario.activo).subscribe({
      next: (actualizado) => {
        this.usuarios.update((lista) =>
          lista.map((item) => (item.id === actualizado.id ? actualizado : item)),
        );
        this.exito.set(`Usuario ${actualizado.activo ? 'activado' : 'desactivado'}`);
        setTimeout(() => this.exito.set(''), 3000);
      },
      error: (err) => this.error.set(mensajeAmigable(err)),
    });
  }

  eliminar(id: string): void {
    if (!confirm('Eliminar este usuario?')) return;

    this.usuarioSvc.eliminar(id).subscribe({
      next: () => {
        this.usuarios.update((lista) => lista.filter((usuario) => usuario.id !== id));
        this.exito.set('Usuario eliminado');
        setTimeout(() => this.exito.set(''), 3000);
      },
      error: (err) => this.error.set(mensajeAmigable(err)),
    });
  }
}
