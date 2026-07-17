import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login as loginAction, logout as logoutAction } from '@/redux/slices/authSlice';
import type { User, UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // const login = useCallback(async (email: string, password: string, expectedRole?: UserRole) => {
  //   try {
  //     await dispatch(loginAction({ email, password, expectedRole: expectedRole || 'client' })).unwrap();
  //   } catch (error) {
  //     throw new Error(error instanceof Error ? error.message : 'Login failed');
  //   }
  // }, [dispatch]);

  const login = useCallback(async (email: string, password: string) => {
  try {
    const result = await dispatch(loginAction({email, password})).unwrap();
    return result.user; // caller ko real role milega
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
}, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutAction()).unwrap();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Logout failed');
    }
  }, [dispatch]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading: loading,
      login,
      logout,
    }),
    [user, isAuthenticated, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
