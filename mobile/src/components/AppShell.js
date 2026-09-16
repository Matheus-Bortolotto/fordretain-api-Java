import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { usePathname } from 'expo-router';
import colors from '../styles/colors';
import useAuth from '../hooks/useAuth';

const ROUTE_META = {
  '/home': {
    title: 'Tela inicial',
    subtitle: 'Central de decisão e acompanhamento',
  },
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'KPIs, VIN Share e visão executiva',
  },
  '/clients': {
    title: 'Clientes em risco',
    subtitle: 'Carteira priorizada por criticidade',
  },
  '/client-details': {
    title: 'Detalhes do cliente',
    subtitle: 'Ação comercial e contexto do caso',
  },
  '/recommendations': {
    title: 'Recomendações',
    subtitle: 'Campanhas, estratégias e acompanhamento',
  },
  '/prediction': {
    title: 'Classificação preditiva',
    subtitle: 'Simulação para novos clientes',
  },
  '/profiles': {
    title: 'Perfis comportamentais',
    subtitle: 'Leitura dos clusters e estratégias',
  },
};

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || 'F';
  const second = parts[1]?.[0] || 'R';
  return `${first}${second}`.toUpperCase();
}

function TabItem({ item, active, onPress }) {
  return (
    <Pressable style={[styles.tabItem, active && styles.tabItemActive]} onPress={onPress}>
      <Text style={[styles.tabIcon, active && styles.tabIconActive]}>{item.icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

export default function AppShell({ navigation, children }) {
  const pathname = usePathname();
  const [panelVisible, setPanelVisible] = useState(false);
  const { user, logout } = useAuth();
  const isManager = ['ADMIN', 'GERENTE'].includes(user?.role);
  const meta = ROUTE_META[pathname] || {
    title: 'FordRetain',
    subtitle: 'Retenção preditiva',
  };

  const tabs = isManager
    ? [
        { label: 'Home', icon: '⌂', screen: 'Home', path: '/home' },
        { label: 'Dashboard', icon: '◫', screen: 'Dashboard', path: '/dashboard' },
        { label: 'Clientes', icon: '◎', screen: 'Clients', path: '/clients' },
        { label: 'Ações', icon: '◉', screen: 'Recommendations', path: '/recommendations' },
      ]
    : [
        { label: 'Home', icon: '⌂', screen: 'Home', path: '/home' },
        { label: 'Clientes', icon: '◎', screen: 'Clients', path: '/clients' },
        { label: 'Ações', icon: '◉', screen: 'Recommendations', path: '/recommendations' },
      ];

  const secondaryItems = isManager
    ? [
        { label: 'Classificação preditiva', screen: 'Prediction' },
        { label: 'Perfis comportamentais', screen: 'Profiles' },
      ]
    : [];

  function navigateTo(screen) {
    setPanelVisible(false);
    navigation.navigate(screen);
  }

  async function handleLogout() {
    setPanelVisible(false);
    await logout();
    navigation.replace('Login');
  }

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>{meta.title}</Text>
          <Text style={styles.headerSubtitle}>{meta.subtitle}</Text>
        </View>

        <Pressable style={styles.accountButton} onPress={() => setPanelVisible(true)}>
          <Text style={styles.accountInitials}>{getInitials(user?.name)}</Text>
        </Pressable>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.tabBar}>
        {tabs.map((item) => (
          <TabItem
            key={item.path}
            item={item}
            active={pathname === item.path}
            onPress={() => navigation.navigate(item.screen)}
          />
        ))}
      </View>

      <Modal visible={panelVisible} transparent animationType="fade" onRequestClose={() => setPanelVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPanelVisible(false)} />

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={styles.panelAvatar}>
                <Text style={styles.panelAvatarText}>{getInitials(user?.name)}</Text>
              </View>
              <View style={styles.panelUserBlock}>
                <Text style={styles.panelName}>{user?.name || 'Usuário FordRetain'}</Text>
                <Text style={styles.panelEmail}>{user?.email || 'Conta local'}</Text>
                <Text style={styles.panelRole}>{user?.role || 'Perfil não identificado'}</Text>
              </View>
            </View>

            {secondaryItems.length ? (
              <View style={styles.panelSection}>
                <Text style={styles.panelSectionTitle}>Ferramentas</Text>
                {secondaryItems.map((item) => (
                  <Pressable key={item.screen} style={styles.panelItem} onPress={() => navigateTo(item.screen)}>
                    <Text style={styles.panelItemText}>{item.label}</Text>
                    <Text style={styles.panelItemArrow}>›</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.panelSection}>
              <Text style={styles.panelSectionTitle}>Sessão</Text>
              <Pressable style={styles.panelItem} onPress={() => navigateTo('Home')}>
                <Text style={styles.panelItemText}>Voltar para início</Text>
                <Text style={styles.panelItemArrow}>›</Text>
              </Pressable>
              <Pressable style={[styles.panelItem, styles.logoutItem]} onPress={handleLogout}>
                <Text style={styles.logoutItemText}>Sair da conta</Text>
                <Text style={styles.logoutItemText}>›</Text>
              </Pressable>
            </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextBlock: { flex: 1 },
  headerTitle: { color: colors.navy, fontWeight: '900', fontSize: 20 },
  headerSubtitle: { color: colors.textGray, fontWeight: '700', fontSize: 12, marginTop: 2 },
  accountButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.fordBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInitials: { color: colors.white, fontWeight: '900', fontSize: 13 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.fordBlue,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  tabIcon: { color: colors.white, fontWeight: '900', fontSize: 14 },
  tabIconActive: { color: colors.fordBlue },
  tabLabel: { color: colors.white, fontWeight: '900', fontSize: 11 },
  tabLabelActive: { color: colors.fordBlue },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,26,51,0.42)' },
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  panelAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.fordBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelAvatarText: { color: colors.white, fontWeight: '900' },
  panelUserBlock: { flex: 1 },
  panelName: { color: colors.navy, fontWeight: '900', fontSize: 16 },
  panelEmail: { color: colors.textGray, fontWeight: '600', fontSize: 12, marginTop: 2 },
  panelRole: { color: colors.fordBlue, fontWeight: '900', fontSize: 12, marginTop: 5 },
  panelSection: { gap: 8 },
  panelSectionTitle: { color: colors.navy, fontWeight: '900', fontSize: 14 },
  panelItem: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  panelItemText: { color: colors.navy, fontWeight: '800' },
  panelItemArrow: { color: colors.fordBlue, fontWeight: '900', fontSize: 22 },
  logoutItem: {
    backgroundColor: colors.riskRedSoft,
    borderColor: '#FFC9CE',
  },
  logoutItemText: { color: colors.riskRed, fontWeight: '900' },
});
