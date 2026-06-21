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

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  nickname: z.string().min(3, 'Nickname must be at least 3 characters'),
  collegeName: z.string().min(2, 'College name is required').max(120),
  branch: z.string().min(2, 'Branch is required'),
  year: z.coerce.number({ invalid_type_error: 'Year is required' }).min(1, 'Year must be between 1 and 6').max(6, 'Year must be between 1 and 6'),
  gender: z.enum(['woman', 'man', 'non_binary', 'prefer_not'], { required_error: 'Gender is required' })
});

const colleges = [
  ['Test College', 'gmail.com'],
  ['JSS Academy of Technical Education Noida', 'jssaten.ac.in'],
  ['Indian Institute of Technology Delhi', 'iitd.ac.in'],
  ['Delhi Technological University', 'dtu.ac.in'],
  ['Netaji Subhas University of Technology', 'nsut.ac.in'],
  ['Bennett University', 'bennett.edu.in'],
  ['Sharda University', 'sharda.ac.in'],
  ['Galgotias University', 'galgotiasuniversity.edu.in'],
  ['Amity University Noida', 'amity.edu'],
  ['Indraprastha Institute of Information Technology Delhi', 'iiitd.ac.in'],
  ['Guru Gobind Singh Indraprastha University', 'ipu.ac.in']
];

const formContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3
    }
  }
};

const formItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 14 } }
};

export const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.accessToken);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { gender: 'prefer_not', year: 1 } });
  if (token) return <Navigate to="/" replace />;
  const getApiError = (error) => {
    if (!error) return 'Signup failed';
    if (typeof error === 'string') return error;
    return error.message || error.data?.message || error.error || 'Signup failed';
  };

  const onSubmit = async (values) => {
    try {
      await http.post('/auth/signup', values);
      toast.success('OTP sent to your email');
      navigate('/auth/verify-otp', { state: { email: values.email } });
    } catch (error) {
      toast.error(getApiError(error));
    }
  };
  const onInvalid = (formErrors) => {
    const first = Object.values(formErrors)[0]?.message;
    toast.error(first || 'Please check the signup form');
  };
  return (
    <AuthShell title="Claim your anonymous campus ID" subtitle="Select an approved Delhi NCR college and verify your email.">
      <motion.form
        variants={formContainer}
        initial="hidden"
        animate="show"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="mt-8 grid gap-3 sm:grid-cols-2"
      >
        <motion.div variants={formItem} className="sm:col-span-2">
          <Input placeholder="College email" type="email" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs font-semibold text-flare">{errors.email.message}</p>}
        </motion.div>
        
        <motion.div variants={formItem} className="sm:col-span-2">
          <Input placeholder="College Name" list="college-names" {...register('collegeName')} />
          <datalist id="college-names">
            {colleges.map(([college, domain]) => <option key={college} value={college}>{domain}</option>)}
          </datalist>
          <p className="mt-1 text-xs text-slate-500">
            A matching college email domain verifies your student status automatically.
          </p>
        </motion.div>
        
        <motion.div variants={formItem}>
          <Input placeholder="Nickname" {...register('nickname')} />
        </motion.div>
        
        <motion.div variants={formItem}>
          <Input placeholder="Branch" {...register('branch')} />
        </motion.div>
        
        <motion.div variants={formItem}>
          <Input placeholder="Year" type="number" {...register('year')} />
        </motion.div>
        
        <motion.div variants={formItem}>
          <select className="h-11 w-full rounded-xl border border-black/10 bg-white/70 px-3.5 text-sm font-medium outline-none transition focus:border-aurora focus:ring-1 focus:ring-aurora/20 dark:border-white/10 dark:bg-white/5" {...register('gender')}>
            <option value="prefer_not">Prefer not</option><option value="woman">Woman</option><option value="man">Man</option><option value="non_binary">Non-binary</option>
          </select>
        </motion.div>
        
        <motion.div variants={formItem} className="sm:col-span-2">
          <Input placeholder="Password" type="password" {...register('password')} />
        </motion.div>
        
        <motion.div variants={formItem} className="sm:col-span-2 mt-2">
          <Button type="submit" className="w-full font-bold uppercase tracking-wider" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Create campus profile'}
          </Button>
        </motion.div>
      </motion.form>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-5 text-sm text-slate-500"
      >
        Already joined? <Link className="font-bold text-flare hover:underline" to="/auth/login">Login</Link>
      </motion.p>
    </AuthShell>
  );
};
