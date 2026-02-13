import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

// Export analysis as PDF
export const exportAnalysisReport = async (analysis) => {
  try {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text('Resume Analysis Report', 20, 20);

    // Date
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date(analysis.createdAt).toLocaleString()}`, 20, 35);

    // ATS Score
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('ATS Compatibility Score', 20, 55);

    // Score gauge
    doc.setFontSize(48);
    doc.setTextColor(
      analysis.scores.overall >= 80 ? 16 : analysis.scores.overall >= 60 ? 245 : 239,
      analysis.scores.overall >= 80 ? 185 : analysis.scores.overall >= 60 ? 158 : 68,
      analysis.scores.overall >= 80 ? 129 : analysis.scores.overall >= 60 ? 11 : 68
    );
    doc.text(`${analysis.scores.overall}%`, 20, 80);

    // Score breakdown
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Score Breakdown', 20, 110);

    const scoreData = [
      ['Category', 'Score', 'Status'],
      [
        'Keyword Match',
        `${analysis.scores.keyword}%`,
        analysis.scores.keyword >= 70 ? 'Good' : 'Needs Improvement',
      ],
      [
        'Semantic Similarity',
        `${analysis.scores.semantic}%`,
        analysis.scores.semantic >= 70 ? 'Good' : 'Needs Improvement',
      ],
      [
        'Formatting',
        `${analysis.scores.format}%`,
        analysis.scores.format >= 70 ? 'Good' : 'Needs Improvement',
      ],
      [
        'Impact',
        `${analysis.scores.impact}%`,
        analysis.scores.impact >= 70 ? 'Good' : 'Needs Improvement',
      ],
    ];

    doc.autoTable({
      startY: 120,
      head: [scoreData[0]],
      body: scoreData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    // Keywords
    let yPos = doc.lastAutoTable.finalY + 20;
    doc.text('Keyword Analysis', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(22, 163, 74);
    doc.text(`✓ Matched: ${analysis.keywords.matched.length} keywords`, 25, yPos);
    yPos += 7;
    doc.setTextColor(220, 38, 38);
    doc.text(`✗ Missing: ${analysis.keywords.missing.length} keywords`, 25, yPos);

    // AI Recommendations
    yPos += 20;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('AI Recommendations', 20, yPos);
    yPos += 10;
    doc.setFontSize(11);

    analysis.recommendations.improvements.slice(0, 5).forEach((rec, index) => {
      doc.text(`${index + 1}. ${rec}`, 25, yPos + index * 7);
    });

    // Save PDF
    doc.save(`resume-analysis-${analysis.id}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

// Export as CSV
export const exportToCSV = (data, filename) => {
  try {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
};

// Export analysis history
export const exportAnalysisHistory = (analyses) => {
  const data = analyses.map((a) => ({
    Date: new Date(a.createdAt).toLocaleDateString(),
    'ATS Score': `${a.scores.overall}%`,
    'Keyword Match': `${a.scores.keyword}%`,
    'Semantic Score': `${a.scores.semantic}%`,
    'Format Score': `${a.scores.format}%`,
    'Impact Score': `${a.scores.impact}%`,
    'Matched Keywords': a.keywords.matchedCount,
    'Missing Keywords': a.keywords.missing.length,
  }));

  exportToCSV(data, 'analysis-history');
};

// Share analysis
export const shareAnalysis = async (analysisId) => {
  const url = `${window.location.origin}/analysis/${analysisId}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Resume Analysis Results',
        text: 'Check out my resume analysis results!',
        url: url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  } else {
    // Fallback to clipboard
    navigator.clipboard.writeText(url);
  }
};
