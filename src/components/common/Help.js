import { ExpandMore, HelpOutline } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import React from 'react';

const faqs = [
  {
    question: 'How does the ATS score work?',
    answer:
      'Our AI analyzes your resume against the job description, looking for keywords, skills, and formatting patterns that match industry-standard Applicant Tracking Systems. A score above 80% is considered excellent.',
  },
  {
    question: 'Which file formats are supported?',
    answer:
      'We currently support PDF and DOCX formats. For the best extraction results, we recommend using clean, professional templates without complex graphics.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, your privacy is our priority. Your resumes and analyses are stored securely. You can delete your data at any time from the History or Settings pages.',
  },
  {
    question: 'How can I improve my score?',
    answer:
      "Focus on the 'Missing Keywords' and 'Recommendations' sections after an analysis. Tailoring your professional summary and experience bullet points to match the job description is the most effective way to improve your score.",
  },
];

export default function Help() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <HelpOutline sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Help Center
        </Typography>
      </Box>

      <Paper sx={{ mb: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Typography color="text.secondary" paragraph>
          Find answers to common questions about the AI Resume Analyzer.
        </Typography>

        {faqs.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography sx={{ fontWeight: 600 }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Container>
  );
}
