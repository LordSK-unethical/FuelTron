import { useLocalSearchParams, router } from 'expo-router';
import EditRefillScreen from './edit';

export default function RefillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditRefillScreen refillId={id} />;
}
