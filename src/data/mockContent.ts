import type { ContentPost } from '../types'

export const mockContentPosts: ContentPost[] = [
  // --- DRAFT ---
  {
    id: 'cp1', title: 'Trend: Decoração Minimalista 2026', contentType: 'reel',
    caption: '🏠 Menos é mais! Veja como um único quadro transforma qualquer ambiente.\n\n#minimalismo #decoracao #quadros',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'draft',
    scheduledDate: '2026-04-25', publishedAt: null, approvedAt: null, notes: null,
    tags: ['trend', 'minimalismo'], createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'cp2', title: 'Bastidores: Produção de Quadros ACM', contentType: 'video',
    caption: '🎬 Veja como seus quadros são feitos! Do design à entrega final.\n\nConheça nosso processo de produção e entenda por que cada peça é única.',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'draft',
    scheduledDate: '2026-04-28', publishedAt: null, approvedAt: null, notes: null,
    tags: ['bastidores', 'produção'], createdAt: '2026-04-10T11:00:00Z',
  },
  {
    id: 'cp3', title: 'Post LinkedIn: Cases de Escritórios', contentType: 'carousel',
    caption: 'Como quadros decorativos transformam o ambiente corporativo — 5 cases reais dos nossos clientes.',
    mediaUrl: null, thumbnailUrl: null, platform: 'linkedin', status: 'draft',
    scheduledDate: '2026-04-30', publishedAt: null, approvedAt: null, notes: null,
    tags: ['corporativo', 'b2b'], createdAt: '2026-04-10T12:00:00Z',
  },

  // --- REVIEW ---
  {
    id: 'cp4', title: 'Lançamento Coleção Outono 2026', contentType: 'carousel',
    caption: '🍂 Nova coleção de quadros decorativos chegou! Tons terrosos, texturas naturais e aquele aconchego que só a arte traz pro seu lar.\n\n💡 Dica: Quadros em tons quentes são perfeitos para criar ambientes acolhedores no outono.\n\n👉 Arraste para ver todos os modelos\n📲 Link na bio para garantir o seu\n\n#quadrosdecorativos #decoracao #outono2026',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'review',
    scheduledDate: '2026-04-15', publishedAt: null, approvedAt: null, notes: null,
    tags: ['lancamento', 'outono', 'colecao'], createdAt: '2026-04-08T09:00:00Z',
  },
  {
    id: 'cp5', title: 'Dica: Como Escolher o Tamanho Ideal', contentType: 'reel',
    caption: '📐 Você sabe qual o tamanho ideal de quadro para cada parede?\n\nRegra de ouro: O quadro deve ocupar entre 60% e 75% da largura do móvel abaixo dele.\n\n🛋️ Sofá de 2m → Quadro de 1,20m a 1,50m\n🛏️ Cama queen → Quadro de 1m a 1,20m\n📺 Rack de TV → Composição de 3 quadros menores\n\nSalva esse post pra quando for decorar! 🔖',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'review',
    scheduledDate: '2026-04-20', publishedAt: null, approvedAt: null, notes: 'Revisar medidas do exemplo do rack',
    tags: ['dica', 'educativo', 'reels'], createdAt: '2026-04-09T14:00:00Z',
  },
  {
    id: 'cp6', title: 'Enquete: Qual estilo combina com você?', contentType: 'story',
    caption: 'Moderno ou clássico? Abstrato ou paisagem? Vote nos stories!',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'review',
    scheduledDate: '2026-04-16', publishedAt: null, approvedAt: null, notes: null,
    tags: ['interacao', 'enquete'], createdAt: '2026-04-09T16:00:00Z',
  },
  {
    id: 'cp7', title: 'TikTok: Transformação de Ambiente em 15s', contentType: 'reel',
    caption: 'POV: Você comprou um quadro na Arte Nossa e seu ambiente mudou completamente 🖼️✨',
    mediaUrl: null, thumbnailUrl: null, platform: 'tiktok', status: 'review',
    scheduledDate: '2026-04-22', publishedAt: null, approvedAt: null, notes: null,
    tags: ['tiktok', 'transformacao', 'viral'], createdAt: '2026-04-10T08:00:00Z',
  },

  // --- APPROVED ---
  {
    id: 'cp8', title: 'Antes e Depois - Sala da Cliente Maria', contentType: 'image',
    caption: '✨ Transformação que só um quadro faz!\n\nOlha como a sala da Maria ficou completamente diferente com o nosso Canvas Premium 90x60cm.\n\nAntes: parede vazia, sem personalidade\nDepois: ambiente acolhedor e com identidade\n\n📸 Foto real da nossa cliente\n📲 Chama no WhatsApp (link na bio)',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'approved',
    scheduledDate: '2026-04-18', publishedAt: null, approvedAt: '2026-04-11T10:00:00Z', notes: 'Aprovado! Capricha na edição da foto.',
    tags: ['depoimento', 'antes-depois', 'social-proof'], createdAt: '2026-04-07T09:00:00Z',
  },
  {
    id: 'cp9', title: 'Promoção: Frete Grátis Abril', contentType: 'image',
    caption: '🚚 FRETE GRÁTIS em todos os quadros!\n\nSó até o final de Abril. Aproveite!\n\n📲 Peça pelo WhatsApp\n🔗 Link na bio',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'approved',
    scheduledDate: '2026-04-14', publishedAt: null, approvedAt: '2026-04-10T15:00:00Z', notes: null,
    tags: ['promocao', 'frete-gratis'], createdAt: '2026-04-08T11:00:00Z',
  },
  {
    id: 'cp10', title: 'Facebook: Kit Dia das Mães', contentType: 'carousel',
    caption: '💝 Presente especial para a mãe que ama decorar! Kit exclusivo com 3 quadros coordenados a partir de R$ 259,90.',
    mediaUrl: null, thumbnailUrl: null, platform: 'facebook', status: 'approved',
    scheduledDate: '2026-04-27', publishedAt: null, approvedAt: '2026-04-11T09:00:00Z', notes: null,
    tags: ['dia-das-maes', 'kit', 'presente'], createdAt: '2026-04-09T10:00:00Z',
  },
  {
    id: 'cp11', title: 'Composição de Quadros - Guia Visual', contentType: 'carousel',
    caption: '🎨 3 formas de compor quadros na parede:\n\n1️⃣ Simétrica: mesmos tamanhos alinhados\n2️⃣ Gallery Wall: tamanhos variados, liberdade total\n3️⃣ Linha central: alturas diferentes, alinhados no centro',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'approved',
    scheduledDate: '2026-04-24', publishedAt: null, approvedAt: '2026-04-11T14:00:00Z', notes: null,
    tags: ['guia', 'composicao', 'educativo'], createdAt: '2026-04-10T09:00:00Z',
  },

  // --- PUBLISHED ---
  {
    id: 'cp12', title: 'Quadro Canvas Premium - Foto Destaque', contentType: 'image',
    caption: '🖼️ O queridinho dos nossos clientes: Canvas Premium 60x40cm.\n\nImpressa em alta resolução com acabamento galeria. Pronta para pendurar!',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'published',
    scheduledDate: '2026-04-05', publishedAt: '2026-04-05T10:00:00Z', approvedAt: '2026-04-04T16:00:00Z', notes: null,
    tags: ['produto', 'destaque'], createdAt: '2026-04-02T09:00:00Z',
  },
  {
    id: 'cp13', title: 'Depoimento em Vídeo - Cliente João', contentType: 'video',
    caption: '🗣️ "Ficou melhor do que eu imaginava!" — João, cliente desde 2025.\n\nObrigado pela confiança! ❤️',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'published',
    scheduledDate: '2026-04-08', publishedAt: '2026-04-08T12:00:00Z', approvedAt: '2026-04-07T11:00:00Z', notes: null,
    tags: ['depoimento', 'video', 'social-proof'], createdAt: '2026-04-05T14:00:00Z',
  },
  {
    id: 'cp14', title: 'Carrossel: Top 5 Quadros Mais Vendidos', contentType: 'carousel',
    caption: '🏆 Os 5 quadros mais vendidos de Março!\n\n1. Canvas Premium 60x40\n2. Kit 3 Quadros Decorativos\n3. Quadro Acrílico Premium\n4. Canvas Grande 90x60\n5. Quadro MDF Slim',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'published',
    scheduledDate: '2026-04-01', publishedAt: '2026-04-01T09:30:00Z', approvedAt: '2026-03-31T15:00:00Z', notes: null,
    tags: ['ranking', 'mais-vendidos'], createdAt: '2026-03-29T10:00:00Z',
  },
  {
    id: 'cp15', title: 'Story: Bastidores Embalagem', contentType: 'story',
    caption: '📦 Olha o cuidado com cada embalagem! Seus quadros chegam perfeitos.',
    mediaUrl: null, thumbnailUrl: null, platform: 'instagram', status: 'published',
    scheduledDate: '2026-04-10', publishedAt: '2026-04-10T14:00:00Z', approvedAt: '2026-04-10T10:00:00Z', notes: null,
    tags: ['bastidores', 'embalagem'], createdAt: '2026-04-09T09:00:00Z',
  },
]
