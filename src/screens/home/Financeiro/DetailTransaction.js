// C:\PROJETOS\PGMP\src\screens\home\Financeiro\DetailTransaction.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const formatDate = (date) => {
  if (!date) return "N/A";
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return "Data inválida";
    return parsedDate.toLocaleDateString("pt-BR");
  } catch (e) {
    return "Data inválida";
  }
};

const formatDateTime = (date) => {
  if (!date) return "N/A";
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return "Data inválida";
    return `${parsedDate.toLocaleDateString("pt-BR")} ${parsedDate.toLocaleTimeString("pt-BR")}`;
  } catch (e) {
    return "Data inválida";
  }
};

const formatValue = (value) => {
  if (!value) return "N/A";
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export default function DetailTransaction({ route, navigation }) {
  const { record } = route.params;

  const handleBack = () => {
    try {
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao voltar:", error);
    }
  };

  const isReceita = record.tipo === "receita";

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.header, isReceita ? styles.headerReceita : styles.headerDespesa]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={isReceita ? "#2E7D32" : "#C62828"} />
        </TouchableOpacity>
        <Text style={styles.headerText} accessibilityRole="header">
          Detalhes da {isReceita ? "Receita" : "Despesa"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.mainCard, isReceita ? styles.receitaCard : styles.despesaCard]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={isReceita ? "cash-plus" : "cash-minus"}
            size={48}
            color={isReceita ? "#2E7D32" : "#C62828"}
          />
        </View>
        <Text style={styles.valorText}>
          {isReceita ? "+" : "-"} {formatValue(record.valor)}
        </Text>
      </View>

      <Text style={styles.title}>{record.descricao || "Sem Descrição"}</Text>
      <Text style={styles.subtitle}>{record.categoria || "Sem Categoria"}</Text>

      <View style={styles.infoSection}>
        <Text style={styles.label} accessibilityLabel="Data da Transação">
          Data da Transação
        </Text>
        <Text style={styles.input}>
          {formatDate(record.data)}
        </Text>

        <Text style={styles.label} accessibilityLabel="Descrição">
          Descrição
        </Text>
        <Text style={styles.input}>
          {record.descricao || "N/A"}
        </Text>

        <Text style={styles.label} accessibilityLabel="Valor">
          Valor
        </Text>
        <Text style={styles.input}>
          {formatValue(record.valor)}
        </Text>

        <Text style={styles.label} accessibilityLabel="Categoria">
          Categoria
        </Text>
        <Text style={styles.input}>
          {record.categoria || "N/A"}
        </Text>

        <Text style={styles.label} accessibilityLabel="Tipo">
          Tipo
        </Text>
        <Text style={styles.input}>
          {isReceita ? "Receita" : "Despesa"}
        </Text>
      </View>

      {Array.isArray(record.historico) && record.historico.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Histórico de Alterações</Text>
          {record.historico.map((entry, index) => (
            <View key={index} style={[styles.historyItem, isReceita ? styles.historyItemReceita : styles.historyItemDespesa]}>
              <View style={styles.historyHeader}>
                <Text style={[styles.historyType, isReceita ? styles.historyTypeReceita : styles.historyTypeDespesa]}>
                  {entry.tipo || "Alteração"}
                </Text>
                <Text style={styles.historyDate}>{formatDateTime(entry.data)}</Text>
              </View>
              <Text style={styles.historyDescription}>
                {entry.descricao || "Sem descrição"}
              </Text>
              {entry.usuario && (
                <Text style={styles.historyUser}>
                  Por: {entry.usuario}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerReceita: {
    backgroundColor: "#2E7D32",
  },
  headerDespesa: {
    backgroundColor: "#C62828",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mainCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    margin: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 6,
  },
  receitaCard: {
    borderLeftColor: "#2E7D32",
  },
  despesaCard: {
    borderLeftColor: "#C62828",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  valorText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 15,
    marginVertical: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginHorizontal: 15,
    marginBottom: 20,
    color: "#666",
  },
  infoSection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  historySection: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  historyItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    backgroundColor: "#fff",
  },
  historyItemReceita: {
    borderLeftColor: "#2E7D32",
  },
  historyItemDespesa: {
    borderLeftColor: "#C62828",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  historyType: {
    fontSize: 14,
    fontWeight: "bold",
  },
  historyTypeReceita: {
    color: "#2E7D32",
  },
  historyTypeDespesa: {
    color: "#C62828",
  },
  historyDate: {
    fontSize: 12,
    color: "#999",
  },
  historyDescription: {
    fontSize: 14,
    marginBottom: 3,
    color: "#333",
  },
  historyUser: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#666",
  },
});