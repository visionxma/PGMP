// C:\PROJETOS\PGMP\src\screens\home\Financeiro\FinancialSummary.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function FinancialSummary({ totals }) {
  const formatCurrency = (value) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  };

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons
            name="trending-up"
            size={24}
            color="#2E7D32"
          />
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={[styles.summaryValue, styles.receitaValue]}>
            {formatCurrency(totals.receitas)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryItem}>
          <MaterialCommunityIcons
            name="trending-down"
            size={24}
            color="#C62828"
          />
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={[styles.summaryValue, styles.despesaValue]}>
            {formatCurrency(totals.despesas)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="wallet" size={24} color="#7D4A2A" />
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text
            style={[
              styles.summaryValue,
              totals.saldo >= 0 ? styles.saldoPositive : styles.saldoNegative,
            ]}
          >
            {formatCurrency(totals.saldo)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    alignItems: "center",
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  receitaValue: {
    color: "#2E7D32",
  },
  despesaValue: {
    color: "#C62828",
  },
  saldoPositive: {
    color: "#2E7D32",
  },
  saldoNegative: {
    color: "#C62828",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
});