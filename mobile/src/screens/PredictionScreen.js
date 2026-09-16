import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import RoleGuard from '../components/RoleGuard';
import colors from '../styles/colors';
import { getPredictionVariables, predictClientProfile } from '../services/api';
import styles from '../styles/screens/PredictionScreen.styles';

const initialForm = {
  nome: '',
  email: '',
  telefone: '',
  idade: '',
  regiao: '',
  modeloVeiculo: '',
  formaPagamento: '',
  canalCompra: '',
  historicoMarca: '',
  dataCompra: new Date().toISOString().slice(0, 10),
};

function OptionGroup({ label, value, options = [], onChange }) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.optionWrap}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable key={option} style={[styles.optionChip, selected && styles.optionChipActive]} onPress={() => onChange(option)}>
              <Text style={[styles.optionText, selected && styles.optionTextActive]}>{option.replaceAll('_', ' ')}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FormField({ label, ...props }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.optionLabel}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
    </View>
  );
}

export default function PredictionScreen({ navigation }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState([]);

  useEffect(() => {
    getPredictionVariables().then((data) => setVariables(data.variaveis || []));
  }, []);

  const variableByName = useMemo(
    () => variables.reduce((acc, item) => ({ ...acc, [item.name]: item }), {}),
    [variables],
  );

  const update = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  function validate() {
    const required = ['nome', 'email', 'idade', 'regiao', 'modeloVeiculo', 'formaPagamento', 'canalCompra', 'historicoMarca', 'dataCompra'];
    if (required.some((field) => !String(form[field] || '').trim())) return 'Preencha todos os campos obrigatórios.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Digite um e-mail válido.';
    if (Number(form.idade) < 18 || Number(form.idade) > 100) return 'A idade deve estar entre 18 e 100 anos.';
    if (form.telefone && !/^\d{10,11}$/.test(form.telefone.replace(/\D/g, ''))) return 'O telefone deve ter 10 ou 11 dígitos.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dataCompra)) return 'A data da compra deve estar no formato AAAA-MM-DD.';
    return '';
  }

  async function handlePredict() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(await predictClientProfile(form));
    } catch (requestError) {
      setResult(null);
      setError(requestError?.message || 'Não foi possível realizar a predição.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RoleGuard
      navigation={navigation}
      allowedRoles={['ADMIN', 'GERENTE']}
      message="A classificação preditiva é liberada para os perfis Administrador e Gerente."
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Classificação Preditiva</Text>
        <Text style={styles.subtitle}>Os dados abaixo são enviados de verdade para POST /api/v1/predict.</Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Regra anti data leakage</Text>
          <Text style={styles.warningText}>A previsão usa somente informações disponíveis no momento da compra.</Text>
        </View>

        <View style={styles.formCard}>
          <FormField label="Nome completo *" placeholder="João da Silva" value={form.nome} onChangeText={(value) => update('nome', value)} />
          <FormField label="E-mail *" placeholder="joao@email.com" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={(value) => update('email', value)} />
          <FormField label="Telefone" placeholder="11999990001" keyboardType="phone-pad" value={form.telefone} onChangeText={(value) => update('telefone', value)} />
          <FormField label="Idade *" placeholder="34" keyboardType="number-pad" value={form.idade} onChangeText={(value) => update('idade', value)} />
          <FormField label="Data da compra *" placeholder="AAAA-MM-DD" value={form.dataCompra} onChangeText={(value) => update('dataCompra', value)} />

          {variables.map((variable) => (
            <OptionGroup
              key={variable.name}
              label={variable.label}
              value={form[variable.name]}
              options={variableByName[variable.name]?.options}
              onChange={(value) => update(variable.name, value)}
            />
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.fordBlue} />
            <Text style={styles.loadingText}>Enviando dados para a API FordRetain...</Text>
          </View>
        ) : (
          <PrimaryButton title="Prever perfil" onPress={handlePredict} />
        )}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Predição não realizada</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado da classificação</Text>
            <Text style={styles.row}><Text style={styles.label}>Cliente:</Text> {result.nomeCliente}</Text>
            <Text style={styles.row}><Text style={styles.label}>Perfil previsto:</Text> {result.perfil}</Text>
            <Text style={styles.row}><Text style={styles.label}>Risco de evasão:</Text> {result.riscoEvasao}%</Text>
            <Text style={styles.row}><Text style={styles.label}>Ação recomendada:</Text> {result.acaoRecomendada}</Text>

            <View style={styles.criteriaBox}>
              <Text style={styles.criteriaTitle}>Probabilidades por perfil</Text>
              {result.probabilidades.map((item) => (
                <Text key={item.perfil} style={styles.criteriaItem}>• {item.perfil}: {item.valor}%</Text>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </RoleGuard>
  );
}
