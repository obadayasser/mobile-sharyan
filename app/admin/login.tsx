import { useState } from 'react';
import { View, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/AuthContext';

export default function AdminLogin() {
  const { t } = useTranslation();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await loginAdmin(email, password);
      router.replace('/admin/dashboard');
    } catch (e: any) { Alert.alert(t('common.error'), e?.message || t('errors.unauthorized')); }
    finally { setLoading(false); }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <Header title={t('admin.login')} showBack />
      <View style={tw`px-6 pt-10`}>
        <Input label={t('admin.email')} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input label={t('admin.password')} value={password} onChangeText={setPassword} secureTextEntry />
        <View style={tw`mt-6`}><Button title={t('admin.loginButton')} onPress={handleLogin} loading={loading} /></View>
      </View>
    </View>
  );
}
