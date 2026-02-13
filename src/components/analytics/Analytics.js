import { Assessment, AssignmentTurnedIn, Psychology, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, Container, Grid, LinearProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useAuth } from '../../contexts/AuthContext';
import { getAnalysisStats } from '../../services/analysisService';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchStats();
    }
  }, [currentUser]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAnalysisStats(currentUser.uid);
      setStats(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  const keywordData = [
    { name: 'Matched', value: stats?.keywordStats?.averageMatched || 0 },
    { name: 'Missing', value: stats?.keywordStats?.averageMissing || 0 },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Performance Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Analyses
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Avg Score
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats?.averageScore || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentTurnedIn color="secondary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Best Score
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats?.bestScore || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Psychology color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Worst Score
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {stats?.worstScore || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Score History Trend
              </Typography>
              <Box sx={{ height: 350, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.scoreHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Keyword Distribution
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={keywordData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {keywordData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {Math.round(
                      ((stats?.keywordStats?.averageMatched || 0) /
                        ((stats?.keywordStats?.averageMatched || 1) +
                          (stats?.keywordStats?.averageMissing || 0))) *
                      100
                    )}
                    %
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Match Rate
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Matched Keywords (Avg)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats?.keywordStats?.averageMatched || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Missing Keywords (Avg)</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {stats?.keywordStats?.averageMissing || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
