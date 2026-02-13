import {
  Analytics,
  AutoAwesome,
  Close,
  Download,
  Menu,
  Security,
  Speed,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import heroPreview from '../../assets/hero.png';
import { useAuth } from '../../contexts/AuthContext';

const features = [
  {
    icon: <AutoAwesome sx={{ fontSize: 40 }} />,
    title: 'AI-Powered Analysis',
    description:
      'Advanced AI algorithms analyze your resume against job descriptions with 98% accuracy',
  },
  {
    icon: <Analytics sx={{ fontSize: 40 }} />,
    title: 'ATS Score & Insights',
    description: 'Get detailed ATS compatibility scores and actionable improvement suggestions',
  },
  {
    icon: <Speed sx={{ fontSize: 40 }} />,
    title: 'Lightning Fast',
    description: 'Complete resume analysis in under 30 seconds with our optimized engine',
  },
  {
    icon: <Security sx={{ fontSize: 40 }} />,
    title: 'Enterprise Security',
    description: 'Bank-level encryption ensures your data stays private and secure',
  },
];

const stats = [
  { value: '50K+', label: 'Resumes Analyzed' },
  { value: '85%', label: 'Success Rate' },
  { value: '4.9', label: 'User Rating' },
  { value: '24/7', label: 'Support' },
];

export default function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Navigation */}
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          backdropFilter: 'blur(20px)',
          background:
            theme.palette.mode === 'light' ? 'rgba(255,255,255,0.86)' : 'rgba(15,23,42,0.82)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              AI Resume Analyzer
            </Typography>

            {isMobile ? (
              <IconButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <Close /> : <Menu />}
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button color="inherit" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="contained" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            zIndex: 1100,
            p: 2,
            boxShadow: 2,
          }}
        >
          <Container>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Container>
        </Box>
      )}

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 20 }, pb: { xs: 8, md: 16 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, mb: 2 }}>
                Land Your Dream Job with{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  AI-Powered
                </Box>{' '}
                Resume Optimization
              </Typography>

              <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
                Get instant ATS compatibility scores and personalized recommendations to beat the
                bots and impress recruiters.
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Start Free Analysis
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Download />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  View Demo
                </Button>
              </Box>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box
                component="img"
                src={heroPreview}
                alt="Dashboard Preview"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: theme.shadows[4],
                }}
              />
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item key={index} xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ color: 'white', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 16 } }}>
        <Typography variant="h2" align="center" sx={{ mb: 2 }}>
          Why Choose Our Platform?
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 8 }}>
          Everything you need to optimize your resume for ATS systems
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} md={6} lg={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        width: 64,
                        height: 64,
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">{feature.description}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 16 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ mb: 2 }}>
            How It Works
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 8 }}>
            Three simple steps to optimize your resume
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                step: '01',
                title: 'Upload Resume',
                description: 'Upload your resume in PDF or DOCX format',
              },
              {
                step: '02',
                title: 'Add Job Description',
                description: 'Paste the job description you want to target',
              },
              {
                step: '03',
                title: 'Get Analysis',
                description: 'Receive comprehensive feedback and recommendations',
              },
            ].map((item, index) => (
              <Grid item key={index} xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h1" sx={{ color: 'primary.light', mb: 2 }}>
                    {item.step}
                  </Typography>
                  <Typography variant="h4" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">{item.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 16 } }}>
        <Card
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            backgroundImage: 'none',
            p: { xs: 4, md: 8 },
          }}
        >
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ color: 'primary.contrastText', mb: 2 }}>
                Ready to Optimize Your Resume?
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: 'rgba(255,255,255,0.92)', mb: 4, fontWeight: 500 }}
              >
                Join thousands of job seekers who have successfully improved their resumes with our
                AI analyzer.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  px: 6,
                  py: 2,
                }}
                onClick={() => navigate('/register')}
              >
                Get Started For Free
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'light' ? 'grey.900' : '#020617',
          color: 'white',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                AI Resume Analyzer
              </Typography>
              <Typography color="grey.500">
                Empowering job seekers with AI technology to land their dream jobs.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" gutterBottom color="grey.400">
                    Product
                  </Typography>
                  <Typography color="grey.500">Features</Typography>
                  <Typography color="grey.500">Pricing</Typography>
                  <Typography color="grey.500">API</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" gutterBottom color="grey.400">
                    Company
                  </Typography>
                  <Typography color="grey.500">About</Typography>
                  <Typography color="grey.500">Blog</Typography>
                  <Typography color="grey.500">Careers</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" gutterBottom color="grey.400">
                    Support
                  </Typography>
                  <Typography color="grey.500">Help Center</Typography>
                  <Typography color="grey.500">Contact</Typography>
                  <Typography color="grey.500">Privacy</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" gutterBottom color="grey.400">
                    Legal
                  </Typography>
                  <Typography color="grey.500">Terms</Typography>
                  <Typography color="grey.500">Privacy</Typography>
                  <Typography color="grey.500">Cookies</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 4,
              pt: 4,
              borderTop: '1px solid',
              borderColor: 'grey.800',
              textAlign: 'center',
            }}
          >
            <Typography color="grey.500">
              Copyright {new Date().getFullYear()} AI Resume Analyzer. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
