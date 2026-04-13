import type { Campaign, CreativePerformance, TrafficAlert, TrafficComparison } from '../types'

export const mockCampaigns: Campaign[] = [
  {
    id: 'c1', campaignId: '120241438742790075', campaignName: 'Tráfego - Seguidores Goiânia',
    objective: 'OUTCOME_TRAFFIC', status: 'ACTIVE',
    spend: 1250.00, revenue: 0, purchases: 0, impressions: 47200, clicks: 920,
    leads: 0, cpm: 26.48, cpc: 1.36, ctr: 1.95, roas: 0,
    linkClicks: 780, videoViews: 12400, engagement: 3200, messagingReplies: 0,
    costPerResult: 1.60, date: '2026-04-12',
  },
  {
    id: 'c2', campaignId: '120241379359550075', campaignName: '[SMF] Atração - Carrossel Gestores IA',
    objective: 'OUTCOME_ENGAGEMENT', status: 'ACTIVE',
    spend: 680.00, revenue: 0, purchases: 0, impressions: 31500, clicks: 620,
    leads: 0, cpm: 21.59, cpc: 1.10, ctr: 1.97, roas: 0,
    linkClicks: 410, videoViews: 8900, engagement: 5800, messagingReplies: 45,
    costPerResult: 0.12, date: '2026-04-12',
  },
  {
    id: 'c3', campaignId: '120225201509700075', campaignName: 'WS01 - Seu melhor funcionário',
    objective: 'OUTCOME_LEADS', status: 'ACTIVE',
    spend: 2100.00, revenue: 8400.00, purchases: 12, impressions: 52000, clicks: 1340,
    leads: 89, cpm: 40.38, cpc: 1.57, ctr: 2.58, roas: 4.0,
    linkClicks: 1120, videoViews: 0, engagement: 1800, messagingReplies: 67,
    costPerResult: 23.60, date: '2026-04-12',
  },
  {
    id: 'c4', campaignId: '120224183474710075', campaignName: 'Leads - Secretária do Futuro',
    objective: 'OUTCOME_LEADS', status: 'PAUSED',
    spend: 950.00, revenue: 2850.00, purchases: 4, impressions: 28000, clicks: 480,
    leads: 42, cpm: 33.93, cpc: 1.98, ctr: 1.71, roas: 3.0,
    linkClicks: 380, videoViews: 0, engagement: 920, messagingReplies: 31,
    costPerResult: 22.62, date: '2026-04-12',
  },
  {
    id: 'c5', campaignId: '120223505137340075', campaignName: '[TRÁFEGO] [IG] Descoberta',
    objective: 'OUTCOME_TRAFFIC', status: 'ACTIVE',
    spend: 450.00, revenue: 0, purchases: 0, impressions: 84800, clicks: 880,
    leads: 0, cpm: 5.31, cpc: 0.51, ctr: 1.04, roas: 0,
    linkClicks: 740, videoViews: 62000, engagement: 8400, messagingReplies: 0,
    costPerResult: 0.61, date: '2026-04-12',
  },
  {
    id: 'c6', campaignId: '120218030398660075', campaignName: '[TRÁFEGO] Captação de Seguidores',
    objective: 'OUTCOME_TRAFFIC', status: 'PAUSED',
    spend: 320.00, revenue: 0, purchases: 0, impressions: 18500, clicks: 290,
    leads: 0, cpm: 17.30, cpc: 1.10, ctr: 1.57, roas: 0,
    linkClicks: 220, videoViews: 4200, engagement: 1100, messagingReplies: 0,
    costPerResult: 1.45, date: '2026-04-12',
  },
  {
    id: 'c7', campaignId: 'boost_001', campaignName: 'Publicação: Comenta aqui qual tarefa...',
    objective: 'LINK_CLICKS', status: 'PAUSED',
    spend: 180.00, revenue: 0, purchases: 0, impressions: 12000, clicks: 95,
    leads: 0, cpm: 15.00, cpc: 1.89, ctr: 0.79, roas: 0,
    linkClicks: 78, videoViews: 3400, engagement: 640, messagingReplies: 12,
    costPerResult: 2.31, date: '2026-04-12',
  },
  {
    id: 'c8', campaignId: 'boost_002', campaignName: 'Publicação: Você tá deixando...',
    objective: 'LINK_CLICKS', status: 'PAUSED',
    spend: 100.00, revenue: 0, purchases: 0, impressions: 6500, clicks: 42,
    leads: 0, cpm: 15.38, cpc: 2.38, ctr: 0.65, roas: 0,
    linkClicks: 35, videoViews: 1800, engagement: 310, messagingReplies: 5,
    costPerResult: 2.86, date: '2026-04-12',
  },
]

