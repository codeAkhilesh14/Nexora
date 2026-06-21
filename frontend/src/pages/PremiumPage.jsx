import { useMutation } from '@tanstack/react-query';
import { Crown, Eye, Rocket, Zap, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { setCredentials } from '../features/auth/authSlice.js';

const plans = [
  ['pulse_pro', '₹29', 'Pulse Pro', Zap, ['20 swipes daily', '120 messages daily', '120 messages daily in rooms', 'Premium badge', 'See users year']],
  ['orbit_z', '₹49', 'Orbit Z', Crown, ['30 swipes daily', 'Unlimited messages', 'Unlimited messages in rooms', 'Premium badge', 'See users year']],
  ['nebula_x', '₹99', 'Nebula X', Rocket, ['Unlimited swipes', 'Unlimited messages', 'Unlimited messages in rooms', 'Stealth-ready badge', 'See users year', 'Unlock Super Likes']]
];

const planIconColors = {
  pulse_pro: 'text-cyan-500 dark:text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]',
  orbit_z: 'text-violet-500 dark:text-violet-400 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]',
  nebula_x: 'text-amber-500 dark:text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]'
};

const activeBannerStyles = {
  pulse_pro: {
    container: 'from-cyan-500/10 via-sky-500/5 to-transparent border-cyan-500/30 dark:border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    iconColor: 'text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]',
    badge: 'bg-cyan-50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40'
  },
  orbit_z: {
    container: 'from-violet-500/10 via-fuchsia-500/5 to-transparent border-violet-500/30 dark:border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    iconColor: 'text-violet-500 dark:text-violet-400 drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
  },
  nebula_x: {
    container: 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 dark:border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    iconColor: 'text-amber-500 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  }
};

const activePlan = (plan) => ({ spark: 'pulse_pro', plus: 'orbit_z', max: 'nebula_x' }[plan] || plan);

const planRank = {
  pulse_pro: 1,
  spark: 1,
  orbit_z: 2,
  plus: 2,
  nebula_x: 3,
  max: 3
};
const isPremiumActive = (premium) => Boolean(premium?.active && (!premium.expiresAt || new Date(premium.expiresAt) > new Date()));
const formatDate = (date) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date)) : '';

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => reject(new Error('Unable to load Razorpay Checkout'));
  document.body.appendChild(script);
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
};

export const PremiumPage = () => {
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state.auth);
  const currentPlan = activePlan(user?.premium?.plan);
  const premiumActive = isPremiumActive(user?.premium);
  const buy = useMutation({
    mutationFn: (plan) => http.post('/subscriptions/orders', { plan }),
    onSuccess: async (res) => {
      try {
        const { order, keyId, subscription } = res.data;
        if (!keyId) {
          toast.error('Razorpay key is missing in backend .env');
          return;
        }
        await loadRazorpay();
        const checkout = new window.Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Nexora',
          description: `${subscription.plan} premium plan`,
          order_id: order.id,
          prefill: { email: user?.email },
          theme: { color: '#54f4c8' },
          handler: async (payment) => {
            try {
              await http.post('/subscriptions/verify', payment);
              const me = await http.get('/auth/me');
              dispatch(setCredentials({ user: me.data.user, accessToken }));
              toast.success('Premium activated');
            } catch (error) {
              toast.error(error.message || 'Payment verification failed');
            }
          },
          modal: { ondismiss: () => toast('Payment cancelled') }
        });
        checkout.on('payment.failed', (response) => {
          toast.error(response.error?.description || 'Payment failed');
        });
        checkout.open();
      } catch (error) {
        toast.error(error.message || 'Could not open Razorpay Checkout');
      }
    },
    onError: (error) => toast.error(error.message || 'Could not start payment')
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Premium Plans
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">Built for students, priced like canteen money.</p>
        </div>
        <Eye className="hidden text-amber-400 sm:block" size={34} />
      </div>
      
      {premiumActive && (() => {
        const info = plans.find(([id]) => id === currentPlan);
        const ActiveIcon = info?.[3] || Crown;
        const name = info?.[2] || 'Premium';
        const styles = activeBannerStyles[currentPlan] || activeBannerStyles.pulse_pro;
        return (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`mt-5 rounded-2xl border bg-gradient-to-r ${styles.container} p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-md`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 dark:bg-white/5 rounded-xl border border-white/10 shrink-0">
                <ActiveIcon className={styles.iconColor} size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-base text-slate-900 dark:text-white font-display">
                    Your {name} plan is active
                  </h3>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Purchase resets and unlocks again after the 28-day billing cycle.
                </p>
              </div>
            </div>
            
            <div className="shrink-0 flex items-center justify-start sm:justify-end w-full sm:w-auto">
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                Expires {formatDate(user.premium.expiresAt)}
              </span>
            </div>
          </motion.div>
        );
      })()}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      >
        {plans.map(([id, price, name, Icon, perks]) => {
          const isPopular = id === 'orbit_z';
          const isActive = premiumActive && currentPlan === id;
          const currentRank = premiumActive ? (planRank[currentPlan] || 0) : 0;
          const targetRank = planRank[id] || 0;
          const isUpgrade = premiumActive && targetRank > currentRank;
          const isDowngradeOrSame = premiumActive && targetRank <= currentRank;
          
          const buttonText = isActive ? 'Active' : isUpgrade ? 'Upgrade' : 'Activate';
          const buttonDisabled = buy.isPending || isActive || isDowngradeOrSame;
          return (
            <motion.div
              key={id}
              variants={cardItemVariants}
              className="relative"
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-gradient-to-r from-aurora via-teal-400 to-aurora px-4 py-1 text-xs font-black text-ink shadow-lg uppercase tracking-wider scale-95 border border-white/20">
                  Most Popular
                </div>
              )}
              <Card className={`h-full flex flex-col justify-between overflow-hidden relative border transition-all duration-300 ${isPopular ? 'border-aurora/40 dark:border-aurora/30 shadow-glow bg-gradient-to-b from-white to-aurora/5 dark:from-ink dark:to-aurora/5' : 'border-black/5 dark:border-white/5 bg-white dark:bg-ink'}`}>
                
                {isPopular && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-aurora/5 via-transparent to-flare/5 opacity-50"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}
                
                <div className="relative z-10 flex-1">
                  <div className="flex justify-between items-start">
                    <Icon className={planIconColors[id] || 'text-slate-400 dark:text-slate-500'} size={32} />
                    <span className="text-2xl sm:text-3xl font-black font-display text-slate-800 dark:text-white">{price}</span>
                  </div>
                  <h2 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white">{name}</h2>
                  
                  <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-3">
                    {perks.map((p) => (
                      <div key={p} className="flex items-center gap-2.5 text-sm">
                        <Check className="text-aurora shrink-0" size={16} />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative z-10 mt-5 sm:mt-8">
                  <Button
                    className={`w-full font-bold uppercase tracking-wider ${isPopular ? 'bg-aurora text-ink hover:bg-aurora/90' : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white'}`}
                    variant={isPopular ? 'neon' : 'ghost'}
                    onClick={() => buy.mutate(id)}
                    disabled={buttonDisabled}
                  >
                    {buttonText}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
