//C:\PROJETOS\PGMP\src\screens\FluxoCaixaScreen.js

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Dimensions,
  Modal,
  Alert
} from 'react-native';
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const STORAGE_KEY = "@transacoes_financeiras";

export default function FluxoCaixaScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mes'); // mes, trimestre, ano
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);

  const colors = {
    primary: '#5D2A0A',
    secondary: '#7D4A2A',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#2E2E2E',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#2E7D32',
    danger: '#C62828',
    warning: '#F57C00',
    info: '#1976D2',
    accent: '#FF9800'
  };

  useEffect(() => {
    loadTransactions();
    const unsubscribe = navigation.addListener('focus', loadTransactions);
    return unsubscribe;
  }, [navigation]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransactions(parsed);
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados financeiros.");
    } finally {
      setLoading(false);
    }
  };

  // Análise de dados por período
  const analyzeByPeriod = useMemo(() => {
    const now = new Date();
    const periods = [];
    
    let monthsToAnalyze = 1;
    if (selectedPeriod === 'trimestre') monthsToAnalyze = 3;
    if (selectedPeriod === 'ano') monthsToAnalyze = 12;

    for (let i = 0; i < monthsToAnalyze; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.data);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const receitas = monthTransactions
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      const despesas = monthTransactions
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0);

      periods.push({
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        year: date.getFullYear(),
        receitas,
        despesas,
        saldo: receitas - despesas,
        fullDate: date
      });
    }

    return periods.reverse();
  }, [transactions, selectedPeriod]);

  // Cálculo de totais gerais
  const totals = useMemo(() => {
    const allReceitas = analyzeByPeriod.reduce((sum, p) => sum + p.receitas, 0);
    const allDespesas = analyzeByPeriod.reduce((sum, p) => sum + p.despesas, 0);
    
    return {
      receitas: allReceitas,
      despesas: allDespesas,
      saldo: allReceitas - allDespesas,
      media: {
        receitas: allReceitas / analyzeByPeriod.length,
        despesas: allDespesas / analyzeByPeriod.length,
        saldo: (allReceitas - allDespesas) / analyzeByPeriod.length
      }
    };
  }, [analyzeByPeriod]);

  // Análise de categorias
  const categoryAnalysis = useMemo(() => {
    const categories = {};
    
    transactions.forEach(t => {
      const cat = t.categoria || 'Sem categoria';
      if (!categories[cat]) {
        categories[cat] = { receitas: 0, despesas: 0, count: 0 };
      }
      categories[cat].count++;
      if (t.tipo === 'receita') {
        categories[cat].receitas += Number(t.valor);
      } else {
        categories[cat].despesas += Number(t.valor);
      }
    });

    return Object.entries(categories)
      .map(([name, data]) => ({
        name,
        ...data,
        total: data.receitas + data.despesas
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions]);

  // Previsão simples (média dos últimos períodos)
  const forecast = useMemo(() => {
    if (analyzeByPeriod.length < 2) return null;

    const avgReceitas = totals.media.receitas;
    const avgDespesas = totals.media.despesas;
    const trend = analyzeByPeriod[analyzeByPeriod.length - 1].saldo - analyzeByPeriod[0].saldo;

    return {
      nextMonth: {
        receitas: avgReceitas,
        despesas: avgDespesas,
        saldo: avgReceitas - avgDespesas
      },
      trend: trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'stable'
    };
  }, [analyzeByPeriod, totals]);

  // Insights inteligentes
  const insights = useMemo(() => {
    const insights = [];

    // Insight 1: Melhor/Pior mês
    if (analyzeByPeriod.length > 1) {
      const bestMonth = [...analyzeByPeriod].sort((a, b) => b.saldo - a.saldo)[0];
      const worstMonth = [...analyzeByPeriod].sort((a, b) => a.saldo - b.saldo)[0];
      
      if (bestMonth.saldo > 0) {
        insights.push({
          icon: 'trending-up',
          iconColor: colors.success,
          title: 'Melhor Mês',
          description: `${bestMonth.month}/${bestMonth.year} teve o melhor saldo`,
          value: bestMonth.saldo,
          type: 'success'
        });
      }

      if (worstMonth.saldo < 0) {
        insights.push({
          icon: 'trending-down',
          iconColor: colors.danger,
          title: 'Atenção',
          description: `${worstMonth.month}/${worstMonth.year} teve saldo negativo`,
          value: worstMonth.saldo,
          type: 'warning'
        });
      }
    }

    // Insight 2: Categoria que mais gasta
    if (categoryAnalysis.length > 0) {
      const topCategory = categoryAnalysis[0];
      insights.push({
        icon: 'crown',
        iconColor: colors.warning,
        title: 'Maior Categoria',
        description: `${topCategory.name} representa a maior movimentação`,
        value: topCategory.total,
        type: 'info'
      });
    }

    // Insight 3: Taxa de economia
    if (totals.receitas > 0) {
      const economyRate = ((totals.receitas - totals.despesas) / totals.receitas) * 100;
      insights.push({
        icon: 'piggy-bank',
        iconColor: economyRate > 20 ? colors.success : economyRate > 10 ? colors.warning : colors.danger,
        title: 'Taxa de Economia',
        description: `Você está economizando ${economyRate.toFixed(1)}% das receitas`,
        value: economyRate,
        type: economyRate > 20 ? 'success' : 'warning',
        isPercentage: true
      });
    }

    // Insight 4: Previsão
    if (forecast && forecast.trend !== 'stable') {
      insights.push({
        icon: 'crystal-ball',
        iconColor: forecast.trend === 'positive' ? colors.success : colors.danger,
        title: 'Tendência',
        description: `Seu saldo está em ${forecast.trend === 'positive' ? 'crescimento' : 'queda'}`,
        value: forecast.nextMonth.saldo,
        type: forecast.trend === 'positive' ? 'success' : 'warning'
      });
    }

    return insights;
  }, [analyzeByPeriod, categoryAnalysis, totals, forecast]);

  const formatCurrency = (value) => {
    return Number(value).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Gráfico de barras simples
  const SimpleBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.receitas, d.despesas)));
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartContent}>
          {data.map((item, index) => (
            <View key={index} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    styles.receitaBar,
                    { height: `${(item.receitas / maxValue) * 100}%` }
                  ]} 
                />
                <View 
                  style={[
                    styles.bar, 
                    styles.despesaBar,
                    { height: `${(item.despesas / maxValue) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>
                {item.month}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Receitas</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.danger }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Despesas</Text>
          </View>
        </View>
      </View>
    );
  };

  const InsightCard = ({ insight, onPress }) => (
    <TouchableOpacity 
      style={[styles.insightCard, { 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        borderLeftColor: insight.iconColor,
        borderLeftWidth: 4
      }]}
      onPress={() => onPress(insight)}
      activeOpacity={0.7}
    >
      <View style={[styles.insightIcon, { backgroundColor: insight.iconColor + '20' }]}>
        <MaterialCommunityIcons name={insight.icon} size={24} color={insight.iconColor} />
      </View>
      <View style={styles.insightContent}>
        <Text style={[styles.insightTitle, { color: colors.text }]}>
          {insight.title}
        </Text>
        <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
          {insight.description}
        </Text>
        <Text style={[
          styles.insightValue, 
          { color: insight.type === 'success' ? colors.success : insight.type === 'warning' ? colors.warning : colors.text }
        ]}>
          {insight.isPercentage ? `${insight.value.toFixed(1)}%` : formatCurrency(insight.value)}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const InsightModal = () => {
    if (!selectedInsight) return null;

    return (
      <Modal
        visible={showInsightsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInsightsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIcon, { backgroundColor: selectedInsight.iconColor }]}>
              <MaterialCommunityIcons name={selectedInsight.icon} size={40} color={colors.surface} />
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {selectedInsight.title}
            </Text>
            
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              {selectedInsight.description}
            </Text>

            <View style={[styles.modalValueContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalValue, { 
                color: selectedInsight.type === 'success' ? colors.success : 
                       selectedInsight.type === 'warning' ? colors.warning : colors.text 
              }]}>
                {selectedInsight.isPercentage ? 
                  `${selectedInsight.value.toFixed(1)}%` : 
                  formatCurrency(selectedInsight.value)
                }
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowInsightsModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.surface }]}>
                  Entendi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Analisando dados financeiros...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="chart-line" size={25} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Fluxo de Caixa</Text>
              <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
                 Análise Inteligente
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surface }]}
            onPress={loadTransactions}
          >
            <MaterialIcons name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Seletor de Período */}
        <View style={[styles.periodSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {['mes', 'trimestre', 'ano'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                { color: selectedPeriod === period ? colors.surface : colors.textSecondary }
              ]}>
                {period === 'mes' ? 'Mês' : period === 'trimestre' ? 'Trimestre' : 'Ano'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cards de Resumo */}
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.success + '20' }]}>
              <MaterialCommunityIcons name="trending-up" size={24} color={colors.success} />
            </View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total Receitas
            </Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatCurrency(totals.receitas)}
            </Text>
            <Text style={[styles.summaryAvg, { color: colors.textSecondary }]}>
              Média: {formatCurrency(totals.media.receitas)}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.danger + '20' }]}>
              <MaterialCommunityIcons name="trending-down" size={24} color={colors.danger} />
            </View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Total Despesas
            </Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>
              {formatCurrency(totals.despesas)}
            </Text>
            <Text style={[styles.summaryAvg, { color: colors.textSecondary }]}>
              Média: {formatCurrency(totals.media.despesas)}
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardFull, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            borderLeftColor: totals.saldo >= 0 ? colors.success : colors.danger,
            borderLeftWidth: 4
          }]}>
            <View style={[styles.summaryIcon, { 
              backgroundColor: (totals.saldo >= 0 ? colors.success : colors.danger) + '20' 
            }]}>
              <MaterialCommunityIcons 
                name={totals.saldo >= 0 ? "wallet" : "wallet-outline"} 
                size={28} 
                color={totals.saldo >= 0 ? colors.success : colors.danger} 
              />
            </View>
            <View style={styles.saldoContent}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Saldo do Período
              </Text>
              <Text style={[styles.saldoValue, { 
                color: totals.saldo >= 0 ? colors.success : colors.danger 
              }]}>
                {formatCurrency(totals.saldo)}
              </Text>
              <Text style={[styles.summaryAvg, { color: colors.textSecondary }]}>
                Média mensal: {formatCurrency(totals.media.saldo)}
              </Text>
            </View>
          </View>
        </View>

        {/* Gráfico */}
        {analyzeByPeriod.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chart-bar" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Comparativo do Período
              </Text>
            </View>
            <SimpleBarChart data={analyzeByPeriod} />
          </View>
        )}

        {/* Insights Inteligentes */}
        {insights.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Insights Inteligentes
              </Text>
            </View>
            {insights.map((insight, index) => (
              <InsightCard 
                key={index} 
                insight={insight} 
                onPress={(ins) => {
                  setSelectedInsight(ins);
                  setShowInsightsModal(true);
                }}
              />
            ))}
          </View>
        )}

        {/* Top Categorias */}
        {categoryAnalysis.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="format-list-bulleted" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Top 5 Categorias
              </Text>
            </View>
            {categoryAnalysis.map((cat, index) => (
              <View key={index} style={[styles.categoryItem, { borderBottomColor: colors.border }]}>
                <View style={styles.categoryLeft}>
                  <Text style={[styles.categoryRank, { color: colors.primary }]}>
                    #{index + 1}
                  </Text>
                  <View>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {cat.name}
                    </Text>
                    <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>
                      {cat.count} transaç{cat.count === 1 ? 'ão' : 'ões'}
                    </Text>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={[styles.categoryValue, { color: colors.success }]}>
                    +{formatCurrency(cat.receitas)}
                  </Text>
                  <Text style={[styles.categoryValue, { color: colors.danger }]}>
                    -{formatCurrency(cat.despesas)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Previsão */}
        {forecast && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="crystal-ball" size={20} color={colors.info} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Previsão Próximo Mês
              </Text>
            </View>
            <View style={styles.forecastContainer}>
              <View style={styles.forecastItem}>
                <Text style={[styles.forecastLabel, { color: colors.textSecondary }]}>
                  Receitas Previstas
                </Text>
                <Text style={[styles.forecastValue, { color: colors.success }]}>
                  {formatCurrency(forecast.nextMonth.receitas)}
                </Text>
              </View>
              <View style={styles.forecastItem}>
                <Text style={[styles.forecastLabel, { color: colors.textSecondary }]}>
                  Despesas Previstas
                </Text>
                <Text style={[styles.forecastValue, { color: colors.danger }]}>
                  {formatCurrency(forecast.nextMonth.despesas)}
                </Text>
              </View>
              <View style={[styles.forecastItem, styles.forecastItemFull]}>
                <Text style={[styles.forecastLabel, { color: colors.textSecondary }]}>
                  Saldo Previsto
                </Text>
                <Text style={[styles.forecastValue, { 
                  color: forecast.nextMonth.saldo >= 0 ? colors.success : colors.danger 
                }]}>
                  {formatCurrency(forecast.nextMonth.saldo)}
                </Text>
              </View>
            </View>
            <View style={[styles.trendBadge, { 
              backgroundColor: forecast.trend === 'positive' ? colors.success + '20' : 
                             forecast.trend === 'negative' ? colors.danger + '20' : colors.textSecondary + '20'
            }]}>
              <MaterialCommunityIcons 
                name={forecast.trend === 'positive' ? 'trending-up' : 
                      forecast.trend === 'negative' ? 'trending-down' : 'trending-neutral'} 
                size={16} 
                color={forecast.trend === 'positive' ? colors.success : 
                       forecast.trend === 'negative' ? colors.danger : colors.textSecondary} 
              />
              <Text style={[styles.trendText, { 
                color: forecast.trend === 'positive' ? colors.success : 
                       forecast.trend === 'negative' ? colors.danger : colors.textSecondary 
              }]}>
                Tendência {forecast.trend === 'positive' ? 'Positiva' : 
                          forecast.trend === 'negative' ? 'Negativa' : 'Estável'}
              </Text>
            </View>
          </View>
        )}

        {/* Botão para Gestão Financeira */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('FinanceScreen')}
        >
          <MaterialCommunityIcons name="finance" size={20} color={colors.surface} />
          <Text style={[styles.actionButtonText, { color: colors.surface }]}>
            Ir para Gestão Financeira
          </Text>
        </TouchableOpacity>

        {/* Footer Info */}
        <View style={[styles.footerInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information" size={16} color={colors.info} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Os insights e previsões são baseados no histórico de transações. 
            Mantenha seus registros atualizados para análises mais precisas.
          </Text>
        </View>
      </ScrollView>

      <InsightModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  headerContainer: {
    backgroundColor: '#5D2A0A',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCards: {
    marginBottom: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryCardFull: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryAvg: {
    fontSize: 11,
  },
  saldoContent: {
    flex: 1,
    marginLeft: 12,
  },
  saldoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  chartContainer: {
    marginTop: 8,
  },
  chartContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: 12,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
    width: '100%',
    justifyContent: 'center',
    gap: 4,
  },
  bar: {
    width: 16,
    minHeight: 2,
    borderRadius: 4,
  },
  receitaBar: {
    backgroundColor: '#2E7D32',
  },
  despesaBar: {
    backgroundColor: '#C62828',
  },
  chartLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryRank: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    width: 30,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 11,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  forecastContainer: {
    marginTop: 8,
    gap: 12,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  forecastItemFull: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  forecastLabel: {
    fontSize: 13,
  },
  forecastValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  footerText: {
    fontSize: 12,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalValueContainer: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  modalActions: {
    width: '100%',
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
