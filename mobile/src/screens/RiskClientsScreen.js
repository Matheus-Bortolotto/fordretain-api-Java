import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import AuthGuard from '../components/AuthGuard';
import ClientCard from '../components/ClientCard';
import colors from '../styles/colors';
import { getLeads } from '../services/api';
import styles from '../styles/screens/RiskClientsScreen.styles';

const FILTERS = ['Todos', 'Alto', 'Médio', 'Baixo'];

export default function RiskClientsScreen({ navigation }) {
  const [riskFilter, setRiskFilter] = useState('Todos');
  const [allLeads, setAllLeads] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLeads() {
      setError('');

      try {
        const data = await getLeads();
        setAllLeads(data);
      } catch {
        setError('Não foi possível carregar os leads priorizados.');
      } finally {
        setInitialLoading(false);
      }
    }

    loadLeads();
  }, []);

  const leads = useMemo(() => {
    if (riskFilter === 'Todos') return allLeads;
    return allLeads.filter((client) => client.nivelRisco === riskFilter);
  }, [allLeads, riskFilter]);

  const summary = {
    total: allLeads.length,
    high: allLeads.filter((client) => client.nivelRisco === 'Alto').length,
    medium: allLeads.filter((client) => client.nivelRisco === 'Médio').length,
    low: allLeads.filter((client) => client.nivelRisco === 'Baixo').length,
  };

  if (initialLoading) {
    return (
      <AuthGuard navigation={navigation}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.fordBlue} />
          <Text style={styles.loadingText}>Buscando leads priorizados na API...</Text>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard navigation={navigation}>
      <View style={styles.container}>
        <Text style={styles.title}>Clientes Priorizados por Risco</Text>
        <Text style={styles.subtitle}>Carteira ordenada por risco de evasão e prioridade comercial.</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.total}</Text>
            <Text style={styles.summaryLabel}>clientes</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryHigh]}>
            <Text style={styles.summaryValue}>{summary.high}</Text>
            <Text style={styles.summaryLabel}>alto risco</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryMedium]}>
            <Text style={styles.summaryValue}>{summary.medium}</Text>
            <Text style={styles.summaryLabel}>risco médio</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryLow]}>
            <Text style={styles.summaryValue}>{summary.low}</Text>
            <Text style={styles.summaryLabel}>baixo risco</Text>
          </View>
        </View>

        <View style={styles.filterPanel}>
          <View>
            <Text style={styles.filterTitle}>Filtrar carteira</Text>
          </View>
          <View style={styles.filters}>
            {FILTERS.map((item) => (
              <Pressable
                key={item}
                style={[styles.filterChip, riskFilter === item && styles.filterChipActive]}
                onPress={() => setRiskFilter(item)}
              >
                <Text style={[styles.filterText, riskFilter === item && styles.filterTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={leads}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ClientCard
              cliente={item}
              onOpenDetails={(cliente) => navigation.navigate('ClientDetails', { client: cliente })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum cliente encontrado para este filtro.</Text>}
        />
      </View>
    </AuthGuard>
  );
}
