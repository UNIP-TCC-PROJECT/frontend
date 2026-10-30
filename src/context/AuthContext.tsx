import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  type JSX,
} from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import { api, TOKEN_KEY } from "../services/api";
import { useAuth } from "./useAuth";

export interface User {
  id: number;
  name: string;
  email: string;
  type: string;
  status: string;
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
  createdAt?: string;

  // Mantém a compatibilidade com os demais campos do cadastro.
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string, otp?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
  getUser: () => User | null;
  updateUser: (partial: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const USER_KEY = "user";

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps,
);

function lerUsuarioSalvo(): User | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const salvo = localStorage.getItem(USER_KEY);

    return token && salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(lerUsuarioSalvo);

  const salvarUsuario = useCallback((usuario: User | null) => {
    setUser(usuario);

    if (usuario) {
      localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    try {
      const { data } = await api.get<User>("/users/me");
      salvarUsuario(data);
    } catch (error: unknown) {
      // Falhas de conexão não encerram a sessão.
      if (isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        salvarUsuario(null);
      }
    }
  }, [salvarUsuario]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const updateUser = (partial: Partial<User>) => {
    if (!user) return;

    salvarUsuario({ ...user, ...partial });
  };

  const login = async (email: string, password: string, otp?: string) => {
    const response = await api.post("/users/login", {
      email,
      password,
      ...(otp ? { otp } : {}),
    });

    const { access_token, mfa_setup_required } = response.data;

    localStorage.setItem(TOKEN_KEY, access_token);

    const userResponse = await api.get<User>("/users/me");
    salvarUsuario(userResponse.data);

    if (userResponse.data.type === "ADMIN") {
      // Administrador sem MFA ativo só pode concluir o enrolamento.
      navigate(mfa_setup_required ? "/admin/mfa" : "/admin");
    } else {
      navigate("/");
    }
  };

  const register = async (data: any) => {
    await api.post("/users", data);
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    salvarUsuario(null);
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

export function RequireAuth({
  children,
}: {
  children: JSX.Element;
}) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
}

export function RequireOng({
  children,
}: {
  children: JSX.Element;
}) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    } else if (user?.type !== "ONG") {
      navigate("/");
    }
  }, [isLoggedIn, user, navigate]);

  return isLoggedIn && user?.type === "ONG" ? children : null;
}

export function RequireDoador({
  children,
}: {
  children: JSX.Element;
}) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    } else if (user?.type !== "DOADOR" || user.status !== "ATIVO") {
      navigate("/");
    }
  }, [isLoggedIn, user, navigate]);

  return isLoggedIn && user?.type === "DOADOR" && user.status === "ATIVO"
    ? children
    : null;
}

export function RequireAdmin({
  children,
}: {
  children: JSX.Element;
}) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
    } else if (user?.type !== "ADMIN") {
      navigate("/");
    }
  }, [isLoggedIn, user, navigate]);

  return isLoggedIn && user?.type === "ADMIN" ? children : null;
}
