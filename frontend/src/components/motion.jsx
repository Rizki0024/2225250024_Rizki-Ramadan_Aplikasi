// Primitif animasi bersama (Motion). Aturan: hanya transform & opacity, durasi ≤ 0,35 s,
// dan semuanya dimatikan otomatis bila perangkat meminta "kurangi gerakan" (MotionConfig di App).
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const EASE = [0.22, 1, 0.36, 1];

/** Pembungkus isi halaman: muncul dari bawah sedikit, keluar memudar. */
export function PageMotion({ children, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.24, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Daftar yang anak-anaknya muncul berurutan. */
export function Stagger({ children, className, as = 'div', delay = 0.04, ...rest }) {
  const Comp = motion[as];
  return (
    <Comp className={className} initial="hidden" animate="show" {...rest}
      variants={{ hidden: {}, show: { transition: { staggerChildren: delay } } }}>
      {children}
    </Comp>
  );
}

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
};

export function StaggerItem({ children, className, as = 'div', ...rest }) {
  const Comp = motion[as];
  return <Comp className={className} variants={itemVariants} {...rest}>{children}</Comp>;
}

const MotionLink = motion.create(Link);

/** Kartu tautan dengan efek hover (naik sedikit) dan tap (mengecil sedikit). */
export function CardLink({ children, className, to, style, ...rest }) {
  return (
    <MotionLink to={to} className={className} style={style} variants={itemVariants}
      whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }} {...rest}>
      {children}
    </MotionLink>
  );
}

/** Umpan balik jawaban: benar = "pop" lembut, salah = goyang kecil (bukan berkedip). */
export function FeedbackMotion({ correct, children, className, ...rest }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={correct ? { opacity: 1, scale: [0.96, 1.03, 1] } : { opacity: 1, scale: 1, x: [0, -6, 6, -3, 3, 0] }}
      transition={{ duration: 0.35, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Bintang yang muncul satu per satu. */
export function AnimatedStars({ count = 0, max = 3, big = false }) {
  return (
    <span className={`stars${big ? ' big' : ''}`} aria-label={`${count} dari ${max} bintang`}>
      {Array.from({ length: max }, (_, i) => (
        <motion.span key={i} className={i < count ? '' : 'off'}
          initial={{ scale: 0, rotate: -40, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.15 + i * 0.18, type: 'spring', stiffness: 380, damping: 16 }}>
          ★
        </motion.span>
      ))}
    </span>
  );
}

/** Bilah progres yang terisi dengan animasi. */
export function AnimatedBar({ value, max = 100, className = 'progress', label }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={className} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: EASE }} />
    </div>
  );
}
