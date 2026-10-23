export function formatKz(amount: number, showSign: boolean = false): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const parts = absAmount.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];

  const formatted = `${integerPart},${decimalPart} Kz`;

  if (isNegative) {
    return `- ${formatted}`;
  }
  if (showSign && amount > 0) {
    return `+ ${formatted}`;
  }
  return formatted;
}

export function formatCompactKz(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace('.', ',')} M Kz`;
  }
  if (abs >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} mil Kz`;
  }
  return `${amount.toFixed(0)} Kz`;
}

export function formatDatePt(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${day} ${months[mIndex] || month} ${year}`;
}

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return 'Hoje';
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === yesterday) return 'Ontem';

  return formatDatePt(dateStr);
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Calcula a quantidade aproximada de meses restantes até a data limite
 */
export function calculateRemainingMonths(deadlineStr: string): number {
  if (!deadlineStr) return 1;
  const now = new Date();
  const deadline = new Date(deadlineStr);
  
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 0;
  return Math.max(1, Math.round(diffDays / 30.4));
}

/**
 * Calcula quanto deve ser poupado por mês para atingir o objectivo até a data limite
 */
export function calculateMonthlySavingsNeeded(
  targetAmount: number,
  currentAmount: number,
  deadlineStr: string
): number {
  const remaining = Math.max(0, targetAmount - currentAmount);
  if (remaining <= 0) return 0;
  const months = calculateRemainingMonths(deadlineStr);
  if (months <= 0) return remaining;
  return Math.ceil(remaining / months);
}

export function getTermLabel(term: 'short' | 'medium' | 'long'): string {
  switch (term) {
    case 'short':
      return 'Curto Prazo (até 1 ano)';
    case 'medium':
      return 'Médio Prazo (1 a 3 anos)';
    case 'long':
      return 'Longo Prazo (> 3 anos)';
    default:
      return 'Prazo Geral';
  }
}

export function getTermBadge(term: 'short' | 'medium' | 'long'): {
  label: string;
  badgeClass: string;
} {
  switch (term) {
    case 'short':
      return {
        label: 'Curto Prazo',
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
      };
    case 'medium':
      return {
        label: 'Médio Prazo',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    case 'long':
      return {
        label: 'Longo Prazo',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      };
    default:
      return {
        label: 'Objectivo',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
}
