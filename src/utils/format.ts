export const formatCOP = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0';
  return '$' + num.toLocaleString('es-CO', { maximumFractionDigits: 0 });
};
