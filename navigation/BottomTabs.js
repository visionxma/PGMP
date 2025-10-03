//C:\PROJETOS\PGMP\navigation\BottomTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import NoticiasScreen from "../src/screens/NoticiasScreen";
import AIscreen from "../src/screens/AIscreen"; // CORRIGIDO: removido /AIscreen extra
import HomeScreen from "../src/screens/HomeScreen";
import FluxoCaixaScreen from "../src/screens/FluxoCaixaScreen";
import TarefasScreen from "../src/screens/TarefasScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#d1d1d1",
        tabBarStyle: { backgroundColor: "#5D2A0A" }, // Mantém a cor marrom
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Notícias":
              iconName = "newspaper";
              break;
            case "Chat IA":
              iconName = "chatbubble-ellipses";
              break;
            case "Início":
              iconName = "home";
              break;
            case "Fluxo de Caixa":
              iconName = "bar-chart";
              break;
            case "Tarefas":
              iconName = "list";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Notícias" component={NoticiasScreen} />
      <Tab.Screen name="Chat IA" component={AIscreen} />
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Fluxo de Caixa" component={FluxoCaixaScreen} />
      <Tab.Screen name="Tarefas" component={TarefasScreen} />
    </Tab.Navigator>
  );
}