import { useLocalSearchParams } from 'expo-router';
import LoginScreen from '../src/screens/LoginScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function LoginRoute() {
  const params = useLocalSearchParams();
  const navigation = useRouterNavigation();

  return <LoginScreen navigation={navigation} route={{ params }} />;
}
