import { Stack } from 'expo-router';
import colors from '../src/styles/colors';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.navy },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="clients" options={{ headerShown: false }} />
        <Stack.Screen name="client-details" options={{ headerShown: false }} />
        <Stack.Screen name="recommendations" options={{ headerShown: false }} />
        <Stack.Screen name="prediction" options={{ headerShown: false }} />
        <Stack.Screen name="profiles" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
