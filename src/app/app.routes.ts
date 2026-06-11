import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';
import { tramiteOwnershipGuard } from './core/guards/tramite-ownership.guard';

export const routes: Routes = [
	{
		path: 'login',
		loadComponent: () =>
			import('./auth/login/login.component').then((m) => m.LoginComponent),
	},
	{
		path: 'admin',
		canActivate: [authGuard, rolGuard],
		data: { roles: ['Administrador', 'SuperUser'] },
		children: [
			{
				path: 'dashboard',
				loadComponent: () =>
					import('./admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
			},

			// ── Hub Organización (catálogos base en pestañas) ──
			{
				path: 'organizacion',
				loadComponent: () =>
					import('./admin/hubs/organizacion.component').then((m) => m.HubOrganizacionComponent),
				children: [
					{
						path: 'departamentos',
						loadComponent: () =>
							import('./admin/departamentos/departamentos.component').then((m) => m.DepartamentosComponent),
					},
					{
						path: 'actividades',
						loadComponent: () =>
							import('./admin/actividades/actividades.component').then((m) => m.ActividadesComponent),
					},
					{
						path: 'documentos',
						loadComponent: () =>
							import('./admin/documentos/documentos.component').then((m) => m.DocumentosComponent),
					},
					{
						path: 'usuarios',
						loadComponent: () =>
							import('./admin/usuarios/usuarios-lista.component').then((m) => m.UsuariosListaComponent),
					},
					{ path: '', redirectTo: 'departamentos', pathMatch: 'full' },
				],
			},

			// ── Hub Flujos (políticas + diagramas en pestañas) ──
			{
				path: 'flujos',
				loadComponent: () =>
					import('./admin/hubs/flujos.component').then((m) => m.HubFlujosComponent),
				children: [
					{
						path: 'politicas',
						loadComponent: () =>
							import('./admin/politicas/politicas-lista.component').then((m) => m.PoliticasListaComponent),
					},
					{
						path: 'diagramas',
						loadComponent: () =>
							import('./admin/diagramas/diagramas-lista.component').then((m) => m.DiagramasListaComponent),
					},
					{
						path: 'compartidos',
						loadComponent: () =>
							import('./admin/diagramas/diagramas-compartidos.component').then((m) => m.DiagramasCompartidosComponent),
					},
					{ path: '', redirectTo: 'politicas', pathMatch: 'full' },
				],
			},

			// ── Hub Analítica (métricas + auditoría + IA en pestañas) ──
			{
				path: 'analitica',
				loadComponent: () =>
					import('./admin/hubs/analitica.component').then((m) => m.HubAnaliticaComponent),
				children: [
					{
						path: 'metricas',
						loadComponent: () =>
							import('./admin/metricas/dashboard-metricas.component').then((m) => m.DashboardMetricasComponent),
					},
					{
						path: 'historial',
						loadComponent: () =>
							import('./admin/historial/historial-tramites.component').then((m) => m.HistorialTramitesComponent),
					},
					{
						path: 'anomalias',
						loadComponent: () =>
							import('./admin/anomalias/anomalias.component').then((m) => m.AnomaliasComponent),
					},
					{
						path: 'reportes-naturales',
						loadComponent: () =>
							import('./admin/reportes-naturales/reportes-naturales.component').then((m) => m.ReportesNaturalesComponent),
					},
					{ path: '', redirectTo: 'metricas', pathMatch: 'full' },
				],
			},

			// ── Formularios / editores / detalle (fuera de los hubs) ──
			{
				path: 'usuarios/nuevo',
				loadComponent: () =>
					import('./admin/usuarios/usuario-form.component').then((m) => m.UsuarioFormComponent),
			},
			{
				path: 'usuarios/:id/editar',
				loadComponent: () =>
					import('./admin/usuarios/usuario-form.component').then((m) => m.UsuarioFormComponent),
			},
			{
				path: 'politicas/nueva',
				loadComponent: () =>
					import('./admin/politicas/politica-form.component').then((m) => m.PoliticaFormComponent),
			},
			{
				path: 'politicas/:id/editar',
				loadComponent: () =>
					import('./admin/politicas/politica-form.component').then((m) => m.PoliticaFormComponent),
			},
			{
				path: 'diagramas/nuevo',
				loadComponent: () =>
					import('./admin/diagramas/diagrama-editor.component').then((m) => m.DiagramaEditorComponent),
			},
			{
				path: 'diagramas/ia',
				loadComponent: () =>
					import('./admin/diagramas/diagrama-ia.component').then((m) => m.DiagramaIaComponent),
			},
			{
				path: 'sugerir-politica',
				loadComponent: () =>
					import('./admin/sugerir-politica/sugerir-politica.component').then((m) => m.SugerirPoliticaComponent),
			},
			// `diagramas/compartidos` debe resolverse ANTES que `diagramas/:id`.
			{ path: 'diagramas/compartidos', redirectTo: 'flujos/compartidos', pathMatch: 'full' },
			{
				path: 'diagramas/:id',
				loadComponent: () =>
					import('./admin/diagramas/diagrama-editor.component').then((m) => m.DiagramaEditorComponent),
			},
			{
				path: 'documentos/:id/auditoria',
				loadComponent: () =>
					import('./admin/auditoria-documento/auditoria-documento.component').then((m) => m.AuditoriaDocumentoComponent),
			},
			{
				path: 'expediente/:id',
				loadComponent: () =>
					import('./funcionario/expediente-digital/expediente-digital.component').then((m) => m.ExpedienteDigitalComponent),
			},

			// ── Redirects de URLs antiguas → hubs (no se rompen enlaces) ──
			{ path: 'usuarios', redirectTo: 'organizacion/usuarios', pathMatch: 'full' },
			{ path: 'departamentos', redirectTo: 'organizacion/departamentos', pathMatch: 'full' },
			{ path: 'documentos', redirectTo: 'organizacion/documentos', pathMatch: 'full' },
			{ path: 'actividades', redirectTo: 'organizacion/actividades', pathMatch: 'full' },
			{ path: 'politicas', redirectTo: 'flujos/politicas', pathMatch: 'full' },
			{ path: 'diagramas', redirectTo: 'flujos/diagramas', pathMatch: 'full' },
			{ path: 'metricas', redirectTo: 'analitica/metricas', pathMatch: 'full' },
			{ path: 'historial', redirectTo: 'analitica/historial', pathMatch: 'full' },
			{ path: 'anomalias', redirectTo: 'analitica/anomalias', pathMatch: 'full' },
			{ path: 'reportes-naturales', redirectTo: 'analitica/reportes-naturales', pathMatch: 'full' },

			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
		],
	},
	{
		path: 'funcionario',
		canActivate: [authGuard, rolGuard],
		data: { roles: ['Funcionario'] },
		children: [
			{
				path: 'tramites',
				loadComponent: () =>
					import('./funcionario/tramites-lista/tramites-lista.component').then((m) => m.TramitesListaComponent),
			},
			{
				path: 'tramites/:id',
				loadComponent: () =>
					import('./funcionario/tramite-detalle/tramite-detalle.component').then((m) => m.TramiteDetalleComponent),
			},
			{
				path: 'bandeja',
				loadComponent: () =>
					import('./funcionario/bandeja-entrada/bandeja-entrada.component').then((m) => m.BandejaEntradaComponent),
			},
			{
				path: 'expediente/:id',
				loadComponent: () =>
					import('./funcionario/expediente-digital/expediente-digital.component').then((m) => m.ExpedienteDigitalComponent),
				canActivate: [tramiteOwnershipGuard],
			},
			{
				path: 'documentos/:id/editar',
				loadComponent: () =>
					import('./funcionario/documento-editor/documento-editor.component').then((m) => m.DocumentoEditorComponent),
			},
			// Edición colaborativa de Office (.docx/.xlsx/.pptx) del repo vía OnlyOffice.
			{
				path: 'documentos/:id/office',
				loadComponent: () =>
					import('./funcionario/onlyoffice-editor/onlyoffice-editor.component').then((m) => m.OnlyofficeEditorComponent),
			},
			// P1 §7 — colaboración: el funcionario invitado como editor abre y
			// edita los diagramas que le compartieron (mismos componentes que admin;
			// el backend valida creador/colaborador-editor en cada mutación).
			{
				path: 'diagramas/compartidos',
				loadComponent: () =>
					import('./admin/diagramas/diagramas-compartidos.component').then((m) => m.DiagramasCompartidosComponent),
			},
			{
				path: 'diagramas/:id',
				loadComponent: () =>
					import('./admin/diagramas/diagrama-editor.component').then((m) => m.DiagramaEditorComponent),
			},
		],
	},
	{
		path: 'notificaciones',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./shared/notificaciones/notificaciones.component').then((m) => m.NotificacionesComponent),
	},
	{
		path: 'no-autorizado',
		loadComponent: () =>
			import('./shared/pages/no-autorizado.component').then((m) => m.NoAutorizadoComponent),
	},
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/login' },
];
