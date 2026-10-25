import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date, pattern = 'dd MMM yyyy') => {
  if (!date) return '-';
  try {
    return format(new Date(date), pattern);
  } catch {
    return '-';
  }
};

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, hh:mm a');

export const timeAgo = (date) => {
  if (!date) return '-';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '-';
  }
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const todayString = () => format(new Date(), 'EEEE, dd MMMM yyyy');