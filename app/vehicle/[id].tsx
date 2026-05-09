import { useLocalSearchParams, router } from 'expo-router';
import EditVehicleScreen from './edit';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditVehicleScreen vehicleId={id} />;
}
