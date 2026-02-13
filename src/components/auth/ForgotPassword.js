import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { resetPassword } from '../../services/userService';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Link
                component={RouterLink}
                to="/login"
                sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
              >
                <ArrowBack sx={{ mr: 1 }} /> Back to Login
              </Link>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {sent ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Password reset email sent! Check your inbox.
                </Alert>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Didn't receive the email? Check your spam folder or{' '}
                  <Link href="#" onClick={handleSubmit}>
                    click here to resend
                  </Link>
                </Typography>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
}
