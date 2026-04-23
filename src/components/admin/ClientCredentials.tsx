import { useEffect, useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Globe,
  Loader2,
  Copy,
  X,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Credential {
  id: string
  platform_name: string
  url: string | null
  username: string | null
  password: string | null
  api_key: string | null
  notes: string | null
  created_at: string
}

interface ClientCredentialsProps {
  clientId: string
}

const inputClass =
  'w-full bg-[#111] border border-[#1a1a1a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#00D4FF] transition-colors'

const emptyForm = {
  platform_name: '',
  url: '',
  username: '',
  password: '',
  api_key: '',
  notes: '',
}

export default function ClientCredentials({ clientId }: ClientCredentialsProps) {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Credential | null>(null)
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [flash, setFlash] = useState('')

  useEffect(() => {
    fetchCredentials()
  }, [clientId])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(''), 2500)
    return () => clearTimeout(t)
  }, [flash])

  const fetchCredentials = async () => {
    setLoading(true)
    const { data, error: dbError } = await (supabase as any)
      .from('client_credentials')
      .select('*')
      .eq('client_id', clientId)
      .order('platform_name')

    if (dbError) {
      setError(dbError.message)
    } else {
      setCredentials((data ?? []) as Credential[])
    }
    setLoading(false)
  }

  const openDialog = (credential?: Credential) => {
    setError('')
    if (credential) {
      setEditing(credential)
      setForm({
        platform_name: credential.platform_name,
        url: credential.url ?? '',
        username: credential.username ?? '',
        password: credential.password ?? '',
        api_key: credential.api_key ?? '',
        notes: credential.notes ?? '',
      })
    } else {
      setEditing(null)
      setForm(emptyForm)
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditing(null)
    setForm(emptyForm)
    setError('')
  }

  const handleSave = async () => {
    if (!form.platform_name.trim()) {
      setError('Informe o nome da plataforma')
      return
    }

    setSaving(true)
    setError('')
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Nao autenticado')

      const payload = {
        platform_name: form.platform_name.trim(),
        url: form.url.trim() || null,
        username: form.username.trim() || null,
        password: form.password || null,
        api_key: form.api_key.trim() || null,
        notes: form.notes.trim() || null,
      }

      if (editing) {
        const { error: dbError } = await (supabase as any)
          .from('client_credentials')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', editing.id)
        if (dbError) throw dbError
        setFlash('Credencial atualizada')
      } else {
        const { error: dbError } = await (supabase as any)
          .from('client_credentials')
          .insert({ ...payload, client_id: clientId, user_id: user.id })
        if (dbError) throw dbError
        setFlash('Credencial adicionada')
      }

      closeDialog()
      fetchCredentials()
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao salvar credencial')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover esta credencial?')) return
    const { error: dbError } = await (supabase as any)
      .from('client_credentials')
      .delete()
      .eq('id', id)
    if (dbError) {
      setError(dbError.message)
      return
    }
    setFlash('Credencial removida')
    fetchCredentials()
  }

  const toggleReveal = (id: string) => {
    setVisible(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setFlash(`${label} copiado`)
  }

  return (
    <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Key size={16} className="text-[#00D4FF]" />
            Credenciais ({credentials.length})
          </h2>
          <p className="text-xs text-[#666] mt-1">
            Acessos do cliente — visiveis apenas para voce (super admin).
          </p>
        </div>
        <button
          type="button"
          onClick={() => openDialog()}
          className="flex items-center gap-1.5 bg-[#00D4FF18] hover:bg-[#00D4FF30] border border-[#00D4FF30] text-[#00D4FF] px-3 py-1.5 rounded-lg text-sm transition-colors"
        >
          <Plus size={14} />
          Adicionar
        </button>
      </div>

      {flash && (
        <div className="mb-3 px-4 py-2 rounded-xl bg-[#00FF8818] border border-[#00FF8830] text-[#00FF88] text-sm">
          {flash}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D4FF]" />
        </div>
      ) : credentials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[#1a1a1a] rounded-xl">
          <Key className="h-7 w-7 text-[#444] mb-2" />
          <p className="text-sm text-[#888]">Nenhuma credencial cadastrada</p>
          <button
            type="button"
            onClick={() => openDialog()}
            className="mt-3 flex items-center gap-1.5 text-[#00D4FF] hover:underline text-sm"
          >
            <Plus size={14} />
            Adicionar primeira credencial
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {credentials.map(cred => {
            const pwVisible = visible.has(cred.id)
            const keyVisible = visible.has(`api-${cred.id}`)
            return (
              <div
                key={cred.id}
                className="rounded-xl border border-[#1a1a1a] bg-[#111] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-[#00D4FF]" />
                    <span className="text-sm font-medium text-white">
                      {cred.platform_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openDialog(cred)}
                      className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cred.id)}
                      className="p-1.5 rounded-lg text-[#888] hover:text-[#FF4D6A] hover:bg-[#FF4D6A18] transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {cred.url && (
                    <Row label="URL">
                      <a
                        href={cred.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00D4FF] hover:underline truncate"
                      >
                        {cred.url}
                      </a>
                      <IconBtn onClick={() => copy(cred.url!, 'URL')} title="Copiar">
                        <Copy size={11} />
                      </IconBtn>
                    </Row>
                  )}
                  {cred.username && (
                    <Row label="Usuario">
                      <span className="text-white truncate">{cred.username}</span>
                      <IconBtn
                        onClick={() => copy(cred.username!, 'Usuario')}
                        title="Copiar"
                      >
                        <Copy size={11} />
                      </IconBtn>
                    </Row>
                  )}
                  {cred.password && (
                    <Row label="Senha">
                      <span className="font-mono text-white truncate">
                        {pwVisible ? cred.password : '••••••••'}
                      </span>
                      <IconBtn
                        onClick={() => toggleReveal(cred.id)}
                        title={pwVisible ? 'Ocultar' : 'Mostrar'}
                      >
                        {pwVisible ? <EyeOff size={11} /> : <Eye size={11} />}
                      </IconBtn>
                      <IconBtn
                        onClick={() => copy(cred.password!, 'Senha')}
                        title="Copiar"
                      >
                        <Copy size={11} />
                      </IconBtn>
                    </Row>
                  )}
                  {cred.api_key && (
                    <Row label="API Key">
                      <span className="font-mono text-white truncate">
                        {keyVisible ? cred.api_key : '••••••••'}
                      </span>
                      <IconBtn
                        onClick={() => toggleReveal(`api-${cred.id}`)}
                        title={keyVisible ? 'Ocultar' : 'Mostrar'}
                      >
                        {keyVisible ? <EyeOff size={11} /> : <Eye size={11} />}
                      </IconBtn>
                      <IconBtn
                        onClick={() => copy(cred.api_key!, 'API Key')}
                        title="Copiar"
                      >
                        <Copy size={11} />
                      </IconBtn>
                    </Row>
                  )}
                  {cred.notes && (
                    <div className="flex items-start gap-2 pt-1">
                      <span className="text-[#666] w-16 shrink-0">Notas:</span>
                      <span className="text-[#aaa] whitespace-pre-wrap">
                        {cred.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeDialog}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {editing ? 'Editar credencial' : 'Nova credencial'}
              </h3>
              <button
                type="button"
                onClick={closeDialog}
                className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#111] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="px-4 py-2 rounded-xl bg-[#FF4D6A18] border border-[#FF4D6A30] text-[#FF4D6A] text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Field label="Plataforma *">
                <input
                  type="text"
                  value={form.platform_name}
                  onChange={e =>
                    setForm({ ...form, platform_name: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Ex: Meta Ads, Chatwoot, Hostinger"
                />
              </Field>
              <Field label="URL de acesso">
                <input
                  type="text"
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  className={inputClass}
                  placeholder="https://..."
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Usuario / Email">
                  <input
                    type="text"
                    value={form.username}
                    onChange={e =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className={inputClass}
                    placeholder="usuario@exemplo.com"
                  />
                </Field>
                <Field label="Senha">
                  <input
                    type="text"
                    value={form.password}
                    onChange={e =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </Field>
              </div>
              <Field label="API Key / Token">
                <input
                  type="text"
                  value={form.api_key}
                  onChange={e => setForm({ ...form, api_key: e.target.value })}
                  className={inputClass}
                  placeholder="Chave de API ou token"
                />
              </Field>
              <Field label="Observacoes">
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className={`${inputClass} min-h-[80px] resize-y`}
                  placeholder="Notas, permissoes, MFA, etc."
                />
              </Field>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeDialog}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#111] transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#00FF88] hover:bg-[#00cc6e] disabled:opacity-50 text-black font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#666] w-16 shrink-0">{label}:</span>
      {children}
    </div>
  )
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1 rounded text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
    >
      {children}
    </button>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm text-[#888] mb-1 block">{label}</label>
      {children}
    </div>
  )
}
