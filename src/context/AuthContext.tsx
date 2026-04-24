import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { setCurrentUserId } from "@/lib/storage";

interface AuthUser {
  id: string;
  email: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthLoading: boolean;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ needsEmailVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const syncUserId = useCallback((nextUser: AuthUser | null) => {
    setCurrentUserId(nextUser?.id ?? null);
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsAuthLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          // Silently handle error - no console log
          setUser(null);
          syncUserId(null);
        } else if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email ?? null,
          };
          setUser(authUser);
          syncUserId(authUser);
        } else {
          setUser(null);
          syncUserId(null);
        }
      } catch (error) {
        // Silently handle error - no console log
        setUser(null);
        syncUserId(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email ?? null,
        };
        setUser(authUser);
        syncUserId(authUser);
      } else {
        setUser(null);
        syncUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUserId]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        throw error;
      }

      return { needsEmailVerification: !data.session };
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const redirectTo = `${window.location.origin}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


