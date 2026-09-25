import DashboardScreen from '../src/screens/DashboardScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function DashboardRoute() {
  const navigation = useRouterNavigation();
  return <DashboardScreen navigation={navigation} />;
}
