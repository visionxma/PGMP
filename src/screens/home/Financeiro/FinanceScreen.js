// C:\PROJETOS\PGMP\src\screens\home\Financeiro\FinanceScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AddTransactionModal from "./AddTransactionModal";
import TransactionItem from "./TransactionItem";
import FinancialSummary from "./FinancialSummary";

export default function FinanceScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState("receita");

  const openModal = (type) => {
    setTransactionType(type);
    setModalVisible(true);
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      type: transactionType,
      date: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
    setModalVisible(false);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const calculateTotals = () => {
    const receitas = transactions
      .filter((t) => t.type === "receita")
      .reduce((sum, t) => sum + parseFloat(t.value), 0);

    const despesas = transactions
      .filter((t) => t.type === "despesa")
      .reduce((sum, t) => sum + parseFloat(t.value), 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  };

  const totals = calculateTotals();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.greeting}>Gestão Financeira</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumo Financeiro */}
        <FinancialSummary totals={totals} />

        {/* Botões de Adicionar */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.addButton, styles.receitaButton]}
            onPress={() => openModal("receita")}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={24}
              color="#fff"
            />
            <Text style={styles.addButtonText}>Adicionar Receita</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, styles.despesaButton]}
            onPress={() => openModal("despesa")}
          >
            <MaterialCommunityIcons
              name="minus-circle"
              size={24}
              color="#fff"
            />
            <Text style={styles.addButtonText}>Adicionar Despesa</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Transações */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Transações</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={60}
                color="#999"
              />
              <Text style={styles.emptyStateText}>
                Nenhuma transação registrada
              </Text>
            </View>
          ) : (
            transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={deleteTransaction}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de Adicionar Transação */}
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addTransaction}
        type={transactionType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    backgroundColor: "#5D2A0A",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  addButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  receitaButton: {
    backgroundColor: "#2E7D32",
  },
  despesaButton: {
    backgroundColor: "#C62828",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  transactionsContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5D2A0A",
    marginBottom: 15,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },
});