import React, { createContext, useEffect, useState, type JSX } from "react";

import { useNavigate } from "react-router-dom";

import { api } from "../services/api";
import { useAuth } from "./useAuth";

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
  getUser: () => User | null;
  updateUser: (data: User) => void;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      return JSON.parse(storedUser);
    }

    return null;
  });

  const login = async (email: string, password: string) => {
    const response = await api.post("/users/login", {
      email,
      password,
    });

    const { access_token } = response.data;

    localStorage.setItem("access_token", access_token);

    const userResponse = await api.get("/users/me");

    localStorage.setItem("user", JSON.stringify(userResponse.data));

    setUser(userResponse.data);

    navigate("/");
  };

  const register = async (data: any) => {
    await api.post("/users", data);

    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/");
  };

  const getUser = () => {
    return user;
  };

  const updateUser = (data: User) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

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

export function RequireOng({ children }: { children: JSX.Element }) {
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