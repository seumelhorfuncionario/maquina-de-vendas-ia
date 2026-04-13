import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientId } from './useClientId';

export interface CrmLabel {
  id: number;
  title: string;
  description: string;
  color: string;
  conversations_count: number;
}

export interface CrmConversation {
  id: number;
  inbox_id: number;
  status: string;
  messages: any[];
  labels: string[];
  contact: {
    name: string;
    email?: string;
    phone_number?: string;
  };
  created_at: string;
  updated_at: string;
  source_id?: string;
  custom_attributes?: Record<string, any>;
}

export interface CrmInbox {
  id: number;
  name: string;
  channel_type: string;
}

export interface CrmMetrics {
  conversationsCount: number;
  openConversationsCount: number;
  outgoingMessagesCount: number;
  incomingMessagesCount: number;
  avgFirstResponseTime: number | null;
  avgResolutionTime: number | null;
  labels: CrmLabel[];
  conversations: CrmConversation[];
  inboxes: CrmInbox[];
  loading: boolean;
  error: string | null;
  enabled: boolean;
  lastSyncAt: string | null;
}

export const useCrmMetrics = (timePeriod: number = 30) => {
  const { clientId, loading: clientLoading } = useClientId();
  const [metrics, setMetrics] = useState<CrmMetrics>({
    conversationsCount: 0,
    openConversationsCount: 0,
    outgoingMessagesCount: 0,
    incomingMessagesCount: 0,
    avgFirstResponseTime: null,
    avgResolutionTime: null,
    labels: [],
    conversations: [],
    inboxes: [],
    loading: true,
    error: null,
    enabled: false,
    lastSyncAt: null,
  });

  useEffect(() => {
    if (clientLoading) return;
    if (!clientId) {
      setMetrics(prev => ({ ...prev, loading: false, error: 'Client ID not found' }));
      return;
    }

    fetchMetrics();
  }, [clientId, clientLoading, timePeriod]);

  const fetchMetrics = async () => {
    try {
      setMetrics(prev => ({ ...prev, loading: true, error: null }));

      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('cw_enabled, cw_last_sync_at')
        .eq('id', clientId!)
        .single();

      if (clientError) throw clientError;

      if (!clientData.cw_enabled) {
        setMetrics({
          conversationsCount: 0,
          openConversationsCount: 0,
          outgoingMessagesCount: 0,
          incomingMessagesCount: 0,
          avgFirstResponseTime: null,
          avgResolutionTime: null,
          labels: [],
          conversations: [],
          inboxes: [],
          loading: false,
          error: null,
          enabled: false,
          lastSyncAt: clientData.cw_last_sync_at,
        });
        return;
      }

      // Try cached metrics first
      const { data: cachedMetrics, error: cacheError } = await supabase
        .from('chatwoot_metrics')
        .select('*')
        .eq('client_id', clientId!)
        .order('synced_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cacheError && cachedMetrics) {
        const cacheAge = Date.now() - new Date(cachedMetrics.synced_at!).getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (cacheAge < fiveMinutes) {
          setMetrics({
            conversationsCount: cachedMetrics.conversations_count || 0,
            openConversationsCount: cachedMetrics.open_conversations_count || 0,
            outgoingMessagesCount: cachedMetrics.outgoing_messages_count || 0,
            incomingMessagesCount: cachedMetrics.incoming_messages_count || 0,
            avgFirstResponseTime: cachedMetrics.avg_first_response_time,
            avgResolutionTime: cachedMetrics.avg_resolution_time,
            labels: [],
            conversations: [],
            inboxes: [],
            loading: false,
            error: null,
            enabled: true,
            lastSyncAt: cachedMetrics.synced_at,
          });
          return;
        }
      }

      // Fetch fresh metrics via Edge Function
      const { data, error } = await supabase.functions.invoke('chatwoot-metrics', {
        body: { client_id: clientId, days: timePeriod },
      });

      if (error) {
        throw new Error('Edge Function nao disponivel. Usando dados em cache.');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.success || !data.data) {
        throw new Error('Resposta invalida do servidor');
      }

      const metricsData = data.data.metrics || data.data;
      const labelsData = data.data.labels || [];
      const conversationsData = data.data.conversations || [];
      const inboxesData = data.data.inboxes || [];

      setMetrics({
        conversationsCount: metricsData.conversations_count || 0,
        openConversationsCount: metricsData.open_conversations_count || 0,
        outgoingMessagesCount: metricsData.outgoing_messages_count || 0,
        incomingMessagesCount: metricsData.incoming_messages_count || 0,
        avgFirstResponseTime: metricsData.avg_first_response_time,
        avgResolutionTime: metricsData.avg_resolution_time,
        labels: labelsData,
        conversations: conversationsData,
        inboxes: inboxesData,
        loading: false,
        error: null,
        enabled: true,
        lastSyncAt: data.synced_at,
      });
    } catch (error) {
      console.error('Error fetching CRM metrics:', error);
      setMetrics(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch CRM metrics',
      }));
    }
  };

  return { ...metrics, refetch: fetchMetrics };
};
