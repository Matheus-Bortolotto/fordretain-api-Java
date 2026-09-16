import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import colors from '../styles/colors';
import AuthGuard from '../components/AuthGuard';
import useAuth from '../hooks/useAuth';
import { getDashboard, getPriorityLeads } from '../services/api';
import styles from '../styles/screens/HomeScreen.styles';

function formatPercent(value) {
  if (value === null || value === undefined) return '--';
  return `${value}%`;
}

function MetricTile({ label, value, tone = 'blue', onPress }) {
  const toneStyle = styles[`metric_${tone}`] || styles.metric_blue;
  const Content = (
    <>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [styles.metricTile, toneStyle, pressed && styles.pressed]} onPress={onPress}>
        {Content}
      </Pressable>
    );
  }

  return <View style={[styles.metricTile, toneStyle]}>{Content}</View>;
}

function LeadRow({ lead, highlighted = false, onPress }) {
  return (
    <View style={[styles.leadRow, highlighted && styles.leadRowHighlighted]}>
      <View style={styles.leadTop}>
        <View style={styles.leadInfo}>
          <Text style={styles.leadName}>{lead.nome}</Text>
          <Text style={styles.leadMeta}>{lead.veiculo} • {lead.prioridade}</Text>
        </View>
        <View style={styles.riskPill}>
          <Text style={styles.riskText}>{lead.riscoEvasao}%</Text>
        </View>
      </View>

      {highlighted ? <Text style={styles.leadReason}>{lead.motivoPriorizacao}</Text> : null}

      <Pressable style={({ pressed }) => [styles.leadCta, pressed && styles.pressed]} onPress={onPress}>
        <Text style={styles.leadCtaText}>{highlighted ? 'Abrir cliente crítico' : 'Abrir detalhes'}</Text>
      </Pressable>
    </View>
  );
}

function AreaCard({ title, subtitle, icon, tone = 'blue', onPress }) {
  const toneStyle = styles[`area_${tone}`] || styles.area_blue;

  return (
    <Pressable style={({ pressed }) => [styles.areaCard, toneStyle, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.areaIconBox}>
        <Text style={styles.areaIcon}>{icon}</Text>
      </View>
      <Text style={styles.areaTitle}>{title}</Text>
      <Text style={styles.areaSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const isManager = ['ADMIN', 'GERENTE'].includes(user?.role);
  const [dashboard, setDashboard] = useState(null);
  const [priorityLeads, setPriorityLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const [dashboardData, leadsData] = await Promise.all([
          isManager ? getDashboard() : Promise.resolve(null),
          getPriorityLeads(3),
        ]);

        if (isMounted) {
          setDashboard(dashboardData);
          setPriorityLeads(leadsData);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError?.message || 'Não foi possível carregar os dados da API.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, [isManager]);

  return (
    <AuthGuard navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryPanel}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryTitleBlock}>
              <Text style={styles.eyebrow}>{isManager ? 'Central do gerente' : 'Central de atendimento'}</Text>
              <Text style={styles.title}>Olá, {user?.name || 'usuário'}</Text>
            </View>

            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{user?.role || 'Perfil'}</Text>
            </View>
          </View>

          <Text style={styles.summaryText}>
            {isManager
              ? 'Comece pelo risco da carteira, avance para clientes críticos e acompanhe a ação comercial até a decisão.'
              : 'Priorize clientes em risco, classifique novos perfis e registre ações de retenção com base nas recomendações.'}
          </Text>

          {error ? <Text style={styles.loadingText}>{error}</Text> : null}

          {loading ? (
            <View style={styles.loadingInline}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.loadingText}>Carregando dados do dia...</Text>
            </View>
          ) : (
            <View style={styles.metricGrid}>
              {isManager ? (
                <>
                  <MetricTile label="VIN Share" value={formatPercent(dashboard?.vinShareEstimado)} />
                  <MetricTile label="Alto risco" value={String(dashboard?.highRisk || 0)} tone="red" onPress={() => navigation.navigate('Clients')} />
                  <MetricTile label="Total de clientes" value={String(dashboard?.total || 0)} tone="yellow" />
                  <MetricTile label="Perfis mapeados" value={String(dashboard?.clientesPorPerfil?.length || 0)} tone="green" />
                </>
              ) : (
                <>
                  <MetricTile label="Leads críticos" value={String(priorityLeads.length)} tone="red" onPress={() => navigation.navigate('Clients')} />
                  <MetricTile label="Clientes em risco" value="Consultar" tone="green" onPress={() => navigation.navigate('Clients')} />
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Áreas do app</Text>
          <Text style={styles.sectionSubtitle}>Acesse também pelos cards ou pelo menu superior.</Text>
        </View>

        <View style={styles.areaGrid}>
          {isManager ? (
            <AreaCard title="Dashboard" subtitle="KPIs e VIN Share" icon="📊" tone="blue" onPress={() => navigation.navigate('Dashboard')} />
          ) : null}

          <AreaCard title="Clientes" subtitle="Risco e prioridade" icon="👥" tone="green" onPress={() => navigation.navigate('Clients')} />

          {isManager ? (
            <AreaCard title="Classificação" subtitle="Previsão de perfil" icon="🤖" tone="purple" onPress={() => navigation.navigate('Prediction')} />
          ) : null}

          {isManager ? (
            <AreaCard title="Perfis" subtitle="Segmentos comportamentais" icon="🧩" tone="yellow" onPress={() => navigation.navigate('Profiles')} />
          ) : null}

          <AreaCard title="Recomendações" subtitle="Campanhas e ações" icon="🎯" tone="red" onPress={() => navigation.navigate('Recommendations')} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fila prioritária</Text>
          <Text style={styles.sectionSubtitle}>Clientes que merecem atenção primeiro.</Text>
        </View>

        <View style={styles.card}>
          {priorityLeads.length ? (
            priorityLeads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} highlighted={lead.id === priorityLeads[0]?.id} onPress={() => navigation.navigate('ClientDetails', { client: lead })} />
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhum lead prioritário encontrado.</Text>
          )}
        </View>
      </ScrollView>
    </AuthGuard>
  );
}
