import RecommendationsScreen from '../src/screens/RecommendationsScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function RecommendationsRoute() {
  const navigation = useRouterNavigation();
  return <RecommendationsScreen navigation={navigation} />;
}
