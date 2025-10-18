import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  Alert,
  TextInput
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function ConteudoScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  const colors = {
    primary: '#5D2A0A',
    secondary: '#7D4A2A',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#2E2E2E',
    textSecondary: '#666666',
    border: '#E0E0E0',
    accent: '#FF9800',
    success: '#4CAF50'
  };

  // CONFIGURAÇÃO DOS VÍDEOS - PERSONALIZE AQUI
  // Para adicionar/editar vídeos, basta modificar este array
  const videoCategories = [
    {
      id: 1,
      title: 'Primeiros Passos',
      icon: 'rocket',
      description: 'Aprenda o básico para começar',
      videos: [
        {
          id: 1,
          title: 'Como criar um e-mail',
          description: 'Aprenda passo a passo como criar sua conta de e-mail Gmail gratuitamente.',
          duration: '5:30',
          url: 'https://www.youtube.com/watch?v=EXEMPLO1',
          tags: ['básico', 'email', 'gmail']
        },
        {
          id: 2,
          title: 'Como criar conta Gov.br',
          description: 'Tutorial completo para criar sua conta no portal Gov.br e acessar serviços do governo.',
          duration: '8:45',
          url: 'https://www.youtube.com/watch?v=EXEMPLO2',
          tags: ['básico', 'gov.br', 'governo']
        },
        {
          id: 3,
          title: 'Navegando na Internet',
          description: 'Aprenda a usar o navegador e navegar com segurança pela internet.',
          duration: '6:20',
          url: 'https://www.youtube.com/watch?v=EXEMPLO3',
          tags: ['básico', 'internet', 'segurança']
        }
      ]
    },
    {
      id: 2,
      title: 'Uso do PGMP',
      icon: 'mobile-phone',
      description: 'Como usar o aplicativo',
      videos: [
        {
          id: 4,
          title: 'Instalando o PGMP',
          description: 'Como baixar e instalar o aplicativo PGMP no seu celular.',
          duration: '4:15',
          url: 'https://www.youtube.com/watch?v=EXEMPLO4',
          tags: ['app', 'instalação', 'pgmp']
        },
        {
          id: 5,
          title: 'Fazendo seu primeiro cadastro',
          description: 'Passo a passo para realizar seu primeiro cadastro no PGMP.',
          duration: '7:30',
          url: 'https://www.youtube.com/watch?v=EXEMPLO5',
          tags: ['app', 'cadastro', 'pgmp']
        },
        {
          id: 6,
          title: 'Consultando informações',
          description: 'Como consultar suas informações e histórico no aplicativo.',
          duration: '5:50',
          url: 'https://www.youtube.com/watch?v=EXEMPLO6',
          tags: ['app', 'consulta', 'pgmp']
        }
      ]
    },
    {
      id: 3,
      title: 'Segurança Digital',
      icon: 'shield',
      description: 'Proteja suas informações',
      videos: [
        {
          id: 7,
          title: 'Criando senhas seguras',
          description: 'Aprenda a criar e gerenciar senhas fortes para suas contas.',
          duration: '6:00',
          url: 'https://www.youtube.com/watch?v=EXEMPLO7',
          tags: ['segurança', 'senha', 'proteção']
        },
        {
          id: 8,
          title: 'Identificando golpes online',
          description: 'Como reconhecer e se proteger de golpes e fraudes na internet.',
          duration: '9:15',
          url: 'https://www.youtube.com/watch?v=EXEMPLO8',
          tags: ['segurança', 'golpes', 'fraudes']
        },
        {
          id: 9,
          title: 'Protegendo seus dados',
          description: 'Boas práticas para manter suas informações pessoais seguras.',
          duration: '7:40',
          url: 'https://www.youtube.com/watch?v=EXEMPLO9',
          tags: ['segurança', 'dados', 'privacidade']
        }
      ]
    },
    {
      id: 4,
      title: 'Dúvidas Frequentes',
      icon: 'question-circle',
      description: 'Respostas para perguntas comuns',
      videos: [
        {
          id: 10,
          title: 'Esqueci minha senha',
          description: 'O que fazer quando você esquece sua senha e como recuperá-la.',
          duration: '4:30',
          url: 'https://www.youtube.com/watch?v=EXEMPLO10',
          tags: ['ajuda', 'senha', 'recuperação']
        },
        {
          id: 11,
          title: 'Atualizando cadastro',
          description: 'Como atualizar seus dados cadastrais no sistema.',
          duration: '5:45',
          url: 'https://www.youtube.com/watch?v=EXEMPLO11',
          tags: ['ajuda', 'cadastro', 'atualização']
        }
      ]
    }
  ];

  const handleVideoPress = async (video) => {
    Alert.alert(
      video.title,
      'Deseja assistir este vídeo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Assistir',
          onPress: async () => {
            try {
              const canOpen = await Linking.canOpenURL(video.url);
              if (canOpen) {
                await Linking.openURL(video.url);
              } else {
                Alert.alert(
                  'Erro',
                  'Não foi possível abrir o vídeo. Verifique se você tem um aplicativo compatível instalado.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error) {
              Alert.alert(
                'Erro',
                'Ocorreu um erro ao tentar abrir o vídeo.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filterVideos = (videos) => {
    if (!searchQuery.trim()) return videos;
    
    const query = searchQuery.toLowerCase();
    return videos.filter(video => 
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.tags.some(tag => tag.toLowerCase().includes(query))
    );
  };

  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return videoCategories;
    
    return videoCategories
      .map(category => ({
        ...category,
        videos: filterVideos(category.videos)
      }))
      .filter(category => category.videos.length > 0);
  };

  const VideoCard = ({ video }) => (
    <TouchableOpacity
      style={[styles.videoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleVideoPress(video)}
      activeOpacity={0.7}
    >
      <View style={[styles.videoThumbnail, { backgroundColor: colors.primary }]}>
        <FontAwesome name="play-circle" size={40} color={colors.surface} />
        <View style={[styles.durationBadge, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={[styles.videoDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {video.description}
        </Text>
        
        <View style={styles.tagsContainer}>
          {video.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.background }]}>
              <Text style={[styles.tagText, { color: colors.secondary }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const CategorySection = ({ category }) => {
    const isExpanded = expandedCategory === category.id;
    const filteredVideos = filterVideos(category.videos);

    return (
      <View style={[styles.categorySection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => toggleCategory(category.id)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryHeaderLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.primary }]}>
              <FontAwesome name={category.icon} size={20} color={colors.surface} />
            </View>
            <View style={styles.categoryHeaderText}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                {category.title}
              </Text>
              <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>
                {category.description} • {filteredVideos.length} vídeo{filteredVideos.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <MaterialIcons
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.videosContainer}>
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </View>
        )}
      </View>
    );
  };

  const filteredCategories = getFilteredCategories();

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
              <FontAwesome name="play-circle" size={25} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>
                Materiais Audiovisuais
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
                Tutoriais e guias em vídeo
              </Text>
            </View>
          </View>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome name="search" size={16} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar vídeos..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <FontAwesome name="info-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Aprenda no seu ritmo
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Assista aos vídeos quantas vezes precisar. Todos os tutoriais foram criados 
            pensando em pessoas que estão começando a usar tecnologia.
          </Text>
        </View>

        {/* Categories */}
        {filteredCategories.length > 0 ? (
          <View style={styles.categoriesContainer}>
            {filteredCategories.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <FontAwesome name="search" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              Nenhum vídeo encontrado
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Tente buscar com outras palavras
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={[styles.footerInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome name="lightbulb-o" size={16} color={colors.accent} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Novos vídeos são adicionados regularmente. Continue acompanhando!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
    padding: 0,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categorySection: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryHeaderText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 12,
  },
  videosContainer: {
    padding: 12,
    paddingTop: 0,
  },
  videoCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  videoThumbnail: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  videoDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  footerText: {
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});