import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type Dispatch, type DragEvent, type ReactNode, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Instagram, Facebook, Image as ImageIcon, Upload, X, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '../contexts/AuthContext'
import { useInvalidateSocialOnboarding } from '../hooks/useSocialOnboardingStatus'
import MascotSMF from '../components/MascotSMF'

/* ──────────────────────── Types ──────────────────────── */
interface SocialOnboardingData {
  instagramConnected: boolean
  instagramHandle: string
  photoUrls: string[]
  businessType: string
  businessDescription: string
  targetAudience: string[]
  postFrequency: string
  whatYouSell: string
  logoUrl: string
  brandColors: string[]
  voiceTone: string
  authorityMode: boolean
  completedAt?: string
}

const DEFAULT_DATA: SocialOnboardingData = {
  instagramConnected: false,
  instagramHandle: '',
  photoUrls: [],
  businessType: '',
  businessDescription: '',
  targetAudience: [],
  postFrequency: '3x/semana',
  whatYouSell: '',
  logoUrl: '',
  brandColors: ['#00D4FF', '#00FF88', '#A855F7', '#FF4D6A', '#FFD600', '#0A78E0'],
  voiceTone: 'Educativo',
  authorityMode: true,
}

const TOTAL_STEPS = 6
const STEP_LABELS = ['Boas-vindas', 'Instagram', 'Conteúdo', 'Negócio', 'Identidade', 'Pronto']

const LS_KEY_PREFIX = 'smf-social-onboarding-'

/* ──────────────────────── Storage helpers ──────────────────────── */
function lsKey(clientId?: string | null) {
  return `${LS_KEY_PREFIX}${clientId || 'anon'}`
}

