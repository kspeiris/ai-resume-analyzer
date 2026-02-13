import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

import { db, storage } from '../firebase/config';

// Helper to convert File to Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Upload resume file and metadata
export const uploadResume = async (userId, file, extractedText) => {
  try {
    if (!userId) throw new Error('User ID is required for upload');
    if (!file) throw new Error('File is required for upload');

    console.log(`Starting Firestore-based resume upload for user: ${userId}`);

    const base64File = await fileToBase64(file);
    console.log('File converted successfully.');

    // Create resume document in Firestore
    console.log('Creating resume document in Firestore...');
    const resumeData = {
      userId,
      fileName: file.name,
      fileData: base64File, // Store the actual file content here
      fileType: file.type,
      fileSize: file.size,
      extractedText: extractedText || 'No text extracted',
      uploadedAt: Timestamp.now(),
      isActive: true,
      analysesCount: 0,
      metadata: {
        wordCount: extractedText ? extractedText.split(/\s+/).length : 0,
        characterCount: extractedText ? extractedText.length : 0,
        lastAnalyzed: null,
      },
    };

    const docRef = await addDoc(collection(db, 'resumes'), resumeData);
    console.log('Resume document created in Firestore:', docRef.id);

    // Update user's resume count
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        totalResumes: increment(1),
        lastResumeUpload: Timestamp.now(),
      },
      { merge: true }
    );

    return {
      id: docRef.id,
      ...resumeData,
    };
  } catch (error) {
    console.error('Fatal error in uploadResume:', error);
    throw new Error('Failed to save resume: ' + error.message);
  }
};

// Get all resumes for a user
export const getUserResumes = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'resumes'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('uploadedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const resumes = [];

    querySnapshot.forEach((doc) => {
      resumes.push({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
      });
    });

    return resumes;
  } catch (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
};

// Get single resume by ID
export const getResumeById = async (resumeId) => {
  try {
    const docRef = doc(db, 'resumes', resumeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        uploadedAt: docSnap.data().uploadedAt?.toDate(),
      };
    } else {
      throw new Error('Resume not found');
    }
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

// Delete resume
export const deleteResume = async (resumeId, userId) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'resumes', resumeId));

    // Update user count
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalResumes: increment(-1),
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

// Update resume metadata
export const updateResume = async (resumeId, updates) => {
  try {
    const docRef = doc(db, 'resumes', resumeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating resume:', error);
    throw error;
  }
};

// Get latest resume
export const getLatestResume = async (userId) => {
  try {
    const resumes = await getUserResumes(userId, 1);
    return resumes[0] || null;
  } catch (error) {
    console.error('Error fetching latest resume:', error);
    throw error;
  }
};