export const mockCreatives: CreativePerformance[] = [
  {
    id: 'cr1', creativeId: 'ad_001', creativeName: 'Vídeo Depoimento - Cliente Satisfeito',
    campaignId: '120225201509700075', adSetName: 'Lookalike 1%',
    spend: 850, revenue: 4200, purchases: 6, impressions: 22000, clicks: 580,
    roas: 4.94, ctr: 2.64, cpc: 1.47, classification: 'winner', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr2', creativeId: 'ad_002', creativeName: 'Carrossel - Antes e Depois Escritório',
    campaignId: '120225201509700075', adSetName: 'Interesse Decoração',
    spend: 620, revenue: 2800, purchases: 4, impressions: 18000, clicks: 420,
    roas: 4.52, ctr: 2.33, cpc: 1.48, classification: 'winner', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr3', creativeId: 'ad_003', creativeName: 'Imagem Produto - Canvas Premium 90x60',
    campaignId: '120224183474710075', adSetName: 'Retargeting Visitantes',
    spend: 380, revenue: 1140, purchases: 2, impressions: 12000, clicks: 280,
    roas: 3.0, ctr: 2.33, cpc: 1.36, classification: 'positive', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr4', creativeId: 'ad_004', creativeName: 'Vídeo Tutorial - Como Pendurar Quadros',
    campaignId: '120241379359550075', adSetName: 'Público Frio - Interesse',
    spend: 290, revenue: 870, purchases: 1, impressions: 15000, clicks: 310,
    roas: 3.0, ctr: 2.07, cpc: 0.94, classification: 'positive', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr5', creativeId: 'ad_005', creativeName: 'Story - Promoção Relâmpago 30% OFF',
    campaignId: '120224183474710075', adSetName: 'Base Clientes',
    spend: 210, revenue: 630, purchases: 1, impressions: 8000, clicks: 190,
    roas: 3.0, ctr: 2.38, cpc: 1.11, classification: 'positive', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr6', creativeId: 'ad_006', creativeName: 'Imagem Catálogo - Kit 3 Quadros',
    campaignId: '120241438742790075', adSetName: 'Lookalike 3%',
    spend: 420, revenue: 420, purchases: 1, impressions: 19000, clicks: 320,
    roas: 1.0, ctr: 1.68, cpc: 1.31, classification: 'neutral', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr7', creativeId: 'ad_007', creativeName: 'Vídeo Institucional - Arte Nossa',
    campaignId: '120223505137340075', adSetName: 'Descoberta Ampla',
    spend: 180, revenue: 0, purchases: 0, impressions: 32000, clicks: 340,
    roas: 0, ctr: 1.06, cpc: 0.53, classification: 'neutral', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr8', creativeId: 'ad_008', creativeName: 'Carrossel - Novidades Abril',
    campaignId: '120241438742790075', adSetName: 'Interesse Decoração',
    spend: 350, revenue: 350, purchases: 0, impressions: 14000, clicks: 230,
    roas: 1.0, ctr: 1.64, cpc: 1.52, classification: 'neutral', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr9', creativeId: 'ad_009', creativeName: 'Imagem Genérica - Estoque Variado',
    campaignId: '120218030398660075', adSetName: 'Público Aberto',
    spend: 260, revenue: 0, purchases: 0, impressions: 9000, clicks: 85,
    roas: 0, ctr: 0.94, cpc: 3.06, classification: 'negative', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr10', creativeId: 'ad_010', creativeName: 'Vídeo Longo - Processo de Fabricação',
    campaignId: 'boost_002', adSetName: 'Boost Orgânico',
    spend: 100, revenue: 0, purchases: 0, impressions: 4200, clicks: 28,
    roas: 0, ctr: 0.67, cpc: 3.57, classification: 'negative', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr11', creativeId: 'ad_011', creativeName: 'Imagem Black Friday - Quadros 50% OFF',
    campaignId: '120218030398660075', adSetName: 'Retargeting',
    spend: 190, revenue: 95, purchases: 0, impressions: 11000, clicks: 110,
    roas: 0.5, ctr: 1.0, cpc: 1.73, classification: 'fatigue', thumbnailUrl: null, date: '2026-04-12',
  },
  {
    id: 'cr12', creativeId: 'ad_012', creativeName: 'Vídeo Natal 2025 - Presente Perfeito',
    campaignId: 'boost_001', adSetName: 'Base Clientes',
    spend: 150, revenue: 60, purchases: 0, impressions: 7500, clicks: 75,
    roas: 0.4, ctr: 1.0, cpc: 2.0, classification: 'fatigue', thumbnailUrl: null, date: '2026-04-12',
  },
]

