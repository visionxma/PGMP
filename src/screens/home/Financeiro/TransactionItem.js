// C:\PROJETOS\PGMP\src\screens\home\Financeiro\TransactionItem.js
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TransactionItem({ transaction, onDelete }) {
  const categoryLabels = {
    vendas: "Vendas",
    servicos: "Serviços",
    outros_receitas: "Outros",
    insumos: "Insumos",
    manutencao: "Manutenção",
    funcionarios: "Funcionários",
    combustivel: "Combustível",
    outros_despesas: "Outros",
  };

  const categoryIcons = {
    vendas: "cash-multiple",
    servicos: "hand-heart",
    outros_receitas: "dots-horizontal",
    insumos: "package-variant",
    manutencao: "tools",
    funcionarios: "account-group",
    combustivel: "gas-station",
    outros_despesas: "dots-horizontal",
  };

  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar exclusão",
      "Deseja realmente excluir esta transação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: () => onDelete(transaction.id),
          style: "destructive",
        },
      ]
    );
  };

  const isReceita = transaction.type === "receita";

  return (
    <View
      style={[
        styles.transactionCard,
        isReceita ? styles.receitaCard : styles.despesaCard,
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={categoryIcons[transaction.category]}
          size={24}
          color={isReceita ? "#2E7D32" : "#C62828"}
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.description}>{transaction.description}</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <MaterialCommunityIcons name="delete" size={20} color="#C62828" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>
              {categoryLabels[transaction.category]}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>

        <Text
          style={[
            styles.value,
            isReceita ? styles.receitaValue : styles.despesaValue,
          ]}
        >
          {isReceita ? "+" : "-"} {formatCurrency(transaction.value)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  transactionCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
  },
  receitaCard: {
    borderLeftColor: "#2E7D32",
  },
  despesaCard: {
    borderLeftColor: "#C62828",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    padding: 2,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "500",
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
  },
  receitaValue: {
    color: "#2E7D32",
  },
  despesaValue: {
    color: "#C62828",
  },
});