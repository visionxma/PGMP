// C:\PROJETOS\PGMP\navigation\AppNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CalculatorScreen from "../src/screens/home/Calculadora/CalculatorScreen";
import Documentos from "../src/screens/home/Documentos/Documentos";
import AlertsScreen from "../src/screens/home/Alertas/AlertsScreen";
import ContentScreen from "../src/screens/home/Conteúdo/Conteúdo";
import SupportScreen from "../src/screens/home/PedirAjuda/SupportScreen";
import FinanceScreen from "../src/screens/home/Financeiro/FinanceScreen";
import BottomTabs from "./BottomTabs";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Main" // 🚨 troquei para Main
    >
      <Stack.Screen name="Main" component={BottomTabs} />
      {/* Telas que são acessadas através dos botões da HomeScreen */}
      <Stack.Screen name="Calculator" component={CalculatorScreen} />
      <Stack.Screen name="Documentos" component={Documentos} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="Content" component={ContentScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Finance" component={FinanceScreen} />
    </Stack.Navigator>
  );
}
