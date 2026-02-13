import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  increment,
} from 'firebase/firestore';
import {
  updateEmail,
  updatePassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { db, auth } from '../firebase/config';

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
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found');
    }

    const userData = userSnap.data();

    return {
      totalAnalyses: userData.analysesCount || 0,
      totalResumes: userData.totalResumes || 0,
      averageScore: userData.stats?.averageScore || 0,
      improvementRate: userData.stats?.improvementRate || 0,
      subscription: userData.subscription || 'free',
      resumeLimit: userData.resumeLimit || 5,
      remainingAnalyses: (userData.resumeLimit || 5) - (userData.analysesCount || 0),
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
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
