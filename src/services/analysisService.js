/**
 * Local storage key and configuration for persistency
 */
const LOCAL_ANALYSES_KEY = 'resume_analyzer_local_analyses_v1';
const LOCAL_ANALYSIS_LIMIT = 50;

/**
 * Reads analysis results from local storage
 * @returns {Array} List of analysis objects
 */
const readLocalAnalyses = () => {
  try {
    const raw = localStorage.getItem(LOCAL_ANALYSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Failed to parse local analyses:', error);
    return [];
  }
};

/**
 * Writes analysis results to local storage
 * @param {Array} analyses - List of analysis objects to persist
 */
const writeLocalAnalyses = (analyses) => {
  localStorage.setItem(LOCAL_ANALYSES_KEY, JSON.stringify(analyses));
};

/**
 * Simulates AI analysis logic for local-first use
 * @param {string} resumeText - Extracted text from resume
 * @param {string} jobDescription - Target job description
 * @returns {Object} Analysis metrics and recommendations
 */
const performLocalAnalysis = (resumeText, jobDescription) => {
  const resumeWords = resumeText.toLowerCase().split(/\W+/);
  const jdWords = jobDescription.toLowerCase().split(/\W+/);

  const stopWords = new Set([
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
  ]);

  const jdKeywords = [...new Set(jdWords.filter((w) => w.length > 3 && !stopWords.has(w)))];
  const matchedKeywords = jdKeywords.filter((w) => resumeWords.includes(w));
  const missingKeywords = jdKeywords.filter((w) => !resumeWords.includes(w)).slice(0, 10);

  const matchRate = jdKeywords.length > 0 ? matchedKeywords.length / jdKeywords.length : 0;
  const overallScore = Math.min(100, Math.round(matchRate * 100 + 20));

  return {
    jobDescription,
    scores: {
      overall: overallScore,
      keyword: Math.round(matchRate * 100),
      semantic: Math.min(100, Math.round(matchRate * 100 + 10)),
      format: 85,
      impact: Math.min(100, Math.round(overallScore * 0.9)),
    },
    keywords: {
      matched: matchedKeywords.slice(0, 15),
      missing: missingKeywords,
      matchedCount: matchedKeywords.length,
      total: jdKeywords.length,
    },
    recommendations: {
      summary:
        'This is a locally generated analysis. To get specialized AI results, please deploy the backend functions.',
      improvements: [
        'Consider adding more specific keywords from the job description.',
        'Ensure your experience sections emphasize impact over duties.',
        'Professional summary should be tailored to this specific role.',
      ],
      bulletRewrites: [
        'Collaborated with team to improve project efficiency by 20%.',
        'Implemented new system that reduced downtime by 15 hours weekly.',
      ],
      missingSkills: missingKeywords.slice(0, 5),
      tips: [
        'Use a standard font like Arial or Calibri.',
        'Keep your resume to 1-2 pages maximum.',
        'Avoid images, charts, and complex columns.',
      ],
    },
    sections: {
      education: { score: 90, feedback: 'Education section is clear.' },
      experience: {
        score: Math.round(overallScore * 0.8),
        feedback: 'Work experience shows good progression.',
      },
    },
  };
};

/**
 * Creates a new analysis session
 * @param {string} userId - Current user unique identifier
 * @param {string} resumeId - Reference to the resume document
 * @param {string} resumeText - Text content to analyze
 * @param {string} jobDescription - Target job requirements
 */
export const createAnalysis = async (userId, resumeId, resumeText, jobDescription) => {
  try {
    // Artificial delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analysisResults = performLocalAnalysis(resumeText, jobDescription);

    const analysisData = {
      id: `analysis_${Date.now()}`,
      userId,
      resumeId,
      ...analysisResults,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    const current = readLocalAnalyses();
    const next = [analysisData, ...current].slice(0, LOCAL_ANALYSIS_LIMIT);
    writeLocalAnalyses(next);

    return {
      ...analysisData,
      createdAt: new Date(analysisData.createdAt),
    };
  } catch (error) {
    console.error('Error creating analysis:', error);
    throw new Error('Analysis failed: ' + error.message);
  }
};

/**
 * Retrieves a specific analysis by ID
 * @param {string} analysisId
 */
export const getAnalysis = async (analysisId) => {
  try {
    const analysis = readLocalAnalyses().find((a) => a.id === analysisId);
    if (analysis) {
      return {
        ...analysis,
        createdAt: new Date(analysis.createdAt),
      };
    } else {
      throw new Error('Analysis not found');
    }
  } catch (error) {
    console.error('Error fetching analysis:', error);
    throw error;
  }
};

/**
 * Fetches all analyses for a specific user
 * @param {string} userId
 * @param {number} limitCount
 */
export const getUserAnalyses = async (userId, limitCount = 10) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch analyses');
    }

    const analyses = readLocalAnalyses()
      .filter((a) => a.userId === userId)
      .slice(0, limitCount)
      .map((a) => ({
        ...a,
        createdAt: new Date(a.createdAt),
      }));

    return {
      analyses,
      lastDoc: null,
      hasMore: analyses.length === limitCount,
    };
  } catch (error) {
    console.error('Error fetching analyses:', error);
    throw error;
  }
};

/**
 * Permanently deletes an analysis result
 * @param {string} analysisId
 */
export const deleteAnalysis = async (analysisId) => {
  try {
    const current = readLocalAnalyses();
    const next = current.filter((a) => a.id !== analysisId);
    writeLocalAnalyses(next);
    return { success: true };
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};

/**
 * Stores user feedback for an analysis session
 */
export const updateAnalysisFeedback = async (analysisId, feedback) => {
  try {
    const current = readLocalAnalyses();
    const index = current.findIndex((a) => a.id === analysisId);
    if (index === -1) throw new Error('Analysis not found');

    current[index].userFeedback = feedback;
    current[index].feedbackSubmittedAt = new Date().toISOString();

    writeLocalAnalyses(current);
    return { success: true };
  } catch (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }
};

/**
 * Aggregates performance statistics for a user
 */
export const getAnalysisStats = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch analysis stats');
    }

    const analyses = readLocalAnalyses().filter((a) => a.userId === userId);

    const stats = {
      total: analyses.length,
      averageScore: 0,
      bestScore: 0,
      worstScore: 100,
      scoreHistory: [],
      keywordStats: {
        averageMatched: 0,
        averageMissing: 0,
      },
    };

    if (analyses.length > 0) {
      const scores = analyses.map((a) => a.scores?.overall || 0);
      stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      stats.bestScore = Math.max(...scores);
      stats.worstScore = Math.min(...scores);

      stats.scoreHistory = analyses
        .slice(0, 10)
        .map((a) => ({
          date: new Date(a.createdAt).toLocaleDateString(),
          score: a.scores?.overall || 0,
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

/**
 * Compares two analysis metrics to track progress
 */
export const compareAnalyses = async (analysisId1, analysisId2) => {
  try {
    const [analysis1, analysis2] = await Promise.all([
      getAnalysis(analysisId1),
      getAnalysis(analysisId2),
    ]);

    return {
      first: analysis1,
      second: analysis2,
      differences: {
        scoreChange: analysis2.scores.overall - analysis1.scores.overall,
        keywordImprovement: analysis2.keywords.matchedCount - analysis1.keywords.matchedCount,
        formatImprovement: analysis2.scores.format - analysis1.scores.format,
        impactImprovement: analysis2.scores.impact - analysis1.scores.impact,
      },
    };
  } catch (error) {
    console.error('Error comparing analyses:', error);
    throw error;
  }
};
