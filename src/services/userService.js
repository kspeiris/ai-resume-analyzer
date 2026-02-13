import {
  updateEmail,
  updatePassword,
  updateProfile,
  sendEmailVerification,
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

const LOCAL_ANALYSES_KEY = 'resume_analyzer_local_analyses_v1';
const LOCAL_RESUMES_KEY = 'resume_analyzer_local_resumes_v1';
const LOCAL_PROFILES_KEY = 'resume_analyzer_local_profiles_v1';

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
};

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

// Get user profile
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
      // Create profile if doesn't exist
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

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    // Update Auth profile if name changed
    if (updates.name) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name,
      });
    }

    // Update Auth email if changed
    if (updates.email && updates.email !== auth.currentUser.email) {
      await updateEmail(auth.currentUser, updates.email);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update user settings
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

// Change password
export const changePassword = async (newPassword) => {
  try {
    await updatePassword(auth.currentUser, newPassword);
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Send verification email
export const sendVerificationEmail = async () => {
  try {
    await sendEmailVerification(auth.currentUser);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Get user statistics
export const getUserStats = async (userId) => {
  // Always try local stats first as it's faster and works offline/with CORS issues
  const localStats = getLocalUserStats(userId);

  try {
    // If we have some local analyses, we can optionally just return those
    // to keep the UI snappy. We only check Firestore if we want to sync.
    if (localStats.totalAnalyses > 0) {
      return localStats;
    }

    const userRef = doc(db, 'users', userId);
    // Add a simple timeout/protection would be better, but for now:
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

// Update user after analysis
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

// Delete user account
export const deleteUserAccount = async (userId) => {
  try {
    // Delete user document
    await deleteDoc(doc(db, 'users', userId));

    // Delete user auth
    await auth.currentUser.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
