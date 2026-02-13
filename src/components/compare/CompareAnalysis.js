import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Button,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  RemoveCircle,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { compareAnalyses } from '../../services/analysisService';
import { useNavigate } from 'react-router-dom';

export default function CompareAnalysis() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const compareList = JSON.parse(localStorage.getItem('compareAnalyses') || '[]');
      
      if (compareList.length < 2) {
        navigate('/history');
        return;
      }

      const result = await compareAnalyses(compareList[0], compareList[1]);
      setComparison(result);
      
      // Clear comparison list
      localStorage.removeItem('compareAnalyses');
    } catch (error) {
      setError('Failed to compare analyses');
    } finally {
      setLoading(false);
    }
  };

  const getScoreDifferenceColor = (diff) => {
    if (diff > 0) return 'success.main';
    if (diff < 0) return 'error.main';
    return 'text.secondary';
  };

  const getScoreDifferenceIcon = (diff) => {
    if (diff > 0) return <TrendingUp sx={{ color: 'success.main' }} />;
    if (diff < 0) return <TrendingDown sx={{ color: 'error.main' }} />;
    return <RemoveCircle sx={{ color: 'text.secondary' }} />;
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Comparing analyses...</Typography>
      </Container>
    );
  }

  if (error || !comparison) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error || 'Failed to load comparison'}</Alert>
      </Container>
    );
  }

  const { first, second, differences } = comparison;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Analysis Comparison
        </Typography>
        <Typography color="text.secondary" paragraph>
          Comparing analyses from {new Date(first.createdAt).toLocaleDateString()} and{' '}
          {new Date(second.createdAt).toLocaleDateString()}
        </Typography>

        {/* Overall Improvement */}
        <Paper sx={{ p: 4, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Overall Progress
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'white' }}>
                {differences.scoreChange > 0 ? '+' : ''}{differences.scoreChange}%
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {differences.scoreChange > 0 
                  ? 'Your resume has improved! Keep up the good work.'
                  : 'Your score decreased. Review the recommendations below.'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              {getScoreDifferenceIcon(differences.scoreChange)}
              <Typography variant="h6" sx={{ mt: 1, color: 'white' }}>
                {differences.scoreChange > 0 ? 'Improvement' : 'Decline'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={4}>
          {/* Score Comparison */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Score Breakdown
                </Typography>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>ATS Score</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${first.scores.overall}%`}
                            color={first.scores.overall >= 80 ? 'success' : first.scores.overall >= 60 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={`${second.scores.overall}%`}
                            color={second.scores.overall >= 80 ? 'success' : second.scores.overall >= 60 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getScoreDifferenceIcon(differences.scoreChange)}
                            <Typography 
                              sx={{ ml: 1, color: getScoreDifferenceColor(differences.scoreChange) }}
                            >
                              {differences.scoreChange > 0 ? '+' : ''}{differences.scoreChange}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Keyword Match</TableCell>
                        <TableCell align="center">{first.scores.keyword}%</TableCell>
                        <TableCell align="center">{second.scores.keyword}%</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getScoreDifferenceIcon(differences.keywordImprovement)}
                            <Typography sx={{ ml: 1, color: getScoreDifferenceColor(differences.keywordImprovement) }}>
                              {differences.keywordImprovement > 0 ? '+' : ''}{differences.keywordImprovement}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Format Score</TableCell>
                        <TableCell align="center">{first.scores.format}%</TableCell>
                        <TableCell align="center">{second.scores.format}%</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getScoreDifferenceIcon(differences.formatImprovement)}
                            <Typography sx={{ ml: 1, color: getScoreDifferenceColor(differences.formatImprovement) }}>
                              {differences.formatImprovement > 0 ? '+' : ''}{differences.formatImprovement}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Impact Score</TableCell>
                        <TableCell align="center">{first.scores.impact}%</TableCell>
                        <TableCell align="center">{second.scores.impact}%</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getScoreDifferenceIcon(differences.impactImprovement)}
                            <Typography sx={{ ml: 1, color: getScoreDifferenceColor(differences.impactImprovement) }}>
                              {differences.impactImprovement > 0 ? '+' : ''}{differences.impactImprovement}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Keywords Comparison */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Keywords Added
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 100 }}>
                  {second.keywords.matched
                    .filter(k => !first.keywords.matched.includes(k))
                    .map((keyword, i) => (
                      <Chip
                        key={i}
                        label={keyword}
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                    ))}
                  {second.keywords.matched.filter(k => !first.keywords.matched.includes(k)).length === 0 && (
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No new keywords added
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Keywords Still Missing */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Still Missing
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 100 }}>
                  {second.keywords.missing
                    .filter(k => !first.keywords.missing.includes(k) || first.keywords.matched.includes(k))
                    .map((keyword, i) => (
                      <Chip
                        key={i}
                        label={keyword}
                        color="warning"
                        size="small"
                        icon={<Warning />}
                      />
                    ))}
                  {second.keywords.missing.length === 0 && (
                    <Typography color="success.main" sx={{ py: 2 }}>
                      Great job! No missing keywords
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations Progress */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommendations Progress
                </Typography>
                <List>
                  {first.recommendations.improvements.map((rec, index) => {
                    const isCompleted = second.recommendations.improvements.includes(rec);
                    return (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {isCompleted ? (
                            <CheckCircle color="success" />
                          ) : (
                            <RadioButtonUnchecked color="disabled" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={rec}
                          secondary={isCompleted ? 'Completed' : 'Not yet addressed'}
                          secondaryTypographyProps={{
                            color: isCompleted ? 'success.main' : 'text.secondary'
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/analysis/${first.id}`)}
          >
            View First Analysis
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(`/analysis/${second.id}`)}
          >
            View Latest Analysis
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/upload')}
          >
            New Analysis
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}