import CssBaseline from '@mui/material/CssBaseline';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import AnalysisResults from './components/analysis/AnalysisResults';
import Analytics from './components/analytics/Analytics';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Help from './components/common/Help';
import Layout from './components/common/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import Support from './components/common/Support';
import CompareAnalysis from './components/compare/CompareAnalysis';
import Dashboard from './components/dashboard/Dashboard';
import History from './components/history/History';
import JobDescription from './components/job/JobDescription';
import Landing from './components/landing/Landing';
import ResumeUpload from './components/resume/ResumeUpload';
import Settings from './components/settings/Settings';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<ResumeUpload />} />
                <Route path="/job-description" element={<JobDescription />} />
                <Route path="/analysis/:id" element={<AnalysisResults />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="/support" element={<Support />} />
                <Route path="/compare" element={<CompareAnalysis />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </>
  );
}

export default App;
