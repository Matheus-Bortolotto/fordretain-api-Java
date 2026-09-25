import AdminUsersScreen from '../src/screens/AdminUsersScreen';
import useRouterNavigation from '../src/navigation/useRouterNavigation';

export default function AdminUsersRoute() { return <AdminUsersScreen navigation={useRouterNavigation()} />; }
