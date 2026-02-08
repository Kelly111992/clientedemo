/**
 * Parsea una fecha string de forma segura (evita problemas de timezone)
 */
export const parseDate = (dateString: string): Date => {
  const parts = dateString.split('-');
  if (parts.length !== 3) return new Date(dateString);

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexado
  const day = parseInt(parts[2], 10);

  return new Date(year, month, day);
};

/**
 * Obtiene los días de diferencia entre hoy y una fecha
 */
export const getDaysDifference = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = parseDate(dateString);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Formatea una fecha para mostrar
 */
export const formatDate = (dateString: string): string => {
  const date = parseDate(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

/**
 * Verifica si la póliza vence en los próximos 30 días
 */
export const isExpiringSoon = (dateString: string): boolean => {
  const diff = getDaysDifference(dateString);
  return diff >= 0 && diff <= 30;
};

/**
 * Obtiene la categoría de urgencia de vencimiento
 */
export type ExpirationCategory = 'critical' | 'warning' | 'upcoming' | 'ok' | 'expired';

export const getExpirationCategory = (dateString: string): ExpirationCategory => {
  const diff = getDaysDifference(dateString);

  if (diff < 0) return 'expired';       // Ya venció
  if (diff <= 7) return 'critical';      // 7 días o menos - CRÍTICO
  if (diff <= 15) return 'warning';      // 8-15 días - ADVERTENCIA
  if (diff <= 30) return 'upcoming';     // 16-30 días - PRÓXIMO
  return 'ok';                           // Más de 30 días - OK
};

/**
 * Formatea los días restantes de forma legible
 */
export const formatDaysRemaining = (dateString: string): string => {
  const diff = getDaysDifference(dateString);

  if (diff < 0) return `Venció hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? 's' : ''}`;
  if (diff === 0) return '¡Vence HOY!';
  if (diff === 1) return 'Vence mañana';
  if (diff <= 7) return `Vence en ${diff} días`;
  if (diff <= 30) return `Vence en ${diff} días`;
  return `${diff} días restantes`;
};