import { useState } from 'react';
import { extractText } from '../services/documentParser';
import { validateResumeFile } from '../utils/validators';

export function useResumeParser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const parseResume = async (file) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file
      const validation = validateResumeFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      setProgress(30);

      // Extract text
      const text = await extractText(file);
      setProgress(70);

      // Parse sections
      const sections = parseSections(text);
      setProgress(90);

      // Extract metadata
      const metadata = extractMetadata(text, file);
      setProgress(100);

      return {
        text,
        sections,
        metadata,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const parseSections = (text) => {
    const lines = text.split('\n');
    const sections = {
      summary: '',
      experience: '',
      education: '',
      skills: '',
      projects: '',
      certifications: '',
      languages: '',
      other: ''
    };

    let currentSection = 'other';

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('summary') || lowerLine.includes('profile') || lowerLine.includes('objective')) {
        currentSection = 'summary';
      } else if (lowerLine.includes('experience') || lowerLine.includes('work')) {
        currentSection = 'experience';
      } else if (lowerLine.includes('education') || lowerLine.includes('degree')) {
        currentSection = 'education';
      } else if (lowerLine.includes('skill') || lowerLine.includes('technolog')) {
        currentSection = 'skills';
      } else if (lowerLine.includes('project')) {
        currentSection = 'projects';
      } else if (lowerLine.includes('certification')) {
        currentSection = 'certifications';
      } else if (lowerLine.includes('language')) {
        currentSection = 'languages';
      }
      
      sections[currentSection] += line + '\n';
    });

    return sections;
  };

  const extractMetadata = (text, file) => {
    return {
      wordCount: text.split(/\s+/).length,
      characterCount: text.length,
      lineCount: text.split('\n').length,
      bulletPoints: (text.match(/[•\-\*·]/g) || []).length,
      email: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0],
      phone: text.match(/(\+\d{1,3}[-.]?)?\d{10,}/)?.[0],
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };
  };

  return {
    parseResume,
    loading,
    error,
    progress
  };
}