//C:\PROJETOS\PGMP\src\components\ThemeToggleButton.js

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';

export const ThemeToggleButton = ({ size = 24, style }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getColors(isDarkMode);

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.surface }, style]}
      onPress={toggleTheme}
    >
      <Ionicons
        name={isDarkMode ? 'sunny' : 'moon'}
        size={size}
        color={colors.text}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});