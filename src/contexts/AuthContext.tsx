import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";

interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  is_default: boolean;
  monthly_limit: number;
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  type: 'income' | 'expense';
  tags: string[];
  note: string;
  transaction_date: string;
  created_at: string;
  categories?: Category; // Joined data
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  categories: Category[];
  transactions: Transaction[];
  loading: boolean;
  refreshCategories: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const [profileRes, categoriesRes, transactionsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("categories").select("*").eq("user_id", userId).order('name'),
        supabase.from("transactions").select("*, categories(*)").eq("user_id", userId).order('transaction_date', { ascending: false })
      ]);
      
      if (!profileRes.error) setProfile(profileRes.data);
      if (!categoriesRes.error) setCategories(categoriesRes.data || []);
      if (!transactionsRes.error) setTransactions(transactionsRes.data || []);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const refreshCategories = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order('name');
    setCategories(data || []);
  };

  const refreshTransactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("transactions")
      .select("*, categories(*)")
      .eq("user_id", user.id)
      .order('transaction_date', { ascending: false });
    setTransactions(data || []);
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await refreshTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      throw err;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setCategories([]);
        setTransactions([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      profile, 
      categories, 
      transactions,
      loading, 
      refreshCategories,
      refreshTransactions,
      deleteTransaction,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
