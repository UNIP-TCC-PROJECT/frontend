import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type JSX,
} from "react";

import { useNavigate } from "react-router-dom";

import { api, TOKEN_KEY } from "../services/api";

export interface User {
  id: number;
  name: string;
  email: string;
  type: "ONG" | "DOADOR";
  phone?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  description?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  website?: string | null;
  pixKey?: string | null;
  category?: string | null;
  profileImage?: string | null;
  createdAt: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
  getUser: () => User | null;
  updateUser: (partial: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const USER_KEY = "user";

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

function lerUsuarioSalvo(): User | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const salvo = localStorage.getItem(USER_KEY);
    return token && salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  // Já nasce preenchido: evita o RequireAuth te jogar para /auth no F5
  const [user, setUser] = useState<User | null>(lerUsuarioSalvo);

  // Atualiza o estado E o localStorage juntos
  const salvarUsuario = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  };

  // Busca o usuário atual no backend (traz a profileImage do banco)
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    try {
      const { data } = await api.get<User>("/users/me");
      setUser(data);
      localStorage.setItem(USER_KEY, JSON.stringify(data));
    } catch (err: any) {
      // Só desloga se o token for inválido/expirado
      if (err?.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      }
    }
  }, []);

  // No F5: sincroniza com o banco (é isso que faz a foto voltar)
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const updateUser = (partial: Partial<User>) => {
    if (!user) return;
    salvarUsuario({ ...user, ...partial });
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password });
    const { access_token } = response.data;

    localStorage.setItem(TOKEN_KEY, access_token);

    const userResponse = await api.get<User>("/users/me");
    salvarUsuario(userResponse.data);

    navigate("/");
  };

  const register = async (data: any) => {
    await api.post("/users", data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    navigate("/");
  };

  const getUser = () => user;

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoggedIn,
        getUser,
        updateUser,
        refreshUser,
      }}
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