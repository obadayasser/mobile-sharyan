import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import ar from './ar.json';
import en from './en.json';

const LANG_KEY = '@sharyan:language';

export type AppLanguage = 'ar' | 'en';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

function applyRTL(lng: AppLanguage): boolean {
  const shouldBeRTL = lng === 'ar';
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
    return true;
  }
  return false;
}

export async function hydrateLanguage(): Promise<AppLanguage> {
  let lng: AppLanguage = 'ar';
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored === 'ar' || stored === 'en') lng = stored;
  } catch {
    // ignore — fall back to default
  }
  if (i18n.language !== lng) {
    await i18n.changeLanguage(lng);
  }
  applyRTL(lng);
  return lng;
}

export async function setLanguage(lng: AppLanguage): Promise<boolean> {
  try {
    await AsyncStorage.setItem(LANG_KEY, lng);
  } catch {
    // ignore — at least the in-memory switch happens
  }
  await i18n.changeLanguage(lng);
  return applyRTL(lng);
}

export default i18n;
