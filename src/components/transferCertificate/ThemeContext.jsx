import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';
import { C, C_LIGHT } from './constants';

export const TCThemeContext = createContext(C);

export function TCThemeProvider({ children }) {
  const isDarkMode = useSelector((state) => state.appConfig?.isDarkMode ?? true);
  const themeC = isDarkMode ? C : C_LIGHT;
  return (
    <TCThemeContext.Provider value={themeC}>
      {children}
    </TCThemeContext.Provider>
  );
}

export function useTCTheme() {
  return useContext(TCThemeContext);
}
