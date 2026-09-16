import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import PrimaryButton from './PrimaryButton';
import colors from '../styles/colors';
import useAuth from '../hooks/useAuth';
import AppShell from './AppShell';

export default function AuthGuard({ navigation, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.fordBlue} />
      </View>
    );
  }

  if (user) {
    return <AppShell navigation={navigation}>{children}</AppShell>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sessão expirada</Text>
        <Text style={styles.message}>
          Não encontramos um usuário logado. Faça login novamente para acessar o FordRetain com o perfil correto.
        </Text>
        <PrimaryButton title="Voltar ao Login" onPress={() => navigation.replace('Login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16, justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 18 },
  title: { color: colors.navy, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  message: { color: '#334155', lineHeight: 21, marginBottom: 8 },
});
