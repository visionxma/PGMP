//C:\PROJETOS\PGMP\src\screens\NoticiasScreen.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ScrollView, 
  Image,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const NewsItem = ({ item, onPress, onToggleSave, isSaved, colors }) => (
  <TouchableOpacity 
    style={[styles.newsItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
    onPress={() => onPress(item)}
    activeOpacity={0.8}
  >
    <Image 
      source={{ uri: item.image }} 
      style={styles.newsImage}
      defaultSource={{ uri: 'https://via.placeholder.com/120x80/5D2A0A/FFFFFF?text=PGMP' }}
    />
    <View style={styles.newsContent}>
      <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.newsDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.newsFooter}>
        <Text style={[styles.newsDate, { color: colors.textSecondary }]}>
          {new Date(item.publishedAt).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={[styles.newsSource, { color: colors.primary }]} numberOfLines={1}>
          {item.source}
        </Text>
      </View>
    </View>
    <TouchableOpacity 
      style={styles.saveButton} 
      onPress={() => onToggleSave(item.id)}
      accessibilityLabel={isSaved ? "Remover dos salvos" : "Salvar notícia"}
    >
      <FontAwesome 
        name={isSaved ? "bookmark" : "bookmark-o"} 
        size={20} 
        color={isSaved ? colors.primary : colors.textSecondary} 
      />
    </TouchableOpacity>
  </TouchableOpacity>
);

const ModalContent = ({ news, onClose, colors }) => {
  const [showRedirectModal, setShowRedirectModal] = useState(false);

  const handleReadMore = () => {
    setShowRedirectModal(true);
  };

  const handleConfirmRedirect = () => {
    setShowRedirectModal(false);
    if (news.url) {
      Linking.openURL(news.url);
    }
  };

  const handleCancelRedirect = () => {
    setShowRedirectModal(false);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!news}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity 
                onPress={onClose} 
                style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
              >
                <FontAwesome name="times" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <Image 
                source={{ uri: news.image }} 
                style={styles.modalImage}
                defaultSource={{ uri: 'https://via.placeholder.com/400x200/5D2A0A/FFFFFF?text=PGMP+News' }}
              />
              
              <View style={styles.modalContentContainer}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{news.title}</Text>
                
                <View style={styles.modalMetaContainer}>
                  <Text style={[styles.modalDate, { color: colors.textSecondary }]}>
                    📅 {new Date(news.publishedAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={[styles.modalSource, { color: colors.primary }]}>
                    📰 {news.source}
                  </Text>
                </View>
                
                <Text style={[styles.modalText, { color: colors.text }]}>
                  {news.description || 'Descrição não disponível.'}
                </Text>
                
                {news.content && (
                  <Text style={[styles.modalText, { color: colors.text, marginTop: 10 }]}>
                    {news.content.replace(/\[\s*\+\d+\s*chars\]$/, '')}
                  </Text>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.modalButtonsContainer}>
              {news.url && (
                <TouchableOpacity
                  onPress={handleReadMore}
                  style={[styles.readMoreButton, { backgroundColor: colors.primary }]}
                >
                  <FontAwesome name="external-link" size={16} color={colors.surface} style={{ marginRight: 8 }} />
                  <Text style={[styles.buttonText, { color: colors.surface }]}>Ler Completa</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                onPress={onClose} 
                style={[styles.closeButton, { backgroundColor: colors.textSecondary }]}
              >
                <Text style={[styles.buttonText, { color: colors.surface }]}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showRedirectModal}
        onRequestClose={handleCancelRedirect}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.redirectModalContent, { backgroundColor: colors.background }]}>
            <FontAwesome name="external-link" size={32} color={colors.primary} style={{ marginBottom: 16 }} />
            <Text style={[styles.redirectModalTitle, { color: colors.text }]}>
              🌐 Redirecionamento
            </Text>
            <Text style={[styles.redirectModalText, { color: colors.textSecondary }]}>
              Você será redirecionado para o site oficial da notícia. Deseja continuar?
            </Text>
            <View style={styles.redirectModalButtons}>
              <TouchableOpacity
                onPress={handleConfirmRedirect}
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.buttonText, { color: colors.surface }]}>✅ Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelRedirect}
                style={[styles.cancelButton, { backgroundColor: colors.textSecondary }]}
              >
                <Text style={[styles.buttonText, { color: colors.surface }]}>❌ Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function NoticiasScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [savedNews, setSavedNews] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cores do tema marrom (igual ao Chat IA)
  const colors = {
    primary: '#5D2A0A',
    secondary: '#7D4A2A',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#2E2E2E',
    textSecondary: '#666666',
    border: '#E0E0E0',
    shadow: '#000000',
    error: '#FF5722'
  };

  const API_KEY = '93ee93f998d346e29ff6e3a455885111';
  const BASE_URL = 'https://newsapi.org/v2/everything';
  const MAX_RESULTS = 100;

  // Carregar notícias salvas do AsyncStorage
  useEffect(() => {
    loadSavedNews();
  }, []);

  const loadSavedNews = async () => {
    try {
      const saved = await AsyncStorage.getItem('pgmp_savedNews');
      if (saved) {
        setSavedNews(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar notícias salvas:', error);
    }
  };

  const saveSavedNews = async (newsIds) => {
    try {
      await AsyncStorage.setItem('pgmp_savedNews', JSON.stringify(newsIds));
    } catch (error) {
      console.error('Erro ao salvar notícias:', error);
    }
  };

  const toggleSaveNews = useCallback(async (newsId) => {
    try {
      let updatedSaved;
      if (savedNews.includes(newsId)) {
        updatedSaved = savedNews.filter(id => id !== newsId);
        Alert.alert('📰', 'Notícia removida dos salvos!');
      } else {
        updatedSaved = [...savedNews, newsId];
        Alert.alert('📰', 'Notícia salva com sucesso!');
      }
      setSavedNews(updatedSaved);
      await saveSavedNews(updatedSaved);
    } catch (error) {
      console.error('Erro ao salvar/desalvar notícia:', error);
      Alert.alert('❌', 'Erro ao salvar notícia');
    }
  }, [savedNews]);

  const fetchNews = async (isLoadMore = false, isRefresh = false) => {
    if (error) setError(null);
    
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (!isLoadMore) {
      setLoading(true);
    }

    if (isLoadMore && news.length >= MAX_RESULTS) {
      setError('🚫 Limite de 100 notícias atingido (conta gratuita)');
      setIsFetchingMore(false);
      if (isRefresh) setIsRefreshing(false);
      return;
    }

    try {
      const agrotopics = [
        'agronegócio',
        'agricultura',
        'pecuária', 
        'agro',
        'fazenda',
        'rural',
        'plantio',
        'safra',
        'soja',
        'milho',
        'gado',
        'bovino',
        'suíno',
        'avicultura',
        'irrigação',
        'fertilizante',
        'defensivo',
        'máquina agrícola',
        'trator',
        'colheitadeira',
        'commodities',
        'exportação agrícola'
      ].join(' OR ');

      const response = await axios.get(BASE_URL, {
        params: {
          q: `(${agrotopics}) AND (Brasil OR Brazil)`,
          apiKey: API_KEY,
          language: 'pt',
          page: isLoadMore ? page : 1,
          pageSize: 10,
          sortBy: 'publishedAt',
        },
        timeout: 10000
      });

      const articles = response.data.articles
        .filter(article => article.title && article.description)
        .map((article, index) => ({
          id: `${isLoadMore ? page : 1}-${index}-${Date.now()}`,
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          image: article.urlToImage || 'https://via.placeholder.com/120x80/5D2A0A/FFFFFF?text=PGMP',
          publishedAt: new Date(article.publishedAt),
          source: article.source.name || 'Fonte Desconhecida',
        }));

      const sortedArticles = articles.sort((a, b) => b.publishedAt - a.publishedAt);
      
      setNews((prev) => (isLoadMore ? [...prev, ...sortedArticles] : sortedArticles));
    } catch (err) {
      let errorMessage;
      if (err.response && err.response.status === 426) {
        errorMessage = '🚫 Limite de notícias atingido (conta gratuita)';
      } else if (err.response && err.response.status === 401) {
        errorMessage = '🔑 Erro de autenticação da API';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = '⏱️ Timeout: Verifique sua conexão';
      } else {
        errorMessage = err.response
          ? `❌ Erro ${err.response.status}: ${err.response.data.message || 'Erro ao buscar notícias'}`
          : err.request
          ? '📡 Erro de rede. Verifique sua conexão'
          : '⚠️ Ocorreu um erro inesperado';
      }
      setError(errorMessage);
    } finally {
      if (!isLoadMore) setLoading(false);
      setIsFetchingMore(false);
      if (isRefresh) setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!isRefreshing) {
      setPage(1);
      fetchNews(false, true);
    }
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const filteredNews = useMemo(() => {
    let filtered = news;
    
    if (filter === 'saved') {
      filtered = news.filter(item => savedNews.includes(item.id));
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => b.publishedAt - a.publishedAt);
  }, [news, searchQuery, filter, savedNews]);

  const loadMoreNews = () => {
    if (!isFetchingMore && filter !== 'saved' && news.length < MAX_RESULTS && !error) {
      setIsFetchingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (isFetchingMore) {
      fetchNews(true);
    }
  }, [isFetchingMore]);

  useEffect(() => {
    fetchNews();
  }, []);

  const handleNewsClick = (item) => {
    setSelectedNews(item);
  };

  const handleCloseModal = () => {
    setSelectedNews(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
             Carregando notícias do agronegócio...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header Container */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.logoText, { color: colors.primary }]}>🌾</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>PGMP Notícias</Text>
              <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
                📰 Agronegócio em Destaque
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: colors.surface }]} 
            onPress={handleRefresh} 
            disabled={isRefreshing}
            accessibilityLabel="Atualizar notícias"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <FontAwesome name="refresh" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.filterButton, 
            { borderColor: colors.primary },
            filter === 'recent' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setFilter('recent')}
        >
          <Text style={[
            styles.filterButtonText, 
            { color: filter === 'recent' ? colors.surface : colors.primary }
          ]}>
             Recentes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { borderColor: colors.primary },
            filter === 'saved' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setFilter('saved')}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filter === 'saved' ? colors.surface : colors.primary }
          ]}>
             Salvas ({savedNews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Campo de Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.surface, 
            color: colors.text, 
            borderColor: colors.border 
          }]}
          placeholder="🔍 Buscar notícias do agronegócio..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Mensagem de Erro */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchNews()}
          >
            <Text style={[styles.retryButtonText, { color: colors.surface }]}>🔄 Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de Notícias */}
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NewsItem 
            item={item} 
            onPress={handleNewsClick} 
            onToggleSave={toggleSaveNews}
            isSaved={savedNews.includes(item.id)}
            colors={colors} 
          />
        )}
        onEndReached={loadMoreNews}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.footerLoaderText, { color: colors.textSecondary }]}>
                Carregando mais notícias...
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <FontAwesome name="newspaper-o" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {filter === 'saved' 
                  ? '📰 Nenhuma notícia salva ainda'
                  : searchQuery 
                  ? '🔍 Nenhuma notícia encontrada para esta busca'
                  : '📰 Nenhuma notícia disponível no momento'
                }
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {filter === 'saved' 
                  ? 'Salve notícias interessantes para ler depois'
                  : 'Tente novamente em alguns minutos'
                }
              </Text>
            </View>
          )
        }
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal de Detalhes da Notícia */}
      {selectedNews && (
        <ModalContent 
          news={selectedNews} 
          onClose={handleCloseModal} 
          colors={colors} 
        />
      )}
    </View>
  );
}

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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1.5,
    borderRadius: 25,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  newsItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  newsContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  newsDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 10,
    flex: 1,
  },
  newsSource: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  footerLoaderText: {
    marginLeft: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeModalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  modalContentContainer: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
    marginBottom: 12,
  },
  modalMetaContainer: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  modalSource: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 22,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  readMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  redirectModalContent: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  redirectModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  redirectModalText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  redirectModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});