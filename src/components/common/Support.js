import { Chat, Email, Forum } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Support() {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your message has been sent to support!');
    setFormData({ subject: '', message: '' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Support
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        We're here to help you succeed in your job search.
      </Typography>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                sx={{ mb: 3 }}
                required
              />
              <TextField
                fullWidth
                label="How can we help?"
                name="message"
                multiline
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                sx={{ mb: 3 }}
                required
              />
              <Button type="submit" variant="contained" size="large" fullWidth>
                Send Message
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Email Support</Typography>
                  <Typography variant="body2" color="text.secondary">
                    support@airesume.com
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Chat sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Live Chat</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Mon-Fri, 9am-5pm EST
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Forum sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>Community Forum</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Join our community of job seekers
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

// Helper to use Stack
function Stack({ children, spacing }) {
  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}>{children}</Box>;
}