function loadLocal(clientId?: string | null): SocialOnboardingData | null {
  try {
    const raw = localStorage.getItem(lsKey(clientId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveLocal(clientId: string | null | undefined, data: SocialOnboardingData) {
  try {
    localStorage.setItem(lsKey(clientId), JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function isSocialOnboardingComplete(clientId?: string | null): boolean {
  const stored = loadLocal(clientId)
  return !!stored?.completedAt
}

/* ──────────────────────── Page ──────────────────────── */
export default function SocialOnboarding() {
  const navigate = useNavigate()
  const { user, clientProfile } = useAuth()
  const invalidateOnboarding = useInvalidateSocialOnboarding()

  const clientId = clientProfile?.id || user?.id || null

  const [step, setStep] = useState(1)
  const [stepKey, setStepKey] = useState(0)
  const [data, setData] = useState<SocialOnboardingData>(DEFAULT_DATA)
  const [saving, setSaving] = useState(false)

  // Load existing local data on mount
  useEffect(() => {
    const existing = loadLocal(clientId)
    if (existing) {
      setData({ ...DEFAULT_DATA, ...existing })
    }
  }, [clientId])

  const goNext = () => {
    saveLocal(clientId, data)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1))
    setStepKey((k) => k + 1)
  }

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1))
    setStepKey((k) => k + 1)
  }

  const handleFinish = async () => {
    setSaving(true)
    const completed: SocialOnboardingData = { ...data, completedAt: new Date().toISOString() }
    saveLocal(clientId, completed)

    // Try to persist into clients.dashboard_config (non-blocking)
    if (clientProfile?.id) {
      try {
        const { data: current } = await supabase
          .from('clients')
          .select('dashboard_config')
          .eq('id', clientProfile.id)
          .maybeSingle()

        const existingCfg = (current?.dashboard_config as Record<string, unknown> | null) || {}
        const nextCfg = { ...existingCfg, social_onboarding: completed }
        await supabase
          .from('clients')
          .update({ dashboard_config: nextCfg as never })
          .eq('id', clientProfile.id)
      } catch {
        /* ignore persistence errors, localStorage already saved */
      }
    }

    invalidateOnboarding()
    setSaving(false)
    navigate('/criativos', { replace: true })
  }

  const handleSkipAll = async () => {
    const marker: SocialOnboardingData = { ...data, completedAt: new Date().toISOString() }
    saveLocal(clientId, marker)

    // Persist skip into the DB too so the gate doesn't trap the user on next login
    if (clientProfile?.id) {
      try {
        const { data: current } = await supabase
          .from('clients')
          .select('dashboard_config')
          .eq('id', clientProfile.id)
          .maybeSingle()
        const existingCfg = (current?.dashboard_config as Record<string, unknown> | null) || {}
        const nextCfg = { ...existingCfg, social_onboarding: marker }
        await supabase
          .from('clients')
          .update({ dashboard_config: nextCfg as never })
          .eq('id', clientProfile.id)
      } catch {
        /* ignore */
      }
    }

    invalidateOnboarding()
    navigate('/criativos', { replace: true })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'auto',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
      }}
    >
      {/* Ambient background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'radial-gradient(ellipse 700px 500px at 50% 30%, rgba(0, 180, 255, 0.10) 0%, transparent 70%), radial-gradient(ellipse 600px 400px at 80% 90%, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Skip (top right) */}
      <button
        onClick={handleSkipAll}
        style={{
          position: 'absolute',
          top: 20,
          right: 24,
          zIndex: 10,
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: 12,
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        Pular configuração
      </button>

      {/* Progress dots */}
      <div style={{ marginTop: 40, position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1
            const isComplete = stepNum < step
            const isCurrent = stepNum === step
            return (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background:
                      isComplete || isCurrent
                        ? 'var(--accent-cyan)'
                        : 'var(--border)',
                    transition: 'all 0.3s',
                    animation: isCurrent ? 'onboardDotGlow 2s ease-in-out infinite' : 'none',
                  }}
                />
                {isCurrent && (
                  <span
                    style={{
                      marginTop: 6,
                      fontSize: 10,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mascot + contextual line */}
      <div
        style={{
          marginTop: 28,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <MascotSMF
          size={180}
          mood={step === TOTAL_STEPS ? 'happy' : step === 1 ? 'happy' : 'idle'}
        />
        <p
          style={{
            marginTop: 16,
            fontSize: 13,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: 360,
            lineHeight: 1.5,
            padding: '0 24px',
          }}
        >
          {stageLine(step)}
        </p>
      </div>

      {/* Form area */}
      <div
        key={stepKey}
        style={{
          width: '100%',
          maxWidth: 520,
          padding: '24px 24px 56px',
          position: 'relative',
          zIndex: 2,
          animation: 'onboardFormIn 0.4s ease-out',
        }}
      >
        {step === 1 && <StepWelcome onNext={goNext} userName={user?.name} />}
        {step === 2 && <StepInstagram data={data} setData={setData} onNext={goNext} onBack={goBack} />}
        {step === 3 && (
          <StepPhotos clientId={clientId} data={data} setData={setData} onNext={goNext} onBack={goBack} />
        )}
        {step === 4 && <StepBusiness data={data} setData={setData} onNext={goNext} onBack={goBack} />}
        {step === 5 && (
          <StepBrand clientId={clientId} data={data} setData={setData} onNext={goNext} onBack={goBack} />
        )}
        {step === 6 && <StepFinish data={data} onFinish={handleFinish} onBack={goBack} saving={saving} />}
      </div>
    </div>
  )
}

function stageLine(step: number) {
  switch (step) {
    case 1:
      return 'Oi! Eu sou o SMF, seu melhor funcionário de IA para redes sociais. Vou te ajudar a configurar tudo em 2 minutos.'
    case 2:
      return 'Me conecte ao seu Instagram para que eu possa publicar e acompanhar suas métricas.'
    case 3:
      return 'Me mostre algumas fotos do seu negócio — vou usar como referência para gerar criativos.'
    case 4:
      return 'Agora me conte sobre o seu negócio. Quanto mais eu souber, melhor eu trabalho pra você.'
    case 5:
      return 'Defina sua identidade visual e o tom que eu devo usar nas publicações.'
    case 6:
      return 'Pronto! Acabei de aprender tudo que preciso. Vamos começar?'
    default:
      return ''
  }
}

/* ──────────────────────── Shared UI ──────────────────────── */
const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg-elevated)',
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
  height: 42,
  fontFamily: 'inherit',
}

const labelStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-muted)',
  marginBottom: 6,
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  fontWeight: 600,
}

function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 20, textAlign: 'center' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{title}</h2>
      {subtitle && (
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{subtitle}</p>
      )}
    </div>
  )
}

function NavRow({
  onBack,
  onNext,
  nextLabel = 'Continuar',
  showSkip = false,
  onSkip,
  nextDisabled,
}: {
  onBack?: () => void
  onNext: () => void
  nextLabel?: string
  showSkip?: boolean
  onSkip?: () => void
  nextDisabled?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, gap: 12 }}>
      <div>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text-secondary)',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 38,
            }}
          >
            <ArrowLeft size={14} />
            Voltar
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showSkip && (
          <button
            onClick={onSkip ?? onNext}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Pular
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          style={{
            background: nextDisabled
              ? 'var(--bg-elevated)'
              : 'linear-gradient(135deg, #00D4FF 0%, #0A78E0 100%)',
            border: 'none',
            borderRadius: 10,
            color: nextDisabled ? 'var(--text-muted)' : '#02131f',
            padding: '8px 22px',
            cursor: nextDisabled ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 700,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            opacity: nextDisabled ? 0.7 : 1,
            transition: 'transform 0.15s, opacity 0.2s',
          }}
        >
          {nextLabel}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 24,
        boxShadow: 'var(--card-shadow) rgba(0, 212, 255, 0.08)',
      }}
    >
      {children}
    </div>
  )
}

