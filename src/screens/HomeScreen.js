//C:\PROJETOS\PGMP\src\screens\HomeScreen.js

import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet 
} from "react-native";
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation, route }) {
  const user = route.params?.user || "Produtor";

  const menuItems = [
    { 
      label: "Calculadora", 
      screen: "Calculator", 
      icon: "calculator",
      iconType: "FontAwesome5"
    },
    { 
      label: "Documentos", 
      screen: "Documentos", 
      icon: "file-document-multiple",
      iconType: "MaterialCommunityIcons"
    },
    { 
      label: "Alertas", 
      screen: "Alerts", 
      icon: "bell",
      iconType: "FontAwesome5"
    },
    { 
      label: "Conteúdo", 
      screen: "Content", 
      icon: "play-circle",
      iconType: "FontAwesome5"
    },
    { 
      label: "Pedir Ajuda", 
      screen: "Support", 
      icon: "help-circle",
      iconType: "MaterialCommunityIcons"
    },
    { 
      label: "Financeiro", 
      screen: "Finance", 
      icon: "money-bill-wave",
      iconType: "FontAwesome5"
    },
  ];

  const renderIcon = (iconName, iconType, size = 40, color = "#fff") => {
    if (iconType === "FontAwesome5") {
      return <FontAwesome5 name={iconName} size={size} color={color} />;
    } else {
      return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {user}!
          </Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileButtonText}>Meu Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Grid de botões organizados em grupos de 3 */}
        <View style={styles.gridContainer}>
          {/* Primeira linha */}
          <View style={styles.rowContainer}>
            {menuItems.slice(0, 3).map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuButton}
                onPress={() => navigation.navigate(item.screen)}
                accessible
                accessibilityLabel={`Botão para navegar para ${item.label}`}
              >
                {renderIcon(item.icon, item.iconType)}
                <Text style={styles.menuButtonText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Segunda linha */}
          <View style={styles.rowContainer}>
            {menuItems.slice(3, 6).map((item, index) => (
              <TouchableOpacity
                key={index + 3}
                style={styles.menuButton}
                onPress={() => navigation.navigate(item.screen)}
                accessible
                accessibilityLabel={`Botão para navegar para ${item.label}`}
              >
                {renderIcon(item.icon, item.iconType)}
                <Text style={styles.menuButtonText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Seção adicional de informações */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Sistema de Gestão</Text>
          <Text style={styles.infoDescription}>
            Gerencie suas atividades de produção de forma eficiente e organizada.
          </Text>
        </View>

        {/* Botão de configurações - CORRIGIDO */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            console.log('Navegando para Settings...');
            navigation.navigate('Settings');
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
          <Text style={styles.settingsButtonText}>Configurações</Text>
        </TouchableOpacity>

        {/* Espaçamento extra para não ficar colado na bottom tab */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  gridContainer: {
    marginBottom: 30,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  menuButton: {
    backgroundColor: '#7D4A2A',
    width: '31%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 14,
  },
  infoContainer: {
    backgroundColor: '#8B5A3A',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#F0F0F0',
    lineHeight: 20,
  },
  settingsButton: {
    backgroundColor: '#5D2A0A',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});