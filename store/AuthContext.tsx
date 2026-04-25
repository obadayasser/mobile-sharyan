import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getDeviceId, clearDeviceId } from '@/utils/device-id';
import { api } from '@/services/api';
import { authService } from '@/services/auth.service';
import { donorService } from '@/services/donor.service';
import { patientService } from '@/services/patient.service';
import { bloodBankService } from '@/services/blood-bank.service';
import { Donor } from '@/types/donor';
import { Patient } from '@/types/patient';
import { BloodBank } from '@/types/blood-bank';
import { Admin, AdminTokens } from '@/types/admin';
import { UserRole } from '@/constants/enums';

const STORAGE_KEYS = {
  USER_TYPE: 'sharyan_user_type',
  ADMIN_TOKEN: 'sharyan_admin_token',
  ADMIN_REFRESH: 'sharyan_admin_refresh',
};

// Stored in AsyncStorage (NOT cleared on logout) so we can offer
// "Continue as <name>" on the onboarding screen.
const LAST_ACCOUNT_KEY = 'sharyan_last_account';

export interface StoredAccount {
  type: 'DONOR' | 'PATIENT' | 'BLOOD_BANK';
  name: string;
}

async function readLastAccount(): Promise<StoredAccount | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.name === 'string' &&
      (parsed.type === 'DONOR' || parsed.type === 'PATIENT' || parsed.type === 'BLOOD_BANK')
    ) {
      return parsed as StoredAccount;
    }
    return null;
  } catch {
    return null;
  }
}

async function writeLastAccount(account: StoredAccount): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // ignore — best effort
  }
}

async function clearLastAccount(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_ACCOUNT_KEY);
  } catch {
    // ignore
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  } catch {
    return AsyncStorage.getItem(key);
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
}

type Profile = Donor | Patient | BloodBank | null;

interface AuthState {
  isLoading: boolean;
  isOnboarded: boolean;
  userType: UserRole | null;
  deviceId: string | null;
  profile: Profile;
  adminToken: string | null;
  adminProfile: Admin | null;
  storedAccount: StoredAccount | null;
  setUserTypeAndRegister: (type: UserRole, registerData: any) => Promise<void>;
  switchRole: (targetType: 'DONOR' | 'PATIENT') => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  restoreLastAccount: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<UserRole | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<Admin | null>(null);
  const [storedAccount, setStoredAccount] = useState<StoredAccount | null>(null);

  const isOnboarded = !!userType && !!profile;

  useEffect(() => {
    loadStoredAuth();
    readLastAccount().then(setStoredAccount);
  }, []);

