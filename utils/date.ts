import i18n from '@/i18n';

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const isAr = i18n.language === 'ar';

  if (seconds < 60) return isAr ? 'الآن' : 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return isAr ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return isAr ? `منذ ${months} شهر` : `${months}mo ago`;
  const years = Math.floor(months / 12);
  return isAr ? `منذ ${years} سنة` : `${years}y ago`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-IQ' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
