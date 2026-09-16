import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import ProfileBadge from './ProfileBadge';
import colors from '../styles/colors';

function getRiskStyle(risk) {
  if (risk >= 70) return styles.highRisk;
  if (risk >= 50) return styles.mediumRisk;
  return styles.lowRisk;
}

export default function ClientCard({ cliente, onOpenDetails }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.nameBlock}>
          <Text style={styles.nome}>{cliente.nome}</Text>
          <Text style={styles.meta}>
            {cliente.veiculo} • {cliente.regiao}
          </Text>
        </View>

        <Text style={[styles.riskBadge, getRiskStyle(cliente.riscoEvasao)]}>
          {cliente.riscoEvasao}%
        </Text>
      </View>

      <View style={styles.badgeRow}>
        <ProfileBadge perfil={cliente.perfil} />
        <Text style={styles.priorityText}>{cliente.prioridade}</Text>
      </View>

      <Text style={styles.acaoLabel}>Ação sugerida</Text>
      <Text style={styles.acao}>{cliente.acaoRecomendada}</Text>

      {expanded && (
        <View style={styles.expandedArea}>
          <Text style={styles.expandedTitle}>Resumo do cliente</Text>

          <Text style={styles.detailLine}>
            <Text style={styles.detailLabel}>Motivo da priorização: </Text>
            {cliente.motivoPriorizacao || 'Cliente priorizado pelo risco de evasão.'}
          </Text>

          <Text style={styles.detailLine}>
            <Text style={styles.detailLabel}>Região: </Text>
            {cliente.regiao}
          </Text>

          <Text style={styles.detailLine}>
            <Text style={styles.detailLabel}>Probabilidade do perfil: </Text>
            {cliente.probabilidadePerfil}%
          </Text>

          <Text style={styles.detailLine}>
            <Text style={styles.detailLabel}>Última predição: </Text>
            {cliente.dataPredicao || 'Não informado'}
          </Text>

          <Text style={styles.detailLine}>
            <Text style={styles.detailLabel}>Fatores de risco: </Text>
            {cliente.fatoresRisco?.join(', ') || 'Não informado'}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => setExpanded((prev) => !prev)}
        >
          <Text style={styles.secondaryButtonText}>
            {expanded ? 'Ocultar resumo' : 'Expandir resumo'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => onOpenDetails(cliente)}
        >
          <Text style={styles.primaryButtonText}>Abrir detalhes</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  nameBlock: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginRight: 8,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    color: colors.white,
    fontWeight: '800',
    overflow: 'hidden',
  },
  highRisk: {
    backgroundColor: colors.riskRed,
  },
  mediumRisk: {
    backgroundColor: colors.warningYellow,
  },
  lowRisk: {
    backgroundColor: colors.successGreen,
  },
  meta: {
    fontSize: 13,
    color: colors.textGray,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityText: {
    fontSize: 12,
    color: colors.textGray,
    fontWeight: '700',
  },
  acaoLabel: {
    fontSize: 12,
    color: colors.navy,
    fontWeight: '700',
  },
  acao: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  expandedArea: {
    backgroundColor: colors.lightBlue,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  expandedTitle: {
    color: colors.fordBlue,
    fontWeight: '800',
    marginBottom: 2,
  },
  detailLine: {
    color: '#1E293B',
    fontSize: 13,
    lineHeight: 18,
  },
  detailLabel: {
    fontWeight: '800',
    color: colors.navy,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.fordBlue,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.fordBlue,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  secondaryButtonText: {
    color: colors.fordBlue,
    fontWeight: '800',
    fontSize: 13,
  },
});
