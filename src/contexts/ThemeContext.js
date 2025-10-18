//C:\PROJETOS\PGMP\src\contexts\ThemeContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Função para obter as cores baseadas no tema
export const getColors = (isDarkMode) => ({
  background: isDarkMode ? '#121212' : '#ffffff',
  surface: isDarkMode ? '#1e1e1e' : '#f5f5f5',
  text: isDarkMode ? '#ffffff' : '#000000',
  placeholder: isDarkMode ? '#888888' : '#666666',
  primary: isDarkMode ? '#bb86fc' : '#6200ee',
  error: '#cf6679',
  border: isDarkMode ? '#333333' : '#e0e0e0',
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    isLoading,
    colors: getColors(isDarkMode), // Adicionado as cores no contexto
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};