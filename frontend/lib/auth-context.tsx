"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { LoginModal } from "@/components/LoginModal";

const supabase = createClient();

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  openLoginModal: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  openLoginModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && modalOpen) Promise.resolve().then(() => setModalOpen(false));
  }, [session, modalOpen]);

  return (
    <AuthContext.Provider value={{ session, loading, openLoginModal: () => setModalOpen(true) }}>
      {children}
      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}