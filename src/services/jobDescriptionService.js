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
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Save job description
export const saveJobDescription = async (userId, title, description, company = '') => {
  try {
    const jdData = {
      userId,
      title,
      description,
      company,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
      analysesCount: 0,
      metadata: {
        wordCount: description.split(/\s+/).length,
        characterCount: description.length,
        extractedKeywords: extractKeywords(description),
      },
    };

    const docRef = await addDoc(collection(db, 'jobDescriptions'), jdData);

    return {
      id: docRef.id,
      ...jdData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error saving job description:', error);
    throw error;
  }
};

// Get all job descriptions for user
export const getUserJobDescriptions = async (userId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'jobDescriptions'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const jds = [];

    querySnapshot.forEach((doc) => {
      jds.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    return jds;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

// Get single job description
export const getJobDescriptionById = async (jdId) => {
  try {
    const docRef = doc(db, 'jobDescriptions', jdId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      };
    } else {
      throw new Error('Job description not found');
    }
  } catch (error) {
    console.error('Error fetching job description:', error);
    throw error;
  }
};

// Update job description
export const updateJobDescription = async (jdId, updates) => {
  try {
    const docRef = doc(db, 'jobDescriptions', jdId);

    // Update extracted keywords if description changed
    if (updates.description) {
      updates.metadata = {
        wordCount: updates.description.split(/\s+/).length,
        characterCount: updates.description.length,
        extractedKeywords: extractKeywords(updates.description),
      };
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating job description:', error);
    throw error;
  }
};

// Delete job description
export const deleteJobDescription = async (jdId) => {
  try {
    await deleteDoc(doc(db, 'jobDescriptions', jdId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting job description:', error);
    throw error;
  }
};

// Increment analysis count
export const incrementJDAnalysisCount = async (jdId) => {
  try {
    const docRef = doc(db, 'jobDescriptions', jdId);
    await updateDoc(docRef, {
      analysesCount: increment(1),
      lastAnalyzedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing JD analysis count:', error);
    throw error;
  }
};

// Search job descriptions
export const searchJobDescriptions = async (userId, searchTerm) => {
  try {
    const jds = await getUserJobDescriptions(userId, 100);

    // Client-side search since Firestore doesn't support full-text search
    const results = jds.filter(
      (jd) =>
        jd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (jd.company && jd.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return results.slice(0, 20);
  } catch (error) {
    console.error('Error searching job descriptions:', error);
    throw error;
  }
};

// Extract keywords from text
const extractKeywords = (text) => {
  const stopWords = [
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
  ];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word) && isNaN(word));

  const keywordCount = {};
  words.forEach((word) => {
    keywordCount[word] = (keywordCount[word] || 0) + 1;
  });

  return Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
};
