import ProfilesScreen from '../src/screens/ProfilesScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function ProfilesRoute() {
  const navigation = useRouterNavigation();
  return <ProfilesScreen navigation={navigation} />;
}
