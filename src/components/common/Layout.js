import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && !isMobile && {
            marginLeft: '240px',
            width: `calc(100% - 240px)`,
          }),
        }}
      >
        <Navbar onMenuClick={toggleSidebar} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ flex: 1 }}
          >
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Outlet />
            </Box>
          </motion.div>
        </AnimatePresence>
        
        <Footer />
      </Box>
    </Box>
  );
}