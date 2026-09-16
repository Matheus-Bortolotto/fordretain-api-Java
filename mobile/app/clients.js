import RiskClientsScreen from '../src/screens/RiskClientsScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function ClientsRoute() {
  const navigation = useRouterNavigation();
  return <RiskClientsScreen navigation={navigation} />;
}
