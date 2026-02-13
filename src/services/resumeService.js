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
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase/config';

// Upload resume file and metadata
export const uploadResume = async (userId, file, extractedText) => {
  try {
    // Upload file to Firebase Storage
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `resumes/${userId}/${fileName}`);
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    // Create resume document in Firestore
    const resumeData = {
      userId,
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      extractedText,
      uploadedAt: Timestamp.now(),
      isActive: true,
      analysesCount: 0,
      metadata: {
        wordCount: extractedText.split(/\s+/).length,
        characterCount: extractedText.length,
        lastAnalyzed: null
      }
    };

    const docRef = await addDoc(collection(db, 'resumes'), resumeData);
    
    // Update user's resume count
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalResumes: increment(1),
      lastResumeUpload: Timestamp.now()
    });

    return {
      id: docRef.id,
      ...resumeData
    };
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw new Error('Failed to upload resume');
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
        uploadedAt: doc.data().uploadedAt?.toDate()
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
        uploadedAt: docSnap.data().uploadedAt?.toDate()
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
export const deleteResume = async (resumeId, userId, fileUrl) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'resumes', resumeId));
    
    // Delete from Storage
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
    
    // Update user count
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalResumes: increment(-1)
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
      updatedAt: Timestamp.now()
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