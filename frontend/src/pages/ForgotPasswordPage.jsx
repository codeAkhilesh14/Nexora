import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { AuthShell } from './AuthShell.jsx';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      return toast.error('Please enter your college email');
    }
    setLoading(true);
    try {
      await http.post('/auth/forgot-password', { email });
      toast.success('Reset code sent to your email');
      setStep(2);
    } catch (error) {
      toast.error(error?.message || 'Could not send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      return toast.error('Please enter the 6-digit OTP code');
    }
    if (!password.trim() || password.length < 8) {
      return toast.error('Password must be at least 8 characters long');
    }
    setLoading(true);
    try {
      await http.post('/auth/reset-password', { email, otp, password });
      toast.success('Password reset successfully. You can now login.');
      navigate('/auth/login');
    } catch (error) {
      toast.error(error?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await http.post('/auth/forgot-password', { email });
      toast.success('A new OTP has been sent to your email');
    } catch (error) {
      toast.error(error?.message || 'Could not resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (step === 1) {
    return (
      <AuthShell title="Reset password" subtitle="We'll send a 6-digit verification code to your email.">
        <form onSubmit={handleSendCode} className="mt-8 space-y-4">
          <div>
            <Input
              type="email"
              placeholder="College email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Button type="submit" className="w-full font-bold uppercase tracking-wider" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </div>
        </form>
        <p className="mt-5 text-sm text-slate-500">
          Remembered your password? <Link className="font-bold text-flare hover:underline" to="/auth/login">Back to Login</Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set new password" subtitle={`Enter the code sent to ${email} and your new password.`}>
      <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="New password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Button type="submit" className="w-full font-bold uppercase tracking-wider" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs font-semibold"
            disabled={resending}
            onClick={handleResendOtp}
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </Button>
        </div>
      </form>
      <p className="mt-5 text-sm text-slate-500">
        Remembered your password? <Link className="font-bold text-flare hover:underline" to="/auth/login">Back to Login</Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
