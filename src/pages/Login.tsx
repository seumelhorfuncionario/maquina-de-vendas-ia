import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('carlos@quadrosart.com.br')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error || 'Email ou senha incorretos.')
      }
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#050505', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center gap-2 mb-3"
          >
            <Zap className="w-8 h-8" style={{ color: '#00D4FF' }} />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Máquina de Vendas IA
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Sua fábrica no piloto automático
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: '#0a0a0a',
            border: '1px solid #1a1a1a',
          }}
        >
          <h2 className="text-lg font-semibold text-white mb-6">
            Entrar na sua conta
          </h2>

          {error && (
            <div className="flex items-center gap-2 mb-4 rounded-lg px-4 py-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-neutral-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-[#00D4FF]/50"
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid #1a1a1a',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-neutral-400">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-neutral-600 outline-none transition-colors focus:border-[#00D4FF]/50"
                  style={{
                    backgroundColor: '#111',
                    border: '1px solid #1a1a1a',
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-lg text-sm font-semibold text-black transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-[#00D4FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#00D4FF' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-600">
            Demo: carlos@quadrosart.com.br / demo123
          </p>
        </div>
      </div>
    </div>
  )
}
