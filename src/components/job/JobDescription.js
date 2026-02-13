import {
  Analytics,
  Business,
  Delete,
  Edit,
  History,
  MoreVert,
  PlayArrow,
  Save,
  Work,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { createAnalysis } from '../../services/analysisService';
import {
  deleteJobDescription,
  getUserJobDescriptions,
  saveJobDescription,
} from '../../services/jobDescriptionService';
import { validateJobDescription } from '../../utils/validators';

export default function JobDescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [description, setDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [savedJDs, setSavedJDs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJD, setSelectedJD] = useState(null);

  const { resumeId, resumeText } = location.state || {};

  useEffect(() => {
    if (!resumeId) {
      toast.error('Please upload a resume first');
      navigate('/upload');
    }
    fetchSavedJobDescriptions();
  }, [resumeId, navigate]);

  const fetchSavedJobDescriptions = async () => {
    try {
      setLoading(true);
      const jds = await getUserJobDescriptions(currentUser.uid);
      setSavedJDs(jds);
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);

    // Real-time validation
    const validation = validateJobDescription(value);
    setValidationErrors(validation.errors);
  };

  const handleSave = async () => {
    if (!jobTitle) {
      toast.error('Please enter a job title');
      return;
    }

    if (!description) {
      toast.error('Please enter a job description');
      return;
    }

    try {
      setLoading(true);
      await saveJobDescription(currentUser.uid, jobTitle, description, company);
      toast.success('Job description saved successfully');
      setJobTitle('');
      setCompany('');
      setDescription('');
      fetchSavedJobDescriptions();
    } catch (error) {
      toast.error('Failed to save job description');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!description) {
      toast.error('Please enter a job description');
      return;
    }

    const validation = validateJobDescription(description);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setAnalyzing(true);

      const analysis = await createAnalysis(currentUser.uid, resumeId, resumeText, description);

      toast.success('Analysis completed successfully!');
      navigate(`/analysis/${analysis.id}`);
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMenuOpen = (event, jd) => {
    setAnchorEl(event.currentTarget);
    setSelectedJD(jd);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJD(null);
  };

  const handleLoadJD = () => {
    if (selectedJD) {
      setJobTitle(selectedJD.title);
      setCompany(selectedJD.company || '');
      setDescription(selectedJD.description);
      handleMenuClose();
    }
  };

  const handleDeleteJD = async () => {
    if (selectedJD) {
      try {
        await deleteJobDescription(selectedJD.id);
        toast.success('Job description deleted');
        fetchSavedJobDescriptions();
      } catch (error) {
        toast.error('Failed to delete');
      }
      handleMenuClose();
    }
  };

  const wordCount = description.split(/\s+/).filter(Boolean).length;
  const isJDValid = description.length >= 50 && description.length <= 5000;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Work sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Job Description
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" paragraph>
                Paste the job description you want to analyze against your resume. The more detailed
                the description, the more accurate your analysis will be.
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company (Optional)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={12}
                label="Job Description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Paste the job description here..."
                error={validationErrors.length > 0}
                helperText={validationErrors.join('. ')}
                sx={{ mb: 2 }}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Box>
                  <Chip label={`${wordCount} words`} size="small" sx={{ mr: 1 }} />
                  <Chip
                    label={isJDValid ? 'Ready for analysis' : 'Needs more content'}
                    color={isJDValid ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading || !jobTitle || !description}
                    sx={{ mr: 2 }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Analytics />}
                    onClick={handleAnalyze}
                    disabled={analyzing || !isJDValid}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Resume'}
                  </Button>
                </Box>
              </Box>

              {analyzing && (
                <Box sx={{ mt: 3 }}>
                  <LinearProgress />
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    Analyzing your resume against the job description...
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar - Saved JDs */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <History sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Saved Job Descriptions</Typography>
                </Box>

                {loading ? (
                  <LinearProgress />
                ) : savedJDs.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No saved job descriptions yet</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Save a job description to reuse it later
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {savedJDs.map((jd) => (
                      <ListItem
                        key={jd.id}
                        secondaryAction={
                          <IconButton edge="end" onClick={(e) => handleMenuOpen(e, jd)}>
                            <MoreVert />
                          </IconButton>
                        }
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemText
                          primary={jd.title}
                          secondary={
                            <>
                              <Typography variant="caption" display="block">
                                {jd.company || 'No company specified'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(jd.createdAt).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleLoadJD}>
                    <ListItemIcon>
                      <PlayArrow fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Use this JD</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleDeleteJD}>
                    <ListItemIcon>
                      <Delete fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                  </MenuItem>
                </Menu>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  💡 Tips for better analysis
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Include full job description"
                      secondary="Copy the complete JD from the job posting"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Keep requirements intact"
                      secondary="Don't edit or remove key requirements"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Add company culture info"
                      secondary="Include values, mission, and culture details"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}
