import {
  Add,
  ArrowForward,
  Assessment,
  Description,
  History,
  Refresh,
  TrendingUp,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useAuth } from '../../contexts/AuthContext';
import { getUserAnalyses } from '../../services/analysisService';
import { getUserStats } from '../../services/userService';

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser, userProfile } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const [analysesData, statsData] = await Promise.all([
        getUserAnalyses(currentUser.uid, 5),
        getUserStats(currentUser.uid),
      ]);
      setAnalyses(analysesData.analyses);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Analyses',
      value: stats?.totalAnalyses || 0,
      icon: <Assessment />,
      color: '#2563eb',
    },
    {
      title: 'Average Score',
      value: `${stats?.averageScore || 0}%`,
      icon: <TrendingUp />,
      color: '#10b981',
    },
    {
      title: 'Resumes Uploaded',
      value: stats?.totalResumes || 0,
      icon: <Description />,
      color: '#7c3aed',
    },
    {
      title: 'Improvement Rate',
      value: `${stats?.improvementRate || 0}%`,
      icon: <TrendingUp />,
      color: '#f59e0b',
    },
  ];

  if (loading) {
    return (
      <Container sx={{ py: 8 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Welcome back, {userProfile?.name || currentUser?.displayName}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's an overview of your resume analysis activity
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/upload')}
          >
            New Analysis
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                          {stat.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                        {stat.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Progress Chart and Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Score Progression
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats?.scoreHistory || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Description />}
                    onClick={() => navigate('/upload')}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Upload Resume
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<History />}
                    onClick={() => navigate('/history')}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    View History
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Refresh />}
                    onClick={fetchDashboardData}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Refresh Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Analyses */}
        <Card>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Typography variant="h6">Recent Analyses</Typography>
              <Button endIcon={<ArrowForward />} onClick={() => navigate('/history')}>
                View All
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Keywords</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyses.length > 0 ? (
                    analyses.map((analysis) => (
                      <TableRow key={analysis.id} hover>
                        <TableCell>{new Date(analysis.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{analysis.jobDescription?.substring(0, 50)}...</TableCell>
                        <TableCell>
                          <Chip
                            label={`${analysis.scores?.overall}%`}
                            color={
                              analysis.scores?.overall >= 80
                                ? 'success'
                                : analysis.scores?.overall >= 60
                                  ? 'warning'
                                  : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {analysis.keywords?.matchedCount || 0}/{analysis.keywords?.total || 0}
                        </TableCell>
                        <TableCell>
                          <Chip label="Completed" color="success" size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No analyses yet. Start by uploading your first resume!
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{ mt: 2 }}
                          onClick={() => navigate('/upload')}
                        >
                          Upload Resume
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}
