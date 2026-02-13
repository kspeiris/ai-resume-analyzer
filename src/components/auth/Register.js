import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress
} from '@mui/material';
import {
  Google,
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  CheckCircle
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { validatePassword } from '../../utils/validators';

const steps = ['Account', 'Profile', 'Complete'];

const schema = yup.object({
  name: yup.string().required('Full name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions')
});

export default function Register() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      setActiveStep(1);
      
      await signup(data.email, data.password, data.name);
      
      setActiveStep(2);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.message);
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const validation = validatePassword(password);
    if (password.length === 0) return 0;
    if (validation.isValid) return 100;
    return Math.min(validation.errors.length * 20, 80);
  };

  const passwordStrength = getPasswordStrength();
  const passwordColor = passwordStrength >= 80 ? 'success' : 
                       passwordStrength >= 50 ? 'warning' : 'error';

  return (
    <Container component="main" maxWidth="sm">
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
            py: 4
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 2
            }}
          >
            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                component={RouterLink}
                to="/"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  display: 'inline-block',
                  mb: 1
                }}
              >
                AI Resume Analyzer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your free account to get started
              </Typography>
            </Box>

            {/* Success Message */}
            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                </motion.div>
                <Typography variant="h6" gutterBottom>
                  Account Created Successfully!
                </Typography>
                <Typography color="text.secondary">
                  Redirecting to dashboard...
                </Typography>
                <LinearProgress sx={{ mt: 3 }} />
              </Box>
            )}

            {/* Error Alert */}
            {error && activeStep !== 2 && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Registration Form */}
            {activeStep !== 2 && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  {...register('name')}
                  fullWidth
                  label="Full Name"
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  {...register('email')}
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  {...register('password')}
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Password Strength
                      </Typography>
                      <Typography variant="caption" color={`${passwordColor}.main`}>
                        {passwordStrength >= 80 ? 'Strong' : 
                         passwordStrength >= 50 ? 'Medium' : 'Weak'}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      color={passwordColor}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}

                <TextField
                  {...register('confirmPassword')}
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  margin="normal"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}

            {activeStep === 0 && (
              <>
                <Divider sx={{ my: 2 }}>OR</Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<Google />}
                  onClick={() => {}}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  Sign up with Google
                </Button>
              </>
            )}

            {activeStep === 0 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    underline="hover"
                    fontWeight={600}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
}