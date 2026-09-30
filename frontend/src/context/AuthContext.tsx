import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import api from "../services/api";
import type { LoginResponse, User } from "../types";


interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}


const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );


interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [user, setUser] =
    useState<User | null>(() => {

      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      try {
        return JSON.parse(storedUser) as User;
      } catch {
        localStorage.removeItem("user");
        return null;
      }

    });


  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem("access_token")
    );


  const [isLoading, setIsLoading] =
    useState(true);


  /* ==========================================================
     GET CURRENT USER
  ========================================================== */

  const refreshUser = async () => {

    try {

      const response =
        await api.get<User>("/auth/me");

      const currentUser = response.data;

      setUser(currentUser);

      localStorage.setItem(
        "user",
        JSON.stringify(currentUser)
      );

    } catch {

      setUser(null);
      setToken(null);

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem("user");

    }

  };


  /* ==========================================================
     INITIAL AUTHENTICATION
  ========================================================== */

  useEffect(() => {

    const initializeAuth = async () => {

      const storedToken =
        localStorage.getItem(
          "access_token"
        );

      if (storedToken) {
        await refreshUser();
      }

      setIsLoading(false);

    };

    initializeAuth();

  }, []);


  /* ==========================================================
     LOGIN
  ========================================================== */

  const login = async (
    email: string,
    password: string
  ) => {

    const response =
      await api.post<LoginResponse>(
        "/auth/login",
        {
          email,
          password,
        }
      );


    const accessToken =
      response.data.access_token;


    localStorage.setItem(
      "access_token",
      accessToken
    );


    setToken(accessToken);


    /*
      Always request /auth/me after login.

      This guarantees that the frontend receives
      the complete user object including the role.
    */

    await refreshUser();

  };


  /* ==========================================================
     LOGOUT
  ========================================================== */

  const logout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated:
          Boolean(token && user),
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}


/* ============================================================
   AUTH HOOK
============================================================ */

export function useAuth(): AuthContextType {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );

  }

  return context;

}