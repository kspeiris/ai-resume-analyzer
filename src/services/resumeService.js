import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';

import { db } from '../firebase/config';

const LOCAL_RESUMES_KEY = 'resume_analyzer_local_resumes_v1';
const LOCAL_RESUME_LIMIT = 1;

const readLocalResumes = () => {
  try {
    const raw = localStorage.getItem(LOCAL_RESUMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Failed to parse local resumes:', error);
    return [];
  }
};

const writeLocalResumes = (resumes) => {
  localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(resumes));
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

// Upload resume file and metadata
export const uploadResume = async (userId, file, extractedText) => {
  try {
    if (!userId) throw new Error('User ID is required for upload');
    if (!file) throw new Error('File is required for upload');

    const base64Data = await fileToBase64(file);
    const nowIso = new Date().toISOString();
    const localResume = {
      id: `local_${Date.now()}`,
      userId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileData: base64Data,
      extractedText: extractedText || 'No text extracted',
      uploadedAt: nowIso,
      isActive: true,
      analysesCount: 0,
      metadata: {
        wordCount: extractedText ? extractedText.split(/\s+/).length : 0,
        characterCount: extractedText ? extractedText.length : 0,
        lastAnalyzed: null,
      },
    };

    const current = readLocalResumes().filter((resume) => resume.userId !== userId);
    const next = [localResume, ...current].slice(0, LOCAL_RESUME_LIMIT);

    try {
      writeLocalResumes(next);
    } catch {
      // Clear previous entries and retry once when storage is full.
      writeLocalResumes([localResume]);
    }

    return localResume;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw new Error('Failed to upload resume: ' + error.message);
  }
};

// Get all resumes for a user
export const getUserResumes = async (userId, limitCount = 10) => {
  try {
    const localResumes = readLocalResumes()
      .filter((resume) => resume.userId === userId && resume.isActive !== false)
      .slice(0, limitCount)
      .map((resume) => ({
        ...resume,
        uploadedAt: new Date(resume.uploadedAt),
      }));

    if (localResumes.length > 0) {
      return localResumes;
    }

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
    const localResume = readLocalResumes().find((resume) => resume.id === resumeId);
    if (localResume) {
      return {
        ...localResume,
        uploadedAt: new Date(localResume.uploadedAt),
      };
    }

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
    const localResumes = readLocalResumes();
    const existsLocally = localResumes.some((resume) => resume.id === resumeId);
    if (existsLocally) {
      const next = localResumes.filter((resume) => resume.id !== resumeId);
      writeLocalResumes(next);
      return { success: true };
    }

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
    const localLatest = readLocalResumes().find((resume) => resume.userId === userId);
    if (localLatest) {
      return {
        ...localLatest,
        uploadedAt: new Date(localLatest.uploadedAt),
      };
    }

    const resumes = await getUserResumes(userId, 1);
    return resumes[0] || null;
  } catch (error) {
    console.error('Error fetching latest resume:', error);
    throw error;
  }
};
