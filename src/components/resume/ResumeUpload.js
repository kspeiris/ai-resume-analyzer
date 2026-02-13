import {
  Analytics,
  CheckCircle,
  CloudUpload,
  Description,
  PictureAsPdf,
  Warning,
} from '@mui/icons-material';
import {
  Alert,
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { extractText } from '../../services/documentParser';
import { uploadResume } from '../../services/resumeService';

const steps = ['Upload Resume', 'Extract Text', 'Complete'];

export default function ResumeUpload() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [validationResults, setValidationResults] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const uploadedFile = acceptedFiles[0];

      if (!uploadedFile) return;

      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(uploadedFile.type)) {
        setError('Please upload a PDF or DOCX file');
        return;
      }

      // Validate file size (5MB max)
      if (uploadedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      if (!currentUser?.uid) {
        setError('Please sign in before uploading your resume');
        return;
      }

      setFile(uploadedFile);
      setError(null);
      setActiveStep(1); // This will now be 'Extract Text'
      await processFile(uploadedFile);
    },
    [currentUser]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const processFile = async (uploadedFile) => {
    setProcessing(true);

    try {
      // Step 2: Extract Text
      setActiveStep(1);
      console.log('Extracting text locally...');
      const text = await extractText(uploadedFile);

      // Validate extracted text
      const validation = validateResume(text);
      setValidationResults(validation);

      // Step 3: Complete
      setActiveStep(2);

      // Save resume after extraction/validation
      const resumeData = await uploadResume(currentUser.uid, uploadedFile, text);
      toast.success('Resume uploaded successfully!');

      // Auto-clear selected file quickly from UI
      setTimeout(() => {
        setFile(null);
        setValidationResults(null);
        setActiveStep(0);
      }, 400);

      // Navigate to job description page with persisted resume id
      setTimeout(() => {
        navigate('/job-description', {
          state: {
            resumeId: resumeData.id,
            resumeText: text,
            fileName: uploadedFile.name,
          },
        });
      }, 900);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(
        error.message || 'Failed to extract text. Please ensure the file is not a scanned image.'
      );
      toast.error('Processing failed');

      // Auto-remove and reset quickly on failure
      setFile(null);
      setValidationResults(null);
      setActiveStep(0);
    } finally {
      setProcessing(false);
    }
  };

  const validateResume = (text) => {
    const results = {
      hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
      hasPhone: /(\+\d{1,3}[-.]?)?\d{10,}/.test(text),
      hasExperience: /experience|work history|employment/i.test(text),
      hasEducation: /education|degree|university|college/i.test(text),
      hasSkills: /skills|technologies|proficiencies/i.test(text),
      wordCount: text.split(/\s+/).length,
      bulletPoints: (text.match(/•|\*|-|·/g) || []).length,
    };

    results.score = Object.values(results).filter((v) => typeof v === 'boolean' && v).length * 20;

    return results;
  };

  const getFileIcon = () => {
    if (!file) return <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />;
    return file.type === 'application/pdf' ? (
      <PictureAsPdf sx={{ fontSize: 48, color: 'error.main' }} />
    ) : (
      <Description sx={{ fontSize: 48, color: 'primary.main' }} />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Upload Your Resume
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Start by uploading your resume in PDF or DOCX format
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : error ? 'error.main' : 'grey.300',
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive
                  ? alpha(theme.palette.primary.main, 0.04)
                  : 'background.paper',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <input {...getInputProps()} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={file ? 'file' : 'dropzone'}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {getFileIcon()}

                  {file ? (
                    <>
                      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                        {file.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>

                      {activeStep === 2 && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Upload Complete"
                          color="success"
                          sx={{ mt: 2 }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                        {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        or click to browse files
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{ mt: 2 }}
                      >
                        Supported formats: PDF, DOCX (Max 5MB)
                      </Typography>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </Paper>

            {processing && (
              <Box sx={{ mt: 3 }}>
                <LinearProgress />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {activeStep === 1 && 'Processing your resume...'}
                  {activeStep === 2 && 'Upload complete. Redirecting...'}
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Analytics sx={{ mr: 1 }} />
                  Resume Requirements
                </Typography>

                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="PDF or DOCX format" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Maximum file size: 5MB" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Include contact information" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary="Clear section headers" />
                  </ListItem>
                </List>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Your resume is processed securely and never shared with third parties.
                </Typography>
              </CardContent>
            </Card>

            {validationResults && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resume Quality Check
                  </Typography>

                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={validationResults.score}
                      size={80}
                      thickness={4}
                      sx={{
                        color:
                          validationResults.score >= 80
                            ? 'success.main'
                            : validationResults.score >= 60
                              ? 'warning.main'
                              : 'error.main',
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" component="div" color="text.secondary">
                        {validationResults.score}%
                      </Typography>
                    </Box>
                  </Box>

                  <List dense>
                    {Object.entries(validationResults).map(([key, value]) => {
                      if (typeof value === 'boolean') {
                        return (
                          <ListItem key={key}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {value ? (
                                <CheckCircle color="success" fontSize="small" />
                              ) : (
                                <Warning color="warning" fontSize="small" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, (str) => str.toUpperCase())}
                              secondary={!value && 'Missing'}
                            />
                          </ListItem>
                        );
                      }
                      return null;
                    })}
                  </List>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}
