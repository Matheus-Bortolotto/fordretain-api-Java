import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../styles/colors';
import AuthGuard from '../components/AuthGuard';
import RetryState from '../components/RetryState';
import useAuth from '../hooks/useAuth';
import { getDashboard, getPriorityLeads } from '../services/api';
import styles from '../styles/screens/HomeScreen.styles';

function formatPercent(value) { return value === null || value === undefined ? '--' : `${value}%`; }

function MetricTile({ label, value, tone = 'blue', onPress }) {
  const Content = <><Text style={[styles.metricValue, tone === 'dark' && styles.metricValueDark]}>{value}</Text><Text style={[styles.metricLabel, tone === 'dark' && styles.metricLabelDark]}>{label}</Text></>;
  return onPress ? <Pressable style={[styles.metricTile, styles[`metric_${tone}`]]} onPress={onPress}>{Content}</Pressable> : <View style={[styles.metricTile, styles[`metric_${tone}`]]}>{Content}</View>;
}

function LeadRow({ lead, onPress, first }) {
  return (
    <Pressable style={[styles.leadRow, first && styles.leadRowFirst]} onPress={onPress}>
      <View style={styles.leadRank}><View style={[styles.leadRankDot, first && styles.leadRankDotFirst]} /></View>
      <View style={styles.leadInfo}><Text style={styles.leadName}>{lead.nome}</Text><Text style={styles.leadMeta}>{lead.veiculo} · {lead.prioridade}</Text></View>
      <View style={styles.leadScore}><Text style={styles.riskText}>{lead.riscoEvasao}%</Text><Text style={styles.scoreLabel}>risco</Text></View>
    </Pressable>
  );
}

function ToolRow({ title, caption, onPress }) {
  return <Pressable style={styles.toolRow} onPress={onPress}><View style={styles.toolCopy}><Text style={styles.toolTitle}>{title}</Text><Text style={styles.toolCaption}>{caption}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>;
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const isManager = ['ADMIN', 'GERENTE'].includes(user?.role);
  const [dashboard, setDashboard] = useState(null);
  const [priorityLeads, setPriorityLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => setReloadToken((value) => value + 1), []);

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      setLoading(true);
      setError('');
      try {
        const [dashboardData, leadsData] = await Promise.all([isManager ? getDashboard() : Promise.resolve(null), getPriorityLeads(3)]);
        if (isMounted) { setDashboard(dashboardData); setPriorityLeads(leadsData); }
      } catch (requestError) {
        if (isMounted) setError(requestError?.message || 'Não foi possível carregar os dados da API.');
      } finally { if (isMounted) setLoading(false); }
    }
    loadHomeData();
    return () => { isMounted = false; };
  }, [isManager, reloadToken]);

  return (
    <AuthGuard navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.introRow}>
          <View><Text style={styles.kicker}>{isManager ? 'OPERAÇÃO · GESTÃO' : 'OPERAÇÃO · ATENDIMENTO'}</Text><Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'usuário'}</Text></View>
          <View style={styles.dateMark}><Text style={styles.dateMarkTop}>HOJE</Text><Text style={styles.dateMarkBottom}>FORD</Text></View>
        </View>

        <View style={styles.statusBand}>
          <View style={styles.statusIndicator}><View style={styles.statusDot} /><Text style={styles.statusLabel}>BASE CONECTADA</Text></View>
          <Text style={styles.statusText}>{loading ? 'Atualizando indicadores...' : 'Última leitura disponível'}</Text>
        </View>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Leitura rápida</Text><Text style={styles.sectionSubtitle}>Um resumo para começar o turno.</Text></View></View>
        {error && !loading ? (
          <RetryState title="Não foi possível atualizar a Home" message={error} onRetry={retry} />
        ) : (
          <View style={styles.metricGrid}>
            {loading ? <View style={styles.loadingInline}><ActivityIndicator color={colors.fordBlue} /><Text style={styles.loadingText}>Carregando dados do dia...</Text></View> : isManager ? <>
              <MetricTile label="VIN Share estimado" value={formatPercent(dashboard?.vinShareEstimado)} />
              <MetricTile label="Clientes em alto risco" value={String(dashboard?.highRisk || 0)} tone="red" onPress={() => navigation.navigate('Clients')} />
              <MetricTile label="Clientes na base" value={String(dashboard?.total || 0)} tone="dark" />
              <MetricTile label="Perfis mapeados" value={String(dashboard?.clientesPorPerfil?.length || 0)} tone="blue" />
            </> : <>
              <MetricTile label="Fila prioritária" value={String(priorityLeads.length)} tone="red" onPress={() => navigation.navigate('Clients')} />
              <MetricTile label="Carteira completa" value="Abrir" tone="dark" onPress={() => navigation.navigate('Clients')} />
            </>}
          </View>
        )}

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Fila prioritária</Text><Text style={styles.sectionSubtitle}>Comece por quem precisa de contexto.</Text></View></View>
        <View style={styles.queueCard}>
          {priorityLeads.length ? priorityLeads.map((lead, index) => <LeadRow key={lead.id} lead={lead} first={index === 0} onPress={() => navigation.navigate('ClientDetails', { client: lead })} />) : <Text style={styles.emptyText}>Nenhum cliente prioritário encontrado.</Text>}
          <Pressable style={styles.queueFooter} onPress={() => navigation.navigate('Clients')}><Text style={styles.queueFooterText}>Ver carteira completa</Text><Ionicons name="chevron-forward" size={18} color={colors.fordBlue} /></Pressable>
        </View>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Atalhos de trabalho</Text><Text style={styles.sectionSubtitle}>Acesse as ferramentas sem procurar no menu.</Text></View></View>
        <View style={styles.toolsCard}>
          {isManager ? <ToolRow title="Classificar cliente" caption="Simulação de perfil comportamental" onPress={() => navigation.navigate('Prediction')} /> : null}
          <ToolRow title="Orientações de retenção" caption="Estratégias por perfil e nível de risco" onPress={() => navigation.navigate('Recommendations')} />
        </View>
      </ScrollView>
    </AuthGuard>
  );
}
