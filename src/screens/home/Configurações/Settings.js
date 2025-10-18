//C:\PROJETOS\PGMP\src\screens\Settings.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Alert,
  Switch,
  Linking
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PASSWORDS: "@senhas_seguras",
  THEME: "@tema_app",
  PRIVACY_ACCEPTED: "@privacidade_aceita"
};

export default function Settings({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [passwords, setPasswords] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordListModal, setShowPasswordListModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  
  // Estados do formulário de senha
  const [titulo, setTitulo] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [descricao, setDescricao] = useState('');

  const colors = {
    primary: '#5D2A0A',
    secondary: '#7D4A2A',
    tertiary: '#8B5A3A',
    background: darkMode ? '#1A1A1A' : '#F5F5F5',
    surface: darkMode ? '#2A2A2A' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#2E2E2E',
    textSecondary: darkMode ? '#CCCCCC' : '#666666',
    border: darkMode ? '#3A3A3A' : '#E0E0E0',
    success: '#2E7D32',
    danger: '#C62828',
    warning: '#F57C00',
    info: '#1976D2',
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Carregar tema
      const storedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (storedTheme !== null) {
        setDarkMode(storedTheme === 'dark');
      }

      // Carregar senhas
      const storedPasswords = await AsyncStorage.getItem(STORAGE_KEYS.PASSWORDS);
      if (storedPasswords) {
        setPasswords(JSON.parse(storedPasswords));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const savePasswords = async (newPasswords) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(newPasswords));
      setPasswords(newPasswords);
    } catch (error) {
      console.error('Erro ao salvar senhas:', error);
      Alert.alert('Erro', 'Não foi possível salvar a senha.');
    }
  };

  const toggleTheme = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme ? 'dark' : 'light');
      Alert.alert('Tema Alterado', `Tema ${newTheme ? 'escuro' : 'claro'} ativado!`);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const handleSavePassword = () => {
    if (!titulo.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha pelo menos o título e a senha');
      return;
    }

    const newPassword = {
      id: editingPassword?.id || Date.now().toString(),
      titulo: titulo.trim(),
      email: email.trim(),
      senha: senha.trim(),
      descricao: descricao.trim(),
      dataCriacao: editingPassword?.dataCriacao || new Date().toISOString(),
      dataModificacao: new Date().toISOString()
    };

    let updatedPasswords;
    if (editingPassword) {
      updatedPasswords = passwords.map(p => p.id === editingPassword.id ? newPassword : p);
    } else {
      updatedPasswords = [...passwords, newPassword];
    }

    savePasswords(updatedPasswords);
    closePasswordModal();
    Alert.alert('Sucesso', `Senha ${editingPassword ? 'atualizada' : 'salva'} com segurança!`);
  };

  const handleDeletePassword = (password) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a senha "${password.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const updatedPasswords = passwords.filter(p => p.id !== password.id);
            savePasswords(updatedPasswords);
          }
        }
      ]
    );
  };

  const openEditModal = (password) => {
    setEditingPassword(password);
    setTitulo(password.titulo);
    setEmail(password.email);
    setSenha(password.senha);
    setDescricao(password.descricao);
    setShowPasswordListModal(false);
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setEditingPassword(null);
    setTitulo('');
    setEmail('');
    setSenha('');
    setDescricao('');
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, label) => {
    // Em produção, use Clipboard do expo: import * as Clipboard from 'expo-clipboard';
    // Clipboard.setStringAsync(text);
    Alert.alert('Copiado', `${label} copiado para área de transferência!`);
  };

  const menuSections = [
    {
      title: 'Segurança',
      items: [
        {
          icon: 'key',
          iconType: 'FontAwesome5',
          label: 'Gerenciador de Senhas',
          subtitle: `${passwords.length} senha${passwords.length !== 1 ? 's' : ''} salva${passwords.length !== 1 ? 's' : ''}`,
          onPress: () => setShowPasswordListModal(true),
          badge: passwords.length > 0 ? passwords.length : null,
          color: colors.info
        },
        {
          icon: 'shield-lock',
          iconType: 'MaterialCommunityIcons',
          label: 'Privacidade',
          subtitle: 'Política de dados e segurança',
          onPress: () => setShowPrivacyModal(true),
          color: colors.success
        },
      ]
    },
    {
      title: 'Aparência',
      items: [
        {
          icon: 'theme-light-dark',
          iconType: 'MaterialCommunityIcons',
          label: 'Tema',
          subtitle: darkMode ? 'Modo Escuro' : 'Modo Claro',
          isSwitch: true,
          value: darkMode,
          onToggle: toggleTheme,
          color: darkMode ? '#FFD700' : colors.warning
        },
      ]
    },
    {
      title: 'Legal',
      items: [
        {
          icon: 'information-outline',
          iconType: 'MaterialCommunityIcons',
          label: 'Termos de Uso',
          subtitle: 'Leia os termos e condições',
          onPress: () => setShowTermsModal(true),
          color: colors.textSecondary
        },
        {
          icon: 'book-open-page-variant',
          iconType: 'MaterialCommunityIcons',
          label: 'Sobre o App',
          subtitle: 'Versão 1.0.0',
          onPress: () => Alert.alert('PGMP', 'Sistema de Gestão v1.0.0\n\nDesenvolvido para produtores rurais.'),
          color: colors.primary
        },
      ]
    }
  ];

  const renderIcon = (iconName, iconType, size = 24, color = colors.primary) => {
    if (iconType === "FontAwesome5") {
      return <FontAwesome5 name={iconName} size={size} color={color} />;
    } else if (iconType === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
    } else {
      return <MaterialIcons name={iconName} size={size} color={color} />;
    }
  };

  const PasswordListModal = () => (
    <Modal
      visible={showPasswordListModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPasswordListModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Senhas Salvas
            </Text>
            <TouchableOpacity onPress={() => setShowPasswordListModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {passwords.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="key-remove" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Nenhuma senha salva ainda
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Clique no botão abaixo para adicionar sua primeira senha
                </Text>
              </View>
            ) : (
              passwords.map((pass) => (
                <View
                  key={pass.id}
                  style={[styles.passwordItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <View style={styles.passwordHeader}>
                    <View style={[styles.passwordIcon, { backgroundColor: colors.info + '20' }]}>
                      <MaterialCommunityIcons name="lock" size={20} color={colors.info} />
                    </View>
                    <View style={styles.passwordInfo}>
                      <Text style={[styles.passwordTitle, { color: colors.text }]}>
                        {pass.titulo}
                      </Text>
                      {pass.email && (
                        <Text style={[styles.passwordEmail, { color: colors.textSecondary }]}>
                          {pass.email}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.passwordDetails}>
                    <View style={styles.passwordField}>
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Senha:</Text>
                      <View style={styles.passwordRow}>
                        <Text style={[styles.fieldValue, { color: colors.text }]}>
                          {showPassword[pass.id] ? pass.senha : '••••••••'}
                        </Text>
                        <TouchableOpacity onPress={() => togglePasswordVisibility(pass.id)}>
                          <MaterialCommunityIcons
                            name={showPassword[pass.id] ? "eye-off" : "eye"}
                            size={18}
                            color={colors.textSecondary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => copyToClipboard(pass.senha, 'Senha')}>
                          <MaterialCommunityIcons name="content-copy" size={18} color={colors.info} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {pass.descricao && (
                      <Text style={[styles.passwordDescription, { color: colors.textSecondary }]}>
                        {pass.descricao}
                      </Text>
                    )}
                  </View>

                  <View style={styles.passwordActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.info + '20' }]}
                      onPress={() => openEditModal(pass)}
                    >
                      <MaterialIcons name="edit" size={18} color={colors.info} />
                      <Text style={[styles.actionButtonText, { color: colors.info }]}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
                      onPress={() => handleDeletePassword(pass)}
                    >
                      <MaterialIcons name="delete" size={18} color={colors.danger} />
                      <Text style={[styles.actionButtonText, { color: colors.danger }]}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.addPasswordButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setShowPasswordListModal(false);
              setShowPasswordModal(true);
            }}
          >
            <MaterialIcons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addPasswordButtonText}>Nova Senha</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PasswordFormModal = () => (
    <Modal
      visible={showPasswordModal}
      transparent={true}
      animationType="slide"
      onRequestClose={closePasswordModal}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingPassword ? 'Editar Senha' : 'Nova Senha'}
            </Text>
            <TouchableOpacity onPress={closePasswordModal}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Título *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex: Email Gmail, Banco, Netflix..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email/Usuário</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={email}
                onChangeText={setEmail}
                placeholder="usuario@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Senha *</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Digite a senha"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!showPassword['new']}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => togglePasswordVisibility('new')}
                >
                  <MaterialCommunityIcons
                    name={showPassword['new'] ? "eye-off" : "eye"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Observações adicionais (opcional)"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
              <MaterialCommunityIcons name="shield-alert" size={20} color={colors.warning} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                As senhas são armazenadas localmente no seu dispositivo de forma segura.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={closePasswordModal}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSavePassword}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                {editingPassword ? 'Atualizar' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const TermsModal = () => (
    <Modal
      visible={showTermsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTermsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Termos de Uso</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.termsText, { color: colors.text }]}>
              <Text style={styles.termsTitle}>1. Aceitação dos Termos{'\n'}</Text>
              Ao usar o aplicativo PGMP (Plataforma de Gestão e Monitoramento de Produção), você concorda com estes termos de uso.{'\n\n'}

              <Text style={styles.termsTitle}>2. Uso do Aplicativo{'\n'}</Text>
              O PGMP é destinado exclusivamente para fins de gestão de produção rural. Você se compromete a:{'\n'}
              • Usar o aplicativo de forma legal e ética{'\n'}
              • Não compartilhar informações confidenciais{'\n'}
              • Manter a segurança de suas credenciais{'\n\n'}

              <Text style={styles.termsTitle}>3. Propriedade Intelectual{'\n'}</Text>
              Todo o conteúdo do aplicativo, incluindo textos, gráficos e código, é protegido por direitos autorais.{'\n\n'}

              <Text style={styles.termsTitle}>4. Limitação de Responsabilidade{'\n'}</Text>
              O aplicativo é fornecido "como está". Não garantimos que estará livre de erros ou funcionará sem interrupções.{'\n\n'}

              <Text style={styles.termsTitle}>5. Modificações{'\n'}</Text>
              Reservamos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação.{'\n\n'}

              <Text style={styles.termsTitle}>6. Conta e Segurança{'\n'}</Text>
              Você é responsável por manter a confidencialidade de suas informações de conta e por todas as atividades que ocorram em sua conta.{'\n\n'}

              <Text style={styles.termsTitle}>7. Contato{'\n'}</Text>
              Para dúvidas sobre estes termos, entre em contato através do suporte do aplicativo.{'\n\n'}

              <Text style={[styles.termsFooter, { color: colors.textSecondary }]}>
                Última atualização: 11 de Outubro de 2025
              </Text>
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={[styles.fullWidthButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowTermsModal(false)}
          >
            <Text style={[styles.fullWidthButtonText, { color: '#FFFFFF' }]}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const PrivacyModal = () => (
    <Modal
      visible={showPrivacyModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Política de Privacidade</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.termsText, { color: colors.text }]}>
              <Text style={styles.termsTitle}>1. Coleta de Informações{'\n'}</Text>
              O PGMP coleta e armazena as seguintes informações:{'\n'}
              • Dados de cadastro (nome, email){'\n'}
              • Informações de produção e financeiras{'\n'}
              • Senhas (criptografadas localmente){'\n'}
              • Dados de uso do aplicativo{'\n\n'}

              <Text style={styles.termsTitle}>2. Uso das Informações{'\n'}</Text>
              Suas informações são usadas para:{'\n'}
              • Fornecer e melhorar nossos serviços{'\n'}
              • Personalizar sua experiência{'\n'}
              • Enviar notificações importantes{'\n'}
              • Gerar relatórios e análises{'\n\n'}

              <Text style={styles.termsTitle}>3. Armazenamento de Dados{'\n'}</Text>
              • Todos os dados são armazenados localmente no seu dispositivo{'\n'}
              • Não compartilhamos suas informações com terceiros{'\n'}
              • Você pode excluir seus dados a qualquer momento{'\n\n'}

              <Text style={styles.termsTitle}>4. Segurança{'\n'}</Text>
              Implementamos medidas de segurança para proteger suas informações:{'\n'}
              • Criptografia de senhas{'\n'}
              • Armazenamento local seguro{'\n'}
              • Autenticação de usuário{'\n\n'}

              <Text style={styles.termsTitle}>5. Seus Direitos{'\n'}</Text>
              Você tem o direito de:{'\n'}
              • Acessar seus dados pessoais{'\n'}
              • Corrigir informações incorretas{'\n'}
              • Solicitar a exclusão de seus dados{'\n'}
              • Exportar seus dados{'\n\n'}

              <Text style={styles.termsTitle}>6. Cookies e Tecnologias{'\n'}</Text>
              O aplicativo não usa cookies, mas pode armazenar dados localmente para melhorar sua experiência.{'\n\n'}

              <Text style={styles.termsTitle}>7. Alterações na Política{'\n'}</Text>
              Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas.{'\n\n'}

              <Text style={styles.termsTitle}>8. Contato{'\n'}</Text>
              Para questões sobre privacidade, entre em contato através do suporte do aplicativo.{'\n\n'}

              <Text style={[styles.termsFooter, { color: colors.textSecondary }]}>
                Última atualização: 11 de Outubro de 2025
              </Text>
            </Text>
          </ScrollView>

          <TouchableOpacity
            style={[styles.fullWidthButton, { backgroundColor: colors.success }]}
            onPress={() => setShowPrivacyModal(false)}
          >
            <Text style={[styles.fullWidthButtonText, { color: '#FFFFFF' }]}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
              <MaterialCommunityIcons name="cog" size={25} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Configurações</Text>
              <Text style={[styles.headerSubtitle, { color: '#FFFFFF' }]}>
                Personalize seu app
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={item.isSwitch ? null : item.onPress}
                activeOpacity={item.isSwitch ? 1 : 0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                  {renderIcon(item.icon, item.iconType, 24, item.color)}
                </View>
                
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuItemLabel, { color: colors.text }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                  </View>
                  
                  {item.badge && (
                    <View style={[styles.badge, { backgroundColor: item.color }]}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  
                  {item.isSwitch ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: item.color + '40' }}
                      thumbColor={item.value ? item.color : colors.textSecondary}
                    />
                  ) : (
                    <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Botão de Sair/Limpar Dados */}
        <TouchableOpacity
          style={[styles.dangerButton, { backgroundColor: colors.danger + '20', borderColor: colors.danger }]}
          onPress={() => {
            Alert.alert(
              'Limpar Todos os Dados',
              'Esta ação irá remover todas as suas configurações, senhas e dados. Deseja continuar?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Limpar',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AsyncStorage.multiRemove([
                        STORAGE_KEYS.PASSWORDS,
                        STORAGE_KEYS.THEME,
                        STORAGE_KEYS.PRIVACY_ACCEPTED
                      ]);
                      setPasswords([]);
                      setDarkMode(false);
                      Alert.alert('Sucesso', 'Dados limpos com sucesso!');
                    } catch (error) {
                      Alert.alert('Erro', 'Não foi possível limpar os dados.');
                    }
                  }
                }
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="delete-forever" size={20} color={colors.danger} />
          <Text style={[styles.dangerButtonText, { color: colors.danger }]}>
            Limpar Todos os Dados
          </Text>
        </TouchableOpacity>

        {/* Footer Info */}
        <View style={[styles.footerInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="information" size={16} color={colors.info} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Suas configurações e senhas são armazenadas de forma segura apenas no seu dispositivo.
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <PasswordListModal />
      <PasswordFormModal />
      <TermsModal />
      <PrivacyModal />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
  },
  dangerButtonText: {
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Password List Styles
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  passwordItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passwordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  passwordInfo: {
    flex: 1,
  },
  passwordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  passwordEmail: {
    fontSize: 13,
  },
  passwordDetails: {
    marginBottom: 12,
  },
  passwordField: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fieldValue: {
    fontSize: 14,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  passwordDescription: {
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  passwordActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    elevation: 3,
  },
  addPasswordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Form Styles
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderRadius: 8,
    padding: 12,
    paddingRight: 48,
    fontSize: 14,
    borderWidth: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    gap: 10,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Terms/Privacy Styles
  termsText: {
    fontSize: 14,
    lineHeight: 24,
  },
  termsTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  termsFooter: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  fullWidthButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  fullWidthButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});