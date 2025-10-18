//C:\PROJETOS\PGMP\src\screens\TarefasScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const STORAGE_KEY = "@tarefas_app";

// Configuração do comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function TarefasScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('todas'); // todas, pendentes, concluidas
  const [expoPushToken, setExpoPushToken] = useState('');
  
  // Estados do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('trabalho');
  const [prioridade, setPrioridade] = useState('media');
  const [dataVencimento, setDataVencimento] = useState('');
  const [horaVencimento, setHoraVencimento] = useState('');
  const [lembreteAtivo, setLembreteAtivo] = useState(true);
  const [antecedenciaLembrete, setAntecedenciaLembrete] = useState(30); // minutos

  // Estados para os pickers de data e hora
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const colors = {
    primary: '#5D2A0A',
    secondary: '#7D4A2A',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#2E2E2E',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#2E7D32',
    danger: '#C62828',
    warning: '#F57C00',
    info: '#1976D2',
    accent: '#FF9800'
  };

  const categorias = [
    { id: 'trabalho', label: 'Trabalho', icon: 'briefcase', color: colors.info },
    { id: 'pessoal', label: 'Pessoal', icon: 'account', color: colors.accent },
    { id: 'estudo', label: 'Estudo', icon: 'school', color: colors.success },
    { id: 'saude', label: 'Saúde', icon: 'heart-pulse', color: colors.danger },
    { id: 'financeiro', label: 'Financeiro', icon: 'cash', color: colors.warning },
  ];

  const prioridades = [
    { id: 'baixa', label: 'Baixa', color: colors.success },
    { id: 'media', label: 'Média', color: colors.warning },
    { id: 'alta', label: 'Alta', color: colors.danger },
  ];

  useEffect(() => {
    loadTasks();
    registerForPushNotificationsAsync();
    
    const unsubscribe = navigation.addListener('focus', loadTasks);
    
    // Listener para quando notificação é recebida (app aberto)
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
    });

    // Listener para quando usuário clica na notificação
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const taskId = response.notification.request.content.data.taskId;
      if (taskId) {
        // Aqui você pode navegar para detalhes da tarefa
        console.log('Tarefa clicada:', taskId);
      }
    });

    return () => {
      unsubscribe();
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [navigation]);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: colors.primary,
      });

      // Canal para tarefas de alta prioridade
      await Notifications.setNotificationChannelAsync('high-priority', {
        name: 'Tarefas Urgentes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: colors.danger,
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Você não receberá lembretes das suas tarefas. Ative as notificações nas configurações.'
        );
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
      console.log('Expo Push Token:', token);
    } else {
      Alert.alert('Aviso', 'Notificações push funcionam apenas em dispositivos físicos.');
    }

    return token;
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      Alert.alert("Erro", "Não foi possível carregar as tarefas.");
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error("Erro ao salvar tarefas:", error);
      Alert.alert("Erro", "Não foi possível salvar a tarefa.");
    }
  };

  // Funções para o Date Picker
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    setDataVencimento(`${dia}/${mes}/${ano}`);
    setSelectedDate(date);
    hideDatePicker();
  };

  // Funções para o Time Picker
  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirmTime = (time) => {
    const hora = String(time.getHours()).padStart(2, '0');
    const minuto = String(time.getMinutes()).padStart(2, '0');
    setHoraVencimento(`${hora}:${minuto}`);
    setSelectedTime(time);
    hideTimePicker();
  };

  const scheduleNotification = async (task) => {
    if (!task.dataVencimento || !task.horaVencimento || !task.lembreteAtivo) {
      return null;
    }

    try {
      // Converter data e hora para timestamp
      const [dia, mes, ano] = task.dataVencimento.split('/');
      const [hora, minuto] = task.horaVencimento.split(':');
      const dataHora = new Date(ano, mes - 1, dia, hora, minuto);
      
      // Subtrair antecedência
      const dataNotificacao = new Date(dataHora.getTime() - (task.antecedenciaLembrete * 60 * 1000));

      // Verificar se a data é futura
      if (dataNotificacao <= new Date()) {
        console.log('Data da notificação já passou');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${task.titulo}`,
          body: task.descricao || 'Você tem uma tarefa agendada',
          data: { taskId: task.id },
          sound: true,
          priority: task.prioridade === 'alta' ? 'high' : 'default',
          badge: 1,
        },
        trigger: {
          date: dataNotificacao,
          channelId: task.prioridade === 'alta' ? 'high-priority' : 'default',
        },
      });

      console.log('Notificação agendada:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      return null;
    }
  };

  const cancelNotification = async (notificationId) => {
    if (notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log('Notificação cancelada:', notificationId);
      } catch (error) {
        console.error('Erro ao cancelar notificação:', error);
      }
    }
  };

  const handleSaveTask = async () => {
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Digite um título para a tarefa');
      return;
    }

    const newTask = {
      id: editingTask?.id || Date.now().toString(),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      prioridade,
      dataVencimento,
      horaVencimento,
      lembreteAtivo,
      antecedenciaLembrete,
      concluida: editingTask?.concluida || false,
      dataCriacao: editingTask?.dataCriacao || new Date().toISOString(),
      notificationId: editingTask?.notificationId || null,
    };

    // Cancelar notificação antiga se existir
    if (editingTask?.notificationId) {
      await cancelNotification(editingTask.notificationId);
    }

    // Agendar nova notificação
    if (lembreteAtivo && dataVencimento && horaVencimento) {
      const notificationId = await scheduleNotification(newTask);
      newTask.notificationId = notificationId;
    }

    let updatedTasks;
    if (editingTask) {
      updatedTasks = tasks.map(t => t.id === editingTask.id ? newTask : t);
    } else {
      updatedTasks = [...tasks, newTask];
    }

    await saveTasks(updatedTasks);
    closeModal();
    Alert.alert('Sucesso', `Tarefa ${editingTask ? 'atualizada' : 'criada'} com sucesso!`);
  };

  const handleDeleteTask = async (task) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir a tarefa "${task.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await cancelNotification(task.notificationId);
            const updatedTasks = tasks.filter(t => t.id !== task.id);
            await saveTasks(updatedTasks);
          }
        }
      ]
    );
  };

  const toggleTaskComplete = async (task) => {
    const updatedTask = { ...task, concluida: !task.concluida };
    
    // Se concluir, cancelar notificação
    if (updatedTask.concluida && task.notificationId) {
      await cancelNotification(task.notificationId);
      updatedTask.notificationId = null;
    }
    // Se desconcluir, reagendar notificação
    else if (!updatedTask.concluida && task.lembreteAtivo) {
      const notificationId = await scheduleNotification(updatedTask);
      updatedTask.notificationId = notificationId;
    }

    const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
    await saveTasks(updatedTasks);
  };

  const openEditModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTitulo(task.titulo);
      setDescricao(task.descricao);
      setCategoria(task.categoria);
      setPrioridade(task.prioridade);
      setDataVencimento(task.dataVencimento);
      setHoraVencimento(task.horaVencimento);
      setLembreteAtivo(task.lembreteAtivo);
      setAntecedenciaLembrete(task.antecedenciaLembrete);
      
      // Converter strings de volta para Date se existirem
      if (task.dataVencimento) {
        const [dia, mes, ano] = task.dataVencimento.split('/');
        setSelectedDate(new Date(ano, mes - 1, dia));
      }
      if (task.horaVencimento) {
        const [hora, minuto] = task.horaVencimento.split(':');
        const timeDate = new Date();
        timeDate.setHours(parseInt(hora), parseInt(minuto));
        setSelectedTime(timeDate);
      }
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setTitulo('');
    setDescricao('');
    setCategoria('trabalho');
    setPrioridade('media');
    setDataVencimento('');
    setHoraVencimento('');
    setLembreteAtivo(true);
    setAntecedenciaLembrete(30);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pendentes') return !task.concluida;
    if (filter === 'concluidas') return task.concluida;
    return true;
  });

  const taskStats = {
    total: tasks.length,
    pendentes: tasks.filter(t => !t.concluida).length,
    concluidas: tasks.filter(t => t.concluida).length,
    vencidas: tasks.filter(t => {
      if (t.concluida || !t.dataVencimento) return false;
      const [dia, mes, ano] = t.dataVencimento.split('/');
      const dataVenc = new Date(ano, mes - 1, dia);
      return dataVenc < new Date();
    }).length,
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando tarefas...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="checkbox-marked-circle" size={25} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Tarefas</Text>
              <Text style={[styles.headerSubtitle, { color: colors.surface }]}>
                Gestão com Lembretes
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.surface }]}
            onPress={() => openEditModal()}
          >
            <MaterialIcons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="format-list-checks" size={24} color={colors.info} />
            <Text style={[styles.statValue, { color: colors.text }]}>{taskStats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="clock-alert" size={24} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.text }]}>{taskStats.pendentes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendentes</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>{taskStats.concluidas}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Concluídas</Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {['todas', 'pendentes', 'concluidas'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterButton,
                filter === f && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.filterButtonText,
                { color: filter === f ? colors.surface : colors.textSecondary }
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de Tarefas */}
        {filteredTasks.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma tarefa {filter === 'todas' ? '' : filter}
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => openEditModal()}
            >
              <Text style={[styles.emptyButtonText, { color: colors.surface }]}>
                Criar Primeira Tarefa
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const cat = categorias.find(c => c.id === task.categoria);
            const prior = prioridades.find(p => p.id === task.prioridade);
            
            return (
              <View
                key={task.id}
                style={[styles.taskCard, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderLeftColor: prior.color,
                  borderLeftWidth: 4,
                  opacity: task.concluida ? 0.6 : 1
                }]}
              >
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => toggleTaskComplete(task)}
                >
                  <MaterialCommunityIcons
                    name={task.concluida ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                    size={28}
                    color={task.concluida ? colors.success : colors.border}
                  />
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text style={[
                      styles.taskTitle,
                      { color: colors.text },
                      task.concluida && styles.taskTitleCompleted
                    ]}>
                      {task.titulo}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: cat.color + '20' }]}>
                      <MaterialCommunityIcons name={cat.icon} size={12} color={cat.color} />
                      <Text style={[styles.categoryText, { color: cat.color }]}>
                        {cat.label}
                      </Text>
                    </View>
                  </View>

                  {task.descricao ? (
                    <Text style={[styles.taskDescription, { color: colors.textSecondary }]}>
                      {task.descricao}
                    </Text>
                  ) : null}

                  <View style={styles.taskFooter}>
                    {task.dataVencimento && (
                      <View style={styles.taskInfo}>
                        <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
                        <Text style={[styles.taskInfoText, { color: colors.textSecondary }]}>
                          {task.dataVencimento} {task.horaVencimento}
                        </Text>
                      </View>
                    )}
                    
                    {task.lembreteAtivo && task.notificationId && (
                      <View style={styles.taskInfo}>
                        <MaterialCommunityIcons name="bell-ring" size={14} color={colors.accent} />
                        <Text style={[styles.taskInfoText, { color: colors.accent }]}>
                          Lembrete {task.antecedenciaLembrete}min antes
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.taskActions}>
                  <TouchableOpacity
                    style={[styles.taskActionButton, { backgroundColor: colors.info + '20' }]}
                    onPress={() => openEditModal(task)}
                  >
                    <MaterialIcons name="edit" size={18} color={colors.info} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.taskActionButton, { backgroundColor: colors.danger + '20' }]}
                    onPress={() => handleDeleteTask(task)}
                  >
                    <MaterialIcons name="delete" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Info sobre Push Token */}
        {expoPushToken && (
          <View style={[styles.infoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="information" size={16} color={colors.info} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Notificações ativas. Token: {expoPushToken.substring(0, 20)}...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Criar/Editar Tarefa */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Título *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Digite o título da tarefa"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={descricao}
                  onChangeText={setDescricao}
                  placeholder="Adicione detalhes (opcional)"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Categoria</Text>
                <View style={styles.optionsRow}>
                  {categorias.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.optionButton,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        categoria === cat.id && { backgroundColor: cat.color + '20', borderColor: cat.color }
                      ]}
                      onPress={() => setCategoria(cat.id)}
                    >
                      <MaterialCommunityIcons
                        name={cat.icon}
                        size={20}
                        color={categoria === cat.id ? cat.color : colors.textSecondary}
                      />
                      <Text style={[
                        styles.optionText,
                        { color: categoria === cat.id ? cat.color : colors.textSecondary }
                      ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Prioridade</Text>
                <View style={styles.optionsRow}>
                  {prioridades.map((prior) => (
                    <TouchableOpacity
                      key={prior.id}
                      style={[
                        styles.priorityButton,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        prioridade === prior.id && { backgroundColor: prior.color + '20', borderColor: prior.color }
                      ]}
                      onPress={() => setPrioridade(prior.id)}
                    >
                      <Text style={[
                        styles.priorityText,
                        { color: prioridade === prior.id ? prior.color : colors.textSecondary }
                      ]}>
                        {prior.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.dateTimeRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Data</Text>
                  <TouchableOpacity
                    style={[styles.datePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={showDatePicker}
                  >
                    <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                    <Text style={[styles.datePickerText, { color: dataVencimento ? colors.text : colors.textSecondary }]}>
                      {dataVencimento || 'Selecionar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Hora</Text>
                  <TouchableOpacity
                    style={[styles.datePickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={showTimePicker}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                    <Text style={[styles.datePickerText, { color: horaVencimento ? colors.text : colors.textSecondary }]}>
                      {horaVencimento || 'Selecionar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.switchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.switchLeft}>
                  <MaterialCommunityIcons name="bell-ring" size={20} color={colors.accent} />
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Ativar Lembrete</Text>
                </View>
                <Switch
                  value={lembreteAtivo}
                  onValueChange={setLembreteAtivo}
                  trackColor={{ false: colors.border, true: colors.accent + '40' }}
                  thumbColor={lembreteAtivo ? colors.accent : colors.textSecondary}
                />
              </View>

              {lembreteAtivo && (
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Avisar com antecedência (minutos)</Text>
                  <View style={styles.antecedenciaRow}>
                    {[15, 30, 60, 120].map((min) => (
                      <TouchableOpacity
                        key={min}
                        style={[
                          styles.antecedenciaButton,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          antecedenciaLembrete === min && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setAntecedenciaLembrete(min)}
                      >
                        <Text style={[
                          styles.antecedenciaText,
                          { color: antecedenciaLembrete === min ? colors.surface : colors.textSecondary }
                        ]}>
                          {min < 60 ? `${min}min` : `${min/60}h`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={closeModal}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveTask}
              >
                <Text style={[styles.modalButtonText, { color: colors.surface }]}>
                  {editingTask ? 'Atualizar' : 'Criar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        date={selectedDate}
        minimumDate={new Date()}
        locale="pt_BR"
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
        headerTextIOS="Escolha a data"
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={hideTimePicker}
        date={selectedTime}
        locale="pt_BR"
        is24Hour={true}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
        headerTextIOS="Escolha o horário"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  headerContainer: {
    backgroundColor: '#5D2A0A',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'flex-start',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  taskFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskInfoText: {
    fontSize: 11,
  },
  taskActions: {
    flexDirection: 'column',
    gap: 8,
    marginLeft: 8,
  },
  taskActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  textArea: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  datePickerText: {
    fontSize: 14,
    flex: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  antecedenciaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  antecedenciaButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  antecedenciaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});