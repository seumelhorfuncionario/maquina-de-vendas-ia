import type { CSSProperties } from 'react'

interface MascotSMFProps {
  size?: number
  animated?: boolean
  mood?: 'idle' | 'happy' | 'thinking' | 'sleeping'
  glow?: boolean
  style?: CSSProperties
  className?: string
}

export default function MascotSMF({
  size = 160,
  animated = true,
  mood = 'idle',
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

  return (
    <div
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
    >
      {glow && (
        <div
          style={{
            position: 'absolute',
            inset: '-10%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 180, 255, 0.25) 0%, rgba(0, 180, 255, 0) 70%)',
            animation: animated ? 'mascotGlow 3s ease-in-out infinite' : 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      <svg
        viewBox="0 0 240 280"
        width={size}
        height={size}
        style={{
          animation: animated ? 'mascotFloat 4s ease-in-out infinite' : 'none',
          overflow: 'visible',
        }}
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
          <circle
            cx="120"
            cy="16"
            r="10"
            fill="url(#mascotAntennaBall)"
            style={{
              animation: animated ? 'mascotAntennaPulse 2.2s ease-in-out infinite' : 'none',
              transformOrigin: '120px 16px',
            }}
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

          {/* Eyes */}
          <g transform="translate(96,115)" style={{ animation: animated && mood === 'idle' ? 'mascotBlink 5s infinite' : 'none', transformOrigin: 'center' }}>
            {eyeShape}
          </g>
          <g transform="translate(144,115)" style={{ animation: animated && mood === 'idle' ? 'mascotBlink 5s infinite' : 'none', transformOrigin: 'center' }}>
            {eyeShape}
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
          <circle cx="120" cy="205" r="5" fill="#3DB8FF" style={{ animation: animated ? 'mascotChestPulse 2s ease-in-out infinite' : 'none' }} />
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
      </svg>
    </div>
  )
}
