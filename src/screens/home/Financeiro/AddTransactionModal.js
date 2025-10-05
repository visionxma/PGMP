// C:\PROJETOS\PGMP\src\screens\home\Financeiro\AddTransactionModal.js
// ============================================================

import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AddTransactionModal({ visible, onClose, onAdd, type }) {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");

  const categories = {
    receita: [
      { value: "vendas", label: "Vendas" },
      { value: "servicos", label: "Serviços" },
      { value: "outros_receitas", label: "Outros" },
    ],
    despesa: [
      { value: "insumos", label: "Insumos" },
      { value: "manutencao", label: "Manutenção" },
      { value: "funcionarios", label: "Funcionários" },
      { value: "combustivel", label: "Combustível" },
      { value: "outros_despesas", label: "Outros" },
    ],
  };

  const handleAdd = () => {
    if (!description.trim() || !value.trim() || !category) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos");
      return;
    }

    const numericValue = parseFloat(value.replace(",", "."));
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Atenção", "Por favor, insira um valor válido");
      return;
    }

    onAdd({
      description: description.trim(),
      value: numericValue,
      category,
    });

    setDescription("");
    setValue("");
    setCategory("");
  };

  const handleClose = () => {
    setDescription("");
    setValue("");
    setCategory("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {type === "receita" ? "Nova Receita" : "Nova Despesa"}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Venda de produtos"
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Valor (R$)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0,00"
                  value={value}
                  onChangeText={setValue}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Categoria</Text>
                <View style={styles.categoriesContainer}>
                  {categories[type].map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryButton,
                        category === cat.value && styles.categoryButtonActive,
                        type === "receita"
                          ? styles.categoryReceita
                          : styles.categoryDespesa,
                        category === cat.value &&
                          (type === "receita"
                            ? styles.categoryReceitaActive
                            : styles.categoryDespesaActive),
                      ]}
                      onPress={() => setCategory(cat.value)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          category === cat.value &&
                            styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  type === "receita"
                    ? styles.confirmButtonReceita
                    : styles.confirmButtonDespesa,
                ]}
                onPress={handleAdd}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    color: "#333",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  categoryReceita: {
    borderColor: "#2E7D32",
    backgroundColor: "#F1F8F4",
  },
  categoryDespesa: {
    borderColor: "#C62828",
    backgroundColor: "#FFF5F5",
  },
  categoryReceitaActive: {
    backgroundColor: "#2E7D32",
  },
  categoryDespesaActive: {
    backgroundColor: "#C62828",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButtonReceita: {
    backgroundColor: "#2E7D32",
  },
  confirmButtonDespesa: {
    backgroundColor: "#C62828",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});