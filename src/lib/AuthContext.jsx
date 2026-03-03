import React, { createContext, useState, useContext } from 'react';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Treat the user as always authenticated locally and bypass Base44.
  const [user] = useState({
    id: 'local-user',
    name: 'Local User',
  });
  const [isAuthenticated] = useState(true);
  const [isLoadingAuth] = useState(false);
  const [isLoadingPublicSettings] = useState(false);
  const [authError] = useState(null);
  const [appPublicSettings] = useState({
    id: appParams.appId,
    public_settings: {},
  }); // Mimic the shape expected elsewhere

  // No-op implementations so existing callers don’t break.
  const logout = () => {};
  const navigateToLogin = () => {};
  const checkAppState = () => {};

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
