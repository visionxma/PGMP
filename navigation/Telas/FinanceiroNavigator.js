// C:\PROJETOS\PGMP\navigation\FinanceiroNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Importando as telas do módulo Financeiro
import FinanceScreen from "../../src/screens/home/Financeiro/FinanceScreen";
import AddEditTransaction from "../../src/screens/home/Financeiro/AddEditTransaction";
import DetailTransaction from "../../src/screens/home/Financeiro/DetailTransaction";

const Stack = createStackNavigator();

export default function FinanceiroNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#F5F5F5" },
      }}
      initialRouteName="FinanceScreen"
    >
      {/* Tela principal - Lista de transações financeiras */}
      <Stack.Screen 
        name="FinanceScreen" 
        component={FinanceScreen}
        options={{
          title: "Gestão Financeira"
        }}
      />

      {/* Tela de adicionar/editar transação */}
      <Stack.Screen 
        name="AddEditTransaction" 
        component={AddEditTransaction}
        options={{
          title: "Transação"
        }}
      />

      {/* Tela de detalhes da transação */}
      <Stack.Screen 
        name="DetailTransaction" 
        component={DetailTransaction}
        options={{
          title: "Detalhes da Transação"
        }}
      />
    </Stack.Navigator>
  );
}