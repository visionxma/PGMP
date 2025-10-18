//C:\PROJETOS\PGMP\src\components\ThemedText.js

import { Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';

export const ThemedText = ({ style, children, type = 'default', ...props }) => {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const getTextColor = () => {
    switch (type) {
      case 'secondary':
        return colors.textSecondary;
      case 'primary':
        return colors.primary;
      default:
        return colors.text;
    }
  };

  return (
    <Text
      style={[
        { color: getTextColor() },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};