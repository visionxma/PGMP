//C:\PROJETOS\PGMP\src\utils\dateHelpers.js

/**
 * Formata data para DD/MM/AAAA
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

/**
 * Formata hora para HH:MM
 */
export const formatTime = (date) => {
  const d = new Date(date);
  const hora = String(d.getHours()).padStart(2, '0');
  const minuto = String(d.getMinutes()).padStart(2, '0');
  return `${hora}:${minuto}`;
};

/**
 * Converte string DD/MM/AAAA HH:MM para Date
 */
export const parseDateTime = (dataStr, horaStr) => {
  const [dia, mes, ano] = dataStr.split('/').map(Number);
  const [hora, minuto] = horaStr.split(':').map(Number);
  return new Date(ano, mes - 1, dia, hora, minuto);
};

/**
 * Valida formato de data DD/MM/AAAA
 */
export const isValidDate = (dateStr) => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(regex);
  
  if (!match) return false;
  
  const dia = parseInt(match[1]);
  const mes = parseInt(match[2]);
  const ano = parseInt(match[3]);
  
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (ano < 2000 || ano > 2100) return false;
  
  const date = new Date(ano, mes - 1, dia);
  return date.getDate() === dia && 
         date.getMonth() === mes - 1 && 
         date.getFullYear() === ano;
};

/**
 * Valida formato de hora HH:MM
 */
export const isValidTime = (timeStr) => {
  const regex = /^(\d{2}):(\d{2})$/;
  const match = timeStr.match(regex);
  
  if (!match) return false;
  
  const hora = parseInt(match[1]);
  const minuto = parseInt(match[2]);
  
  return hora >= 0 && hora <= 23 && minuto >= 0 && minuto <= 59;
};

/**
 * Verifica se data/hora é futura
 */
export const isFutureDateTime = (dataStr, horaStr) => {
  if (!isValidDate(dataStr) || !isValidTime(horaStr)) return false;
  
  const dateTime = parseDateTime(dataStr, horaStr);
  return dateTime > new Date();
};

/**
 * Calcula diferença em minutos entre duas datas
 */
export const getMinutesDiff = (date1, date2) => {
  const diff = Math.abs(date1 - date2);
  return Math.floor(diff / (1000 * 60));
};

/**
 * Retorna data/hora atual formatada
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  return {
    data: formatDate(now),
    hora: formatTime(now),
    dateTime: now
  };
};

/**
 * Adiciona minutos a uma data
 */
export const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

/**
 * Formata data relativa (hoje, amanhã, etc)
 */
export const getRelativeDate = (dateStr) => {
  if (!isValidDate(dateStr)) return dateStr;
  
  const date = parseDateTime(dateStr, '00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.getTime() === today.getTime()) return 'Hoje';
  if (date.getTime() === tomorrow.getTime()) return 'Amanhã';
  if (date.getTime() === yesterday.getTime()) return 'Ontem';
  
  return dateStr;
};

/**
 * Formata duração em texto legível
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }
  const days = Math.floor(minutes / 1440);
  return `${days} dia${days > 1 ? 's' : ''}`;
};

/**
 * Auto-formata input de data enquanto usuário digita
 */
export const autoFormatDate = (text) => {
  // Remove caracteres não numéricos
  const numbers = text.replace(/[^\d]/g, '');
  
  // Adiciona barras automaticamente
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
};

/**
 * Auto-formata input de hora enquanto usuário digita
 */
export const autoFormatTime = (text) => {
  // Remove caracteres não numéricos
  const numbers = text.replace(/[^\d]/g, '');
  
  // Adiciona dois pontos automaticamente
  if (numbers.length <= 2) return numbers;
  return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
};

/**
 * Valida e corrige data
 */
export const validateAndCorrectDate = (dataStr) => {
  if (!dataStr) return { valid: false, corrected: '' };
  
  const numbers = dataStr.replace(/[^\d]/g, '');
  if (numbers.length !== 8) return { valid: false, corrected: dataStr };
  
  let dia = parseInt(numbers.slice(0, 2));
  let mes = parseInt(numbers.slice(2, 4));
  const ano = parseInt(numbers.slice(4, 8));
  
  // Corrigir mês
  if (mes > 12) mes = 12;
  if (mes < 1) mes = 1;
  
  // Corrigir dia baseado no mês
  const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Verificar ano bissexto
  if ((ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0) {
    diasPorMes[1] = 29;
  }
  
  const maxDias = diasPorMes[mes - 1];
  if (dia > maxDias) dia = maxDias;
  if (dia < 1) dia = 1;
  
  const corrected = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
  
  return {
    valid: isValidDate(corrected),
    corrected,
    original: dataStr
  };
};

/**
 * Valida e corrige hora
 */
export const validateAndCorrectTime = (horaStr) => {
  if (!horaStr) return { valid: false, corrected: '' };
  
  const numbers = horaStr.replace(/[^\d]/g, '');
  if (numbers.length !== 4) return { valid: false, corrected: horaStr };
  
  let hora = parseInt(numbers.slice(0, 2));
  let minuto = parseInt(numbers.slice(2, 4));
  
  if (hora > 23) hora = 23;
  if (hora < 0) hora = 0;
  if (minuto > 59) minuto = 59;
  if (minuto < 0) minuto = 0;
  
  const corrected = `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`;
  
  return {
    valid: isValidTime(corrected),
    corrected,
    original: horaStr
  };
};

/**
 * Gera opções de horários para picker
 */
export const generateTimeOptions = (interval = 30) => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const hora = String(h).padStart(2, '0');
      const minuto = String(m).padStart(2, '0');
      options.push(`${hora}:${minuto}`);
    }
  }
  return options;
};

/**
 * Calcula tempo restante até data/hora
 */
export const getTimeRemaining = (dataStr, horaStr) => {
  if (!isValidDate(dataStr) || !isValidTime(horaStr)) {
    return { expired: true, text: 'Data inválida' };
  }
  
  const targetDate = parseDateTime(dataStr, horaStr);
  const now = new Date();
  const diff = targetDate - now;
  
  if (diff <= 0) {
    return { expired: true, text: 'Vencida' };
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return { expired: false, text: `${days}d` };
  if (hours > 0) return { expired: false, text: `${hours}h` };
  return { expired: false, text: `${minutes}min` };
};

export default {
  formatDate,
  formatTime,
  parseDateTime,
  isValidDate,
  isValidTime,
  isFutureDateTime,
  getMinutesDiff,
  getCurrentDateTime,
  addMinutes,
  getRelativeDate,
  formatDuration,
  autoFormatDate,
  autoFormatTime,
  validateAndCorrectDate,
  validateAndCorrectTime,
  generateTimeOptions,
  getTimeRemaining,
};