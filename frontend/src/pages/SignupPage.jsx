import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
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
  ['Guru Gobind Singh Indraprastha University', 'ipu.ac.in'],
  ['Jaypee Institute of Information Technology', 'jiit.ac.in'],
  ['GL Bajaj Institute of Technology and Management', 'glbitm.ac.in'],
  ['Noida Institute of Engineering and Technology', 'niet.co.in'],
  ['ABES Engineering College', 'abes.ac.in'],
  ['Ajay Kumar Garg Engineering College', 'akgec.ac.in'],
  ['Greater Noida Institute of Technology', 'gnit.ac.in'],
  ['IILM University Greater Noida', 'iilm.edu'],
  ['Shiv Nadar University', 'snu.edu.in'],
  ['Maharaja Agrasen Institute of Technology', 'mait.ac.in'],
  ['Maharaja Surajmal Institute of Technology', 'msit.in'],
  ['Bharati Vidyapeeth College of Engineering', 'bharatividyapeeth.edu'],
  ['Bharati Vidyapeeth Institute of Computer Applications and Management', 'bvicam.ac.in'],
  ['National Institute of Technology Delhi', 'nitdelhi.ac.in'],
  ['Jamia Millia Islamia', 'jmi.ac.in'],
  ['Jamia Hamdard', 'jamiahamdard.ac.in'],
  ['Delhi Skill and Entrepreneurship University', 'dseu.ac.in'],
  ['Delhi Pharmaceutical Sciences and Research University', 'dpsru.edu.in'],
  ['Indira Gandhi Delhi Technical University for Women', 'igdtuw.ac.in'],
  ['Guru Tegh Bahadur Institute of Technology', 'gtbit.ac.in'],
  ['Maharaja Agrasen University', 'maharajaagrasenuniversity.in'],
  ['Fairfield Institute of Management and Technology', 'fimt-ggsipu.org'],
  ['HMR Institute of Technology and Management', 'hmritm.ac.in'],
  ['Vivekananda Institute of Professional Studies', 'vips.edu'],
  ['Institute of Information Technology and Management', 'iitmjanakpuri.com'],
  ['Tecnia Institute of Advanced Studies', 'tecnia.in'],
  ['Delhi Institute of Advanced Studies', 'dias.ac.in'],
  ['Chanderprabhu Jain College of Higher Studies', 'cpj.edu.in'],
  ['Jagannath International Management School', 'jimsindia.org'],
  ['Rukmini Devi Institute of Advanced Studies', 'rdias.ac.in'],
  ['Lingayas Vidyapeeth', 'lingayasvidyapeeth.edu.in'],
  ['Manav Rachna University', 'manavrachna.edu.in'],
  ['Manav Rachna International Institute of Research and Studies', 'mriu.edu.in'],
  ['YMCA University of Science and Technology', 'jcboseust.ac.in'],
  ['KR Mangalam University', 'krmangalam.edu.in'],
  ['Ansal University', 'sgtuniversity.ac.in'],
  ['St Andrews Institute of Technology and Management', 'saitm.ac.in'],
  ['GD Goenka University', 'gdgoenkauniversity.com'],
  ['The NorthCap University', 'ncuindia.edu'],
  ['SRM University Delhi NCR', 'srmist.edu.in'],
  ['World College of Technology and Management', 'wctmgurgaon.com'],
  ['BM Institute of Engineering and Technology', 'bmiet.net'],
  ['Dronacharya College of Engineering', 'dronacharya.info'],
  ['KIET Group of Institutions', 'kiet.edu'],
  ['IMS Engineering College', 'imsec.ac.in'],
  ['RKGIT', 'rkgit.edu.in']
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
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { gender: 'prefer_not', year: 1 } });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedCollege = watch('collegeName') || '';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredColleges = colleges.filter(([name]) => 
    name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

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
          <div ref={dropdownRef} className="relative w-full">
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="h-11 w-full flex items-center justify-between rounded-xl border border-black/10 bg-white/70 px-3.5 text-sm font-medium outline-none transition cursor-pointer dark:border-white/10 dark:bg-white/5 text-slate-800 dark:text-slate-200"
            >
              <span className={selectedCollege ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400/80 dark:text-slate-400/60 font-normal'}>
                {selectedCollege || 'Select College'}
              </span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <input type="hidden" {...register('collegeName')} />

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 mt-1.5 w-full rounded-2xl bg-white/95 dark:bg-[#15171e]/95 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-md overflow-hidden p-2"
                >
                  {/* Search Input Box */}
                  <div className="relative mb-2">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search college..."
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-9 pl-9 pr-4 text-xs rounded-xl border border-black/5 bg-slate-50 dark:bg-white/5 outline-none focus:border-aurora transition dark:border-white/5 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Options List */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {filteredColleges.length > 0 ? (
                      filteredColleges.map(([college, domain]) => (
                        <button
                          key={college}
                          type="button"
                          onClick={() => {
                            setValue('collegeName', college, { shouldValidate: true });
                            setDropdownOpen(false);
                            setCollegeSearch('');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex flex-col gap-0.5 ${
                            selectedCollege === college ? 'bg-aurora/10 text-emerald-600 dark:text-aurora font-semibold' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{college}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">@{domain}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-xs text-slate-500 py-3">No colleges found</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {errors.collegeName && <p className="mt-1 text-xs font-semibold text-flare">{errors.collegeName.message}</p>}
          <p className="mt-2 text-xs text-slate-500">
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
