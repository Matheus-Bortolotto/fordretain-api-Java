import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import RoleGuard from '../components/RoleGuard';
import FeedbackModal from '../components/FeedbackModal';
import { getUsers, updateUserRole, updateUserStatus } from '../services/api';
import colors from '../styles/colors';

function AdminUsersContent({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ visible: false, message: '' });

  const load = useCallback(async () => { try { setUsers(await getUsers()); } catch (error) { setFeedback({ visible: true, message: error.message }); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  async function changeRole(user) {
    const role = user.role === 'ANALISTA' ? 'GERENTE' : 'ANALISTA';
    try { const updated = await updateUserRole(user.id, role); setUsers((items) => items.map((item) => item.id === user.id ? updated : item)); setFeedback({ visible: true, message: 'Permissão atualizada. A alteração será aplicada no próximo login do usuário.' }); } catch (error) { setFeedback({ visible: true, message: error.message }); }
  }

  async function changeStatus(user) {
    try { const updated = await updateUserStatus(user.id, !user.ativo); setUsers((items) => items.map((item) => item.id === user.id ? updated : item)); } catch (error) { setFeedback({ visible: true, message: error.message }); }
  }

  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={colors.fordBlue} size="large" /></View>;
  return <>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ color: colors.navy, fontSize: 24, fontWeight: '800' }}>Usuários</Text>
      {users.map((user) => <View key={user.id} style={{ backgroundColor: colors.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.navy, fontWeight: '800', fontSize: 16 }}>{user.nome}</Text>
        <Text style={{ color: colors.textGray, marginTop: 4 }}>{user.email}</Text>
        <Text style={{ color: colors.fordBlue, fontWeight: '700', marginTop: 8 }}>{user.role} · {user.ativo ? 'Ativo' : 'Inativo'}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Pressable onPress={() => changeRole(user)} style={{ backgroundColor: colors.fordBlue, padding: 10, borderRadius: 8 }}><Text style={{ color: colors.white }}>Alternar role</Text></Pressable>
          <Pressable onPress={() => changeStatus(user)} style={{ backgroundColor: user.ativo ? colors.riskRed : colors.successGreen, padding: 10, borderRadius: 8 }}><Text style={{ color: colors.white }}>{user.ativo ? 'Desativar' : 'Ativar'}</Text></Pressable>
        </View>
      </View>)}
    </ScrollView>
    <FeedbackModal visible={feedback.visible} type="aviso" title="Administração" message={feedback.message} buttonText="Entendi" onButtonPress={() => setFeedback({ visible: false, message: '' })} />
  </>;
}

export default function AdminUsersScreen({ navigation }) { return <RoleGuard navigation={navigation} allowedRoles={['ADMIN']} message="A administração de usuários é exclusiva para ADMIN."><AdminUsersContent navigation={navigation} /></RoleGuard>; }
