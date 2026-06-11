import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LucideIconData,
  LayoutDashboard,
  Users,
  Building2,
  ScrollText,
  Activity,
  FileText,
  Workflow,
  Sparkles,
  Share2,
  BarChart2,
  BookOpen,
  Inbox,
  Bell,
  Search,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Menu,
  X,
  CheckCheck,
  ArrowRight,
} from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { ThemeService } from '../../core/services/theme.service';

type Role = 'admin' | 'funcionario';
type MenuKey = 'bell' | 'avatar' | 'mobile' | null;

interface NavLink {
  label: string;
  link: string;
  icon: LucideIconData;
  roles: Role[];
}

interface Dominio {
  label: string;
  link: string;
  roles: Role[];
}

@Component({
  selector: 'app-topbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly notif = inject(NotificacionesService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly palInput = viewChild<ElementRef<HTMLInputElement>>('palInput');

  protected readonly icons = {
    inicio: LayoutDashboard as LucideIconData,
    users: Users as LucideIconData,
    departments: Building2 as LucideIconData,
    policies: ScrollText as LucideIconData,
    activities: Activity as LucideIconData,
    documents: FileText as LucideIconData,
    workflows: Workflow as LucideIconData,
    ai: Sparkles as LucideIconData,
    shared: Share2 as LucideIconData,
    metricas: BarChart2 as LucideIconData,
    historial: BookOpen as LucideIconData,
    bandeja: Inbox as LucideIconData,
    bell: Bell as LucideIconData,
    search: Search as LucideIconData,
    sun: Sun as LucideIconData,
    moon: Moon as LucideIconData,
    chevron: ChevronDown as LucideIconData,
    logout: LogOut as LucideIconData,
    menu: Menu as LucideIconData,
    close: X as LucideIconData,
    markAll: CheckCheck as LucideIconData,
    arrow: ArrowRight as LucideIconData,
  };

  readonly openMenu = signal<MenuKey>(null);
  readonly paletteOpen = signal(false);
  readonly query = signal('');

  constructor() {
    if (this.isBrowser) this.notif.iniciarPolling();
  }

  readonly role = computed<Role | null>(() => {
    if (this.auth.isAdmin()) return 'admin';
    if (this.auth.isFuncionario()) return 'funcionario';
    return null;
  });

  readonly homeLink = computed(() =>
    this.role() === 'funcionario' ? '/funcionario/bandeja' : '/admin/dashboard',
  );

  // ── Dominios de navegación: cada uno enruta a un hub con pestañas ──
  private readonly dominiosAll: Dominio[] = [
    { label: 'Inicio', link: '/admin/dashboard', roles: ['admin'] },
    { label: 'Organización', link: '/admin/organizacion', roles: ['admin'] },
    { label: 'Flujos', link: '/admin/flujos', roles: ['admin'] },
    { label: 'Analítica', link: '/admin/analitica', roles: ['admin'] },
    { label: 'Bandeja', link: '/funcionario/bandeja', roles: ['funcionario'] },
    { label: 'Compartidos', link: '/funcionario/diagramas/compartidos', roles: ['funcionario'] },
  ];

  readonly dominios = computed(() => {
    const r = this.role();
    if (!r) return [];
    return this.dominiosAll.filter((d) => d.roles.includes(r));
  });

  /** Lista plana (deep links) para el command palette y el drawer móvil. */
  private readonly linksAdmin: NavLink[] = [
    { label: 'Inicio · Dashboard', link: '/admin/dashboard', icon: this.icons.inicio, roles: ['admin'] },
    { label: 'Organización · Departamentos', link: '/admin/organizacion/departamentos', icon: this.icons.departments, roles: ['admin'] },
    { label: 'Organización · Actividades', link: '/admin/organizacion/actividades', icon: this.icons.activities, roles: ['admin'] },
    { label: 'Organización · Documentos', link: '/admin/organizacion/documentos', icon: this.icons.documents, roles: ['admin'] },
    { label: 'Organización · Usuarios', link: '/admin/organizacion/usuarios', icon: this.icons.users, roles: ['admin'] },
    { label: 'Flujos · Políticas', link: '/admin/flujos/politicas', icon: this.icons.policies, roles: ['admin'] },
    { label: 'Flujos · Diagramas', link: '/admin/flujos/diagramas', icon: this.icons.workflows, roles: ['admin'] },
    { label: 'Flujos · Compartidos conmigo', link: '/admin/flujos/compartidos', icon: this.icons.shared, roles: ['admin'] },
    { label: 'Diseño de diagrama con IA', link: '/admin/diagramas/ia', icon: this.icons.ai, roles: ['admin'] },
    { label: 'Sugerir política con IA', link: '/admin/sugerir-politica', icon: this.icons.ai, roles: ['admin'] },
    { label: 'Analítica · Métricas', link: '/admin/analitica/metricas', icon: this.icons.metricas, roles: ['admin'] },
    { label: 'Analítica · Historial', link: '/admin/analitica/historial', icon: this.icons.historial, roles: ['admin'] },
    { label: 'Analítica · Anomalías IA', link: '/admin/analitica/anomalias', icon: this.icons.ai, roles: ['admin'] },
    { label: 'Analítica · Reportes IA', link: '/admin/analitica/reportes-naturales', icon: this.icons.ai, roles: ['admin'] },
    { label: 'Notificaciones', link: '/notificaciones', icon: this.icons.bell, roles: ['admin'] },
  ];
  private readonly linksFuncionario: NavLink[] = [
    { label: 'Bandeja de entrada', link: '/funcionario/bandeja', icon: this.icons.bandeja, roles: ['funcionario'] },
    { label: 'Compartidos conmigo', link: '/funcionario/diagramas/compartidos', icon: this.icons.shared, roles: ['funcionario'] },
    { label: 'Notificaciones', link: '/notificaciones', icon: this.icons.bell, roles: ['funcionario'] },
  ];

  readonly allLinks = computed<NavLink[]>(() => {
    const r = this.role();
    if (r === 'admin') return this.linksAdmin;
    if (r === 'funcionario') return this.linksFuncionario;
    return [];
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const links = this.allLinks();
    if (!q) return links;
    return links.filter((l) => l.label.toLowerCase().includes(q));
  });

  /** Últimas 10 notificaciones para el popover de la campana. */
  readonly ultimas = computed(() => this.notif.lista().slice(0, 10));

  readonly usuario = computed(() => this.auth.getUsuario());
  readonly inicial = computed(() => (this.usuario()?.nombre ?? '·').charAt(0).toUpperCase());

  // ── Menús ──
  toggleMenu(key: MenuKey): void {
    this.openMenu.update((cur) => (cur === key ? null : key));
  }
  closeMenus(): void {
    this.openMenu.set(null);
  }

  // ── Command palette ──
  openPalette(): void {
    this.query.set('');
    this.paletteOpen.set(true);
    this.closeMenus();
    if (this.isBrowser) setTimeout(() => this.palInput()?.nativeElement.focus(), 0);
  }
  closePalette(): void {
    this.paletteOpen.set(false);
  }
  onQuery(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }
  goFirst(): void {
    const first = this.filtered()[0];
    if (first) {
      this.closePalette();
      this.router.navigateByUrl(first.link);
    }
  }

  // ── Notificaciones ──
  marcarTodas(): void {
    for (const n of this.notif.lista()) {
      if (!n.leida) this.notif.marcarLeida(n.id).subscribe({ next: () => this.notif.refrescar() });
    }
  }
  abrirNotificacion(n: { tramiteId?: string }): void {
    this.closeMenus();
    this.router.navigateByUrl('/notificaciones');
  }

  logout(): void {
    this.closeMenus();
    this.auth.logout();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.paletteOpen() ? this.closePalette() : this.openPalette();
      return;
    }
    if (e.key === 'Escape') {
      this.closePalette();
      this.closeMenus();
    }
  }
}
