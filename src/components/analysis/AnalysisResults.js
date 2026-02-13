import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error,
  Lightbulb,
  Download,
  Share,
  Refresh,
  Analytics,
  Description,
  Work,
  School,
  EmojiEvents
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { getAnalysis } from '../../services/analysisService';
import { exportAnalysisReport } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 24 }}>
      {value === index && children}
    </div>
  );
}

export default function AnalysisResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const data = await getAnalysis(id);
      setAnalysis(data);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('Failed to load analysis results');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    exportAnalysisReport(analysis);
    toast.success('Report downloaded successfully');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading analysis results...</Typography>
      </Container>
    );
  }

  if (!analysis) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        }>
          Analysis not found or you don't have permission to view it.
        </Alert>
      </Container>
    );
  }

  const scoreData = [
    { name: 'Overall', value: analysis.scores.overall, fill: '#2563eb' },
    { name: 'Keyword', value: analysis.scores.keyword, fill: '#10b981' },
    { name: 'Semantic', value: analysis.scores.semantic, fill: '#7c3aed' },
    { name: 'Format', value: analysis.scores.format, fill: '#f59e0b' },
    { name: 'Impact', value: analysis.scores.impact, fill: '#ef4444' }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle />;
    if (score >= 60) return <Warning />;
    return <Error />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Analysis Results
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generated on {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Download Report">
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Share Analysis">
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
              >
                Share
              </Button>
            </Tooltip>
            <Tooltip title="New Analysis">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={() => navigate('/upload')}
              >
                New Analysis
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Score Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {scoreData.map((score, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {score.name}
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                      <CircularProgress
                        variant="determinate"
                        value={score.value}
                        size={80}
                        thickness={4}
                        color={getScoreColor(score.value)}
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
                        <Typography variant="h5" component="div" color="text.primary">
                          {score.value}%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {score.value >= 80 ? 'Excellent' : score.value >= 60 ? 'Good' : 'Needs Work'}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<Analytics />} label="Overview" />
            <Tab icon={<Description />} label="Keywords" />
            <Tab icon={<Lightbulb />} label="AI Recommendations" />
            <Tab icon={<Work />} label="Job Match" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Strengths
                  </Typography>
                  <List>
                    {analysis.scores.keyword > 70 && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Strong Keyword Match"
                          secondary="Your resume contains many relevant keywords from the job description"
                        />
                      </ListItem>
                    )}
                    {analysis.scores.format > 70 && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Good Formatting"
                          secondary="Your resume is well-structured and ATS-friendly"
                        />
                      </ListItem>
                    )}
                    {analysis.scores.impact > 70 && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Strong Impact Statements"
                          secondary="Good use of quantifiable achievements and action verbs"
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Areas for Improvement
                  </Typography>
                  <List>
                    {analysis.scores.keyword < 60 && (
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Add More Keywords"
                          secondary="Incorporate missing keywords from the job description"
                        />
                      </ListItem>
                    )}
                    {analysis.scores.semantic < 60 && (
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Improve Semantic Match"
                          secondary="Better align your experience with job requirements"
                        />
                      </ListItem>
                    )}
                    {analysis.scores.format < 60 && (
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Fix Formatting"
                          secondary="Use standard section headers and avoid complex formatting"
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Keywords Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Matched Keywords ({analysis.keywords.matched.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {analysis.keywords.matched.map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        color="success"
                        variant="outlined"
                        icon={<CheckCircle />}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom color="warning.main">
                    Missing Keywords ({analysis.keywords.missing.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {analysis.keywords.missing.map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        color="warning"
                        variant="outlined"
                        icon={<Warning />}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            {/* AI Recommendations Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Executive Summary
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
                    <Typography>
                      {analysis.recommendations.summary}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Top Improvements
                  </Typography>
                  <List>
                    {analysis.recommendations.improvements.slice(0, 5).map((item, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <Lightbulb color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Rewritten Bullet Points
                  </Typography>
                  <List>
                    {analysis.recommendations.bulletRewrites.slice(0, 3).map((item, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon>
                          <EmojiEvents color="secondary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item}
                          secondary="More impactful and achievement-oriented"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Missing Skills to Add
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {analysis.recommendations.missingSkills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="filled"
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    ATS Optimization Tips
                  </Typography>
                  <List>
                    {analysis.recommendations.tips.map((tip, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Job Match Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Job Description Analysis
              </Typography>
              <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
                <Typography variant="body1" paragraph>
                  {analysis.jobDescription}
                </Typography>
              </Paper>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Match Breakdown
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>Overall Compatibility</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${analysis.scores.overall}%`}
                            color={getScoreColor(analysis.scores.overall)}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Keyword Match Rate</TableCell>
                        <TableCell align="right">
                          {analysis.keywords.matchedCount}/{analysis.keywords.total} keywords found
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Experience Alignment</TableCell>
                        <TableCell align="right">
                          {analysis.scores.semantic}% semantic similarity
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Formatting Compatibility</TableCell>
                        <TableCell align="right">
                          {analysis.scores.format}% ATS-friendly
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Impact & Achievements</TableCell>
                        <TableCell align="right">
                          {analysis.scores.impact}% measurable results
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </TabPanel>
          </Box>
        </Paper>

        {/* Next Steps */}
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom sx={{ color: 'white' }}>
                  Ready to improve your resume?
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Apply the AI suggestions to make your resume more competitive. Track your progress with another analysis after updating.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                  onClick={() => navigate('/upload')}
                >
                  Start New Analysis
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}