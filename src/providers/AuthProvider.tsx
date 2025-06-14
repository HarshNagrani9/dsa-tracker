
"use client";

import * as React from 'react';
import { auth } from '@/lib/firebase/config';
import { 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type User 
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import type { SignUpFormInput, SignInFormInput } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signUpWithEmail: (data: SignUpFormInput) => Promise<User | null>;
  signInWithEmail: (data: SignInFormInput) => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("AuthProvider: onAuthStateChanged - currentUser:", currentUser ? currentUser.uid : 'null');
      if (currentUser) {
        console.log("AuthProvider: Current user email:", currentUser.email);
        console.log("AuthProvider: Current user displayName (might be null for email/pass):", currentUser.displayName);
        console.log("AuthProvider: Current user photoURL (might be null for email/pass):", currentUser.photoURL);
        console.log("AuthProvider: Current user UID:", currentUser.uid);
      }
      setUser(currentUser);
      setLoading(false);
    }, (authError) => {
      console.error("Auth state change error:", authError);
      setError(authError);
      setLoading(false);
      toast({
        title: "Authentication Error",
        description: authError.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const signUpWithEmail = async (data: SignUpFormInput): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      console.log("AuthProvider: signUpWithEmail - success:", userCredential.user.uid);
      // onAuthStateChanged will handle setting the user
      toast({
        title: "Account Created",
        description: "Successfully signed up!",
      });
      return userCredential.user;
    } catch (e) {
      console.error("Sign-Up Error:", e);
      const signUpError = e instanceof Error ? e : new Error("Unknown sign-up error");
      setError(signUpError);
      toast({
        title: "Sign-Up Failed",
        description: signUpError.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      // setLoading(false); // onAuthStateChanged handles final loading state
    }
  };

  const signInWithEmail = async (data: SignInFormInput): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log("AuthProvider: signInWithEmail - success:", userCredential.user.uid);
      // onAuthStateChanged will handle setting the user
      toast({
        title: "Signed In",
        description: "Successfully signed in.",
      });
      return userCredential.user;
    } catch (e) {
      console.error("Sign-In Error:", e);
      const signInError = e instanceof Error ? e : new Error("Unknown sign-in error");
      setError(signInError);
      toast({
        title: "Sign-In Failed",
        description: signInError.message || "Could not sign in. Please check your credentials.",
        variant: "destructive",
      });
      return null;
    } finally {
      // setLoading(false); // onAuthStateChanged handles final loading state
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting user to null
      toast({
        title: "Signed Out",
        description: "Successfully signed out.",
      });
    } catch (e) {
      console.error("Sign-Out Error:", e);
      const signOutError = e instanceof Error ? e : new Error("Unknown sign-out error");
      setError(signOutError);
      toast({
        title: "Sign-Out Failed",
        description: signOutError.message || "Could not sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      // setLoading(false); // onAuthStateChanged handles final loading state
    }
  };

  const value = { user, loading, error, signUpWithEmail, signInWithEmail, signOutUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