  const loadStoredAuth = async () => {
    try {
      const id = await getDeviceId();
      setDeviceId(id);

      const storedType = await getItem(STORAGE_KEYS.USER_TYPE);
      const storedAdminToken = await getItem(STORAGE_KEYS.ADMIN_TOKEN);

      if (storedType && (storedType === 'DONOR' || storedType === 'PATIENT' || storedType === 'BLOOD_BANK')) {
        api.setDeviceAuth(id, storedType);
        setUserType(storedType as UserRole);
        try {
          const p = await fetchProfile(storedType as UserRole);
          setProfile(p);
          const fresh: StoredAccount = {
            type: storedType as StoredAccount['type'],
            name: (p as any)?.name || '',
          };
          await writeLastAccount(fresh);
          setStoredAccount(fresh);
        } catch {
          // Profile fetch failed, user needs to re-register
          setUserType(null);
          await removeItem(STORAGE_KEYS.USER_TYPE);
        }
      }

      if (storedAdminToken) {
        api.setAdminToken(storedAdminToken);
        setAdminToken(storedAdminToken);
        try {
          const admin = await authService.getAdminProfile();
          setAdminProfile(admin);
        } catch {
          setAdminToken(null);
          api.setAdminToken(null);
          await removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (type: UserRole) => {
    switch (type) {
      case 'DONOR': return donorService.getMe();
      case 'PATIENT': return patientService.getMe();
      case 'BLOOD_BANK': return bloodBankService.getById('me') as any;
      default: return null;
    }
  };

  const setUserTypeAndRegister = useCallback(async (type: UserRole, registerData: any) => {
    console.log('[register] start', type, JSON.stringify(registerData));
    const id = deviceId || (await getDeviceId());
    console.log('[register] using deviceId', id);
    api.setDeviceAuth(id, type);

    let p: Profile = null;
    try {
      switch (type) {
        case 'DONOR':
          p = await donorService.register(registerData);
          break;
        case 'PATIENT':
          p = await patientService.register(registerData);
          break;
        case 'BLOOD_BANK':
          p = await bloodBankService.register(registerData);
          break;
      }
    } catch (err: any) {
      console.warn('[register] API call FAILED', {
        type,
        message: err?.message,
        statusCode: err?.statusCode,
        error: err?.error,
      });
      throw err;
    }

    console.log('[register] API ok, profile id=', (p as any)?.id, 'name=', (p as any)?.name);

    await setItem(STORAGE_KEYS.USER_TYPE, type);
    setUserType(type);
    setDeviceId(id);
    setProfile(p);
    console.log('[register] state updated, isOnboarded should now flip true');

    const name = (p as any)?.name || '';
    const account: StoredAccount = { type: type as StoredAccount['type'], name };
    await writeLastAccount(account);
    setStoredAccount(account);
  }, [deviceId]);

  const switchRole = useCallback(async (targetType: 'DONOR' | 'PATIENT') => {
    const id = deviceId || await getDeviceId();
    api.setDeviceAuth(id, targetType);

    let p: Profile = null;
    try {
      // Try fetching existing profile for this role
      p = await fetchProfile(targetType);
    } catch {
      // Not registered as this role yet — auto-register with current profile's name/mobile
      const currentName = (profile as any)?.name || '';
      const currentMobile = (profile as any)?.mobile || (profile as any)?.phone || '';
      if (targetType === 'PATIENT') {
        p = await patientService.register({ name: currentName, mobile: currentMobile });
      } else {
        p = await donorService.register({ name: currentName, mobile: currentMobile, bloodType: 'O_POSITIVE', gender: 'MALE', latitude: 0, longitude: 0 });
      }
    }

    await setItem(STORAGE_KEYS.USER_TYPE, targetType);
    setUserType(targetType);
    setProfile(p);

    const name = (p as any)?.name || '';
    const account: StoredAccount = { type: targetType, name };
    await writeLastAccount(account);
    setStoredAccount(account);
  }, [deviceId, profile]);

  const loginAdmin = useCallback(async (email: string, password: string) => {
    const tokens: AdminTokens = await authService.adminLogin({ email, password });
    api.setAdminToken(tokens.accessToken);
    await setItem(STORAGE_KEYS.ADMIN_TOKEN, tokens.accessToken);
    await setItem(STORAGE_KEYS.ADMIN_REFRESH, tokens.refreshToken);
    setAdminToken(tokens.accessToken);
    const admin = await authService.getAdminProfile();
    setAdminProfile(admin);
  }, []);

  const logoutAdmin = useCallback(async () => {
    try { await authService.adminLogout(); } catch {}
    api.setAdminToken(null);
    await removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    await removeItem(STORAGE_KEYS.ADMIN_REFRESH);
    setAdminToken(null);
    setAdminProfile(null);
  }, []);

  const logout = useCallback(async () => {
    api.clearAuth();
    await removeItem(STORAGE_KEYS.USER_TYPE);
    await removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    await removeItem(STORAGE_KEYS.ADMIN_REFRESH);
    setUserType(null);
    setProfile(null);
    setAdminToken(null);
    setAdminProfile(null);
    // Note: LAST_ACCOUNT_KEY is intentionally retained so we can offer
    // "Continue as <name>" on the onboarding screen.
  }, []);

  const restoreLastAccount = useCallback(async () => {
    const account = await readLastAccount();
    if (!account) return false;
    const id = deviceId || (await getDeviceId());
    api.setDeviceAuth(id, account.type);
    try {
      const p = await fetchProfile(account.type as UserRole);
      if (!p) throw new Error('No profile');
      await setItem(STORAGE_KEYS.USER_TYPE, account.type);
      setUserType(account.type as UserRole);
      setDeviceId(id);
      setProfile(p);
      const fresh: StoredAccount = { type: account.type, name: (p as any)?.name || account.name };
      await writeLastAccount(fresh);
      setStoredAccount(fresh);
      return true;
    } catch {
      // The stored account no longer exists on the backend — drop the hint.
      api.clearAuth();
      await clearLastAccount();
      setStoredAccount(null);
      return false;
    }
  }, [deviceId]);

  const refreshProfile = useCallback(async () => {
    if (userType) {
      const p = await fetchProfile(userType);
      setProfile(p);
    }
  }, [userType]);

  const updateProfile = useCallback(async (data: any) => {
    switch (userType) {
      case 'DONOR': {
        const p = await donorService.updateMe(data);
        setProfile(p);
        break;
      }
      case 'PATIENT': {
        const p = await patientService.updateMe(data);
        setProfile(p);
        break;
      }
      case 'BLOOD_BANK': {
        const p = await bloodBankService.updateMe(data);
        setProfile(p);
        break;
      }
    }
  }, [userType]);

  return (
    <AuthContext.Provider value={{
      isLoading,
      isOnboarded,
      userType,
      deviceId,
      profile,
      adminToken,
      adminProfile,
      storedAccount,
      setUserTypeAndRegister,
      switchRole,
      loginAdmin,
      logoutAdmin,
      logout,
      restoreLastAccount,
      refreshProfile,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
