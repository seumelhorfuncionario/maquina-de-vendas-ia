import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useClientId } from './useClientId'

interface ManualAppointment {
  id: string
  appointment_date: string
  count: number
  notes: string | null
  value: number | null
}

export const useManualAppointments = (dateFrom?: string) => {
  const { clientId, loading: clientLoading } = useClientId()
  const [appointments, setAppointments] = useState<ManualAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [appointmentValue, setAppointmentValue] = useState(0)

  const fetchAppointments = useCallback(async () => {
    if (!clientId) { setLoading(false); return }

    try {
      setLoading(true)

      // Buscar valor por atendimento do cliente
      const { data: clientData } = await supabase
        .from('clients')
        .select('appointment_value')
        .eq('id', clientId)
        .single()
      setAppointmentValue(clientData?.appointment_value || 0)

      // Buscar agendamentos no período
      const now = new Date()
      const fallback = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const since = dateFrom || fallback

      const { data, error } = await supabase
        .from('manual_appointments')
        .select('id, appointment_date, count, notes, value')
        .eq('client_id', clientId)
        .gte('appointment_date', since)
        .order('appointment_date', { ascending: false })

      if (error) throw error
      setAppointments((data as ManualAppointment[]) || [])
    } catch (err) {
      console.error('Error fetching manual appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [clientId, dateFrom])

  useEffect(() => {
    if (!clientLoading) fetchAppointments()
  }, [clientLoading, fetchAppointments])

  const totalCount = appointments.reduce((sum, a) => sum + a.count, 0)
  const estimatedRevenue = appointments.reduce((sum, a) => {
    // Se o valor foi informado, usa direto; senão, fallback para count × appointmentValue
    return sum + (a.value != null ? a.value : a.count * appointmentValue)
  }, 0)

  const upsertAppointment = async (date: string, count: number, notes?: string, value?: number | null) => {
    if (!clientId) return

    const { data: existing } = await supabase
      .from('manual_appointments')
      .select('id')
      .eq('client_id', clientId)
      .eq('appointment_date', date)
      .maybeSingle()

    const payload = { count, notes: notes || null, value: value ?? null }

    if (existing) {
      await supabase
        .from('manual_appointments')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('manual_appointments')
        .insert({ client_id: clientId, appointment_date: date, ...payload })
    }

    fetchAppointments()
  }

  const deleteAppointment = async (id: string) => {
    await supabase.from('manual_appointments').delete().eq('id', id)
    fetchAppointments()
  }

  return {
    appointments,
    totalCount,
    estimatedRevenue,
    appointmentValue,
    loading,
    upsertAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  }
}
