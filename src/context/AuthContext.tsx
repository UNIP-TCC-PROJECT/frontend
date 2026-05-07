import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type JSX,
} from "react";

import { useNavigate } from "react-router-dom";

import { api } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
  getUser: () => User | null;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password });

    localStorage.setItem("user", JSON.stringify(response.data));

    setUser(response.data);

    navigate("/");
  };

  const register = async (data: any) => {
    await api.post("/users", data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem("user");

    setUser(null);

    navigate("/");
  };

  const getUser = () => {
    return user;
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoggedIn, getUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isLoggedIn } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
}
