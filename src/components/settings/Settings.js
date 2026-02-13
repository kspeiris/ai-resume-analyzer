import { Notifications, Payment, Person, Security } from '@mui/icons-material';
import { Box, Container, Divider, Paper, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';

import BillingSettings from './BillingSettings';
import NotificationSettings from './NotificationSettings';
import ProfileSettings from './ProfileSettings';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        Settings
      </Typography>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab icon={<Person />} iconPosition="start" label="Profile" />
          <Tab icon={<Notifications />} iconPosition="start" label="Notifications" />
          <Tab icon={<Security />} iconPosition="start" label="Security" />
          <Tab icon={<Payment />} iconPosition="start" label="Billing" />
        </Tabs>

        <Box sx={{ p: 0 }}>
          <TabPanel value={tabValue} index={0}>
            <ProfileSettings />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {/* If NotificationSettings is empty, we can show a placeholder or a simple list */}
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">Notification Preferences</Typography>
              <Typography color="text.secondary">
                Manage how you receive alerts and updates.
              </Typography>
              <Typography sx={{ mt: 2 }}>Coming soon in v1.1</Typography>
            </Box>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">Security & Privacy</Typography>
              <Typography color="text.secondary">
                Update your password and manage account security.
              </Typography>
              <Typography sx={{ mt: 2 }}>Coming soon in v1.1</Typography>
            </Box>
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6">Subscription & Billing</Typography>
              <Typography color="text.secondary">Manage your plan and payment methods.</Typography>
              <Typography sx={{ mt: 2 }}>Current Plan: Free Tier</Typography>
            </Box>
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
}
