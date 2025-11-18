// src/hooks/useAuth.ts

'use client';

import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence,
  AuthError 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Bruh, that email looks like a drunk toddler typed it. Try again.',
    'auth/user-disabled': 'Your account got yeeted. RIP.',
    'auth/user-not-found': 'Who dis? I don\'t know you. Create an account maybe?',
    'auth/wrong-password': 'Wrong password, genius. You forget it already? Classic you.',
    'auth/invalid-credential': 'Nah bro, those credentials are trash. Wrong email or password.',
    'auth/too-many-requests': 'Chill tf out! Too many failed attempts. Take a break, touch grass.',
    'auth/network-request-failed': 'Your internet is potato. Check your connection.',
    'auth/popup-closed-by-user': 'Why you close it? Make up your mind.',
    'auth/internal-error': 'Firebase is drunk. Not your fault this time.',
  };

  return errorMessages[errorCode] || 'Something broke. Congrats, you found a new way to fail.';
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Set persistence to LOCAL
      await setPersistence(auth, browserLocalPersistence);
      
      // Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Set cookie for middleware
      const token = await userCredential.user.getIdToken();
      document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Strict`;
      
      return userCredential.user;
    } catch (err) {
      const authError = err as AuthError;
      const errorMessage = getErrorMessage(authError.code);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

