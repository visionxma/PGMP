// C:\PROJETOS\PGMP\src\screens\home\Financeiro\AddEditTransaction.js
import { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform } from "react-native";
import { DatePickerModal } from 'react-native-paper-dates';
import * as Localization from 'expo-localization';
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const STORAGE_KEY = "@transacoes_financeiras";

const formatCurrency = (text) => {
  const numbers = text.replace(/[^0-9]/g, "");
  const value = parseFloat(numbers) / 100;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseCurrency = (text) => {
  const numbers = text.replace(/[^0-9]/g, "");
  return parseFloat(numbers) / 100;
};

const formatDate = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("pt-BR");
};

export default function AddEditTransaction({ route, navigation }) {
  const { record, tipo: tipoParam } = route.params || {};
  
  const [tipo, setTipo] = useState(record?.tipo || tipoParam || "receita");
  const [descricao, setDescricao] = useState(record?.descricao || "");
  const [valor, setValor] = useState(record?.valor ? formatCurrency(record.valor.toString()) : "");
  const [categoria, setCategoria] = useState(record?.categoria || "");
  const [data, setData] = useState(record?.data ? new Date(record.data) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing] = useState(!!record?.id);

  const categorias = {
    receita: [
      "Venda de Produtos",
      "Serviços Prestados",
      "Subsídios (Auxílio Financeiro)",
      "Outros",
    ],
    despesa: [
      "Insumos",
      "Equipamentos",
      "Manutenção",
      "Transporte",
      "Mão de Obra",
      "Impostos e Taxas",
      "Outros",
    ],
  };

  const generateHistoryEntry = (isCreation, changes = {}) => {
    const now = new Date().toISOString();
    
    if (isCreation) {
      return [{
        tipo: `Criação da ${tipo === "receita" ? "Receita" : "Despesa"}`,
        descricao: `${tipo === "receita" ? "Receita" : "Despesa"} criada com valor de R$ ${parseCurrency(valor).toFixed(2)} - ${descricao}`,
        data: now,
        usuario: "Usuário",
      }];
    } else {
      let changesDesc = "Transação atualizada. Alterações: ";
      const changeList = [];
      
      if (changes.descricao) changeList.push(`Descrição alterada de "${changes.descricao.old}" para "${changes.descricao.new}"`);
      if (changes.valor) changeList.push(`Valor alterado de R$ ${changes.valor.old.toFixed(2)} para R$ ${changes.valor.new.toFixed(2)}`);
      if (changes.categoria) changeList.push(`Categoria alterada de "${changes.categoria.old}" para "${changes.categoria.new}"`);
      if (changes.data) changeList.push(`Data alterada de "${formatDate(changes.data.old)}" para "${formatDate(changes.data.new)}"`);
      
      const desc = changeList.length > 0 ? changesDesc + changeList.join("; ") : "Transação atualizada sem alterações significativas.";
      return [...(record.historico || []), {
        tipo: `Atualização da ${tipo === "receita" ? "Receita" : "Despesa"}`,
        descricao: desc,
        data: now,
        usuario: "Usuário",
      }];
    }
  };

  const detectChanges = () => {
    const changes = {};
    if (descricao !== (record?.descricao || "")) changes.descricao = { old: record?.descricao || "", new: descricao };
    if (parseCurrency(valor) !== (record?.valor || 0)) changes.valor = { old: record?.valor || 0, new: parseCurrency(valor) };
    if (categoria !== (record?.categoria || "")) changes.categoria = { old: record?.categoria || "", new: categoria };
    if (new Date(data).toISOString() !== new Date(record?.data || new Date()).toISOString()) changes.data = { old: record?.data || new Date(), new: data };
    return changes;
  };

  const handleSave = async () => {
    if (!descricao.trim() || !valor.trim() || isNaN(parseCurrency(valor)) || !categoria) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios corretamente.");
      return;
    }

    setLoading(true);

    const changes = detectChanges();
    const historico = generateHistoryEntry(!isEditing, changes);

    const transaction = {
      id: record?.id || Date.now().toString(),
      tipo,
      descricao: descricao.trim(),
      valor: parseCurrency(valor),
      categoria,
      data: data.toISOString(),
      historico,
      criadoEm: isEditing ? record.criadoEm : new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let transactions = stored ? JSON.parse(stored) : [];
      
      if (isEditing) {
        transactions = transactions.map(t => t.id === record.id ? transaction : t);
      } else {
        transactions.push(transaction);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      Alert.alert("Sucesso", `Transação ${isEditing ? 'atualizada' : 'adicionada'} com sucesso!`);
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", "Falha ao salvar a transação.");
    } finally {
      setLoading(false);
    }
  };

  const handleValorChange = (text) => {
    setValor(formatCurrency(text));
  };

  const handleDateConfirm = (params) => {
    setShowDatePicker(false);
    if (params.date) {
      setData(params.date);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#5D2A0A" />
        <Text style={styles.loadingText}>Salvando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          {isEditing ? "Editar Transação" : "Nova Transação"}
        </Text>
      </View>

      <Text style={styles.label}>Tipo de Transação</Text>
      <View style={styles.tipoContainer}>
        <TouchableOpacity
          style={[styles.tipoButton, tipo === "receita" && styles.tipoReceitaActive]}
          onPress={() => {
            setTipo("receita");
            setCategoria("");
          }}
          disabled={isEditing}
        >
          <MaterialCommunityIcons
            name="cash-plus"
            size={24}
            color={tipo === "receita" ? "#fff" : "#2E7D32"}
          />
          <Text style={[styles.tipoText, tipo === "receita" && styles.tipoTextActive]}>
            Receita
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tipoButton, tipo === "despesa" && styles.tipoDespesaActive]}
          onPress={() => {
            setTipo("despesa");
            setCategoria("");
          }}
          disabled={isEditing}
        >
          <MaterialCommunityIcons
            name="cash-minus"
            size={24}
            color={tipo === "despesa" ? "#fff" : "#C62828"}
          />
          <Text style={[styles.tipoText, tipo === "despesa" && styles.tipoTextActive]}>
            Despesa
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        placeholder="Informe a descrição"
        placeholderTextColor="#999"
        value={descricao}
        onChangeText={setDescricao}
        editable={!loading}
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        placeholder="0,00"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={valor}
        onChangeText={handleValorChange}
        editable={!loading}
      />

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoria}
          onValueChange={setCategoria}
          style={styles.picker}
          enabled={!loading}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {categorias[tipo].map((cat, idx) => (
            <Picker.Item key={idx} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Data</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <View style={styles.dateButton}>
          <MaterialCommunityIcons name="calendar" size={20} color="#7D4A2A" />
          <Text style={styles.dateButtonText}>
            {formatDate(data) || "Selecione a data"}
          </Text>
        </View>
      </TouchableOpacity>

      <DatePickerModal
        locale={Localization.locale || "pt-BR"}
        mode="single"
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        date={data}
        onConfirm={handleDateConfirm}
        label="Selecione a data"
        saveLabel="Confirmar"
        uppercase={false}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, tipo === "receita" ? styles.saveButtonReceita : styles.saveButtonDespesa]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    backgroundColor: "#5D2A0A",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: Platform.OS === "ios" ? 40 : 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  label: {
    marginBottom: 8,
    color: "#404040",
    fontSize: 15,
    fontWeight: "bold",
  },
  input: {
    height: 42,
    backgroundColor: "#FFF",
    borderBottomWidth: 1.5,
    borderColor: "#7D4A2A",
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 15,
    marginVertical: 5,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderRadius: 6,
    borderColor: "#7D4A2A",
    borderWidth: 1.5,
    marginBottom: 15,
  },
  picker: {
    height: 42,
    color: "#333",
  },
  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tipoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
    marginHorizontal: 5,
  },
  tipoReceitaActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  tipoDespesaActive: {
    backgroundColor: "#C62828",
    borderColor: "#C62828",
  },
  tipoText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#333",
  },
  tipoTextActive: {
    color: "#FFF",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 42,
    backgroundColor: "#FFF",
    borderBottomWidth: 1.5,
    borderColor: "#7D4A2A",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  dateButtonText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  saveButtonReceita: {
    backgroundColor: "#2E7D32",
  },
  saveButtonDespesa: {
    backgroundColor: "#2E7D32",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#C62828",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});