/* ──────────────────────── Step 1 — Welcome ──────────────────────── */
function StepWelcome({ onNext, userName }: { onNext: () => void; userName?: string }) {
  return (
    <Card>
      <CardTitle
        title={userName ? `Que bom te ver, ${userName.split(' ')[0]}!` : 'Vamos começar!'}
        subtitle="Em 5 passos rápidos eu configuro tudo pra você"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { icon: Instagram, label: 'Conecta Instagram' },
          { icon: ImageIcon, label: 'Analisa fotos' },
          { icon: Sparkles, label: 'Aprende o negócio' },
          { icon: Check, label: 'Publica sozinho' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 10,
                background: 'var(--bg-elevated)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(0, 212, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-cyan)',
                }}
              >
                <Icon size={14} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {item.label}
              </span>
            </div>
          )
        })}
      </div>

      <NavRow onNext={onNext} nextLabel="Começar" />
    </Card>
  )
}

/* ──────────────────────── Step 2 — Instagram ──────────────────────── */
function StepInstagram({
  data,
  setData,
  onNext,
  onBack,
}: {
  data: SocialOnboardingData
  setData: Dispatch<SetStateAction<SocialOnboardingData>>
  onNext: () => void
  onBack: () => void
}) {
  const handleConnect = () => {
    setData((prev) => ({ ...prev, instagramConnected: true }))
    onNext()
  }

  return (
    <Card>
      <CardTitle title="Conecte seu Instagram" subtitle="Uso para publicar e analisar seus posts" />

      <button
        onClick={handleConnect}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 12,
          border: 'none',
          background: '#1877F2',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <Facebook size={18} />
        Conectar com Facebook
      </button>

      <div style={{ position: 'relative', margin: '16px 0' }}>
        <div style={{ borderTop: '1px solid var(--border)' }} />
        <span
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            padding: '0 10px',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          ou
        </span>
      </div>

      <label style={labelStyle}>Informe seu @ do Instagram</label>
      <div style={{ position: 'relative' }}>
        <Instagram
          size={14}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          value={data.instagramHandle}
          onChange={(e) => setData((prev) => ({ ...prev, instagramHandle: e.target.value }))}
          placeholder="@seu_perfil"
          style={{ ...inputStyle, paddingLeft: 34 }}
        />
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
        🔒 Sem spam. Apenas publicação e métricas.
      </p>

      <NavRow onBack={onBack} onNext={onNext} showSkip />
    </Card>
  )
}

