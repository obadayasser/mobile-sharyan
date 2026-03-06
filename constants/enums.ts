export type BloodType =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE';

export const BLOOD_TYPES: BloodType[] = [
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
];

export type Gender = 'MALE' | 'FEMALE';

export const GENDERS: Gender[] = ['MALE', 'FEMALE'];

export type BloodRequestStatus =
  | 'OPEN'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'EXPIRED';

export const BLOOD_REQUEST_STATUSES: BloodRequestStatus[] = [
  'OPEN',
  'PARTIALLY_FULFILLED',
  'FULFILLED',
  'CANCELLED',
  'EXPIRED',
];

export type BloodRequestUrgency = 'NORMAL' | 'URGENT' | 'EMERGENCY';

export const BLOOD_REQUEST_URGENCIES: BloodRequestUrgency[] = [
  'NORMAL',
  'URGENT',
  'EMERGENCY',
];

export type BloodBankStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export const BLOOD_BANK_STATUSES: BloodBankStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
];

export type DonationOfferStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export const DONATION_OFFER_STATUSES: DonationOfferStatus[] = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
];

export type CampaignStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  'UPCOMING',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
];

export type NotificationType =
  | 'BLOOD_REQUEST'
  | 'EMERGENCY_REQUEST'
  | 'DONATION_REMINDER'
  | 'CAMPAIGN_ANNOUNCEMENT'
  | 'SHORTAGE_ALERT'
  | 'DONATION_OFFER'
  | 'CHAT_MESSAGE'
  | 'BADGE_EARNED'
  | 'POINTS_EARNED'
  | 'SYSTEM';

export const NOTIFICATION_TYPES: NotificationType[] = [
  'BLOOD_REQUEST',
  'EMERGENCY_REQUEST',
  'DONATION_REMINDER',
  'CAMPAIGN_ANNOUNCEMENT',
  'SHORTAGE_ALERT',
  'DONATION_OFFER',
  'CHAT_MESSAGE',
  'BADGE_EARNED',
  'POINTS_EARNED',
  'SYSTEM',
];

export type StockLevel = 'CRITICAL' | 'LOW' | 'ADEQUATE' | 'HIGH';

export const STOCK_LEVELS: StockLevel[] = ['CRITICAL', 'LOW', 'ADEQUATE', 'HIGH'];

export type BadgeType =
  | 'FIRST_DONATION'
  | 'FIVE_DONATIONS'
  | 'TEN_DONATIONS'
  | 'TWENTY_FIVE_DONATIONS'
  | 'FIFTY_DONATIONS'
  | 'LIFE_SAVER'
  | 'SPEED_HERO'
  | 'CONSISTENT_DONOR'
  | 'CAMPAIGN_CHAMPION'
  | 'COMMUNITY_PILLAR';

export const BADGE_TYPES: BadgeType[] = [
  'FIRST_DONATION',
  'FIVE_DONATIONS',
  'TEN_DONATIONS',
  'TWENTY_FIVE_DONATIONS',
  'FIFTY_DONATIONS',
  'LIFE_SAVER',
  'SPEED_HERO',
  'CONSISTENT_DONOR',
  'CAMPAIGN_CHAMPION',
  'COMMUNITY_PILLAR',
];

export type ChatMessageType = 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM';

export const CHAT_MESSAGE_TYPES: ChatMessageType[] = [
  'TEXT',
  'IMAGE',
  'LOCATION',
  'SYSTEM',
];

export type UserRole = 'ADMIN' | 'DONOR' | 'PATIENT' | 'BLOOD_BANK';

export const USER_ROLES: UserRole[] = ['ADMIN', 'DONOR', 'PATIENT', 'BLOOD_BANK'];
