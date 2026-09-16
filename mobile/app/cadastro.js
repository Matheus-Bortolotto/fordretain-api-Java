import RegisterScreen from '../src/screens/RegisterScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function CadastroRoute() {
  const navigation = useRouterNavigation();
  return <RegisterScreen navigation={navigation} />;
}
