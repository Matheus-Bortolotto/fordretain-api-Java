import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import AuthGuard from '../components/AuthGuard';
import FeedbackModal from '../components/FeedbackModal';
import styles from '../styles/screens/RecommendationsScreen.styles';

const campaigns = [
  { id: 'fidelidade', titulo: 'Programa de fidelidade', publico: 'Clientes Fiéis', objetivo: 'Manter recorrência e aumentar satisfação', acao: 'Benefícios exclusivos, revisão premium e prioridade de atendimento', canal: 'App + e-mail', prazo: 'Mensal', impacto: 'Defesa do VIN Share', prioridade: 'Baixa', estimativa: '3 clientes' },
  { id: 'cupom', titulo: 'Cupom de revisão', publico: 'Clientes Econômicos', objetivo: 'Aumentar retorno imediato', acao: 'Desconto progressivo com validade de 15 dias', canal: 'WhatsApp e SMS', prazo: '48 horas', impacto: '+12% agendamentos', prioridade: 'Média', estimativa: '3 clientes' },
  { id: 'lembrete', titulo: 'Lembrete com agendamento fácil', publico: 'Clientes Esquecidos', objetivo: 'Evitar perda do timing da revisão', acao: 'Mensagem automática com link de agendamento em um clique', canal: 'WhatsApp + push', prazo: '7 dias antes', impacto: 'Menos atrasos', prioridade: 'Média', estimativa: '2 clientes' },
  { id: 'recuperacao', titulo: 'Pacote de recuperação', publico: 'Clientes de Abandono', objetivo: 'Evitar evasão para oficinas independentes', acao: 'Ligação consultiva com pacote de revisões e diagnóstico gratuito', canal: 'Telefone + CRM', prazo: 'Hoje', impacto: '-18% risco crítico', prioridade: 'Alta', estimativa: '2 clientes' },
];

export default function RecommendationsScreen({ navigation }) {
  const [executedCampaign, setExecutedCampaign] = useState(null);
  const [campaignStatus, setCampaignStatus] = useState({});

  function executeCampaign(item) {
    setCampaignStatus((prev) => ({
      ...prev,
      [item.id]: 'Em acompanhamento',
    }));
    setExecutedCampaign(item);
  }

  return (
    <AuthGuard navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Recomendações de Retenção</Text>
        <Text style={styles.subtitle}>Campanhas orientadas por risco, perfil comportamental e oportunidade comercial.</Text>

        <View style={styles.summaryPanel}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{campaigns.length}</Text>
            <Text style={styles.summaryLabel}>campanhas</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {Object.values(campaignStatus).filter((status) => status === 'Em acompanhamento').length}
            </Text>
            <Text style={styles.summaryLabel}>em acompanhamento</Text>
          </View>
        </View>

        {campaigns.map((item) => {
          const status = campaignStatus[item.id] || 'Não iniciada';
          const isActive = status === 'Em acompanhamento';

          return (
            <View key={item.id} style={[styles.card, isActive && styles.cardActive]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.cardTitle}>{item.titulo}</Text>
                  <Text style={styles.cardAudience}>{item.publico} • {item.estimativa}</Text>
                </View>
                <View style={[styles.priorityPill, item.prioridade === 'Alta' && styles.priorityHigh]}>
                  <Text style={styles.priorityText}>{item.prioridade}</Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <Text style={[styles.statusText, isActive && styles.statusTextActive]}>{status}</Text>
                <Text style={styles.impactText}>{item.impacto}</Text>
              </View>

              <Text style={styles.row}><Text style={styles.label}>Objetivo:</Text> {item.objetivo}</Text>
              <Text style={styles.row}><Text style={styles.label}>Ação sugerida:</Text> {item.acao}</Text>
              <Text style={styles.row}><Text style={styles.label}>Canal:</Text> {item.canal}</Text>
              <Text style={styles.row}><Text style={styles.label}>Prazo:</Text> {item.prazo}</Text>

              <PrimaryButton
                title={isActive ? 'Atualizar acompanhamento' : 'Executar campanha'}
                onPress={() => executeCampaign(item)}
              />
            </View>
          );
        })}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Diferencial mobile</Text>
          <Text style={styles.row}>Campanhas podem ser acompanhadas como ações de CRM, com prioridade, canal e público-alvo definidos pelo risco de evasão.</Text>
        </View>

      <FeedbackModal
        visible={Boolean(executedCampaign)}
        type="sucesso"
        title="Campanha executada com sucesso"
        message={executedCampaign ? `A campanha ${executedCampaign.titulo} foi registrada como "Em acompanhamento".` : ''}
        buttonText="Continuar"
        onButtonPress={() => setExecutedCampaign(null)}
      />
      </ScrollView>
    </AuthGuard>
  );
}
