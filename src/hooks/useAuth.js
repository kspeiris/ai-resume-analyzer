import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/userService';
import toast from 'react-hot-toast';

export function useAuthGuard(redirectTo = '/login') {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        toast.error('Please login to access this page');
        navigate(redirectTo);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [currentUser, loading, navigate, redirectTo]);

  return { isAuthorized, user: currentUser, loading };
}

export function useUserProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile(currentUser.uid);
      setProfile(userProfile);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, refetch: fetchProfile };
}
