'use client';

import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import React, { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState, useEffect } from "react";
import { auth } from "../config";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface AUTHCONTEXT_PROPS {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  mail: string;
  setMail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoggedIn: boolean;
  currentUser: User | null;
}

export const AuthContext = createContext<AUTHCONTEXT_PROPS | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("El contexto de autenticación debe ser utilizado por componentes que se encuentren dentro de él");
  return context;
};

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();

  const [mail, setMail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    Swal.fire({
      icon: "info",
      title: "Sesión cerrada",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mail && password) {
      try {
        await login(mail, password);
        Swal.fire({
          icon: "success",
          title: "Inicio de sesión exitoso",
          showConfirmButton: false,
          timer: 1500,
        });
        router.push("/");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Credenciales incorrectas",
        });
      }
    } else {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, complete todos los campos.",
      });
    }
  };

  const contextvalues: AUTHCONTEXT_PROPS = {
    login,
    logout,
    mail,
    setMail,
    password,
    setPassword,
    handleSubmit,
    isLoggedIn,
    currentUser,
  };

  return <AuthContext.Provider value={contextvalues}>{children}</AuthContext.Provider>;
};
