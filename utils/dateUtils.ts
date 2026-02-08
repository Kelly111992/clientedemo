export const getDaysDifference = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  
  // Reset hours to compare only dates
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const isExpiringSoon = (dateString: string): boolean => {
  const diff = getDaysDifference(dateString);
  return diff >= 0 && diff <= 30;
};