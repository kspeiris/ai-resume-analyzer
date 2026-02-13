import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function PrivateRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Authenticating..." />;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
}