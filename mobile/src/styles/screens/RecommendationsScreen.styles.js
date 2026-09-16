import { StyleSheet } from 'react-native';
import colors from '../colors';

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.background, flexGrow: 1, gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: colors.navy },
  subtitle: { color: colors.textGray },
  summaryPanel: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navy, borderRadius: 16, padding: 14 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { color: colors.white, fontWeight: '900', fontSize: 24 },
  summaryLabel: { color: '#DCEBFF', fontWeight: '800', fontSize: 12, marginTop: 2 },
  summaryDivider: { width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.24)' },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, gap: 6 },
  cardActive: { borderColor: '#BFDBFE', backgroundColor: colors.lightBlue },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { fontWeight: '800', color: colors.fordBlue, fontSize: 17 },
  cardAudience: { color: colors.textGray, fontWeight: '700', fontSize: 12, marginTop: 3 },
  priorityPill: { backgroundColor: colors.warningSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  priorityHigh: { backgroundColor: colors.riskRedSoft },
  priorityText: { color: colors.navy, fontWeight: '900', fontSize: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: 8, marginTop: 2 },
  statusText: { color: colors.textGray, fontWeight: '900', fontSize: 12 },
  statusTextActive: { color: colors.fordBlue },
  impactText: { color: colors.successGreen, fontWeight: '900', fontSize: 12 },
  noteCard: { backgroundColor: colors.lightBlue, borderWidth: 1, borderColor: '#BFDBFE', borderRadius: 14, padding: 14, gap: 6 },
  noteTitle: { fontWeight: '800', color: colors.navy, fontSize: 16 },
  row: { color: '#1E293B', lineHeight: 21 },
  label: { fontWeight: '800', color: colors.navy },
});

export default styles;
