import type { CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type MascotAction = 'idle' | 'working' | 'coffee' | 'celebrating'

interface MascotSMFProps {
  size?: number
  animated?: boolean
  mood?: 'idle' | 'happy' | 'thinking' | 'sleeping'
  action?: MascotAction
  glow?: boolean
  style?: CSSProperties
  className?: string
}

export default function MascotSMF({
  size = 160,
  animated = true,
  mood = 'idle',
  action = 'idle',
  glow = true,
  style,
  className,
}: MascotSMFProps) {
  const eyeShape = mood === 'sleeping'
    ? <rect x="-14" y="-2" width="28" height="4" rx="2" fill="#FFFFFF" />
    : mood === 'happy'
    ? <path d="M -14 2 Q 0 -8 14 2" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
    : mood === 'thinking'
    ? <ellipse cx="0" cy="0" rx="10" ry="14" fill="#FFFFFF" />
    : <ellipse cx="0" cy="0" rx="12" ry="16" fill="#FFFFFF" />

  // Float animation (body-wide)
  const floatAnim = animated
    ? {
        animate: { y: [0, -8, 0] },
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }
    : {}

  // Glow pulse
  const glowAnim = animated
    ? {
        animate: { opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] },
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }
    : {}

  // Antenna ball pulse (scale + glow via filter)
  const antennaAnim = animated
    ? {
        animate: {
          scale: [1, 1.15, 1],
          filter: [
            'drop-shadow(0 0 4px rgba(61, 184, 255, 0.6))',
            'drop-shadow(0 0 12px rgba(61, 184, 255, 1))',
            'drop-shadow(0 0 4px rgba(61, 184, 255, 0.6))',
          ],
        },
        transition: {
          duration: 2.2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }
    : {}

  // Blink (mood === 'idle') — scaleY closed just 8% of the cycle
  const blinkAnim = animated && mood === 'idle'
    ? {
        animate: { scaleY: [1, 1, 0.05, 1, 1] },
        transition: {
          duration: 5,
          repeat: Infinity,
          times: [0, 0.92, 0.95, 0.98, 1],
          ease: 'easeInOut' as const,
        },
      }
    : {}

  // Chest LED pulse
  const chestAnim = animated
    ? {
        animate: {
          opacity: [0.6, 1, 0.6],
          scale: [1, 1.15, 1],
          filter: [
            'drop-shadow(0 0 3px rgba(61, 184, 255, 0.5))',
            'drop-shadow(0 0 10px rgba(61, 184, 255, 1))',
            'drop-shadow(0 0 3px rgba(61, 184, 255, 0.5))',
          ],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }
    : {}

  // Hover: whole mascot grows slightly
  const hoverAnim = animated
    ? {
        whileHover: { scale: 1.05 },
        transition: { type: 'spring' as const, stiffness: 260, damping: 18 },
      }
    : {}

  const centerOrigin: CSSProperties = {
    transformBox: 'fill-box',
    transformOrigin: 'center',
  }

  return (
    <motion.div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      {...hoverAnim}
    >
      {glow && (
        <motion.div
          style={{
            position: 'absolute',
            inset: '-10%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 180, 255, 0.25) 0%, rgba(0, 180, 255, 0) 70%)',
            pointerEvents: 'none',
          }}
          {...glowAnim}
        />
      )}

      <motion.svg
        viewBox="0 0 240 280"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
        {...floatAnim}
      >
        <defs>
          <linearGradient id="mascotBodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2FAEFF" />
            <stop offset="60%" stopColor="#0A78E0" />
            <stop offset="100%" stopColor="#064FA0" />
          </linearGradient>
          <linearGradient id="mascotHeadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3DB8FF" />
            <stop offset="100%" stopColor="#0A78E0" />
          </linearGradient>
          <radialGradient id="mascotHighlight" cx="30%" cy="20%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="mascotVisorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0D1421" />
            <stop offset="100%" stopColor="#050A18" />
          </linearGradient>
          <linearGradient id="mascotAntennaBall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3DB8FF" />
            <stop offset="100%" stopColor="#0A78E0" />
          </linearGradient>
        </defs>

        {/* Antenna */}
        <g>
          <rect x="117" y="20" width="6" height="24" fill="#0A78E0" rx="1.5" />
          <motion.circle
            cx="120"
            cy="16"
            r="10"
            fill="url(#mascotAntennaBall)"
            style={centerOrigin}
            {...antennaAnim}
          />
          <circle cx="116" cy="12" r="3" fill="rgba(255,255,255,0.6)" />
        </g>

        {/* Head */}
        <g>
          {/* Head shadow base */}
          <rect x="40" y="50" width="160" height="120" rx="58" fill="#053C7E" opacity="0.5" transform="translate(0,4)" />
          {/* Head body */}
          <rect x="40" y="50" width="160" height="120" rx="58" fill="url(#mascotHeadGrad)" />
          {/* Head highlight */}
          <rect x="40" y="50" width="160" height="120" rx="58" fill="url(#mascotHighlight)" />

          {/* Ear/speaker left */}
          <rect x="28" y="95" width="18" height="30" rx="6" fill="#0A78E0" />
          <circle cx="37" cy="110" r="4" fill="#053C7E" />
          {/* Ear/speaker right */}
          <rect x="194" y="95" width="18" height="30" rx="6" fill="#0A78E0" />
          <circle cx="203" cy="110" r="4" fill="#053C7E" />

          {/* Visor (dark face screen) */}
          <rect x="60" y="78" width="120" height="70" rx="32" fill="url(#mascotVisorGrad)" />
          {/* Visor reflection */}
          <ellipse cx="85" cy="92" rx="22" ry="6" fill="rgba(255,255,255,0.08)" />

          {/* Eyes — outer <g> handles position (translate), inner motion.g handles blink (scaleY).
              Splitting the transforms avoids the translate+scaleY conflict that deformed the eyes. */}
          <g transform="translate(96,115)">
            <motion.g style={centerOrigin} {...blinkAnim}>
              {eyeShape}
            </motion.g>
          </g>
          <g transform="translate(144,115)">
            <motion.g style={centerOrigin} {...blinkAnim}>
              {eyeShape}
            </motion.g>
          </g>
        </g>

        {/* Body */}
        <g>
          {/* Body shadow */}
          <path
            d="M 70 170 Q 120 164 170 170 L 170 235 Q 170 248 158 248 L 82 248 Q 70 248 70 235 Z"
            fill="#053C7E"
            opacity="0.5"
            transform="translate(0,4)"
          />
          {/* Body */}
          <path
            d="M 70 170 Q 120 164 170 170 L 170 235 Q 170 248 158 248 L 82 248 Q 70 248 70 235 Z"
            fill="url(#mascotBodyGrad)"
          />
          {/* Body highlight */}
          <path
            d="M 70 170 Q 120 164 170 170 L 170 235 Q 170 248 158 248 L 82 248 Q 70 248 70 235 Z"
            fill="url(#mascotHighlight)"
          />
          {/* Chest plate */}
          <rect x="98" y="190" width="44" height="30" rx="8" fill="#053C7E" opacity="0.55" />
          <motion.circle
            cx="120"
            cy="205"
            r="5"
            fill="#3DB8FF"
            style={centerOrigin}
            {...chestAnim}
          />
        </g>

        {/* Pixel dissolve at base */}
        <g fill="#2FAEFF">
          <rect x="78" y="252" width="10" height="10" opacity="0.9" />
          <rect x="92" y="252" width="10" height="10" opacity="0.7" />
          <rect x="106" y="252" width="10" height="10" opacity="0.85" />
          <rect x="120" y="252" width="10" height="10" opacity="0.95" />
          <rect x="134" y="252" width="10" height="10" opacity="0.7" />
          <rect x="148" y="252" width="10" height="10" opacity="0.85" />
          <rect x="78" y="266" width="10" height="10" opacity="0.45" />
          <rect x="106" y="266" width="10" height="10" opacity="0.55" />
          <rect x="134" y="266" width="10" height="10" opacity="0.4" />
          <rect x="162" y="266" width="10" height="10" opacity="0.35" />
          <rect x="64" y="266" width="10" height="10" opacity="0.3" />
        </g>

        {/* Action accessories */}
        <AnimatePresence mode="wait">
          {action === 'working' && <WorkingAccessories key="working" animated={animated} />}
          {action === 'coffee' && <CoffeeAccessories key="coffee" animated={animated} />}
          {action === 'celebrating' && <CelebratingAccessories key="celebrating" animated={animated} />}
        </AnimatePresence>
      </motion.svg>
    </motion.div>
  )
}

/* ──────────────────────── Action Accessories ──────────────────────── */

const accessoryEnter = {
  initial: { opacity: 0, scale: 0.6, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.6, y: 10 },
  transition: { type: 'spring' as const, stiffness: 300, damping: 22 },
}

function WorkingAccessories({ animated }: { animated: boolean }) {
  // Laptop floating to the right of the mascot
  const floatAnim = animated
    ? { animate: { y: [0, -4, 0] }, transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' as const } }
    : {}

  // Screen LEDs blinking (typing feel)
  const screenLineAnim = (delay: number) =>
    animated
      ? {
          animate: { opacity: [0.3, 1, 0.3], scaleX: [0.7, 1, 0.7] },
          transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const, delay },
        }
      : {}

  const bubbleAnim = animated
    ? { animate: { y: [0, -3, 0], opacity: [0.8, 1, 0.8] }, transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const } }
    : {}

  return (
    <motion.g {...accessoryEnter}>
      {/* Laptop group — floats gently */}
      <motion.g {...floatAnim}>
        {/* Screen back */}
        <rect x="198" y="192" width="62" height="42" rx="4" fill="#0A1628" stroke="#1E88E5" strokeWidth="1.5" />
        {/* Screen inner */}
        <rect x="201" y="195" width="56" height="36" rx="2" fill="#061020" />
        {/* Typing lines */}
        <motion.rect x="205" y="200" width="32" height="2.5" rx="1" fill="#3DB8FF" style={{ transformBox: 'fill-box', transformOrigin: 'left center' }} {...screenLineAnim(0)} />
        <motion.rect x="205" y="207" width="26" height="2.5" rx="1" fill="#00FF88" style={{ transformBox: 'fill-box', transformOrigin: 'left center' }} {...screenLineAnim(0.15)} />
        <motion.rect x="205" y="214" width="38" height="2.5" rx="1" fill="#3DB8FF" style={{ transformBox: 'fill-box', transformOrigin: 'left center' }} {...screenLineAnim(0.3)} />
        <motion.rect x="205" y="221" width="20" height="2.5" rx="1" fill="#FFD600" style={{ transformBox: 'fill-box', transformOrigin: 'left center' }} {...screenLineAnim(0.45)} />
        {/* Laptop base */}
        <path d="M 194 234 L 264 234 L 270 244 L 188 244 Z" fill="#0A78E0" />
        <rect x="222" y="238" width="14" height="2" rx="1" fill="#3DB8FF" opacity="0.6" />
      </motion.g>

      {/* Thought bubble with dots */}
      <motion.g {...bubbleAnim}>
        <circle cx="70" cy="80" r="14" fill="#FFFFFF" opacity="0.95" />
        <circle cx="52" cy="96" r="5" fill="#FFFFFF" opacity="0.85" />
        <circle cx="44" cy="106" r="3" fill="#FFFFFF" opacity="0.7" />
        <circle cx="64" cy="80" r="1.6" fill="#0A78E0" />
        <circle cx="70" cy="80" r="1.6" fill="#0A78E0" />
        <circle cx="76" cy="80" r="1.6" fill="#0A78E0" />
      </motion.g>
    </motion.g>
  )
}

function CoffeeAccessories({ animated }: { animated: boolean }) {
  const cupFloatAnim = animated
    ? { animate: { y: [0, -3, 0], rotate: [-1, 1, -1] }, transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const } }
    : {}

  // Steam particles rise + fade
  const steamAnim = (delay: number) =>
    animated
      ? {
          animate: { y: [0, -20, -30], opacity: [0, 0.7, 0], scale: [0.8, 1.2, 1.6] },
          transition: { duration: 2.2, repeat: Infinity, ease: 'easeOut' as const, delay },
        }
      : {}

  return (
    <motion.g {...accessoryEnter}>
      {/* Steam */}
      <motion.circle cx="225" cy="150" r="4" fill="rgba(255,255,255,0.6)" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} {...steamAnim(0)} />
      <motion.circle cx="232" cy="150" r="3" fill="rgba(255,255,255,0.5)" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} {...steamAnim(0.6)} />
      <motion.circle cx="218" cy="150" r="3" fill="rgba(255,255,255,0.5)" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} {...steamAnim(1.2)} />

      {/* Cup */}
      <motion.g style={{ transformBox: 'fill-box', transformOrigin: '225px 175px' }} {...cupFloatAnim}>
        {/* Saucer */}
        <ellipse cx="225" cy="200" rx="28" ry="4" fill="#053C7E" opacity="0.6" />
        <ellipse cx="225" cy="198" rx="28" ry="4" fill="#FFFFFF" />
        {/* Cup body */}
        <path d="M 208 160 L 210 195 Q 210 200 215 200 L 235 200 Q 240 200 240 195 L 242 160 Z" fill="#FFFFFF" stroke="#0A78E0" strokeWidth="1.5" />
        {/* Coffee inside */}
        <ellipse cx="225" cy="164" rx="16" ry="3" fill="#4A2C1A" />
        <ellipse cx="225" cy="163" rx="14" ry="2" fill="#6B3C25" />
        {/* Handle */}
        <path d="M 242 170 Q 252 170 252 180 Q 252 190 242 190" fill="none" stroke="#0A78E0" strokeWidth="3" strokeLinecap="round" />
        {/* Highlight */}
        <ellipse cx="215" cy="170" rx="2" ry="8" fill="rgba(255,255,255,0.6)" />
      </motion.g>
    </motion.g>
  )
}

