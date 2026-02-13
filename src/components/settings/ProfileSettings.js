import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  GitHub,
  Save,
  Edit,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/userService';
import { validateEmail, validatePhone } from '../../utils/validators';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || currentUser?.displayName || '',
    email: userProfile?.email || currentUser?.email || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    linkedin: userProfile?.linkedin || '',
    github: userProfile?.github || '',
    bio: userProfile?.bio || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone if provided
    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(currentUser.uid, formData);
      setUserProfile({ ...userProfile, ...formData });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Profile Settings
          </Typography>
          {!editing ? (
            <Button variant="outlined" startIcon={<Edit />} onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button variant="outlined" onClick={() => setEditing(false)} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Profile Picture */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: 48,
                  }}
                >
                  {formData.name.charAt(0).toUpperCase()}
                </Avatar>
                {editing && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                    }}
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                )}
              </Box>
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="+1 (555) 123-4567"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                disabled={!editing}
                placeholder="City, State"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="bio"
                label="Professional Summary"
                value={formData.bio}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Brief description of your professional background..."
              />
            </Grid>

            {/* Social Links */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
                Social Links
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="linkedin"
                label="LinkedIn Profile"
                value={formData.linkedin}
                onChange={handleChange}
                disabled={!editing}
                placeholder="https://linkedin.com/in/username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedIn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="github"
                label="GitHub Profile"
                value={formData.github}
                onChange={handleChange}
                disabled={!editing}
                placeholder="https://github.com/username"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GitHub />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
