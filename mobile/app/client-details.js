import { useLocalSearchParams } from 'expo-router';
import ClientDetailsScreen from '../src/screens/ClientDetailsScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function ClientDetailsRoute() {
  const params = useLocalSearchParams();
  const navigation = useRouterNavigation();

  return <ClientDetailsScreen navigation={navigation} route={{ params }} />;
}
