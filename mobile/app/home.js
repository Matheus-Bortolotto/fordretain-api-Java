import HomeScreen from '../src/screens/HomeScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function HomeRoute() {
  const navigation = useRouterNavigation();
  return <HomeScreen navigation={navigation} />;
}
