import { StatusVariant } from './status-badge/status-badge.component';

/**
 * Mapeo ÚNICO de estado de trámite → variante semántica (Obsidiana Iris).
 * Fuente de verdad compartida; reemplaza las copias de `getEstadoBadgeClass`
 * dispersas por historial, políticas, trámites, etc.
 *
 *  En curso / en proceso        → info
 *  Pendiente de docs / observado → warning
 *  Aprobado                      → success
 *  Rechazado / SLA vencido       → danger
 *  Cancelado / archivado         → neutral
 */
export function estadoVariant(estado: string | null | undefined): StatusVariant {
  const e = (estado ?? '').toLowerCase().replace(/_/g, ' ').trim();
  if (!e) return 'neutral';
  if (e.includes('aprob')) return 'success';
  if (e.includes('rechaz') || e.includes('vencid') || e.includes('venció')) return 'danger';
  if (e.includes('observ') || e.includes('pendiente') || e.includes('docs') || e.includes('subsan')) return 'warning';
  if (e.includes('cancel') || e.includes('archiv')) return 'neutral';
  if (e.includes('curso') || e.includes('proceso') || e.includes('progreso') || e.includes('nuevo') || e.includes('inici')) return 'info';
  return 'neutral';
}

/** Mapeo de nivel de riesgo IA → variante (bajo=success, medio=warning, alto=danger). */
export function riesgoVariant(nivel: string | null | undefined): StatusVariant {
  const n = (nivel ?? '').toLowerCase().trim();
  if (n.includes('alto')) return 'danger';
  if (n.includes('medio') || n.includes('media')) return 'warning';
  if (n.includes('bajo') || n.includes('baja')) return 'success';
  return 'neutral';
}
