import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import { radius, spacing, font, shadow } from '../styles/tokens';
import useAuth from '../hooks/useAuth';
import useApiHealth from '../hooks/useApiHealth';
import AppLogo from './AppLogo';

const TOP_LEVEL_PATHS = ['/home', '/clients', '/dashboard', '/recommendations'];

const HEALTH_META = {
  checking: { label: 'verificando', color: colors.muted },
  online: { label: 'online', color: colors.successGreen },
  demo: { label: 'demonstração', color: colors.warningYellow },
  offline: { label: 'offline', color: colors.riskRed },
};

const ROUTE_META = {
  '/home': { title: 'Visão geral', subtitle: 'O que merece atenção agora' },
  '/dashboard': { title: 'Painel', subtitle: 'Indicadores da operação' },
  '/clients': { title: 'Carteira', subtitle: 'Clientes ordenados por risco' },
  '/client-details': { title: 'Cliente', subtitle: 'Contexto para a próxima decisão' },
  '/recommendations': { title: 'Ações', subtitle: 'Orientações para retenção' },
  '/prediction': { title: 'Classificar', subtitle: 'Simular um novo perfil' },
  '/profiles': { title: 'Perfis', subtitle: 'Padrões de comportamento' },
  '/admin-users': { title: 'Administração', subtitle: 'Gestão de usuários' },
};

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || 'F'}${parts[1]?.[0] || 'R'}`.toUpperCase();
}

function TabItem({ item, active, onPress }) {
  return (
    <Pressable style={styles.tabItem} onPress={onPress} hitSlop={6}>
      <Ionicons name={active ? item.iconActive : item.icon} size={23} color={active ? colors.fordBlue : colors.muted} />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

export default function AppShell({ navigation, children }) {
  const pathname = usePathname();
  const [panelVisible, setPanelVisible] = useState(false);
  const { user, logout } = useAuth();
  const health = useApiHealth();
  const isManager = ['ADMIN', 'GERENTE'].includes(user?.role);
  const meta = ROUTE_META[pathname] || { title: 'FordRetain', subtitle: 'Retenção inteligente' };
  const healthMeta = HEALTH_META[health] || HEALTH_META.checking;
  const showBack = !TOP_LEVEL_PATHS.includes(pathname) && navigation?.canGoBack?.();

  const tools = [
    ...(user?.role === 'ADMIN' ? [{ label: 'Administração de usuários', caption: 'Roles e status de acesso', screen: 'AdminUsers', icon: 'shield-checkmark-outline' }] : []),
    ...(isManager ? [
      { label: 'Classificar cliente', caption: 'Simular um perfil comportamental', screen: 'Prediction', icon: 'analytics-outline' },
      { label: 'Perfis comportamentais', caption: 'Padrões observados na carteira', screen: 'Profiles', icon: 'people-circle-outline' },
    ] : []),
  ];

  const tabs = [
    { label: 'Início', screen: 'Home', path: '/home', icon: 'home-outline', iconActive: 'home' },
    { label: 'Carteira', screen: 'Clients', path: '/clients', icon: 'people-outline', iconActive: 'people' },
    ...(isManager ? [{ label: 'Painel', screen: 'Dashboard', path: '/dashboard', icon: 'stats-chart-outline', iconActive: 'stats-chart' }] : []),
    { label: 'Ações', screen: 'Recommendations', path: '/recommendations', icon: 'bulb-outline', iconActive: 'bulb' },
    ...(tools.length ? [{ label: 'Mais', screen: 'More', path: '/more', icon: 'ellipsis-horizontal-circle-outline', iconActive: 'ellipsis-horizontal-circle' }] : []),
  ];

  async function handleLogout() {
    setPanelVisible(false);
    await logout();
    navigation.replace('Login');
  }

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            {showBack ? (
              <Pressable style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={6}>
                <Ionicons name="chevron-back" size={20} color={colors.fordBlue} />
              </Pressable>
            ) : null}
            <AppLogo small />
          </View>
          <Pressable style={styles.accountButton} onPress={() => setPanelVisible(true)} hitSlop={6}>
            <Text style={styles.accountInitials}>{getInitials(user?.name)}</Text>
          </Pressable>
        </View>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>{meta.title}</Text>
            <Text style={styles.headerSubtitle}>{meta.subtitle}</Text>
          </View>
          <View style={styles.liveStatus}>
            <View style={[styles.liveDot, { backgroundColor: healthMeta.color }]} />
            <Text style={[styles.liveText, { color: healthMeta.color }]}>{healthMeta.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.tabBar}>
        {tabs.map((item) => (
          <TabItem
            key={item.path}
            item={item}
            active={item.path === '/more' ? panelVisible : pathname === item.path}
            onPress={() => (item.screen === 'More' ? setPanelVisible(true) : navigation.replace(item.screen))}
          />
        ))}
      </View>

      <Modal visible={panelVisible} transparent animationType="slide" onRequestClose={() => setPanelVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPanelVisible(false)} />
          <View style={styles.panel}>
            <View style={styles.panelGrabber} />
            <View style={styles.panelHeader}>
              <View style={styles.panelAvatar}><Text style={styles.panelAvatarText}>{getInitials(user?.name)}</Text></View>
              <View style={styles.panelUserBlock}>
                <Text style={styles.panelName}>{user?.name || 'Usuário FordRetain'}</Text>
                <Text style={styles.panelEmail}>{user?.email || 'Conta local'}</Text>
                <Text style={styles.panelRole}>{user?.role || 'Perfil não identificado'}</Text>
              </View>
            </View>

            {tools.length ? (
              <>
                <Text style={styles.panelSectionTitle}>Ferramentas</Text>
                <View style={styles.toolList}>
                  {tools.map((item) => (
                    <Pressable key={item.screen} style={styles.toolItem} onPress={() => { setPanelVisible(false); navigation.navigate(item.screen); }}>
                      <View style={styles.toolIconWrap}><Ionicons name={item.icon} size={18} color={colors.fordBlue} /></View>
                      <View style={styles.toolText}><Text style={styles.toolLabel}>{item.label}</Text><Text style={styles.toolCaption}>{item.caption}</Text></View>
                      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <Pressable style={styles.logoutItem} onPress={handleLogout}>
              <Text style={styles.logoutText}>Encerrar sessão</Text>
              <Ionicons name="log-out-outline" size={18} color={colors.riskRed} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backButton: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  accountButton: { width: 34, height: 34, borderRadius: radius.pill, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.skyBlue },
  accountInitials: { color: colors.fordBlue, fontWeight: font.weight.black, fontSize: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerTitle: { color: colors.navy, fontWeight: font.weight.black, fontSize: font.size.xxl, letterSpacing: font.tracking.tight },
  headerSubtitle: { color: colors.textGray, fontWeight: font.weight.regular, fontSize: font.size.sm, marginTop: 2 },
  liveStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingBottom: 2 },
  liveDot: { width: 7, height: 7, borderRadius: radius.pill },
  liveText: { fontSize: 10, fontWeight: font.weight.bold, textTransform: 'uppercase', letterSpacing: font.tracking.wide },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs + 2,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  tabItem: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabLabel: { color: colors.muted, fontWeight: font.weight.semibold, fontSize: 10.5 },
  tabLabelActive: { color: colors.fordBlue, fontWeight: font.weight.bold },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,26,51,0.4)' },
  panel: { backgroundColor: colors.white, padding: spacing.lg, paddingBottom: spacing.xxl, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadow.md },
  panelGrabber: { alignSelf: 'center', width: 38, height: 4, borderRadius: radius.pill, backgroundColor: colors.line, marginBottom: spacing.lg },
  panelHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingBottom: 18, marginBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  panelAvatar: { width: 46, height: 46, borderRadius: radius.pill, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.skyBlue },
  panelAvatarText: { color: colors.fordBlue, fontWeight: font.weight.black },
  panelUserBlock: { flex: 1 }, panelName: { color: colors.navy, fontWeight: font.weight.black, fontSize: 16 }, panelEmail: { color: colors.textGray, fontSize: 12, marginTop: 2 }, panelRole: { color: colors.fordBlue, fontWeight: font.weight.black, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 6 },
  panelSectionTitle: { color: colors.muted, fontSize: 11, fontWeight: font.weight.black, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  toolList: { borderTopWidth: 1, borderTopColor: colors.borderSoft },
  toolItem: { flexDirection: 'row', alignItems: 'center', minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, gap: 12 },
  toolIconWrap: { width: 34, height: 34, borderRadius: radius.sm, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  toolText: { flex: 1 }, toolLabel: { color: colors.navy, fontWeight: font.weight.bold, fontSize: 14 }, toolCaption: { color: colors.textGray, fontSize: 11, marginTop: 3 },
  logoutItem: { marginTop: 18, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderSoft },
  logoutText: { color: colors.riskRed, fontWeight: font.weight.black },
});
