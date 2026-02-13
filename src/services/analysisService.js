const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.calculateATSScore = async (resumeText, jobDescription) => {
  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  
  // Keyword matching score (40%)
  const matchedKeywords = jobKeywords.filter(keyword => 
    resumeText.toLowerCase().includes(keyword.toLowerCase())
  );
  const keywordScore = (matchedKeywords.length / jobKeywords.length) * 100;

  // Format score (15%)
  const formatScore = calculateFormatScore(resumeText);
  
  // Impact score (15%)
  const impactScore = calculateImpactScore(resumeText);
  
  // Semantic similarity (30%)
  const similarityScore = await calculateSemanticSimilarity(resumeText, jobDescription);

  const overallScore = Math.round(
    (keywordScore * 0.4) +
    (similarityScore * 0.3) +
    (formatScore * 0.15) +
    (impactScore * 0.15)
  );

  return {
    overall: overallScore,
    keyword: Math.round(keywordScore),
    semantic: Math.round(similarityScore),
    format: Math.round(formatScore),
    impact: Math.round(impactScore),
    keywordMatch: {
      matched: matchedKeywords.slice(0, 20),
      missing: jobKeywords.filter(k => !matchedKeywords.includes(k)).slice(0, 20),
      total: jobKeywords.length,
      matchedCount: matchedKeywords.length
    }
  };
};

exports.analyzeResumeWithAI = async (resumeText, jobDescription) => {
  try {
    const prompt = `
      Analyze this resume against the job description and provide:
      1. 5 specific improvements for the resume
      2. 3 rewritten bullet points with better impact
      3. Missing skills to add
      4. Overall resume strength and weaknesses
      5. ATS optimization tips
      
      Resume: ${resumeText.substring(0, 3000)}
      
      Job Description: ${jobDescription.substring(0, 1500)}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS resume consultant. Provide actionable, specific feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0].message.content;
    
    // Parse AI response into structured format
    return parseAIResponse(response);
    
  } catch (error) {
    console.error('AI analysis error:', error);
    return getFallbackRecommendations();
  }
};

function extractKeywords(text) {
  // Remove common stop words and extract important keywords
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 3 && 
      !stopWords.includes(word) &&
      isNaN(word)
    );
  
  // Get unique keywords with frequency
  const keywordCount = {};
  words.forEach(word => {
    keywordCount[word] = (keywordCount[word] || 0) + 1;
  });

  // Return most frequent keywords
  return Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
}

function calculateFormatScore(text) {
  let score = 70; // Base score

  // Check for proper sections
  const sections = ['experience', 'education', 'skills', 'summary', 'projects'];
  sections.forEach(section => {
    if (text.toLowerCase().includes(section)) {
      score += 5;
    }
  });

  // Check for bullet points
  const bulletCount = (text.match(/•|\*|-|·/g) || []).length;
  if (bulletCount > 5) score += 10;
  if (bulletCount > 10) score += 15;

  // Length check (1-2 pages)
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 300 && wordCount < 800) score += 10;
  if (wordCount >= 800 && wordCount <= 1200) score += 5;
  if (wordCount > 1200) score -= 10;

  return Math.min(Math.max(score, 0), 100);
}

function calculateImpactScore(text) {
  let score = 50;

  // Check for quantifiable achievements
  const numbers = (text.match(/\d+/g) || []).length;
  score += Math.min(numbers * 2, 20);

  // Check for action verbs
  const actionVerbs = ['achieved', 'improved', 'increased', 'decreased', 'managed', 'led', 'developed', 'created', 'implemented', 'designed'];
  actionVerbs.forEach(verb => {
    if (text.toLowerCase().includes(verb)) {
      score += 2;
    }
  });

  // Check for percentages
  const percentages = (text.match(/\d+%/g) || []).length;
  score += percentages * 3;

  // Check for monetary values
  const money = (text.match(/[$£€]\d+(?:,\d{3})*(?:\.\d{2})?/g) || []).length;
  score += money * 4;

  return Math.min(score, 100);
}

async function calculateSemanticSimilarity(text1, text2) {
  // Simplified semantic similarity based on common n-grams
  const ngrams1 = getNgrams(text1.toLowerCase(), 3);
  const ngrams2 = getNgrams(text2.toLowerCase(), 3);
  
  const common = new Set([...ngrams1].filter(x => ngrams2.has(x)));
  
  return (common.size / Math.min(ngrams1.size, ngrams2.size)) * 100;
}

function getNgrams(text, n) {
  const ngrams = new Set();
  const words = text.split(/\s+/);
  
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(' '));
  }
  
  return ngrams;
}

function parseAIResponse(response) {
  // Parse AI response into structured format
  const sections = response.split('\n\n');
  
  return {
    improvements: sections.filter(s => s.toLowerCase().includes('improvement')).map(s => s),
    bulletRewrites: sections.filter(s => s.toLowerCase().includes('bullet')).map(s => s),
    missingSkills: sections.filter(s => s.toLowerCase().includes('skill')).map(s => s),
    summary: sections[0],
    tips: sections.filter(s => s.toLowerCase().includes('tip')).map(s => s),
    raw: response
  };
}

function getFallbackRecommendations() {
  return {
    improvements: [
      "Add more quantifiable achievements with specific numbers",
      "Include relevant keywords from the job description",
      "Use stronger action verbs to start bullet points",
      "Ensure consistent formatting throughout the document",
      "Add a professional summary at the top"
    ],
    bulletRewrites: [
      "• Increased sales by 25% within first quarter through strategic client outreach",
      "• Managed team of 10 developers to deliver project 2 weeks ahead of schedule",
      "• Implemented automated testing reducing bug reports by 40%"
    ],
    missingSkills: [
      "Project Management",
      "Data Analysis",
      "Team Leadership",
      "Strategic Planning"
    ],
    summary: "Your resume has good foundational elements but needs more specific achievements and keywords to optimize for ATS systems.",
    tips: [
      "Use industry-standard section headings",
      "Avoid graphics, tables, and columns",
      "Save as PDF to preserve formatting",
      "Include relevant certifications"
    ]
  };
}