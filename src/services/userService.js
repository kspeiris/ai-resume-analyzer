import {
  updateEmail,
  updatePassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';

import { db, auth } from '../firebase/config';

/**
 * Local storage keys for hybrid persistence
 */
const LOCAL_ANALYSES_KEY = 'resume_analyzer_local_analyses_v1';
const LOCAL_RESUMES_KEY = 'resume_analyzer_local_resumes_v1';
const LOCAL_PROFILES_KEY = 'resume_analyzer_local_profiles_v1';

/**
 * Utility to safe-read JSON from localStorage
 * @param {string} key - Storage key
 * @param {*} fallback - Default value if key is missing or invalid
 */
const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Computes user performance metrics from local records
 * @param {string} userId
 */
const getLocalUserStats = (userId) => {
  const profiles = readJson(LOCAL_PROFILES_KEY, {});
  const profile = profiles[userId] || {};
  const analyses = readJson(LOCAL_ANALYSES_KEY, []).filter((a) => a.userId === userId);
  const resumes = readJson(LOCAL_RESUMES_KEY, []).filter((r) => r.userId === userId);

  const scores = analyses.map((a) => a.scores?.overall || 0);
  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

  let improvementRate = 0;
  if (scores.length >= 2) {
    const latest = scores[0];
    const previous = scores[1];
    improvementRate = previous ? Math.round(((latest - previous) / previous) * 100) : 0;
  }

  const scoreHistory = analyses
    .slice(0, 10)
    .map((a) => ({
      date: new Date(a.createdAt).toLocaleDateString(),
      score: a.scores?.overall || 0,
    }))
    .reverse();

  const resumeLimit = profile.resumeLimit || 5;

  return {
    totalAnalyses: analyses.length,
    totalResumes: resumes.length,
    averageScore,
    improvementRate,
    scoreHistory,
    subscription: profile.subscription || 'free',
    resumeLimit,
    remainingAnalyses: Math.max(0, resumeLimit - analyses.length),
  };
};

/**
 * Fetches or initializes user profile data from Firestore
 * @param {string} userId - Auth UID
 */
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        lastLogin: docSnap.data().lastLogin?.toDate(),
      };
    } else {
      const user = auth.currentUser;
      const newProfile = {
        name: user.displayName || '',
        email: user.email,
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        analysesCount: 0,
        totalResumes: 0,
        subscription: 'free',
        resumeLimit: 5,
        settings: {
          emailNotifications: true,
          darkMode: false,
          language: 'en',
          autoSave: true,
        },
        stats: {
          totalAnalyses: 0,
          averageScore: 0,
          improvementRate: 0,
        },
      };

      await setDoc(docRef, newProfile);
      return { id: userId, ...newProfile };
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Updates Firestore profile and synchronizes with Firebase Auth
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    if (updates.name) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name,
      });
    }

    if (updates.email && updates.email !== auth.currentUser.email) {
      await updateEmail(auth.currentUser, updates.email);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Persists user preference settings to Firestore
 */
export const updateUserSettings = async (userId, settings) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      settings,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

/**
 * Updates current user's password in Firebase Auth
 */
export const changePassword = async (newPassword) => {
  try {
    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Triggers a password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Aggregates user stats, prioritizing local data for performance
 * Falls back to Firestore if local data is insufficient
 */
export const getUserStats = async (userId) => {
  const localStats = getLocalUserStats(userId);

  try {
    if (localStats.totalAnalyses > 0) {
      return localStats;
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return localStats;
    }

    const userData = userSnap.data();

    return {
      totalAnalyses: userData.analysesCount || 0,
      totalResumes: userData.totalResumes || 0,
      averageScore: userData.stats?.averageScore || 0,
      improvementRate: userData.stats?.improvementRate || 0,
      scoreHistory: userData.stats?.scoreHistory || [],
      subscription: userData.subscription || 'free',
      resumeLimit: userData.resumeLimit || 5,
      remainingAnalyses: (userData.resumeLimit || 5) - (userData.analysesCount || 0),
    };
  } catch (error) {
    console.warn('Falling back to local stats:', error);
    return localStats;
  }
};

/**
 * Updates user performance trackers after a successful analysis
 * @param {string} userId
 * @param {number} score - Achieved ATS score
 */
export const updateUserAfterAnalysis = async (userId, score) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const totalAnalyses = (userData.analysesCount || 0) + 1;
      const currentAvg = userData.stats?.averageScore || 0;
      const newAvg = (currentAvg * (totalAnalyses - 1) + score) / totalAnalyses;

      await updateDoc(userRef, {
        analysesCount: increment(1),
        lastAnalysisDate: Timestamp.now(),
        'stats.totalAnalyses': increment(1),
        'stats.averageScore': Math.round(newAvg),
        'stats.lastScore': score,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

/**
 * Permanently removes user data from Firestore and deletes Auth account
 */
export const deleteUserAccount = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    await auth.currentUser.delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
