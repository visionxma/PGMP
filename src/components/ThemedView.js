//C:\PROJETOS\PGMP\src\components\ThemedView.js

import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';

export const ThemedView = ({ style, children, ...props }) => {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  return (
    <View
      style={[
        { backgroundColor: colors.background },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};