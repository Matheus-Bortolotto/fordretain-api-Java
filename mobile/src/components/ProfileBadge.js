import { View, Text, StyleSheet } from 'react-native';

const PROFILE_COLORS = {
  'Cliente Fiel': '#16A34A',
  'Cliente Econômico': '#F59E0B',
  'Cliente Esquecido': '#1E5AA8',
  'Cliente de Abandono': '#DC2626',
  'Cliente em Risco': '#DC2626',
};

export default function ProfileBadge({ perfil }) {
  return (
    <View style={[styles.badge, { backgroundColor: PROFILE_COLORS[perfil] || '#94A3B8' }]}>
      <Text style={styles.text}>{perfil}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  text: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
