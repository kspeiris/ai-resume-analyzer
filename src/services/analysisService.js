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
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';

const analyzeResumeFunction = httpsCallable(functions, 'analyzeResume');

// Create new analysis
export const createAnalysis = async (userId, resumeId, resumeText, jobDescription) => {
  try {
    const response = await analyzeResumeFunction({
      resumeText,
      jobDescription,
      resumeId,
      userId
    });

    return response.data;
  } catch (error) {
    console.error('Error creating analysis:', error);
    throw new Error('Analysis failed: ' + error.message);
  }
};

// Get analysis by ID
export const getAnalysis = async (analysisId) => {
  try {
    const docRef = doc(db, 'analyses', analysisId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate()
      };
    } else {
      throw new Error('Analysis not found');
    }
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw error;
  }
};

// Get user analyses with pagination
export const getUserAnalyses = async (userId, limitCount = 10, lastDoc = null) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch analyses');
    }

    let q;
    
    if (lastDoc) {
      q = query(
        collection(db, 'analyses'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, 'analyses'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const analyses = [];
    let lastVisible = null;

    querySnapshot.forEach((doc) => {
      analyses.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
      lastVisible = doc;
    });

    return {
      analyses,
      lastDoc: lastVisible,
      hasMore: analyses.length === limitCount
    };
  } catch (error) {
    console.error('Error fetching analyses:', error);
    throw error;
  }
};

// Delete analysis
export const deleteAnalysis = async (analysisId) => {
  try {
    await deleteDoc(doc(db, 'analyses', analysisId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};

// Update analysis feedback
export const updateAnalysisFeedback = async (analysisId, feedback) => {
  try {
    const docRef = doc(db, 'analyses', analysisId);
    await updateDoc(docRef, {
      'userFeedback': feedback,
      'feedbackSubmittedAt': Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

// Get analysis statistics
export const getAnalysisStats = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch analysis stats');
    }

    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const analyses = [];
    
    querySnapshot.forEach((doc) => {
      analyses.push(doc.data());
    });

    // Calculate statistics
    const stats = {
      total: analyses.length,
      averageScore: 0,
      bestScore: 0,
      worstScore: 100,
      scoreHistory: [],
      keywordStats: {
        averageMatched: 0,
        averageMissing: 0
      }
    };

    if (analyses.length > 0) {
      const scores = analyses.map(a => a.scores?.overall || 0);
      stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      stats.bestScore = Math.max(...scores);
      stats.worstScore = Math.min(...scores);
      
      stats.scoreHistory = analyses
        .slice(0, 10)
        .map(a => ({
          date: a.createdAt?.toDate().toLocaleDateString(),
          score: a.scores?.overall || 0
        }))
        .reverse();

      const totalMatched = analyses.reduce((sum, a) => sum + (a.keywords?.matchedCount || 0), 0);
      const totalMissing = analyses.reduce((sum, a) => sum + (a.keywords?.missing?.length || 0), 0);
      
      stats.keywordStats.averageMatched = Math.round(totalMatched / analyses.length);
      stats.keywordStats.averageMissing = Math.round(totalMissing / analyses.length);
    }

    return stats;
  } catch (error) {
    console.error('Error fetching analysis stats:', error);
    throw error;
  }
};

// Compare two analyses
export const compareAnalyses = async (analysisId1, analysisId2) => {
  try {
    const [analysis1, analysis2] = await Promise.all([
      getAnalysis(analysisId1),
      getAnalysis(analysisId2)
    ]);

    return {
      first: analysis1,
      second: analysis2,
      differences: {
        scoreChange: analysis2.scores.overall - analysis1.scores.overall,
        keywordImprovement: analysis2.keywords.matchedCount - analysis1.keywords.matchedCount,
        formatImprovement: analysis2.scores.format - analysis1.scores.format,
        impactImprovement: analysis2.scores.impact - analysis1.scores.impact
      }
    };
  } catch (error) {
    console.error('Error comparing analyses:', error);
    throw error;
  }
};
