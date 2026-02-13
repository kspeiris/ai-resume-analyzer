import {
  Assessment,
  Compare,
  Delete,
  Download,
  MoreVert,
  Refresh,
  Search,
  TrendingDown,
  TrendingUp,
  Visibility,
} from '@mui/icons-material';
import {
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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { deleteAnalysis, getUserAnalyses } from '../../services/analysisService';
import { exportAnalysisHistory } from '../../utils/exportUtils';
import { formatDate, getScoreColor, getScoreStatus } from '../../utils/helpers';

export default function History() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    averageScore: 0,
    bestScore: 0,
    improvement: 0
  });

  useEffect(() => {
    if (currentUser?.uid) {
      fetchAnalyses();
    }
  }, [currentUser]);

  const fetchAnalyses = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const data = await getUserAnalyses(currentUser.uid, 100);
      setAnalyses(data.analyses);
      calculateStats(data.analyses);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) return;

    const scores = data.map(a => a.scores?.overall || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const best = Math.max(...scores);

    let improvement = 0;
    if (data.length >= 2) {
      const lastTwo = data.slice(0, 2);
      improvement = lastTwo[0].scores?.overall - lastTwo[1].scores?.overall;
    }

    setStats({
      total: data.length,
      averageScore: Math.round(avg),
      bestScore: best,
      improvement
    });
  };

  const handleDelete = async (analysisId) => {
    try {
      await deleteAnalysis(analysisId);
      setAnalyses(analyses.filter(a => a.id !== analysisId));
      toast.success('Analysis deleted successfully');
    } catch (error) {
      toast.error('Failed to delete analysis');
    }
  };

  const handleExport = () => {
    try {
      exportAnalysisHistory(analyses);
      toast.success('History exported successfully');
    } catch (error) {
      toast.error('Failed to export history');
    }
  };

  const handleMenuOpen = (event, analysis) => {
    setAnchorEl(event.currentTarget);
    setSelectedAnalysis(analysis);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAnalysis(null);
  };

  const handleView = () => {
    if (selectedAnalysis) {
      navigate(`/analysis/${selectedAnalysis.id}`);
    }
    handleMenuClose();
  };

  const handleCompare = () => {
    if (selectedAnalysis) {
      // Store selected analysis in localStorage for comparison
      const compareList = JSON.parse(localStorage.getItem('compareAnalyses') || '[]');
      compareList.push(selectedAnalysis.id);
      localStorage.setItem('compareAnalyses', JSON.stringify(compareList));

      if (compareList.length >= 2) {
        navigate('/compare');
      } else {
        toast.success('Analysis added to comparison. Select one more to compare.');
      }
    }
    handleMenuClose();
  };

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(analysis.createdAt).toLocaleDateString().includes(searchTerm)
  );

  const paginatedAnalyses = filteredAnalyses.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading analysis history...</Typography>
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
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Analysis History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage your past resume analyses
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={analyses.length === 0}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchAnalyses}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Analyses
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Average Score
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {stats.averageScore}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Best Score
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {stats.bestScore}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Improvement
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mr: 1 }}>
                    {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
                  </Typography>
                  {stats.improvement > 0 ? (
                    <TrendingUp color="success" />
                  ) : stats.improvement < 0 ? (
                    <TrendingDown color="error" />
                  ) : null}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by job title or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: analyses.length > 0 && (
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.secondary">
                    {filteredAnalyses.length} results
                  </Typography>
                </InputAdornment>
              )
            }}
          />
        </Paper>

        {/* Analyses Table */}
        {analyses.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No analyses yet
            </Typography>
            <Typography color="text.secondary" paragraph>
              Start by uploading your resume and analyzing it against a job description.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/upload')}
            >
              Upload Resume
            </Button>
          </Paper>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Job Description</TableCell>
                    <TableCell>ATS Score</TableCell>
                    <TableCell>Keywords</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAnalyses.map((analysis) => (
                    <TableRow key={analysis.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(analysis.createdAt)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(analysis.createdAt).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                          {analysis.jobDescription?.substring(0, 100)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={`${analysis.scores?.overall || 0}%`}
                            color={getScoreColor(analysis.scores?.overall || 0)}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getScoreStatus(analysis.scores?.overall || 0)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${analysis.keywords?.matchedCount || 0}/${analysis.keywords?.total || 0}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Completed"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/analysis/${analysis.id}`)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, analysis)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAnalyses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleView}>
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCompare}>
            <ListItemIcon>
              <Compare fontSize="small" />
            </ListItemIcon>
            <ListItemText>Compare</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            if (selectedAnalysis) {
              handleDelete(selectedAnalysis.id);
              handleMenuClose();
            }
          }}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </motion.div>
    </Container>
  );
}
