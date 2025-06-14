
"use client";

import * as React from 'react';
import { auth } from '@/lib/firebase/config';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  type User 
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
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
      console.log("AuthProvider: onAuthStateChanged - currentUser:", currentUser);
      if (currentUser) {
        console.log("AuthProvider: Current user email:", currentUser.email);
        console.log("AuthProvider: Current user displayName:", currentUser.displayName);
        console.log("AuthProvider: Current user photoURL:", currentUser.photoURL);
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

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // provider.addScope('profile'); // Usually not needed, Firebase handles default scopes
      // provider.addScope('email');   // Usually not needed
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user
      console.log("AuthProvider: signInWithGoogle - auth.currentUser after popup:", auth.currentUser);
      if (auth.currentUser) {
          console.log("AuthProvider: signInWithGoogle - auth.currentUser email:", auth.currentUser.email);
      }
      toast({
        title: "Signed In",
        description: "Successfully signed in with Google.",
      });
    } catch (e) {
      console.error("Google Sign-In Error:", e);
      const signInError = e instanceof Error ? e : new Error("Unknown sign-in error");
      setError(signInError);
      toast({
        title: "Sign-In Failed",
        description: signInError.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
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

  const value = { user, loading, error, signInWithGoogle, signOutUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