export const mockAlerts: TrafficAlert[] = [
  {
    id: 'a1', type: 'low_ctr', severity: 'danger',
    title: 'CTR muito baixo', description: 'A publicação "Você tá deixando..." está com CTR de apenas 0.65%. Considere pausar ou trocar o criativo.',
    campaignName: 'Publicação: Você tá deixando...', value: 0.65,
  },
  {
    id: 'a2', type: 'high_cpc', severity: 'warning',
    title: 'CPC elevado', description: '"Imagem Genérica - Estoque Variado" está com CPC de R$ 3.06, acima da média de R$ 1.50 da conta.',
    campaignName: 'Imagem Genérica - Estoque Variado', value: 3.06,
  },
  {
    id: 'a3', type: 'fatigue', severity: 'warning',
    title: 'Fadiga de criativo detectada', description: '"Imagem Black Friday" e "Vídeo Natal 2025" estão com performance em queda. ROAS caiu para 0.5x e 0.4x respectivamente.',
    value: 0.5,
  },
  {
    id: 'a4', type: 'cpm_spike', severity: 'warning',
    title: 'CPM em alta', description: 'O CPM médio da conta subiu 18% nos últimos 7 dias (de R$ 22.10 para R$ 26.48). Pode indicar aumento de competição no leilão.',
    value: 26.48,
  },
]

export const mockComparison: TrafficComparison[] = [
  { metric: 'spend', label: 'Gasto', today: 185.40, yesterday: 162.30, last7d: 172.50, todayVsYesterday: 14.2, todayVsLast7d: 7.5, format: 'currency' },
  { metric: 'clicks', label: 'Cliques', today: 142, yesterday: 128, last7d: 135, todayVsYesterday: 10.9, todayVsLast7d: 5.2, format: 'number' },
  { metric: 'cpm', label: 'CPM', today: 26.48, yesterday: 24.10, last7d: 22.30, todayVsYesterday: 9.9, todayVsLast7d: 18.7, format: 'currency' },
  { metric: 'cpc', label: 'CPC', today: 1.31, yesterday: 1.27, last7d: 1.28, todayVsYesterday: 3.1, todayVsLast7d: 2.3, format: 'currency' },
  { metric: 'ctr', label: 'CTR', today: 1.72, yesterday: 1.68, last7d: 1.65, todayVsYesterday: 2.4, todayVsLast7d: 4.2, format: 'percent' },
]

export const mockTrafficSummary = {
  spend: mockCampaigns.reduce((s, c) => s + c.spend, 0),
  clicks: mockCampaigns.reduce((s, c) => s + c.clicks, 0),
  impressions: mockCampaigns.reduce((s, c) => s + c.impressions, 0),
  linkClicks: mockCampaigns.reduce((s, c) => s + c.linkClicks, 0),
  cpc: +(mockCampaigns.reduce((s, c) => s + c.spend, 0) / mockCampaigns.reduce((s, c) => s + c.clicks, 0)).toFixed(2),
  ctr: +(mockCampaigns.reduce((s, c) => s + c.clicks, 0) / mockCampaigns.reduce((s, c) => s + c.impressions, 0) * 100).toFixed(2),
  engagement: mockCampaigns.reduce((s, c) => s + c.engagement, 0),
  videoViews: mockCampaigns.reduce((s, c) => s + c.videoViews, 0),
  revenue: mockCampaigns.reduce((s, c) => s + c.revenue, 0),
  leads: mockCampaigns.reduce((s, c) => s + c.leads, 0),
}