function CelebratingAccessories({ animated }: { animated: boolean }) {
  // Confetti: 8 pieces falling with rotation
  const confetti = [
    { x: 40, delay: 0, color: '#00D4FF', w: 6, h: 3 },
    { x: 80, delay: 0.3, color: '#00FF88', w: 4, h: 4 },
    { x: 120, delay: 0.6, color: '#A855F7', w: 6, h: 3 },
    { x: 160, delay: 0.9, color: '#FFD600', w: 4, h: 4 },
    { x: 200, delay: 1.2, color: '#FF4D6A', w: 6, h: 3 },
    { x: 60, delay: 1.5, color: '#FFD600', w: 4, h: 4 },
    { x: 140, delay: 1.8, color: '#00D4FF', w: 6, h: 3 },
    { x: 180, delay: 2.1, color: '#00FF88', w: 4, h: 4 },
  ]

  const armAnim = animated
    ? {
        animate: { rotate: [-15, 5, -15] },
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {}

  const armAnimRight = animated
    ? {
        animate: { rotate: [15, -5, 15] },
        transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {}

  return (
    <motion.g {...accessoryEnter}>
      {/* Confetti */}
      {animated &&
        confetti.map((c, i) => (
          <motion.rect
            key={i}
            x={c.x}
            y={-20}
            width={c.w}
            height={c.h}
            fill={c.color}
            rx={1}
            animate={{ y: [0, 300], rotate: [0, 360, 720], opacity: [1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: c.delay }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        ))}

      {/* Left arm (raised) */}
      <motion.g style={{ transformBox: 'fill-box', transformOrigin: '70px 185px' }} {...armAnim}>
        <path d="M 70 185 Q 48 170 40 140" stroke="url(#mascotBodyGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="40" cy="140" r="9" fill="#3DB8FF" />
      </motion.g>

      {/* Right arm (raised) */}
      <motion.g style={{ transformBox: 'fill-box', transformOrigin: '170px 185px' }} {...armAnimRight}>
        <path d="M 170 185 Q 192 170 200 140" stroke="url(#mascotBodyGrad)" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="200" cy="140" r="9" fill="#3DB8FF" />
      </motion.g>
    </motion.g>
  )
}
