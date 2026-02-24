// Utilitaires pour le frontend

/**
 * Formate un montant en FCFA
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formate une date en français
 */
export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Valide un numéro de téléphone camerounais
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return /^(237)?[2367]\d{8}$/.test(cleaned);
};

/**
 * Formate un numéro de téléphone camerounais
 */
export const formatPhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('237')) {
    cleaned = '237' + cleaned.slice(-9);
  }
  return '+' + cleaned;
};

/**
 * Tronque un texte
 */
export const truncateText = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};
