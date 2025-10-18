// C:\PROJETOS\PGMP\src\screens\home\Financeiro\FinanceScreen.js
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const STORAGE_KEY = "@transacoes_financeiras";

export const calculateTotals = (transactions) => {
  const receitas = transactions
    .filter((t) => t.tipo === "receita")
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);

  const despesas = transactions
    .filter((t) => t.tipo === "despesa")
    .reduce((sum, t) => sum + (Number(t.valor) || 0), 0);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
  };
};

export default function FinanceScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
    const unsubscribe = navigation.addListener('focus', loadTransactions);
    return unsubscribe;
  }, [navigation]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const sorted = parsed.sort((a, b) => new Date(b.data) - new Date(a.data));
        setTransactions(sorted);
      }
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      Alert.alert("Erro", "Não foi possível carregar as transações.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id, tipo) => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir este registro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        onPress: async () => {
          try {
            const filtered = transactions.filter((t) => t.id !== id);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
            setTransactions(filtered);
            Alert.alert("Sucesso", "Registro excluído com sucesso!");
          } catch (error) {
            console.error("Erro ao excluir:", error);
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        },
      },
    ]);
  };

  const handleEdit = (item) => {
    navigation.navigate("AddEditTransaction", { record: item });
  };

  const handleDetail = (item) => {
    navigation.navigate("DetailTransaction", { record: item });
  };

  const handleBack = () => {
    try {
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao voltar:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Data não informada";
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) return "Data inválida";
      return parsedDate.toLocaleDateString("pt-BR");
    } catch (e) {
      return "Data inválida";
    }
  };

  const formatCurrency = (value) => {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const totals = calculateTotals(transactions);
  const receitas = transactions.filter(t => t.tipo === "receita");
  const despesas = transactions.filter(t => t.tipo === "despesa");

  const sections = [
    { title: "Receitas", data: receitas },
    { title: "Despesas", data: despesas },
  ];

  const renderItem = ({ item }) => {
    const isReceita = item.tipo === "receita";
    return (
      <View style={[styles.recordContainer, isReceita ? styles.receitaCard : styles.despesaCard]}>
        <View style={styles.recordInfo}>
          <Text style={[styles.recordValor, isReceita ? styles.receitaValue : styles.despesaValue]}>
            {isReceita ? "+" : "-"} {formatCurrency(item.valor)}
          </Text>
          <Text style={styles.recordText}>
            {item.descricao || "Sem descrição"}
          </Text>
          <Text style={styles.recordText}>
            Categoria: {item.categoria || "N/A"}
          </Text>
          <Text style={styles.recordText}>Data: {formatDate(item.data)}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.iconButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id, item.tipo)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.detailButton]}
            onPress={() => handleDetail(item)}
          >
            <MaterialCommunityIcons name="file-document" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#5D2A0A" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Gestão Financeira</Text>
        <TouchableOpacity
          style={styles.addButtonHeader}
          onPress={() => navigation.navigate("AddEditTransaction")}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#5D2A0A" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="trending-up" size={28} color="#2E7D32" />
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={[styles.summaryValue, styles.receitaValue]}>
            {formatCurrency(totals.receitas)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="trending-down" size={28} color="#C62828" />
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={[styles.summaryValue, styles.despesaValue]}>
            {formatCurrency(totals.despesas)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="wallet" size={28} color="#7D4A2A" />
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text style={[styles.summaryValue, totals.saldo >= 0 ? styles.saldoPositive : styles.saldoNegative]}>
            {formatCurrency(totals.saldo)}
          </Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#5D2A0A",
    paddingVertical: 15,
    paddingHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerText: {
    color: "#ffffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#F5F5F5",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonHeader: {
    backgroundColor: "#F5F5F5",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    margin: 15,
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
    marginTop: 8,
    marginBottom: 5,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 24,
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
  recordContainer: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  recordInfo: {
    flex: 1,
  },
  recordText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  recordValor: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 3,
  },
  editButton: {
    backgroundColor: "#2E7D32",
  },
  deleteButton: {
    backgroundColor: "#C62828",
  },
  detailButton: {
    backgroundColor: "#2196F3",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },
});