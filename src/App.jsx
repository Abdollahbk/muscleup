import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Dumbbell, Map, LineChart, Cloud, Shield, Zap, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import WaitlistModal from './components/WaitlistModal';
import './index.css';
import './App.css';

/* ─── Locked App Button ──────────────────────────────────────────────── */
const shakeVariants = {
  idle: { x: 0, rotate: 0 },
  shake: {
    x: [0, -8, 8, -8, 8, -5, 5, 0],
    rotate: [0, -4, 4, -4, 4, -2, 2, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

function LockedAppButton({ style = {} }) {
  const { t } = useLanguage();
  const [shaking, setShaking] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    if (shaking) return;
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  return (
    <motion.a
      href="#"
      className="btn btn-secondary btn-locked"
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      variants={shakeVariants}
      animate={shaking ? 'shake' : 'idle'}
      onClick={handleClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            key="lock-overlay"
            className="lock-overlay"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            <Lock size={15} />
            {t('btn_app_locked')}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span animate={{ opacity: hovered ? 0 : 1 }} transition={{ duration: 0.15 }}>
        {t('btn_app')}
      </motion.span>
    </motion.a>
  );
}
/* ──────────────────────────────────────────────────────────────────── */

/* ─── Language Switcher Dropdown ──────────────────────────────────── */
const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇲🇦', displayCode: 'MA' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

function LangSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find(l => l.code === lang);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="lang-dropdown" ref={ref}>
      <button className="lang-trigger" onClick={() => setOpen(v => !v)}>
        <span className="lang-flag">{current.flag}</span>
        <span className="lang-code">{(current.displayCode || current.code).toUpperCase()}</span>
        <motion.span
          className="lang-chevron"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >▾</motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="lang-menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {LANGS.map(({ code, label, flag }) => (
              <motion.li
                key={code}
                className={`lang-option${lang === code ? ' active' : ''}`}
                onClick={() => { setLang(code); setOpen(false); }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.12 }}
              >
                <span className="lang-flag">{flag}</span>
                <span>{label}</span>
                {lang === code && <span className="lang-check">✓</span>}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
/* ──────────────────────────────────────────────────────────────────── */

function App() {
  const { t } = useLanguage();
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const heroRef = useRef(null);
  const curtainRef = useRef(null);

  // 1. Hero Scroll Logic
  const { scrollYProgress: hProgress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });

  // Mouse Interaction Logic for 3D Phone
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  // Map mouse percent to rotation (-15deg to 15deg)
  const rotateXMouse = useTransform(mouseYSpring, [0, 1], [15, -15]);
  const rotateYMouse = useTransform(mouseXSpring, [0, 1], [-15, 15]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const resetMouse = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Hero Background & Phase 1 Text
  const heroBgScale = useTransform(hProgress, [0, 0.5], [1, 1.15]);
  const text1Opacity = useTransform(hProgress, [0, 0.05], [1, 0]);
  const text1Y = useTransform(hProgress, [0, 0.05], [0, -30]);

  // Phase 2: Workout Tracker (active 0.04–0.24)
  const mockup1Opacity = useTransform(hProgress, [0.03, 0.10, 0.20, 0.26], [0, 1, 1, 0]);
  const mockup1Y = useTransform(hProgress, [0.03, 0.12], [80, 0]);
  const text2Opacity = useTransform(hProgress, [0.05, 0.12, 0.20, 0.26], [0, 1, 1, 0]);
  const text2Y = useTransform(hProgress, [0.05, 0.12], [30, 0]);

  // Phase 3: AI Neural Coaching (active 0.24–0.46)
  const mockup2Opacity = useTransform(hProgress, [0.23, 0.32, 0.42, 0.48], [0, 1, 1, 0]);
  const mockup2Y = useTransform(hProgress, [0.23, 0.33], [80, 0]);
  const text3Opacity = useTransform(hProgress, [0.25, 0.34, 0.42, 0.48], [0, 1, 1, 0]);
  const text3Y = useTransform(hProgress, [0.25, 0.34], [30, 0]);

  // Phase 4: Export & Track Progress (active 0.46–0.64)
  const mockup3Opacity = useTransform(hProgress, [0.45, 0.55, 0.63, 0.68], [0, 1, 1, 0]);
  const mockup3Y = useTransform(hProgress, [0.45, 0.56], [80, 0]);
  const text4Opacity = useTransform(hProgress, [0.47, 0.57, 0.63, 0.68], [0, 1, 1, 0]);
  const text4Y = useTransform(hProgress, [0.47, 0.57], [30, 0]);

  // Phase 5: Tailored Workout Plan — FREEZES at end, no fade-out
  // Fully visible by hProgress=0.78 (= 468vh), sticky detaches at 500vh (hProgress=0.833) ✓
  const mockup4Opacity = useTransform(hProgress, [0.66, 0.76], [0, 1]); // stays at 1 forever
  const mockup4Y = useTransform(hProgress, [0.66, 0.78], [80, 0]);
  const text5Opacity = useTransform(hProgress, [0.68, 0.78], [0, 1]); // stays at 1 forever
  const text5Y = useTransform(hProgress, [0.68, 0.78], [30, 0]);

  // Entire page tracking for global effects if any
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const heroBgY = useTransform(scrollYProgress, [0, 0.2], [0, 150]);

  // Curtain panel: rises from 100vh below → 0 as it enters the viewport
  // Tracking: start when curtain top hits viewport bottom → end when curtain top hits viewport top
  const { scrollYProgress: curtainProgress } = useScroll({ target: curtainRef, offset: ["start end", "start start"] });
  const curtainY = useTransform(curtainProgress, [0, 1], ["100vh", "0px"]);

  // Specific tracking for the Sticky Timeline section
  const { scrollYProgress: tProgress } = useScroll({ target: stickyRef, offset: ["start start", "end end"] });

  // ... (previous timeline logic)
  const step1Opacity = useTransform(tProgress, [0.05, 0.25], [0, 1]);
  const step1Y = useTransform(tProgress, [0.05, 0.25], [50, 0]);

  const step2Opacity = useTransform(tProgress, [0.35, 0.55], [0, 1]);
  const step2Y = useTransform(tProgress, [0.35, 0.55], [50, 0]);

  const step3Opacity = useTransform(tProgress, [0.65, 0.85], [0, 1]);
  const step3Y = useTransform(tProgress, [0.65, 0.85], [50, 0]);

  const timelineStyles = [
    { opacity: step1Opacity, y: step1Y },
    { opacity: step2Opacity, y: step2Y },
    { opacity: step3Opacity, y: step3Y }
  ];

  // Variants...
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="app-container" ref={containerRef}>

      {/* Navigation */}
      <nav>
        <a href="#" className="logo">
          <img src="./assets/logo.png" alt="MuscleUp Logo" className="logo-img" />
        </a>
        <div className="nav-links">
          <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px' }} onClick={() => setIsWaitlistOpen(true)}>{t('nav_waitlist')}</button>
          <LangSwitcher />
        </div>
      </nav>

      {/* 1. Hero Sticky Section */}
      <section className="hero-scroll-container" ref={heroRef}>
        <div
          className="hero-sticky-inner"
          onMouseMove={handleMouseMove}
          onMouseLeave={resetMouse}
        >
          <motion.div className="hero-bg" style={{ scale: heroBgScale, y: heroBgY }}></motion.div>
          <div className="hero-overlay"></div>

          <div className="container hero-content" style={{ height: '100%', position: 'relative' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
              {/* Phase 1 Text */}
              <motion.div className="hero-text" style={{ opacity: text1Opacity, y: text1Y, position: 'absolute', left: 0 }}>
                <h1>{t('hero1_title')}<br /><span className="red-text">{t('hero1_accent')}</span></h1>
                <p>{t('hero1_sub')}</p>
                <div className="hero-btns">
                  <button className="btn btn-primary" onClick={() => setIsWaitlistOpen(true)}>{t('btn_waitlist')}</button>
                  <LockedAppButton />
                </div>
              </motion.div>

              {/* Phase 2 Text */}
              <motion.div className="hero-text" style={{ opacity: text2Opacity, y: text2Y, position: 'absolute', left: 0, pointerEvents: 'none' }}>
                <h2>{t('hero2_title')}<br /><span className="red-text">{t('hero2_accent')}</span></h2>
                <p>{t('hero2_sub')}</p>
              </motion.div>

              <motion.div className="hero-text" style={{ opacity: text3Opacity, y: text3Y, position: 'absolute', left: 0, pointerEvents: 'none' }}>
                <h2>{t('hero3_title')}<br /><span className="red-text">{t('hero3_accent')}</span></h2>
                <p>{t('hero3_sub')}</p>
              </motion.div>

              <motion.div className="hero-text" style={{ opacity: text4Opacity, y: text4Y, position: 'absolute', left: 0, pointerEvents: 'none' }}>
                <h2>{t('hero4_title')}<br /><span className="red-text">{t('hero4_accent')}</span></h2>
                <p>{t('hero4_sub')}</p>
              </motion.div>

              <motion.div className="hero-text" style={{ opacity: text5Opacity, y: text5Y, position: 'absolute', left: 0, pointerEvents: 'none' }}>
                <h2>{t('hero5_title')}<br /><span className="red-text">{t('hero5_accent')}</span></h2>
                <p>{t('hero5_sub')}</p>
              </motion.div>

            </div>
          </div>

          <div className="hero-visual-stack">
            {/* Phase 2 Mockup */}
            <motion.div
              className="hero-visual-item"
              style={{ opacity: mockup1Opacity, y: mockup1Y }}
            >
              <div className="phone-3d-wrapper">
                <motion.div
                  className="phone-chassis"
                  animate={{
                    y: [0, -15, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    rotateX: rotateXMouse,
                    rotateY: rotateYMouse
                  }}
                >
                  <div className="dynamic-island"></div>
                  <div className="phone-screen">
                    <img src="./assets/workout-screen.png" alt="Workout Screen" />
                  </div>
                  <div className="phone-glass"></div>
                </motion.div>
              </div>
            </motion.div>

            {/* Phase 3 Mockup - AI Coaching Analytics */}
            <motion.div
              className="hero-visual-item"
              style={{ opacity: mockup2Opacity, y: mockup2Y }}
            >
              <div className="phone-3d-wrapper">
                <motion.div
                  className="phone-chassis"
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  style={{ rotateX: rotateXMouse, rotateY: rotateYMouse }}
                >
                  <div className="dynamic-island"></div>
                  <div className="phone-screen">
                    <img src="./assets/analytics-screen.png" alt="Analytics Screen" />
                  </div>
                  <div className="phone-glass"></div>
                </motion.div>
              </div>
            </motion.div>

            {/* Phase 4 Mockup - Export & Track (analytics-screen2) */}
            <motion.div
              className="hero-visual-item"
              style={{ opacity: mockup3Opacity, y: mockup3Y }}
            >
              <div className="phone-3d-wrapper">
                <motion.div
                  className="phone-chassis"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ rotateX: rotateXMouse, rotateY: rotateYMouse }}
                >
                  <div className="dynamic-island"></div>
                  <div className="phone-screen">
                    <img src="./assets/analytics-screen2.png" alt="Progress Export Screen" />
                  </div>
                  <div className="phone-glass"></div>
                </motion.div>
              </div>
            </motion.div>

            {/* Phase 5 Mockup - Tailored Plan (workout-screen2) */}
            <motion.div
              className="hero-visual-item"
              style={{ opacity: mockup4Opacity, y: mockup4Y }}
            >
              <div className="phone-3d-wrapper">
                <motion.div
                  className="phone-chassis"
                  animate={{ y: [0, 18, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  style={{ rotateX: rotateXMouse, rotateY: rotateYMouse }}
                >
                  <div className="dynamic-island"></div>
                  <div className="phone-screen">
                    <img src="./assets/workout-screen2.png" alt="Tailored Plan Screen" />
                  </div>
                  <div className="phone-glass"></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CURTAIN PANEL — slides up over the hero */}
      <motion.div
        ref={curtainRef}
        style={{
          y: curtainY,
          position: 'relative',
          zIndex: 20,
          borderRadius: '32px 32px 0 0',
          boxShadow: '0 -30px 80px rgba(0,0,0,0.8)',
          backgroundColor: 'var(--bg-primary)',
          paddingTop: '24px',
        }}
      >
        <div className="curtain-hint" />

        {/* 2. Problem Section */}
        <motion.section className="section alternate"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
        >
          <div className="container">
            <motion.h2 variants={itemVariants}>{t('prob_title')}<br /><span className="red-text">{t('prob_accent')}</span></motion.h2>
            <motion.div className="grid-3" variants={sectionVariants}>
              <motion.div className="card" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                <div className="card-icon"><Map size={24} /></div>
                <h3>{t('prob1_title')}</h3><p>{t('prob1_desc')}</p>
              </motion.div>
              <motion.div className="card" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                <div className="card-icon"><RefreshCw size={24} /></div>
                <h3>{t('prob2_title')}</h3><p>{t('prob2_desc')}</p>
              </motion.div>
              <motion.div className="card" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                <div className="card-icon"><Shield size={24} /></div>
                <h3>{t('prob3_title')}</h3><p>{t('prob3_desc')}</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* 3. Solution Section */}
        <motion.section className="section"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={sectionVariants}
        >
          <div className="container" style={{ textAlign: 'center' }}>
            <motion.h2 variants={itemVariants}>{t('sol_title')}</motion.h2>
            <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)', marginTop: '20px', fontSize: '1.2rem', maxWidth: '600px', margin: '20px auto' }}>
              {t('sol_sub')}
            </motion.p>
            <motion.div className="grid-3" style={{ marginTop: '60px' }} variants={sectionVariants}>
              <motion.div className="card" style={{ background: 'transparent', border: 'none' }} variants={itemVariants} whileHover={{ y: -10 }}>
                <h1 style={{ fontSize: '4rem', color: 'var(--accent-red)' }}><Dumbbell size={64} /></h1>
                <h3>{t('sol1')}</h3>
              </motion.div>
              <motion.div className="card" style={{ background: 'transparent', border: 'none' }} variants={itemVariants} whileHover={{ y: -10 }}>
                <h1 style={{ fontSize: '4rem', color: 'var(--accent-red)' }}><Activity size={64} /></h1>
                <h3>{t('sol2')}</h3>
              </motion.div>
              <motion.div className="card" style={{ background: 'transparent', border: 'none' }} variants={itemVariants} whileHover={{ y: -10 }}>
                <h1 style={{ fontSize: '4rem', color: 'var(--accent-red)' }}><Brain size={64} /></h1>
                <h3>{t('sol3')}</h3>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* 4. How It Works Section (Sticky Scroll Storytelling) */}
        <section className="timeline-scroll-container" ref={stickyRef}>
          <div className="timeline-sticky-inner">
            <div className="container hero-grid">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <h2>{t('tl_h1')}<br />{t('tl_h2')}<br /><span className="red-text">{t('tl_accent')}</span></h2>
              </motion.div>
              <div className="timeline">
                {[
                  { titleKey: 'tl1_title', descKey: 'tl1_desc', step: '01' },
                  { titleKey: 'tl2_title', descKey: 'tl2_desc', step: '02' },
                  { titleKey: 'tl3_title', descKey: 'tl3_desc', step: '03' },
                ].map((item, i) => (
                  <motion.div
                    className="timeline-step"
                    key={i}
                    style={{ opacity: timelineStyles[i].opacity, y: timelineStyles[i].y }}
                  >
                    <span style={{ position: 'absolute', left: '-63px', background: '#0d0d0d', color: 'var(--accent-red)', fontWeight: 900, padding: '5px' }}>{item.step}</span>
                    <h3>{t(item.titleKey)}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{t(item.descKey)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Features Section */}
        <motion.section className="section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <div className="container">
            <motion.h2 variants={itemVariants} style={{ textAlign: 'center' }}>{t('feat_title')}</motion.h2>
            <motion.p variants={itemVariants} style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '20px auto', maxWidth: '600px' }}>
              {t('feat_sub')}
            </motion.p>
            <motion.div className="grid-3" variants={sectionVariants}>
              {[
                { icon: <Brain size={24} />, tk: 'feat1_t', dk: 'feat1_d' },
                { icon: <Dumbbell size={24} />, tk: 'feat2_t', dk: 'feat2_d' },
                { icon: <Map size={24} />, tk: 'feat3_t', dk: 'feat3_d' },
                { icon: <Activity size={24} />, tk: 'feat4_t', dk: 'feat4_d' },
                { icon: <LineChart size={24} />, tk: 'feat5_t', dk: 'feat5_d' },
                { icon: <Cloud size={24} />, tk: 'feat6_t', dk: 'feat6_d' },
              ].map((f, i) => (
                <motion.div className="card" key={i} variants={itemVariants} whileHover={{ y: -5, borderColor: 'var(--accent-red)' }}>
                  <div className="card-icon">{f.icon}</div>
                  <h4>{t(f.tk)}</h4><p>{t(f.dk)}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* 6. Pricing */}
        <motion.section className="section alternate" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <div className="container">
            <motion.h2 variants={itemVariants} style={{ textAlign: 'center' }}>{t('price_title')}</motion.h2>
            <motion.div className="pricing-grid" variants={sectionVariants}>
              <motion.div className="price-card" variants={itemVariants}>
                <h3>{t('free_tier')}</h3>
                <ul>
                  <li><CheckCircle2 size={16} className="red-text" /> {t('free1')}</li>
                  <li><CheckCircle2 size={16} className="red-text" /> {t('free2')}</li>
                  <li><CheckCircle2 size={16} className="red-text" /> {t('free3')}</li>
                  <li><CheckCircle2 size={16} className="red-text" /> {t('free4')}</li>
                  <li><CheckCircle2 size={16} className="red-text" /> {t('free5')}</li>
                </ul>
              </motion.div>
              <motion.div className="price-card premium" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                <span style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--accent-red)', padding: '4px 10px', fontSize: '0.7rem', borderRadius: '20px' }}>{t('prem_badge')}</span>
                <h3>{t('prem_tier')}</h3>
                <ul>
                  <li><Zap size={16} className="red-text" /> {t('prem1')}</li>
                  <li><Zap size={16} className="red-text" /> {t('prem2')}</li>
                  <li><Zap size={16} className="red-text" /> {t('prem3')}</li>
                  <li><Zap size={16} className="red-text" /> {t('prem4')}</li>
                  <li><Zap size={16} className="red-text" /> {t('prem5')}</li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* 7. Product Preview */}
        <motion.section className="section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <div className="container" style={{ textAlign: 'center' }}>
            <motion.h2 variants={itemVariants}>{t('preview_title')}</motion.h2>
            <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)', margin: '20px auto 60px', maxWidth: '500px' }}>
              {t('preview_sub')}
            </motion.p>
            <motion.div
              variants={itemVariants}
              style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {['./assets/analytics-screen.png', './assets/workout-screen.png'].map((src, i) => (
                <motion.div
                  key={i}
                  className="phone-3d-wrapper"
                  whileHover={{ scale: 1.04, rotateY: i === 0 ? -5 : 5 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <div className="phone-chassis" style={{ width: '240px', height: '490px' }}>
                    <div className="dynamic-island"></div>
                    <div className="phone-screen">
                      <img src={src} alt="App Screen" />
                    </div>
                    <div className="phone-glass"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* 8. Roadmap */}
        <motion.section className="section alternate" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <div className="container">
            <motion.h2 variants={itemVariants} style={{ textAlign: 'center' }}>{t('road_title')}</motion.h2>
            <motion.div className="grid-3" style={{ marginTop: '60px' }} variants={sectionVariants}>
              <motion.div className="card" variants={itemVariants} style={{ borderColor: 'var(--accent-red)' }} whileHover={{ y: -5 }}>
                <span className="red-text" style={{ fontSize: '0.8rem', fontWeight: 900 }}>{t('road1_l')}</span>
                <h4 style={{ marginTop: '10px' }}>{t('road1_t')}</h4>
              </motion.div>
              <motion.div className="card" variants={itemVariants} whileHover={{ y: -5 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)' }}>{t('road2_l')}</span>
                <h4 style={{ marginTop: '10px' }}>{t('road2_t')}</h4>
              </motion.div>
              <motion.div className="card" variants={itemVariants} whileHover={{ y: -5 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)' }}>{t('road3_l')}</span>
                <h4 style={{ marginTop: '10px' }}>{t('road3_t')}</h4>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA & Footer */}
        <motion.section className="section" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants}>
          <div className="container" style={{ textAlign: 'center' }}>
            <motion.h2 variants={itemVariants}>{t('cta_title')}</motion.h2>
            <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)', margin: '20px auto 40px' }}>{t('cta_sub')}</motion.p>
            <motion.div className="hero-btns" style={{ justifyContent: 'center' }} variants={itemVariants}>
              <button className="btn btn-primary" onClick={() => setIsWaitlistOpen(true)}>{t('btn_waitlist')}</button>
              <LockedAppButton />
            </motion.div>
          </div>
        </motion.section>

        <footer>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', padding: '40px 0', borderTop: '1px solid var(--gray-border)' }}>
            <p style={{ color: 'var(--text-muted)' }}>{t('footer_copy')}</p>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <motion.a href="mailto:contact@muscleup.ma" className="footer-icon-link" whileHover={{ scale: 1.1 }} title="Email">
                <div
                  className="flaticon-mask"
                  style={{ maskImage: "url('https://cdn-icons-png.flaticon.com/128/542/542689.png')", WebkitMaskImage: "url('https://cdn-icons-png.flaticon.com/128/542/542689.png')" }}
                />
              </motion.a>
              <motion.a href="https://www.instagram.com/muscl_eup502/" target="_blank" rel="noopener noreferrer" className="footer-icon-link" whileHover={{ scale: 1.1 }} title="Instagram">
                <div
                  className="flaticon-mask"
                  style={{ maskImage: "url('https://cdn-icons-png.flaticon.com/128/733/733558.png')", WebkitMaskImage: "url('https://cdn-icons-png.flaticon.com/128/733/733558.png')" }}
                />
              </motion.a>
            </div>
          </div>
        </footer>

      </motion.div> {/* END CURTAIN PANEL */}

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
}

function AppWithProvider() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}

export default AppWithProvider;
