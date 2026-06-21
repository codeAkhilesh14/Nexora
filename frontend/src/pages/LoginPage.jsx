import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { setCredentials } from '../features/auth/authSlice.js';
import { AuthShell } from './AuthShell.jsx';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

const formContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3
    }
  }
};

const formItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 14 } }
};

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({ resolver: zodResolver(schema) });
  if (token) return <Navigate to="/" replace />;
  const onSubmit = async (values) => {
    try {
      const res = await http.post('/auth/login', values);
      dispatch(setCredentials(res.data));
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
    }
  };
  const onInvalid = (formErrors) => {
    const first = Object.values(formErrors)[0]?.message;
    toast.error(first || 'Please enter your email and password');
  };
  return (
    <AuthShell title="Enter Nexora" subtitle="Use your verified campus account.">
      <motion.form
        variants={formContainer}
        initial="hidden"
        animate="show"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="mt-8 space-y-4"
      >
        <motion.div variants={formItem}>
          <Input placeholder="College email" type="email" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs font-semibold text-flare">{errors.email.message}</p>}
        </motion.div>
        
        <motion.div variants={formItem}>
          <Input placeholder="Password" type="password" {...register('password')} />
          {errors.password && <p className="mt-1 text-xs font-semibold text-flare">{errors.password.message}</p>}
          <div className="flex justify-end mt-1.5">
            <Link className="text-xs font-semibold text-flare hover:underline" to="/auth/forgot-password">
              Forgot Password?
            </Link>
          </div>
        </motion.div>

        <motion.div variants={formItem}>
          <Button className="w-full font-bold uppercase tracking-wider" disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Login'}
          </Button>
        </motion.div>
      </motion.form>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-5 text-sm text-slate-500"
      >
        New here? <Link className="font-bold text-flare hover:underline" to="/auth/signup">Join your campus</Link>
      </motion.p>
    </AuthShell>
  );
};
