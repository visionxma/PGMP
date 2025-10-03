//C:\PROJETOS\PGMP\src\screens\AIscreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert, 
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CONFIGURAÇÃO DA API GEMINI (GRATUITA)
const GEMINI_API_KEY = 'AIzaSyBn2YSz5xm9Qmg0QBMU-f0tbUi_RmoPuIc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const AIScreen = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: '🤖 Olá! Sou seu assistente de IA! Posso responder qualquer pergunta que você tenha. Como posso ajudá-lo hoje?', 
      sender: 'bot', 
      timestamp: new Date().toISOString() 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // Referência para a FlatList
  const flatListRef = useRef(null);

  // Cores do tema marrom
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

  useEffect(() => {
    loadMessages();
    loadConversationHistory();
    checkApiKey();

    // Listeners do teclado
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Rola para o final quando o teclado aparece
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Efeito para rolar até o final quando as mensagens mudam
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const checkApiKey = () => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'AIzaSyAvkBSTIaZpZ1rSB1HzBggq6X-13DhMIfw') {
      Alert.alert(
        '⚠️ Configuração Necessária',
        'Para usar o Chat IA, você precisa:\n\n1. Acessar: https://aistudio.google.com/app/apikey\n2. Criar uma chave API gratuita do Gemini\n3. Substituir GEMINI_API_KEY no código\n\n✅ O Gemini é 100% gratuito para uso!',
        [{ text: 'Entendi' }]
      );
    }
  };

  const saveMessages = async (messages) => {
    try {
      await AsyncStorage.setItem('pgmp_chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error('Erro ao salvar mensagens:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem('pgmp_chatHistory');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const saveConversationToHistory = async (messages) => {
    try {
      const existingHistory = await AsyncStorage.getItem('pgmp_conversationHistory');
      let history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const userMessages = messages.filter(msg => msg.sender === 'user');
      const lastUserMessage = userMessages[userMessages.length - 1];
      const conversationTitle = lastUserMessage ? 
        (lastUserMessage.text.length > 50 ? 
          lastUserMessage.text.substring(0, 50) + '...' : 
          lastUserMessage.text) : 
        'Nova Conversa';

      const conversation = {
        id: Date.now(),
        title: conversationTitle,
        messages: messages,
        timestamp: new Date().toISOString(),
        messageCount: messages.length - 1,
      };

      history.unshift(conversation);
      if (history.length > 50) {
        history = history.slice(0, 50);
      }

      await AsyncStorage.setItem('pgmp_conversationHistory', JSON.stringify(history));
      setConversationHistory(history);
    } catch (error) {
      console.error('Erro ao salvar conversa no histórico:', error);
    }
  };

  const loadConversationHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('pgmp_conversationHistory');
      if (savedHistory) {
        setConversationHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadConversationFromHistory = (conversation) => {
    setMessages(conversation.messages);
    saveMessages(conversation.messages);
    setShowHistory(false);
    Alert.alert('✅', 'Conversa carregada!');
  };

  const deleteConversationFromHistory = async (conversationId) => {
    try {
      const updatedHistory = conversationHistory.filter(conv => conv.id !== conversationId);
      await AsyncStorage.setItem('pgmp_conversationHistory', JSON.stringify(updatedHistory));
      setConversationHistory(updatedHistory);
      Alert.alert('🗑️', 'Conversa removida do histórico!');
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
    }
  };

  const clearAllHistory = async () => {
    Alert.alert(
      '🗑️ Limpar Todo Histórico',
      'Tem certeza que deseja apagar todo o histórico de conversas? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Apagar Tudo', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('pgmp_conversationHistory');
              setConversationHistory([]);
              Alert.alert('✅', 'Histórico limpo!');
            } catch (error) {
              console.error('Erro ao limpar histórico:', error);
            }
          }
        }
      ]
    );
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      if (editingMessage) {
        const updatedMessages = messages.map((msg) =>
          msg.id === editingMessage.id ? { ...msg, text: inputText, timestamp: new Date().toISOString() } : msg
        );
        setMessages(updatedMessages);
        saveMessages(updatedMessages);
        setEditingMessage(null);
        const botResponse = await fetchBotResponse(inputText);
        const updatedMessagesWithBot = [
          ...updatedMessages.filter((msg) => msg.sender !== 'bot' || msg.id !== editingMessage.id + 1),
          { id: editingMessage.id + 1, text: botResponse, sender: 'bot', timestamp: new Date().toISOString() }
        ];
        setMessages(updatedMessagesWithBot);
        saveMessages(updatedMessagesWithBot);
        saveConversationToHistory(updatedMessagesWithBot);
      } else {
        const newMessage = { 
          id: messages.length + 1, 
          text: inputText, 
          sender: 'user', 
          timestamp: new Date().toISOString() 
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        saveMessages(updatedMessages);
        setInputText('');

        const botResponse = await fetchBotResponse(inputText);
        const updatedMessagesWithBot = [...updatedMessages, { 
          id: updatedMessages.length + 1, 
          text: botResponse, 
          sender: 'bot', 
          timestamp: new Date().toISOString() 
        }];
        setMessages(updatedMessagesWithBot);
        saveMessages(updatedMessagesWithBot);
        saveConversationToHistory(updatedMessagesWithBot);
      }
      setInputText('');
      
      // Rola para o final após enviar mensagem
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  };

  const fetchBotResponse = async (userMessage) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'SUA_CHAVE_GEMINI_AQUI') {
      return '⚠️ Chat IA não configurado. Configure a chave API do Gemini para usar esta funcionalidade.';
    }

    setIsLoading(true);
    
    try {
      console.log("🤖 Enviando mensagem para Google Gemini:", userMessage);
      
      const prompt = `Você é um assistente de IA útil e inteligente para o aplicativo PGMP (Programa de Gestão e Melhoramento de Produção).

INSTRUÇÕES:
- Responda sempre em português brasileiro
- Seja útil, preciso e informativo
- Você pode responder qualquer tipo de pergunta sobre qualquer assunto
- Use emojis quando apropriado para tornar a conversa mais amigável
- Seja prático e objetivo
- Se não souber algo específico, seja honesto mas ofereça alternativas
- Mantenha tom amigável e profissional

PERGUNTA DO USUÁRIO: ${userMessage}`;

      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("✅ Resposta do Google Gemini recebida");
      
      const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (botResponse) {
        return botResponse;
      } else {
        return '🤔 Desculpe, não consegui processar sua pergunta. Pode tentar reformular?';
      }

    } catch (error) {
      console.error("❌ Erro ao obter resposta do Gemini:", error.response ? error.response.data : error.message);
      
      if (error.response?.status === 403) {
        return '🔑 Erro de autenticação. Verifique se a chave API do Gemini está correta.';
      } else if (error.response?.status === 429) {
        return '⏱️ Muitas solicitações. Aguarde um momento e tente novamente.';
      } else {
        return '🔧 Desculpe, houve um erro temporário. Tente novamente em alguns segundos.';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = () => {
    Alert.alert(
      '🗑️ Nova Conversa',
      'Deseja salvar a conversa atual no histórico antes de iniciar uma nova?',
      [
        { 
          text: 'Não Salvar', 
          style: 'destructive',
          onPress: () => {
            setMessages([{ 
              id: 1, 
              text: '🤖 Olá! Sou seu assistente de IA! Posso responder qualquer pergunta que você tenha. Como posso ajudá-lo hoje?', 
              sender: 'bot',
              timestamp: new Date().toISOString()
            }]);
            AsyncStorage.removeItem('pgmp_chatHistory');
            Alert.alert('✅', 'Nova conversa iniciada!');
          }
        },
        { 
          text: 'Salvar e Nova', 
          onPress: () => {
            if (messages.length > 1) {
              saveConversationToHistory(messages);
            }
            setMessages([{ 
              id: 1, 
              text: '🤖 Olá! Sou seu assistente de IA! Posso responder qualquer pergunta que você tenha. Como posso ajudá-lo hoje?', 
              sender: 'bot',
              timestamp: new Date().toISOString()
            }]);
            AsyncStorage.removeItem('pgmp_chatHistory');
            Alert.alert('✅', 'Conversa salva! Nova conversa iniciada!');
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const copyToClipboard = (text) => {
    Clipboard.setStringAsync(text);
    Alert.alert('📋', 'Resposta copiada!');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hoje';
    } else if (diffDays === 2) {
      return 'Ontem';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
    setShowScrollToBottom(!isNearBottom && contentSize.height > layoutMeasurement.height);
  };

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
      setShowScrollToBottom(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.message, 
      item.sender === 'bot' ? 
        [styles.botMessage, { backgroundColor: colors.primary }] : 
        [styles.userMessage, { backgroundColor: colors.secondary }]
    ]}>
      <Text style={[styles.messageText, { color: colors.surface }]}>{item.text}</Text>
      {item.sender === 'user' && (
        <TouchableOpacity 
          onPress={() => { 
            setInputText(item.text); 
            setEditingMessage(item); 
          }}
          style={styles.actionButton}
        >
          <Icon name="edit" size={20} color={colors.surface} />
        </TouchableOpacity>
      )}
      {item.sender === 'bot' && (
        <TouchableOpacity 
          onPress={() => copyToClipboard(item.text)}
          style={styles.actionButton}
        >
          <Ionicons name='copy' size={20} color={colors.surface} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.historyItem, { 
        backgroundColor: colors.surface, 
        borderColor: colors.border 
      }]}
      onPress={() => loadConversationFromHistory(item)}
    >
      <View style={styles.historyItemContent}>
        <View style={styles.historyItemHeader}>
          <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <TouchableOpacity
            onPress={() => deleteConversationFromHistory(item.id)}
            style={[styles.deleteHistoryButton, { backgroundColor: colors.error + '20' }]}
          >
            <Ionicons name="trash" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
        <View style={styles.historyItemFooter}>
          <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
            {formatDate(item.timestamp)}
          </Text>
          <Text style={[styles.historyMessageCount, { color: colors.textSecondary }]}>
            {item.messageCount} mensagens
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.aiIndicator, { backgroundColor: colors.surface }]}>
            <Text style={[styles.aiText, { color: colors.primary }]}>IA</Text>
          </View>
          <View>
            <Text style={[styles.headerText, { color: colors.surface }]}>Chat IA</Text>
            <Text style={[styles.headerSubtext, { color: colors.surface }]}>
              {isLoading ? '🤖 Pensando...' : '💬 Assistente Inteligente'}
            </Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => setShowHistory(true)} 
            style={[styles.historyButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name='time' size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDeleteChat} 
            style={[styles.deleteButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name='add' size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Mensagens */}
      <View style={[styles.chatContainer, { 
        marginBottom: keyboardHeight > 0 ? 10 : 0 
      }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={{
            paddingBottom: 20,
            paddingTop: 10
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
        />
        {showScrollToBottom && (
          <TouchableOpacity 
            style={[styles.scrollToBottomButton, { 
              backgroundColor: colors.primary,
              bottom: keyboardHeight > 0 ? 30 : 20
            }]}
            onPress={scrollToBottom}
          >
            <Ionicons name="arrow-down" size={24} color={colors.surface} />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="small" color={colors.primary} style={styles.loadingSpinner} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            IA processando sua pergunta...
          </Text>
        </View>
      )}

      {/* Input Container */}
      <View style={[styles.inputContainer, { 
        backgroundColor: colors.surface, 
        borderColor: colors.border,
        shadowColor: colors.shadow,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16
      }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.background, 
            color: colors.text, 
            borderColor: colors.border 
          }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={editingMessage ? 'Editando mensagem...' : 'Faça qualquer pergunta...'}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
          editable={!isLoading}
          onFocus={() => {
            setTimeout(() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }, 300);
          }}
        />
        <TouchableOpacity 
          onPress={handleSend} 
          style={[styles.sendButton, { 
            backgroundColor: colors.primary,
            opacity: (inputText.trim() && !isLoading) ? 1 : 0.5
          }]}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons 
            name={editingMessage ? 'checkmark' : 'send'} 
            size={24} 
            color={colors.surface} 
          />
        </TouchableOpacity>
      </View>

      {/* Modal do Histórico */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.historyModal, { backgroundColor: colors.background }]}>
            <View style={[styles.historyModalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.historyModalTitle, { color: colors.text }]}>
                📚 Histórico de Conversas
              </Text>
              <View style={styles.historyModalButtons}>
                {conversationHistory.length > 0 && (
                  <TouchableOpacity
                    onPress={clearAllHistory}
                    style={[styles.clearAllButton, { backgroundColor: colors.error + '20' }]}
                  >
                    <Ionicons name="trash" size={20} color={colors.error} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowHistory(false)}
                  style={[styles.closeModalButton, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="close" size={24} color={colors.surface} />
                </TouchableOpacity>
              </View>
            </View>
            {conversationHistory.length > 0 ? (
              <FlatList
                data={conversationHistory}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderHistoryItem}
                style={styles.historyList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View style={styles.emptyHistoryContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyHistoryText, { color: colors.textSecondary }]}>
                  Nenhuma conversa salva ainda
                </Text>
                <Text style={[styles.emptyHistorySubtext, { color: colors.textSecondary }]}>
                  Suas conversas aparecerão aqui automaticamente
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
  },
  header: { 
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  aiIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerText: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  headerSubtext: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  historyButton: { 
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    elevation: 2,
  },
  deleteButton: { 
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    elevation: 2,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  message: { 
    padding: 16, 
    borderRadius: 16, 
    marginVertical: 6, 
    maxWidth: '85%', 
    marginHorizontal: 10,
    flexDirection: 'row', 
    alignItems: 'flex-end',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botMessage: { 
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userMessage: { 
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: { 
    fontSize: 16, 
    flex: 1,
    lineHeight: 22,
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 16,
    maxWidth: '85%',
  },
  loadingSpinner: {
    marginRight: 12,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: { 
    flex: 1, 
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16, 
    borderWidth: 1.5,
    borderRadius: 25,
    marginRight: 12,
    maxHeight: 120,
    minHeight: 48,
    textAlignVertical: 'top',
  },
  sendButton: { 
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyModal: {
    width: '90%',
    height: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  historyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  historyModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  clearAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyList: {
    flex: 1,
    padding: 20,
  },
  historyItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  deleteHistoryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12,
  },
  historyMessageCount: {
    fontSize: 12,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHistorySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default AIScreen;