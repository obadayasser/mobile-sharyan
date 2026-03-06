import { Share } from 'react-native';
import i18n from '@/i18n';
import { BloodRequest } from '@/types/blood-request';
import { getBloodTypeLabel } from './blood-type';

export async function shareBloodRequest(request: BloodRequest, shareUrl?: string): Promise<void> {
  const t = i18n.t;
  const bloodType = getBloodTypeLabel(request.bloodType);
  const message = t('share.message', {
    bloodType,
    hospital: request.hospitalName || '-',
    phone: request.contactPhone || '-',
  });

  await Share.share({
    message: shareUrl ? `${message}\n${shareUrl}` : message,
    title: t('share.title'),
  });
}
