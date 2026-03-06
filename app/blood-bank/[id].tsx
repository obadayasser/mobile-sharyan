import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import tw from 'twrnc';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { StockLevelBar } from '@/components/blood/StockLevelBar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { bloodBankService } from '@/services/blood-bank.service';
import { bloodStockService } from '@/services/blood-stock.service';
import { BloodBank } from '@/types/blood-bank';
import { BloodStock } from '@/types/blood-stock';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function BloodBankDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [bank, setBank] = useState<BloodBank | null>(null);
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bloodBankService.getById(id!),
      bloodStockService.getByBank(id!).catch(() => []),
    ]).then(([b, s]) => { setBank(b); setStock(s); setLoading(false); });
  }, [id]);

  if (loading || !bank) return <LoadingSpinner />;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <Header title={t('bloodBank.title')} showBack />
      <ScrollView contentContainerStyle={tw`px-5 pb-10 pt-4`}>
        <Card>
          <Text style={tw`text-xl font-bold text-gray-900 mb-2`}>{bank.nameAr || bank.name}</Text>
          {bank.address && <InfoRow icon="location-on" text={bank.address} />}
          {bank.city && <InfoRow icon="location-city" text={bank.city} />}
          {bank.phone && <InfoRow icon="phone" text={bank.phone} />}
          {bank.email && <InfoRow icon="email" text={bank.email} />}
        </Card>

        {stock.length > 0 && (
          <View style={tw`mt-6`}>
            <Text style={tw`text-lg font-bold text-gray-900 mb-3`}>{t('bloodBank.stock')}</Text>
            {stock.map((s) => (
              <View key={s.id} style={tw`mb-3`}>
                <StockLevelBar bloodType={s.bloodType} stockLevel={s.stockLevel} bagsCount={s.bagsCount} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={tw`flex-row items-center mb-2`}>
      <MaterialIcons name={icon} size={18} color={Colors.textSecondary} />
      <Text style={tw`ml-2 text-sm text-gray-600`}>{text}</Text>
    </View>
  );
}
