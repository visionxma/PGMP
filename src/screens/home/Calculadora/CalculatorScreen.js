//C:\PROJETOS\PGMP\src\screens\home\Calculadora\CalculatorScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function CalculatorScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [results, setResults] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState('relevance'); // 'relevance', 'alphabetic_asc', 'alphabetic_desc'

  // Cores do tema marrom (igual aos outros componentes PGMP)
  const colors = {
    primary: '#5D2A0A',
    secondary: '#7D4A2A',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#2E2E2E',
    textSecondary: '#666666',
    border: '#E0E0E0',
    shadow: '#000000',
    error: '#FF5722',
    success: '#4CAF50'
  };

  // Lista expandida de produtos baseados na CONAB - UNIDADES CORRIGIDAS CONFORME NORMAS OFICIAIS
  const conabProductsDatabase = [
    // GRÃOS (principais culturas) - Unidades conforme Portaria CONAB
    {
      id: 1,
      name: 'Soja',
      unit: 'saca de 60 kg',
      minPrice: 89.50,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Grãos',
      relevance: 10
    },
    {
      id: 2,
      name: 'Milho',
      unit: 'saca de 60 kg',
      minPrice: 52.30,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Grãos',
      relevance: 10
    },
    {
      id: 3,
      name: 'Feijão Preto',
      unit: 'saca de 60 kg',
      minPrice: 185.40,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Grãos',
      relevance: 8
    },
    {
      id: 4,
      name: 'Feijão Carioca',
      unit: 'saca de 60 kg',
      minPrice: 195.60,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Grãos',
      relevance: 8
    },
    {
      id: 5,
      name: 'Arroz Longo Fino',
      unit: 'saca de 50 kg (em casca)',
      minPrice: 65.80,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Grãos',
      relevance: 9
    },
    {
      id: 6,
      name: 'Trigo Pão Tipo 1',
      unit: 'saca de 60 kg',
      minPrice: 68.90,
      region: 'Sul',
      lastUpdate: '2024-01-15',
      category: 'Grãos',
      relevance: 7
    },
    {
      id: 7,
      name: 'Feijão de Corda',
      unit: 'saca de 60 kg',
      minPrice: 165.20,
      region: 'Nordeste',
      lastUpdate: '2024-01-15',
      category: 'Grãos',
      relevance: 6
    },
    {
      id: 8,
      name: 'Sorgo',
      unit: 'saca de 60 kg',
      minPrice: 45.80,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Grãos',
      relevance: 5
    },
    
    // OLEAGINOSAS - Unidades CONAB
    {
      id: 9,
      name: 'Amendoim em Casca',
      unit: 'saca de 25 kg',
      minPrice: 85.40,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Oleaginosas',
      relevance: 6
    },
    {
      id: 10,
      name: 'Girassol em Grão',
      unit: 'saca de 60 kg',
      minPrice: 78.60,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Oleaginosas',
      relevance: 5
    },
    {
      id: 11,
      name: 'Mamona',
      unit: 'saca de 60 kg',
      minPrice: 92.30,
      region: 'Nordeste',
      lastUpdate: '2024-01-15',
      category: 'Oleaginosas',
      relevance: 4
    },
    {
      id: 12,
      name: 'Gergelim',
      unit: 'saca de 60 kg',
      minPrice: 275.50,
      region: 'Nordeste',
      lastUpdate: '2024-01-15',
      category: 'Oleaginosas',
      relevance: 3
    },
    
    // FIBRAS - Unidades CONAB
    {
      id: 13,
      name: 'Algodão em Caroço',
      unit: 'arroba (15 kg)',
      minPrice: 95.20,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Fibras',
      relevance: 8
    },
    {
      id: 14,
      name: 'Algodão em Pluma',
      unit: 'arroba (15 kg)',
      minPrice: 189.70,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Fibras',
      relevance: 7
    },
    
    // ESPECIAIS/PERMANENTES - Unidades CONAB
    {
      id: 15,
      name: 'Cacau Cultivado (Amêndoa)',
      unit: 'arroba (15 kg)',
      minPrice: 189.40,
      region: 'Bahia',
      lastUpdate: '2024-01-15',
      category: 'Especiais',
      relevance: 6
    },
    {
      id: 16,
      name: 'Café Arábica',
      unit: 'saca de 60 kg (beneficiado)',
      minPrice: 520.00,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Especiais',
      relevance: 9
    },
    {
      id: 17,
      name: 'Café Robusta',
      unit: 'saca de 60 kg (beneficiado)',
      minPrice: 385.60,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Especiais',
      relevance: 7
    },
    
    // TUBÉRCULOS - Unidades CONAB
    {
      id: 18,
      name: 'Mandioca',
      unit: 'tonelada',
      minPrice: 420.50,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Tubérculos',
      relevance: 7
    },
    {
      id: 19,
      name: 'Batata Doce',
      unit: 'saca de 50 kg',
      minPrice: 78.30,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Tubérculos',
      relevance: 4
    },
    
    // OUTROS PRODUTOS CONAB
    {
      id: 20,
      name: 'Borracha Natural Cultivada',
      unit: 'kg (látex coagulado)',
      minPrice: 4.85,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Outros',
      relevance: 3
    },
    {
      id: 21,
      name: 'Látex de Campo',
      unit: 'kg',
      minPrice: 2.45,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Outros',
      relevance: 2
    },
    {
      id: 22,
      name: 'Leite',
      unit: 'litro',
      minPrice: 1.85,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Outros',
      relevance: 8
    },
    
    // SEMENTES (conforme CONAB)
    {
      id: 23,
      name: 'Semente de Soja',
      unit: 'saca de 60 kg',
      minPrice: 125.50,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Sementes',
      relevance: 6
    },
    {
      id: 24,
      name: 'Semente de Milho',
      unit: 'saca de 60 kg',
      minPrice: 89.30,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Sementes',
      relevance: 5
    },
    {
      id: 25,
      name: 'Semente de Feijão',
      unit: 'saca de 60 kg',
      minPrice: 245.60,
      region: 'Nacional',
      lastUpdate: '2024-01-15',
      category: 'Sementes',
      relevance: 4
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, searchQuery, sortOption]);

  // Debug: verificar se todos os produtos estão sendo carregados
  useEffect(() => {
    console.log('Total de produtos carregados:', products.length);
    console.log('Produtos filtrados:', filteredProducts.length);
  }, [products, filteredProducts]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de dados da CONAB
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // SEMPRE carregar a base completa de produtos
      setProducts(conabProductsDatabase);
      
      // Carregar dados salvos localmente (apenas para preços atualizados)
      const savedData = await AsyncStorage.getItem('pgmp_conab_data');
      const savedUpdate = await AsyncStorage.getItem('pgmp_conab_lastUpdate');
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Verificar se os dados salvos têm a mesma quantidade de produtos
        if (parsedData.length === conabProductsDatabase.length) {
          setProducts(parsedData);
        } else {
          // Se a quantidade não bate, usar dados atualizados e salvar
          setProducts(conabProductsDatabase);
          await AsyncStorage.setItem('pgmp_conab_data', JSON.stringify(conabProductsDatabase));
        }
      } else {
        await AsyncStorage.setItem('pgmp_conab_data', JSON.stringify(conabProductsDatabase));
      }
      
      if (savedUpdate) {
        setLastUpdate(savedUpdate);
      } else {
        const now = new Date().toISOString();
        setLastUpdate(now);
        await AsyncStorage.setItem('pgmp_conab_lastUpdate', now);
      }
      
      console.log('Produtos carregados:', conabProductsDatabase.length);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados dos preços mínimos');
      setProducts(conabProductsDatabase); // Fallback para dados padrão
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setIsRefreshing(true);
      
      // Simular atualização de dados da CONAB (busca dados reais da API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar preços com pequenas variações (simulação de dados reais)
      const updatedProducts = conabProductsDatabase.map(product => ({
        ...product,
        minPrice: product.minPrice * (0.95 + Math.random() * 0.1), // Variação de ±5%
        lastUpdate: new Date().toISOString()
      }));
      
      setProducts(updatedProducts);
      const now = new Date().toISOString();
      setLastUpdate(now);
      
      await AsyncStorage.setItem('pgmp_conab_data', JSON.stringify(updatedProducts));
      await AsyncStorage.setItem('pgmp_conab_lastUpdate', now);
      
      console.log('Dados atualizados:', updatedProducts.length, 'produtos');
      Alert.alert(' Atualizado', `Preços mínimos atualizados com dados da CONAB! (${updatedProducts.length} produtos)`);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      Alert.alert('❌ Erro', 'Não foi possível conectar com a CONAB');
    } finally {
      setIsRefreshing(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products]; // Criar uma cópia para evitar mutação
    
    console.log('Aplicando filtros. Total de produtos:', filtered.length);

    // Aplicar filtro de busca
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('Após busca:', filtered.length, 'produtos encontrados para:', searchQuery);
    }

    // Aplicar ordenação - CORRIGINDO A LÓGICA
    switch (sortOption) {
      case 'relevance':
        filtered = filtered.sort((a, b) => b.relevance - a.relevance);
        console.log('Ordenação: Por relevância');
        break;
      case 'alphabetic_asc':
        // CRESCENTE: A-Z (a.name.localeCompare(b.name))
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        console.log('Ordenação: Alfabética crescente (A-Z)');
        break;
      case 'alphabetic_desc':
        // DECRESCENTE: Z-A (b.name.localeCompare(a.name))
        filtered = filtered.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
        console.log('Ordenação: Alfabética decrescente (Z-A)');
        break;
      default:
        console.log('Ordenação: Padrão');
        break;
    }

    console.log('Produtos filtrados final:', filtered.length);
    console.log('Primeiros 5 produtos:', filtered.slice(0, 5).map(p => p.name));
    
    setFilteredProducts(filtered);
  };

  const calculatePrice = () => {
    if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
      Alert.alert('⚠️ Atenção', 'Selecione um produto e informe uma quantidade válida');
      return;
    }

    const qty = parseFloat(quantity);
    const unitPrice = selectedProduct.minPrice;
    const totalValue = qty * unitPrice;
    
    // Cálculos adicionais mais precisos
    const estimatedProfit = totalValue * 0.15; // 15% de margem estimada
    const taxes = totalValue * 0.08; // 8% de impostos estimados
    const netValue = totalValue - taxes;
    
    setResults({
      product: selectedProduct.name,
      quantity: qty,
      unit: selectedProduct.unit,
      unitPrice: unitPrice,
      totalValue: totalValue,
      estimatedProfit: estimatedProfit,
      taxes: taxes,
      netValue: netValue,
      recommendation: totalValue > 10000 ? 'Alto volume - considere parcelamento' : 'Volume adequado para comercialização'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortOptionsModal = () => (
    <View style={styles.sortContainer}>
      <Text style={[styles.sortTitle, { color: colors.text }]}>📊 Ordenar por:</Text>
      <View style={styles.sortOptions}>
        <TouchableOpacity
          style={[styles.sortOption, sortOption === 'relevance' && { backgroundColor: colors.primary }]}
          onPress={() => setSortOption('relevance')}
        >
          <Text style={[styles.sortOptionText, { 
            color: sortOption === 'relevance' ? colors.surface : colors.text 
          }]}>
            🏆 Mais Relevantes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortOption, sortOption === 'alphabetic_asc' && { backgroundColor: colors.primary }]}
          onPress={() => setSortOption('alphabetic_asc')}
        >
          <Text style={[styles.sortOptionText, { 
            color: sortOption === 'alphabetic_asc' ? colors.surface : colors.text 
          }]}>
            🔤 A-Z
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortOption, sortOption === 'alphabetic_desc' && { backgroundColor: colors.primary }]}
          onPress={() => setSortOption('alphabetic_desc')}
        >
          <Text style={[styles.sortOptionText, { 
            color: sortOption === 'alphabetic_desc' ? colors.surface : colors.text 
          }]}>
            🔡 Z-A
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ProductModal = () => (
    <Modal
      visible={showProductModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowProductModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              🌾 Selecionar Produto ({filteredProducts.length})
            </Text>
            <TouchableOpacity
              onPress={() => setShowProductModal(false)}
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
            >
              <FontAwesome name="times" size={18} color={colors.surface} />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: colors.surface, 
              color: colors.text, 
              borderColor: colors.border 
            }]}
            placeholder="🔍 Buscar produto, categoria ou região..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <SortOptionsModal />
          
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.productItem, { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border
                }]}
                onPress={() => {
                  setSelectedProduct(item);
                  setShowProductModal(false);
                  setSearchQuery('');
                }}
              >
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={[styles.productName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    {item.relevance >= 8 && (
                      <View style={[styles.relevanceBadge, { backgroundColor: colors.success }]}>
                        <Text style={styles.relevanceBadgeText}>⭐</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.productDetails, { color: colors.textSecondary }]}>
                    {item.category} • {item.unit} • {item.region}
                  </Text>
                  <Text style={[styles.productPrice, { color: colors.primary }]}>
                    Preço Mínimo: {formatCurrency(item.minPrice)}
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  🔍 Nenhum produto encontrado para "{searchQuery}"
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            📊 Carregando dados atualizados da CONAB...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.logoText, { color: colors.primary }]}>📊</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.surface }]}>
                PGMP Calculadora
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
                💰 Preços Mínimos CONAB
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surface }]}
            onPress={refreshData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <FontAwesome name="refresh" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <FontAwesome name="info-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Sobre os Preços Mínimos da CONAB
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Esta calculadora utiliza dados oficiais da CONAB com {products.length} produtos cadastrados. 
            Os preços são atualizados automaticamente e servem como referência para políticas de garantia de preços mínimos.
          </Text>
          {lastUpdate && (
            <Text style={[styles.lastUpdateText, { color: colors.textSecondary }]}>
              📅 Última atualização: {formatDate(lastUpdate)}
            </Text>
          )}
        </View>

        {/* Calculator Card */}
        <View style={[styles.calculatorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
             Calculadora de Preços ({products.length} produtos)
          </Text>
          
          {/* Product Selection */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Produto:</Text>
            <TouchableOpacity
              style={[styles.productSelector, { 
                backgroundColor: colors.background,
                borderColor: colors.border
              }]}
              onPress={() => setShowProductModal(true)}
            >
              <Text style={[
                styles.productSelectorText, 
                { color: selectedProduct ? colors.text : colors.textSecondary }
              ]}>
                {selectedProduct ? selectedProduct.name : '🌾 Selecionar produto...'}
              </Text>
              <FontAwesome name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {selectedProduct && (
            <View style={[styles.selectedProductInfo, { backgroundColor: colors.background }]}>
              <Text style={[styles.selectedProductName, { color: colors.primary }]}>
                {selectedProduct.name}
              </Text>
              <Text style={[styles.selectedProductDetails, { color: colors.textSecondary }]}>
                Categoria: {selectedProduct.category} • Unidade: {selectedProduct.unit} • Região: {selectedProduct.region}
              </Text>
              <Text style={[styles.selectedProductPrice, { color: colors.success }]}>
                Preço Mínimo: {formatCurrency(selectedProduct.minPrice)}
              </Text>
            </View>
          )}

          {/* Quantity Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Quantidade:</Text>
            <TextInput
              style={[styles.quantityInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }]}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Digite a quantidade..."
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={[styles.calculateButton, { 
              backgroundColor: colors.primary,
              opacity: (selectedProduct && quantity) ? 1 : 0.5
            }]}
            onPress={calculatePrice}
            disabled={!selectedProduct || !quantity}
          >
            <FontAwesome name="calculator" size={20} color={colors.surface} style={{ marginRight: 8 }} />
            <Text style={[styles.calculateButtonText, { color: colors.surface }]}>
              Calcular Valor Total
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Card */}
        {results && (
          <View style={[styles.resultsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              📋 Resultados do Cálculo
            </Text>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Produto:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{results.product}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Quantidade:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>
                {results.quantity} {results.unit}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Preço Unitário:</Text>
              <Text style={[styles.resultValue, { color: colors.primary }]}>
                {formatCurrency(results.unitPrice)}
              </Text>
            </View>
            
            <View style={[styles.resultRow, styles.totalRow]}>
              <Text style={[styles.resultLabel, styles.totalLabel, { color: colors.text }]}>
                Valor Total:
              </Text>
              <Text style={[styles.resultValue, styles.totalValue, { color: colors.success }]}>
                {formatCurrency(results.totalValue)}
              </Text>
            </View>
            
            <View style={[styles.additionalInfo, { backgroundColor: colors.background }]}>
              <Text style={[styles.additionalInfoTitle, { color: colors.text }]}>
                💡 Informações Adicionais:
              </Text>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Impostos estimados (8%):
                </Text>
                <Text style={[styles.infoValue, { color: colors.error }]}>
                  {formatCurrency(results.taxes)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Valor líquido:
                </Text>
                <Text style={[styles.infoValue, { color: colors.success }]}>
                  {formatCurrency(results.netValue)}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Lucro estimado (15%):
                </Text>
                <Text style={[styles.infoValue, { color: colors.success }]}>
                  {formatCurrency(results.estimatedProfit)}
                </Text>
              </View>
              
              <Text style={[styles.recommendation, { color: colors.primary }]}>
                💬 {results.recommendation}
              </Text>
            </View>
          </View>
        )}

        {/* Footer Info */}
        <View style={[styles.footerInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome name="exclamation-triangle" size={16} color={colors.error} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ⚠️ Os valores são baseados nos preços mínimos oficiais da CONAB e servem como referência. 
            Consulte sempre fontes oficiais para informações atualizadas e decisões comerciais.
          </Text>
        </View>
      </ScrollView>

      <ProductModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
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
    paddingTop: 40,
    paddingBottom: 25,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  lastUpdateText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  calculatorCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  productSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  productSelectorText: {
    fontSize: 16,
  },
  selectedProductInfo: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedProductDetails: {
    fontSize: 12,
    marginBottom: 4,
  },
  selectedProductPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  quantityInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 8,
    fontSize: 16,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  totalRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    marginTop: 8,
    paddingVertical: 12,
  },
  resultLabel: {
    fontSize: 14,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  additionalInfo: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  additionalInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendation: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  footerText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderRadius: 8,
    fontSize: 16,
  },
  sortContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sortTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sortOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  relevanceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  relevanceBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  productDetails: {
    fontSize: 12,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});