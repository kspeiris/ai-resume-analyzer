import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import { GitHub, LinkedIn, Twitter, Facebook } from '@mui/icons-material';
import React from 'react';

export default function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor:
          theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.82)' : 'rgba(15, 23, 42, 0.86)',
        backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              AI Resume Analyzer
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Empowering job seekers with AI technology to optimize their resumes and land their
              dream jobs.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton size="small" color="inherit" href="https://github.com" target="_blank">
                <GitHub />
              </IconButton>
              <IconButton size="small" color="inherit" href="https://linkedin.com" target="_blank">
                <LinkedIn />
              </IconButton>
              <IconButton size="small" color="inherit" href="https://twitter.com" target="_blank">
                <Twitter />
              </IconButton>
              <IconButton size="small" color="inherit" href="https://facebook.com" target="_blank">
                <Facebook />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Product
            </Typography>
            <Link href="/features" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Features
            </Link>
            <Link href="/pricing" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Pricing
            </Link>
            <Link href="/api" color="text.secondary" display="block" sx={{ mb: 1 }}>
              API
            </Link>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Company
            </Typography>
            <Link href="/about" color="text.secondary" display="block" sx={{ mb: 1 }}>
              About
            </Link>
            <Link href="/blog" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Blog
            </Link>
            <Link href="/careers" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Careers
            </Link>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="/docs" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Documentation
            </Link>
            <Link href="/support" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Support
            </Link>
            <Link href="/contact" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Contact
            </Link>
          </Grid>

          <Grid item xs={12} md={2}>
            <Typography variant="subtitle2" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link href="/privacy" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Privacy
            </Link>
            <Link href="/terms" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Terms
            </Link>
            <Link href="/cookies" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Cookies
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          Copyright {currentYear} AI Resume Analyzer. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
