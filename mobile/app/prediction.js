import PredictionScreen from '../src/screens/PredictionScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function PredictionRoute() {
  const navigation = useRouterNavigation();
  return <PredictionScreen navigation={navigation} />;
}
