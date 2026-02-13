// Local storage keys for job descriptions
const LOCAL_JDS_KEY = 'resume_analyzer_local_jds_v1';
const LOCAL_JD_LIMIT = 50;

const readLocalJDs = () => {
  try {
    const raw = localStorage.getItem(LOCAL_JDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Failed to parse local JDs:', error);
    return [];
  }
};

const writeLocalJDs = (jds) => {
  localStorage.setItem(LOCAL_JDS_KEY, JSON.stringify(jds));
};

// Save job description
export const saveJobDescription = async (userId, title, description, company = '') => {
  try {
    const jdData = {
      id: `jd_${Date.now()}`,
      userId,
      title,
      description,
      company,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      analysesCount: 0,
      metadata: {
        wordCount: description.split(/\s+/).length,
        characterCount: description.length,
        extractedKeywords: extractKeywords(description),
      },
    };

    const current = readLocalJDs();
    const next = [jdData, ...current].slice(0, LOCAL_JD_LIMIT);
    writeLocalJDs(next);

    return {
      ...jdData,
      createdAt: new Date(jdData.createdAt),
      updatedAt: new Date(jdData.updatedAt),
    };
  } catch (error) {
    console.error('Error saving job description:', error);
    throw error;
  }
};

// Get all job descriptions for user
export const getUserJobDescriptions = async (userId, limitCount = 20) => {
  try {
    const jds = readLocalJDs()
      .filter((jd) => jd.userId === userId && jd.isActive !== false)
      .slice(0, limitCount)
      .map((jd) => ({
        ...jd,
        createdAt: new Date(jd.createdAt),
        updatedAt: new Date(jd.updatedAt),
      }));

    return jds;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

// Get single job description
export const getJobDescriptionById = async (jdId) => {
  try {
    const jd = readLocalJDs().find((j) => j.id === jdId);

    if (jd) {
      return {
        ...jd,
        createdAt: new Date(jd.createdAt),
        updatedAt: new Date(jd.updatedAt),
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
    const jds = readLocalJDs();
    const index = jds.findIndex((jd) => jd.id === jdId);

    if (index === -1) throw new Error('Job description not found');

    const updatedJD = {
      ...jds[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update extracted keywords if description changed
    if (updates.description) {
      updatedJD.metadata = {
        wordCount: updates.description.split(/\s+/).length,
        characterCount: updates.description.length,
        extractedKeywords: extractKeywords(updates.description),
      };
    }

    jds[index] = updatedJD;
    writeLocalJDs(jds);

    return { success: true };
  } catch (error) {
    console.error('Error updating job description:', error);
    throw error;
  }
};

// Delete job description
export const deleteJobDescription = async (jdId) => {
  try {
    const jds = readLocalJDs();
    const next = jds.filter((jd) => jd.id !== jdId);
    writeLocalJDs(next);
    return { success: true };
  } catch (error) {
    console.error('Error deleting job description:', error);
    throw error;
  }
};

// Increment analysis count
export const incrementJDAnalysisCount = async (jdId) => {
  try {
    const jds = readLocalJDs();
    const index = jds.findIndex((jd) => jd.id === jdId);

    if (index === -1) throw new Error('Job description not found');

    jds[index].analysesCount = (jds[index].analysesCount || 0) + 1;
    jds[index].lastAnalyzedAt = new Date().toISOString();
    jds[index].updatedAt = new Date().toISOString();

    writeLocalJDs(jds);
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
    'this',
    'that',
    'from',
    'your',
    'will',
    'with',
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