/* ──────────────────────── Step 3 — Photos ──────────────────────── */
function StepPhotos({
  clientId,
  data,
  setData,
  onNext,
  onBack,
}: {
  clientId: string | null
  data: SocialOnboardingData
  setData: Dispatch<SetStateAction<SocialOnboardingData>>
  onNext: () => void
  onBack: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024,
    )
    if (arr.length === 0) return
    setUploading(true)
    const newUrls: string[] = []
    for (const file of arr) {
      // Try to upload to Supabase Storage; if bucket missing, fallback to object URL
      try {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${clientId || 'anon'}/onboarding/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.${ext}`
        const { error } = await supabase.storage.from('user-uploads').upload(path, file, {
          upsert: true,
        })
        if (!error) {
          const { data: pub } = supabase.storage.from('user-uploads').getPublicUrl(path)
          newUrls.push(pub.publicUrl)
          continue
        }
      } catch {
        /* fall through to object URL */
      }
      newUrls.push(URL.createObjectURL(file))
    }
    setData((prev) => ({
      ...prev,
      photoUrls: [...prev.photoUrls, ...newUrls].slice(0, 20),
    }))
    setUploading(false)
  }

  const remove = (idx: number) =>
    setData((prev) => ({ ...prev, photoUrls: prev.photoUrls.filter((_, i) => i !== idx) }))

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFiles(e.target.files)
  }

  const minMet = data.photoUrls.length >= 3

  return (
    <Card>
      <CardTitle title="Suas fotos" subtitle="Envie pelo menos 3 — recomendado 6 a 12" />

      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          display: 'block',
          border: `2px dashed ${dragOver ? 'var(--accent-cyan)' : 'var(--border)'}`,
          borderRadius: 12,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 14,
          transition: 'border-color 0.2s, background 0.2s',
          background: dragOver ? 'rgba(0, 212, 255, 0.04)' : 'transparent',
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <Upload
          size={22}
          style={{
            color: 'var(--accent-cyan)',
            display: 'block',
            margin: '0 auto 8px',
          }}
        />
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {uploading ? 'Enviando...' : 'Arraste ou clique para enviar'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          JPG, PNG • Máx 10MB cada
        </div>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginBottom: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const url = data.photoUrls[i]
          return (
            <div
              key={i}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 10,
                position: 'relative',
                border: url ? '1px solid rgba(0, 255, 136, 0.35)' : '2px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {url ? (
                <>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => remove(i)}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.75)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={10} />
                  </button>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>+</span>
              )}
            </div>
          )
        })}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: minMet ? 'var(--accent-green)' : 'var(--accent-yellow)',
        }}
      >
        {data.photoUrls.length} de 3 fotos mínimas {minMet ? '✓' : ''}
      </div>

      {data.photoUrls.length > 6 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          + {data.photoUrls.length - 6} adicionais ({data.photoUrls.length}/20)
        </div>
      )}

      <NavRow onBack={onBack} onNext={onNext} showSkip />
    </Card>
  )
}

/* ──────────────────────── Step 4 — Business ──────────────────────── */
function StepBusiness({
  data,
  setData,
  onNext,
  onBack,
}: {
  data: SocialOnboardingData
  setData: Dispatch<SetStateAction<SocialOnboardingData>>
  onNext: () => void
  onBack: () => void
}) {
  const businessTypes = [
    'Treinamentos',
    'Consultoria',
    'E-commerce',
    'SaaS',
    'Agência',
    'Infoprodutos',
    'Serviços',
    'Comunicação Visual',
    'Outro',
  ]
  const frequencies = [
    { label: '2x/sem', value: '2x/semana' },
    { label: '3x/sem', value: '3x/semana' },
    { label: '5x/sem', value: '5x/semana' },
    { label: 'Diário', value: 'diario' },
  ]

  const [tagInput, setTagInput] = useState('')
  const addTag = () => {
    const t = tagInput.trim()
    if (t && !data.targetAudience.includes(t)) {
      setData((prev) => ({ ...prev, targetAudience: [...prev.targetAudience, t] }))
    }
    setTagInput('')
  }

  return (
    <Card>
      <CardTitle title="Sobre seu negócio" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Tipo de negócio</label>
          <select
            value={data.businessType}
            onChange={(e) => setData((prev) => ({ ...prev, businessType: e.target.value }))}
            style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
          >
            <option value="">Selecione...</option>
            {businessTypes.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Descrição curta</label>
          <input
            type="text"
            value={data.businessDescription}
            onChange={(e) =>
              setData((prev) => ({ ...prev, businessDescription: e.target.value }))
            }
            placeholder="Ex: Agência de comunicação visual em Goiânia"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Público-alvo (adicione palavras-chave)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {data.targetAudience.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 14,
                  background: 'rgba(168, 85, 247, 0.12)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: 'var(--accent-purple)',
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {tag}
                <X
                  size={11}
                  style={{ cursor: 'pointer', opacity: 0.7 }}
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      targetAudience: prev.targetAudience.filter((t) => t !== tag),
                    }))
                  }
                />
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Ex: Arquitetos, Lojas físicas, Empresários..."
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Frequência de posts</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {frequencies.map((f) => {
              const selected = data.postFrequency === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => setData((prev) => ({ ...prev, postFrequency: f.value }))}
                  style={{
                    padding: '8px 0',
                    borderRadius: 10,
                    border: `1px solid ${selected ? 'var(--accent-cyan)' : 'var(--border)'}`,
                    background: selected ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                    color: selected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontSize: 12,
                    fontWeight: selected ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'inherit',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label style={labelStyle}>O que você vende?</label>
          <input
            type="text"
            value={data.whatYouSell}
            onChange={(e) => setData((prev) => ({ ...prev, whatYouSell: e.target.value }))}
            placeholder="Ex: Fachadas, letreiros, identidade visual..."
            style={inputStyle}
          />
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextDisabled={!data.businessType} />
    </Card>
  )
}

/* ──────────────────────── Step 5 — Brand ──────────────────────── */
function StepBrand({
  clientId,
  data,
  setData,
  onNext,
  onBack,
}: {
  clientId: string | null
  data: SocialOnboardingData
  setData: Dispatch<SetStateAction<SocialOnboardingData>>
  onNext: () => void
  onBack: () => void
}) {
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const tones = [
    { label: 'Profissional', icon: '🎯' },
    { label: 'Educativo', icon: '📚' },
    { label: 'Inspiracional', icon: '✨' },
    { label: 'Casual', icon: '😊' },
  ]

  const handleLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    setUploadingLogo(true)
    try {
      const ext = file.name.split('.').pop() || 'png'
      const path = `${clientId || 'anon'}/onboarding/logo_${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('user-uploads').upload(path, file, { upsert: true })
      if (!error) {
        const { data: pub } = supabase.storage.from('user-uploads').getPublicUrl(path)
        setData((prev) => ({ ...prev, logoUrl: pub.publicUrl }))
      } else {
        setData((prev) => ({ ...prev, logoUrl: URL.createObjectURL(file) }))
      }
    } catch {
      setData((prev) => ({ ...prev, logoUrl: URL.createObjectURL(file) }))
    }
    setUploadingLogo(false)
  }

  const updateColor = (i: number, v: string) => {
    setData((prev) => {
      const next = [...prev.brandColors]
      next[i] = v
      return { ...prev, brandColors: next }
    })
  }

  return (
    <Card>
      <CardTitle title="Identidade visual & tom" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
        {/* Logo */}
        <div>
          <label style={labelStyle}>Logo</label>
          <label
            style={{
              width: '100%',
              aspectRatio: '1',
              border: `2px dashed ${data.logoUrl ? 'var(--accent-cyan)' : 'var(--border)'}`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              background: 'var(--bg-elevated)',
            }}
          >
            <input type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Upload
                  size={20}
                  style={{ color: 'var(--text-muted)', display: 'block', margin: '0 auto 6px' }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {uploadingLogo ? 'Enviando...' : 'Enviar logo'}
                </span>
              </div>
            )}
          </label>
        </div>

        {/* Colors */}
        <div>
          <label style={labelStyle}>Cores da marca</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {data.brandColors.map((color, i) => (
              <label
                key={i}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 8,
                  border: '2px solid var(--border)',
                  background: color,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  style={{
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tom de voz */}
      <label style={labelStyle}>Tom de voz</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        {tones.map((t) => {
          const selected = data.voiceTone === t.label
          return (
            <button
              key={t.label}
              onClick={() => setData((prev) => ({ ...prev, voiceTone: t.label }))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${selected ? 'var(--accent-cyan)' : 'var(--border)'}`,
                background: selected ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
                color: selected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: selected ? 600 : 400,
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Authority toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Modo autoridade
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Posiciona você como especialista do seu mercado
          </div>
        </div>
        <div
          onClick={() => setData((prev) => ({ ...prev, authorityMode: !prev.authorityMode }))}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            cursor: 'pointer',
            background: data.authorityMode ? 'var(--accent-cyan)' : 'var(--border-hover)',
            position: 'relative',
            transition: 'background 0.3s',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: 2,
              left: data.authorityMode ? 22 : 2,
              transition: 'left 0.3s',
            }}
          />
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} showSkip />
    </Card>
  )
}

/* ──────────────────────── Step 6 — Finish ──────────────────────── */
function StepFinish({
  data,
  onFinish,
  onBack,
  saving,
}: {
  data: SocialOnboardingData
  onFinish: () => void
  onBack: () => void
  saving: boolean
}) {
  const summary = useMemo(
    () => [
      { icon: '📸', label: 'Instagram', value: data.instagramConnected ? data.instagramHandle || 'Conectado' : 'Pendente' },
      { icon: '🖼️', label: 'Fotos', value: `${data.photoUrls.length} enviadas` },
      { icon: '💼', label: 'Negócio', value: data.businessType || '—' },
      { icon: '🎯', label: 'Público', value: data.targetAudience.slice(0, 2).join(', ') || '—' },
      { icon: '🎨', label: 'Tom', value: data.voiceTone },
      { icon: '📅', label: 'Frequência', value: data.postFrequency },
    ],
    [data],
  )

  const [confettiOn, setConfettiOn] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setConfettiOn(false), 3500)
    return () => clearTimeout(t)
  }, [])

  return (
    <Card>
      <CardTitle title="Tudo pronto! 🎉" subtitle="Revisei tudo e estou pronto para trabalhar" />

      {/* Confetti */}
      {confettiOn &&
        Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'fixed',
              width: 8,
              height: 8,
              borderRadius: Math.random() > 0.5 ? '50%' : 1,
              background: ['#00D4FF', '#00FF88', '#A855F7', '#FFD600'][i % 4],
              left: `${8 + Math.random() * 84}%`,
              bottom: '-8px',
              animation: `onboardConfetti ${2 + Math.random() * 2.5}s ease-out ${Math.random() * 0.6}s forwards`,
              zIndex: 50,
              pointerEvents: 'none',
            }}
          />
        ))}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 20 }}>
        {summary.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        disabled={saving}
        style={{
          width: '100%',
          padding: '14px 0',
          borderRadius: 12,
          border: 'none',
          background: saving
            ? 'var(--bg-elevated)'
            : 'linear-gradient(135deg, #00D4FF 0%, #00FF88 100%)',
          color: saving ? 'var(--text-muted)' : '#02131f',
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          cursor: saving ? 'wait' : 'pointer',
          boxShadow: '0 0 24px rgba(0, 212, 255, 0.25)',
          transition: 'transform 0.15s, box-shadow 0.2s',
          fontFamily: 'inherit',
        }}
      >
        {saving ? 'Salvando...' : 'Entrar no painel →'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
        Você pode alterar essas informações depois
      </p>

      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 12,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          ← Voltar
        </button>
      </div>
    </Card>
  )
}
