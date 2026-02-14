/**
 * @fileoverview Authentication context for managing Firebase Auth state and local fallback profiles.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import toast from 'react-hot-toast';

import { auth } from '../firebase/config';

const AuthContext = createContext();

/**
 * Custom hook to access AuthContext
 */
export function useAuth() {
  return useContext(AuthContext);
}

const LOCAL_PROFILES_KEY = 'resume_analyzer_local_profiles_v1';

/**
 * Retrieves a user profile from local storage
 * @param {string} uid - User identifier
 * @returns {Object|null}
 */
const getLocalProfile = (uid) => {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    const profiles = raw ? JSON.parse(raw) : {};
    return profiles[uid] || null;
  } catch (error) {
    console.warn('Failed to parse local profiles:', error);
    return null;
  }
};

/**
 * Persists a user profile to local storage as fallback
 * @param {string} uid
 * @param {Object} profile
 */
const saveLocalProfile = (uid, profile) => {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    const profiles = raw ? JSON.parse(raw) : {};
    profiles[uid] = profile;
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.warn('Failed to save local profile:', error);
  }
};

/**
 * Provider component for global authentication state
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Register a new user and initialize their profile
   */
  async function signup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const profileData = {
        name,
        email,
        createdAt: new Date().toISOString(),
        analysesCount: 0,
        subscription: 'free',
        resumeLimit: 5,
        settings: {
          emailNotifications: true,
          darkMode: false,
        },
      };

      saveLocalProfile(userCredential.user.uid, profileData);
      setUserProfile(profileData);

      toast.success('Account created successfully!');
      return userCredential;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  /**
   * Log in an existing user
   */
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      return userCredential;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = getLocalProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        } else {
          // Fallback if profile doesn't exist locally
          const fallbackProfile = {
            name: user.displayName || 'User',
            email: user.email,
            createdAt: new Date().toISOString(),
          };
          setUserProfile(fallbackProfile);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
