//C:\PROJETOS\PGMP\src\screens\home\PedirAjuda\SupportScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  StatusBar,
  Platform,
  Modal
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function SupportScreen({ navigation }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const colors = {
    primary: '#5D2A0A',
    secondary: '#7D4A2A',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#2E2E2E',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#4CAF50',
    whatsapp: '#25D366',
    phone: '#2196F3',
    email: '#FF9800'
  };

  // Configurações de contato - PERSONALIZE AQUI
  const contactInfo = {
    whatsapp: {
      number: '5598912345678', // Formato: 55 + DDD + Número (sem espaços ou caracteres especiais)
      displayNumber: '(98) 91234-5678',
      message: 'Olá! Preciso de ajuda com o PGMP.'
    },
    phone: {
      number: '5598912345678',
      displayNumber: '(98) 91234-5678'
    },
    email: {
      address: 'pgmpconab@gmail.com',
      subject: 'Solicitação de Suporte - PGMP',
      body: 'Olá,\n\nPreciso de ajuda com o aplicativo PGMP.\n\nDescreva seu problema aqui...'
    }
  };

  const handleContactPress = (type) => {
    setSelectedContact(type);
    setShowConfirmModal(true);
  };

  const confirmAndRedirect = async () => {
    setShowConfirmModal(false);
    
    try {
      let url = '';
      
      switch (selectedContact) {
        case 'whatsapp':
          const message = encodeURIComponent(contactInfo.whatsapp.message);
          url = `whatsapp://send?phone=${contactInfo.whatsapp.number}&text=${message}`;
          
          const canOpenWhatsApp = await Linking.canOpenURL(url);
          if (!canOpenWhatsApp) {
            Alert.alert(
              'WhatsApp não encontrado',
              'O WhatsApp não está instalado no seu dispositivo.',
              [{ text: 'OK' }]
            );
            return;
          }
          break;
          
        case 'phone':
          url = `tel:${contactInfo.phone.number}`;
          break;
          
        case 'email':
          const subject = encodeURIComponent(contactInfo.email.subject);
          const body = encodeURIComponent(contactInfo.email.body);
          url = `mailto:${contactInfo.email.address}?subject=${subject}&body=${body}`;
          break;
          
        default:
          return;
      }
      
      await Linking.openURL(url);
      
    } catch (error) {
      console.error('Erro ao abrir:', error);
      Alert.alert(
        'Erro',
        'Não foi possível abrir o aplicativo. Verifique se está instalado.',
        [{ text: 'OK' }]
      );
    }
  };

  const ConfirmModal = () => {
    const getContactDetails = () => {
      switch (selectedContact) {
        case 'whatsapp':
          return {
            title: 'Abrir WhatsApp?',
            message: `Você será redirecionado para o WhatsApp para conversar com:\n\n${contactInfo.whatsapp.displayNumber}`,
            icon: 'whatsapp',
            color: colors.whatsapp
          };
        case 'phone':
          return {
            title: 'Fazer Ligação?',
            message: `Você será redirecionado para fazer uma ligação para:\n\n${contactInfo.phone.displayNumber}`,
            icon: 'phone',
            color: colors.phone
          };
        case 'email':
          return {
            title: 'Enviar E-mail?',
            message: `Você será redirecionado para enviar um e-mail para:\n\n${contactInfo.email.address}`,
            icon: 'envelope',
            color: colors.email
          };
        default:
          return { title: '', message: '', icon: '', color: '' };
      }
    };

    const details = getContactDetails();

    return (
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIcon, { backgroundColor: details.color }]}>
              <FontAwesome name={details.icon} size={32} color={colors.surface} />
            </View>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {details.title}
            </Text>
            
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {details.message}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: details.color }]}
                onPress={confirmAndRedirect}
              >
                <Text style={[styles.modalButtonText, { color: colors.surface }]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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
              <FontAwesome name="help-circle" size={25} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>
                Pedir Ajuda
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
                Entre em contato conosco
              </Text>
            </View>
          </View>
          
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <FontAwesome name="info-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Como podemos ajudar?
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Nossa equipe está pronta para responder suas dúvidas e resolver seus problemas. 
            Escolha o canal de atendimento que preferir abaixo.
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Canais de Atendimento
          </Text>

          {/* WhatsApp */}
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleContactPress('whatsapp')}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: colors.whatsapp }]}>
              <FontAwesome name="whatsapp" size={32} color={colors.surface} />
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { color: colors.text }]}>
                WhatsApp
              </Text>
              <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
                Resposta rápida por mensagem
              </Text>
              <Text style={[styles.contactDetail, { color: colors.whatsapp }]}>
                {contactInfo.whatsapp.displayNumber}
              </Text>
            </View>
            
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Phone */}
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleContactPress('phone')}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: colors.phone }]}>
              <FontAwesome name="phone" size={32} color={colors.surface} />
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { color: colors.text }]}>
                Ligação
              </Text>
              <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
                Fale diretamente com nossa equipe
              </Text>
              <Text style={[styles.contactDetail, { color: colors.phone }]}>
                {contactInfo.phone.displayNumber}
              </Text>
            </View>
            
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleContactPress('email')}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: colors.email }]}>
              <FontAwesome name="envelope" size={28} color={colors.surface} />
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, { color: colors.text }]}>
                E-mail
              </Text>
              <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
                Envie sua dúvida detalhada
              </Text>
              <Text style={[styles.contactDetail, { color: colors.email }]}>
                {contactInfo.email.address}
              </Text>
            </View>
            
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={[styles.additionalInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.additionalInfoTitle, { color: colors.text }]}>
            Horário de Atendimento
          </Text>
          <View style={styles.scheduleItem}>
            <FontAwesome name="clock-o" size={16} color={colors.primary} />
            <Text style={[styles.scheduleText, { color: colors.textSecondary }]}>
              Segunda a Sexta: 8h às 18h
            </Text>
          </View>
          <View style={styles.scheduleItem}>
            <FontAwesome name="clock-o" size={16} color={colors.primary} />
            <Text style={[styles.scheduleText, { color: colors.textSecondary }]}>
              Sábado: 8h às 12h
            </Text>
          </View>
          <View style={styles.scheduleItem}>
            <FontAwesome name="calendar-times-o" size={16} color={colors.primary} />
            <Text style={[styles.scheduleText, { color: colors.textSecondary }]}>
              Domingo e Feriados: Fechado
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footerInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FontAwesome name="heart" size={16} color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Estamos aqui para ajudar você a ter a melhor experiência com o PGMP!
          </Text>
        </View>
      </ScrollView>

      <ConfirmModal />
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
  contactSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  contactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    fontWeight: '600',
  },
  additionalInfoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  additionalInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    marginLeft: 12,
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
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    elevation: 2,
  },
  confirmButton: {
    elevation: 3,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});