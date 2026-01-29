import React, { createContext, useContext, useState } from "react";
import type { Id } from "../convex/_generated/dataModel";

interface User {
  userId: Id<"users">;
  firstName: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (userId: string, firstName: string, username: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children?: any }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userId: string, firstName: string, username: string, email: string) => {
    const userData: User = {
      userId: userId as Id<"users">,
      firstName,
      username,
      email,
    };
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, login, logout } },
    children
  );
}

export function useAuthState() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }
  return context;
}