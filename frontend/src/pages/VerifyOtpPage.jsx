import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { http } from '../api/http';
import { setCredentials } from '../features/auth/authSlice.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { AuthShell } from './AuthShell.jsx';

export const VerifyOtpPage = () => {
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Get email from navigation state or fallback to prompt
  const email = location.state?.email || '';

  const handleResend = async () => {
    if (!email) return toast.error('Missing email. Please sign up again.');
    setResending(true);
    try {
      await http.post('/auth/resend-otp', { email });
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error(error?.message || 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!email) {
        toast.error('Missing email. Please sign up again.');
        navigate('/auth/signup');
        return;
      }
      const res = await http.post('/auth/verify-otp', { email, otp });
      // After OTP verify, refresh tokens to log in
      try {
        const refreshRes = await http.post('/auth/refresh');
        if (refreshRes?.data && (refreshRes.data.user || refreshRes.data.accessToken)) {
          dispatch(setCredentials(refreshRes.data));
        }
      } catch {}
      toast.success('OTP verified!');
      navigate('/profile');
    } catch (error) {
      toast.error(error?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle="Enter the OTP sent to your college email.">
      <form onSubmit={handleVerify} className="mt-8 grid gap-3 sm:grid-cols-2">
        <Input className="sm:col-span-2" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
        <Button type="submit" className="sm:col-span-2" disabled={loading || !otp}>Verify OTP</Button>
        <Button type="button" className="sm:col-span-2" disabled={resending} onClick={handleResend}>
          {resending ? 'Sending...' : 'Resend OTP'}
        </Button>
      </form>
    </AuthShell>
  );
};

export default VerifyOtpPage;
