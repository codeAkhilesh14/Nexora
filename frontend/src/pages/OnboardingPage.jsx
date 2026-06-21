import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Compass, ShieldAlert, Sparkles, MessageSquare, Zap, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Logo } from '../components/common/Logo.jsx';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentScene, setCurrentScene] = useState(0);

  // If onboarding is not needed or already completed, redirect to /discover
  useEffect(() => {
    if (user) {
      const isPending = localStorage.getItem(`nexora_onboarding_pending_${user._id || user.id}`);
      
      // If profile is already complete and no onboarding is pending, redirect
      if (user.profileComplete && !isPending) {
        navigate('/discover', { replace: true });
      }
    } else {
      navigate('/auth/login', { replace: true });
    }
  }, [user, navigate]);

  const handleComplete = () => {
    if (user) {
      localStorage.removeItem(`nexora_onboarding_pending_${user._id || user.id}`);
    }
    navigate('/discover');
  };

  // Auto transition every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScene((prev) => (prev === 3 ? 3 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const scenes = [
    {
      title: 'Welcome to the Orbit',
      subtitle: 'Your verified college space',
      desc: 'Engage, study, and share anonymously with verified peers exclusive to your institution. To ensure academic privacy, your discovery feed is restricted strictly to students of your own college.',
      color: 'from-emerald-500/20 to-teal-500/10',
      textColor: 'text-emerald-400',
      icon: Compass,
      element: (
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          {/* Pulsing center orbit */}
          <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl animate-pulse" />
          
          {/* Orbit paths */}
          <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-emerald-500/20 animate-spin [animation-duration:15s]" />
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-teal-500/15 animate-spin [animation-duration:20s] [animation-direction:reverse]" />

          {/* Orbiting nodes */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="absolute top-0 h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] border-2 border-slate-900" />
            <div className="absolute bottom-0 h-3 w-3 rounded-full bg-teal-400 shadow-[0_0_10px_#2dd4bf] border border-slate-900" />
          </motion.div>

          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="absolute left-6 h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] border-2 border-slate-900" />
            <div className="absolute right-6 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] border border-slate-900" />
          </motion.div>

          {/* Core Logo */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="relative z-10 p-5 rounded-2xl glass border border-emerald-500/20 shadow-2xl"
          >
            <Logo />
          </motion.div>
        </div>
      )
    },
    {
      title: 'Anonymous First',
      subtitle: 'Real Connection Later',
      desc: 'All profiles start completely anonymous. As your connection level grows, your name and photo gradually reveal.',
      color: 'from-violet-500/20 to-fuchsia-500/10',
      textColor: 'text-violet-400',
      icon: Sparkles,
      element: (
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-fuchsia-500/5 rounded-full blur-2xl" />
          
          {/* 3D Flipping Card simulation */}
          <motion.div
            animate={{ 
              rotateY: [0, 180, 180, 0],
              y: [0, -10, 0]
            }}
            transition={{ 
              rotateY: { duration: 6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }}
            style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
            className="w-48 h-64 sm:w-56 sm:h-72 rounded-2xl glass border border-violet-500/20 shadow-2xl relative"
          >
            {/* Front Card (Anonymous Status) */}
            <div 
              style={{ backfaceVisibility: 'hidden' }}
              className="absolute inset-0 p-5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <div className="h-6 w-14 rounded bg-slate-500/25 animate-pulse" />
                <Crown size={18} className="text-violet-500/50" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-full bg-slate-700/30 flex items-center justify-center border border-slate-600/30">
                  <span className="text-xl font-bold text-slate-500">?</span>
                </div>
                <div className="h-4 w-28 rounded bg-slate-600/30" />
                <div className="h-3 w-16 rounded bg-slate-600/20" />
              </div>
              <div className="flex gap-1 justify-center">
                <div className="h-5 w-12 rounded bg-slate-700/35" />
                <div className="h-5 w-12 rounded bg-slate-700/35" />
              </div>
            </div>

            {/* Back Card (Revealed Status) */}
            <div 
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              className="absolute inset-0 p-5 flex flex-col justify-between bg-violet-950/20 rounded-2xl"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">Reveal Level 5</span>
                <Crown size={18} className="text-violet-400" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 p-0.5 shadow-lg shadow-violet-500/20">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-violet-400 text-lg">A</div>
                </div>
                <h3 className="font-extrabold text-white text-base">Abhishek G</h3>
                <span className="text-[10px] text-slate-400">CSE · Year 3</span>
              </div>
              <div className="flex gap-1 justify-center">
                <span className="text-[10px] bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full text-violet-300">Web3</span>
                <span className="text-[10px] bg-fuchsia-500/15 border border-fuchsia-500/30 px-2 py-0.5 rounded-full text-fuchsia-300">Coffee</span>
              </div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Safe College Chatting',
      subtitle: 'Zero Screenshot stress',
      desc: 'No profile leaks, verified college emails only, and screenshot protection. Write softly and connect deeply.',
      color: 'from-rose-500/20 to-pink-500/10',
      textColor: 'text-rose-400',
      icon: MessageSquare,
      element: (
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex flex-col justify-center gap-3">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 rounded-full blur-2xl" />
          
          {/* Animated chat messages */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="w-44 sm:w-52 rounded-2xl rounded-bl-none bg-white/5 border border-white/10 p-3 self-start shadow-xl backdrop-blur-md"
          >
            <p className="text-xs text-rose-400 font-bold mb-0.5">Anonymous Peer</p>
            <p className="text-xs text-slate-200">Wanna grab tea at Jassi Tapri?</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 }}
            className="w-44 sm:w-52 rounded-2xl rounded-br-none bg-aurora/15 border border-aurora/35 p-3 self-end shadow-xl backdrop-blur-md"
          >
            <p className="text-xs text-slate-900 dark:text-emerald-300 font-bold mb-0.5">Me</p>
            <p className="text-xs text-slate-800 dark:text-emerald-100">Sure! library at 5? ☕</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
            transition={{ delay: 2.5, type: 'spring' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-rose-500/40 p-2.5 rounded-xl flex items-center gap-2 shadow-2xl z-20"
          >
            <ShieldAlert size={16} className="text-rose-500 animate-pulse" />
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Encrypted Chat</span>
          </motion.div>
        </div>
      )
    },
    {
      title: 'Local Radar Zones',
      subtitle: 'Locate nearby vibes',
      desc: 'Approximate zones like Library or Courtyard help you find active users nearby, with zero live location leaks.',
      color: 'from-amber-500/20 to-orange-500/10',
      textColor: 'text-amber-400',
      icon: Zap,
      element: (
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 rounded-full blur-2xl" />
          
          {/* Radar Circles */}
          <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-amber-500/20 bg-slate-100/5 dark:bg-white/[0.01]" />
          <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-amber-500/10" />
          <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-amber-500/5 bg-amber-500/5" />

          {/* Sweeper arm */}
          <div className="absolute w-1/2 h-1/2 right-1/2 bottom-1/2 origin-bottom-right bg-gradient-to-tr from-transparent via-amber-500/5 to-amber-500/25 border-r border-amber-500/30 rounded-tl-full animate-radar-sweep" />

          {/* Glowing dots lighting up */}
          <motion.div 
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[25%] left-[30%] w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] border border-slate-900" 
          />
          <motion.div 
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-[35%] right-[25%] w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_10px_#ea580c] border border-slate-900" 
          />
        </div>
      )
    }
  ];

  const current = scenes[currentScene];
  const IconComponent = current.icon;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col justify-between bg-slate-950 text-white relative overflow-hidden font-sans p-6 sm:p-10 select-none">
      
      {/* Moving 3D Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(84, 244, 200, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(84, 244, 200, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-25%) scale(1.6)',
          transformOrigin: 'top center',
          animation: 'grid-scroll 18s linear infinite',
        }}
      />

      {/* Floating 3D Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-20">
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-aurora/10 blur-[110px]" />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] rounded-full bg-flare/10 blur-[130px]" />
      </div>

      {/* Header bar */}
      <header className="w-full flex items-center justify-between z-30">
        <Logo />
        <button
          type="button"
          onClick={handleComplete}
          className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.16em] text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          Skip
        </button>
      </header>

      {/* Main content slider */}
      <main className="flex-1 w-full max-w-4xl mx-auto grid md:grid-cols-2 items-center gap-6 sm:gap-12 py-6 z-10">
        
        {/* Left Side: Storytelling details */}
        <div className="space-y-4 text-center md:text-left flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <div className={`p-2 bg-white/5 rounded-xl border border-white/10 ${current.textColor} shrink-0`}>
                  <IconComponent size={20} />
                </div>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] ${current.textColor}`}>
                  {current.subtitle}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-display leading-[1.1] text-white">
                {current.title}
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-slate-400 font-medium max-w-md mx-auto md:mx-0">
                {current.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Graphic Visual Element */}
        <div className="flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, scale: 0.92, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.92, rotateY: 10 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              {current.element}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Footer bar controls */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 z-30 pt-4 border-t border-white/5">
        
        {/* Navigation Dot steps */}
        <div className="flex items-center gap-2.5">
          {scenes.map((_, index) => {
            const isActive = index === currentScene;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentScene(index)}
                className={`h-2 transition-all rounded-full ${
                  isActive 
                    ? 'w-6 bg-gradient-to-r from-aurora to-emerald-400 shadow-[0_0_8px_rgba(84,244,200,0.5)]' 
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to scene ${index + 1}`}
              />
            );
          })}
        </div>

        {/* Action Button: Next or Complete */}
        <div className="w-full sm:w-auto">
          {currentScene === 3 ? (
            <Button
              onClick={handleComplete}
              variant="neon"
              className="w-full sm:w-auto font-black uppercase tracking-wider px-6 text-slate-950 shadow-glow"
            >
              Enter Deck
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentScene((prev) => prev + 1)}
              variant="ghost"
              className="w-full sm:w-auto border border-white/10 hover:border-white/20 text-white font-bold bg-white/5"
            >
              Next Scene
              <ArrowRight size={16} />
            </Button>
          )}
        </div>

      </footer>

    </div>
  );
};
