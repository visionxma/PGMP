//C:\PROJETOS\PGMP\src\constants\Themes.js

import { Colors } from './Colors';

export const lightTheme = {
  colors: Colors.light,
  statusBar: 'dark-content',
};

export const darkTheme = {
  colors: Colors.dark,
  statusBar: 'light-content',
};

export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};