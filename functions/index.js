const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const { analyzeResumeWithAI, calculateATSScore } = require('./src/services/analysisService');

admin.initializeApp();

// Analyze Resume Cloud Function
exports.analyzeResume = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { resumeText, jobDescription, resumeId, userId } = req.body;

      if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Calculate ATS scores
      const scores = await calculateATSScore(resumeText, jobDescription);

      // Generate AI recommendations
      const aiRecommendations = await analyzeResumeWithAI(resumeText, jobDescription);

      // Create analysis result
      const analysisResult = {
        userId,
        resumeId,
        jobDescription: jobDescription.substring(0, 500) + '...',
        scores,
        recommendations: aiRecommendations,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        keywords: {
          matched: scores.keywordMatch.matched,
          missing: scores.keywordMatch.missing
        }
      };

      // Save to Firestore
      const docRef = await admin.firestore()
        .collection('analyses')
        .add(analysisResult);

      // Update user's analysis count
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          analysesCount: admin.firestore.FieldValue.increment(1),
          lastAnalysisDate: admin.firestore.FieldValue.serverTimestamp()
        });

      return res.status(200).json({
        id: docRef.id,
        ...analysisResult,
        createdAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Analysis error:', error);
      return res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
  });
});

// Get User Analyses History
exports.getUserAnalyses = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { limit = 10, offset = 0 } = data;
    
    const snapshot = await admin.firestore()
      .collection('analyses')
      .where('userId', '==', context.auth.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const analyses = [];
    snapshot.forEach(doc => {
      analyses.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
    });

    return { analyses, total: analyses.length };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to fetch analyses');
  }
});

// Cleanup Old Files (Runs daily)
exports.cleanupOldFiles = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles();

    const deletePromises = files
      .filter(file => file.metadata.timeCreated < thirtyDaysAgo.toISOString())
      .map(file => file.delete());

    await Promise.all(deletePromises);
    console.log(`Deleted ${deletePromises.length} old files`);
  });