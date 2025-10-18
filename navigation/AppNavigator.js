// C:\PROJETOS\PGMP\navigation\AppNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Navegadores
import BottomTabs from "./BottomTabs";
import FinanceiroNavigator from "./Telas/FinanceiroNavigator";

// Telas individuais
import CalculatorScreen from "../src/screens/home/Calculadora/CalculatorScreen";
import Documentos from "../src/screens/home/Documentos/Documentos";
import AlertsScreen from "../src/screens/home/Alertas/AlertsScreen";
import ContentScreen from "../src/screens/home/Conteúdo/Conteúdo";
import SupportScreen from "../src/screens/home/PedirAjuda/SupportScreen";
import Settings from "../src/screens/home/Configurações/Settings"; // CORRIGIDO: importação correta

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: "#F5F5F5" }
      }}
      initialRouteName="Main"
    >
      {/* Tela principal com Bottom Tabs */}
      <Stack.Screen name="Main" component={BottomTabs} />

      {/* Telas que são acessadas através dos botões da HomeScreen */}
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Documentos" component={Documentos} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="Content" component={ContentScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Settings" component={Settings} />
      
      {/* Stack de Navegação do Módulo Financeiro */}
      <Stack.Screen name="Finance" component={FinanceiroNavigator} />
    </Stack.Navigator>
  );
}