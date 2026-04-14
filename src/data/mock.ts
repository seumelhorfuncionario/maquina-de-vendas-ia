import type { Lead, Product, Sale, ProductionOrder, ChartData, DashboardMetrics } from '../types'

export const mockUser = {
  id: '1',
  name: 'Luiz - Arte Nossa',
  email: 'carlos@quadrosart.com.br',
  company: 'Arte Nossa Comunicação Visual',
}

export const mockProducts: Product[] = [
  { id: 'p1', name: 'Quadro Canvas Premium', size: '60x40cm', price: 189.90, cost: 45.00, margin: 76.3 },
  { id: 'p2', name: 'Quadro Canvas Grande', size: '90x60cm', price: 289.90, cost: 72.00, margin: 75.2 },
  { id: 'p3', name: 'Quadro MDF Slim', size: '40x30cm', price: 119.90, cost: 28.00, margin: 76.6 },
  { id: 'p4', name: 'Quadro Acrílico Premium', size: '50x50cm', price: 349.90, cost: 95.00, margin: 72.8 },
  { id: 'p5', name: 'Kit 3 Quadros Decorativos', size: '30x40cm cada', price: 259.90, cost: 62.00, margin: 76.1 },
  { id: 'p6', name: 'Quadro Personalizado', size: '80x60cm', price: 399.90, cost: 110.00, margin: 72.5 },
  { id: 'p7', name: 'Placa de ACM', size: '100x50cm', price: 450.00, cost: 150.00, margin: 66.7 },
  { id: 'p8', name: 'Adesivo Parede', size: '200x100cm', price: 320.00, cost: 80.00, margin: 75.0 },
]

export const mockLeads: Lead[] = [
  { id: 'l1', name: 'Ana Paula Silva', phone: '(11) 98765-4321', product: 'Quadro Canvas Premium', origin: 'Instagram Ads', channel: 'instagram', status: 'Novo Lead', createdAt: '2026-04-05', value: 189.90 },
  { id: 'l2', name: 'Roberto Almeida', phone: '(11) 91234-5678', product: 'Kit 3 Quadros Decorativos', origin: 'Google Ads', channel: 'whatsapp', status: 'Novo Lead', createdAt: '2026-04-05', value: 259.90 },
  { id: 'l3', name: 'Fernanda Costa', phone: '(21) 99876-5432', product: 'Quadro Acrílico Premium', origin: 'Facebook Ads', channel: 'whatsapp', status: 'Qualificando', createdAt: '2026-04-04', value: 349.90 },
  { id: 'l4', name: 'Marcelo Santos', phone: '(11) 97654-3210', product: 'Quadro Canvas Grande', origin: 'Instagram Ads', channel: 'instagram', status: 'Qualificando', createdAt: '2026-04-04', value: 289.90 },
  { id: 'l5', name: 'Juliana Mendes', phone: '(31) 98765-1234', product: 'Quadro Personalizado', origin: 'Google Ads', channel: 'whatsapp', status: 'Orçamento Enviado', createdAt: '2026-04-03', value: 399.90 },
  { id: 'l6', name: 'Pedro Oliveira', phone: '(11) 96543-2109', product: 'Quadro Canvas Premium', origin: 'Instagram Ads', channel: 'instagram', status: 'Orçamento Enviado', createdAt: '2026-04-03', value: 189.90 },
  { id: 'l7', name: 'Camila Rocha', phone: '(21) 95432-1098', product: 'Kit 3 Quadros Decorativos', origin: 'Facebook Ads', channel: 'whatsapp', status: 'Orçamento Enviado', createdAt: '2026-04-02', value: 259.90 },
  { id: 'l8', name: 'Lucas Ferreira', phone: '(11) 94321-0987', product: 'Quadro Canvas Grande', origin: 'Google Ads', channel: 'whatsapp', status: 'Venda Fechada', createdAt: '2026-04-01', value: 289.90 },
  { id: 'l9', name: 'Maria Clara Souza', phone: '(31) 93210-9876', product: 'Quadro Acrílico Premium', origin: 'Instagram Ads', channel: 'instagram', status: 'Venda Fechada', createdAt: '2026-04-01', value: 349.90 },
  { id: 'l10', name: 'Thiago Barbosa', phone: '(11) 92109-8765', product: 'Quadro MDF Slim', origin: 'Google Ads', channel: 'whatsapp', status: 'Venda Fechada', createdAt: '2026-03-31', value: 119.90 },
  { id: 'l11', name: 'Beatriz Lima', phone: '(21) 91098-7654', product: 'Quadro Canvas Premium', origin: 'Facebook Ads', channel: 'whatsapp', status: 'Venda Fechada', createdAt: '2026-03-30', value: 189.90 },
  { id: 'l12', name: 'Gabriel Nunes', phone: '(11) 90987-6543', product: 'Kit 3 Quadros Decorativos', origin: 'Instagram Ads', channel: 'instagram', status: 'Venda Fechada', createdAt: '2026-03-29', value: 259.90 },
  { id: 'l13', name: 'Renata Dias', phone: '(31) 99876-5431', product: 'Quadro Canvas Grande', origin: 'Google Ads', channel: 'whatsapp', status: 'Venda Fechada', createdAt: '2026-03-28', value: 289.90 },
  { id: 'l14', name: 'Diego Martins', phone: '(11) 98765-4320', product: 'Placa de ACM', origin: 'Google Ads', channel: 'whatsapp', status: 'Venda Fechada', createdAt: '2026-03-27', value: 450.00 },
  { id: 'l15', name: 'Patrícia Gomes', phone: '(21) 97654-3219', product: 'Adesivo Parede', origin: 'Instagram Ads', channel: 'instagram', status: 'Venda Fechada', createdAt: '2026-03-26', value: 320.00 },
  { id: 'l16', name: 'Rafael Cardoso', phone: '(11) 96543-2108', product: 'Quadro Canvas Premium', origin: 'Facebook Ads', channel: 'whatsapp', status: 'Perdido', createdAt: '2026-04-03', value: 189.90 },
  { id: 'l17', name: 'Isabela Pereira', phone: '(31) 95432-1097', product: 'Quadro MDF Slim', origin: 'Instagram Ads', channel: 'instagram', status: 'Perdido', createdAt: '2026-04-02', value: 119.90 },
  { id: 'l18', name: 'Vinícius Araújo', phone: '(11) 94321-0986', product: 'Quadro Canvas Grande', origin: 'Google Ads', channel: 'whatsapp', status: 'Novo Lead', createdAt: '2026-04-05', value: 289.90 },
  { id: 'l19', name: 'Carolina Machado', phone: '(21) 93210-9875', product: 'Quadro Personalizado', origin: 'Facebook Ads', channel: 'whatsapp', status: 'Qualificando', createdAt: '2026-04-04', value: 399.90 },
  { id: 'l20', name: 'André Teixeira', phone: '(11) 92109-8764', product: 'Quadro Acrílico Premium', origin: 'Instagram Ads', channel: 'instagram', status: 'Novo Lead', createdAt: '2026-04-05', value: 349.90 },
]

export const mockSales: Sale[] = [
  { id: 's1', clientName: 'Lucas Ferreira', product: 'Quadro Canvas Grande', quantity: 1, unitPrice: 289.90, total: 289.90, date: '2026-04-01' },
  { id: 's2', clientName: 'Maria Clara Souza', product: 'Quadro Acrílico Premium', quantity: 1, unitPrice: 349.90, total: 349.90, date: '2026-04-01' },
  { id: 's3', clientName: 'Thiago Barbosa', product: 'Quadro MDF Slim', quantity: 2, unitPrice: 119.90, total: 239.80, date: '2026-03-31' },
  { id: 's4', clientName: 'Beatriz Lima', product: 'Quadro Canvas Premium', quantity: 1, unitPrice: 189.90, total: 189.90, date: '2026-03-30' },
  { id: 's5', clientName: 'Gabriel Nunes', product: 'Kit 3 Quadros Decorativos', quantity: 1, unitPrice: 259.90, total: 259.90, date: '2026-03-29' },
  { id: 's6', clientName: 'Renata Dias', product: 'Quadro Canvas Grande', quantity: 2, unitPrice: 289.90, total: 579.80, date: '2026-03-28' },
  { id: 's7', clientName: 'Diego Martins', product: 'Placa de ACM', quantity: 1, unitPrice: 450.00, total: 450.00, date: '2026-03-27' },
  { id: 's8', clientName: 'Patrícia Gomes', product: 'Adesivo Parede', quantity: 1, unitPrice: 320.00, total: 320.00, date: '2026-03-26' },
  { id: 's9', clientName: 'Marcos Vieira', product: 'Quadro Canvas Premium', quantity: 3, unitPrice: 189.90, total: 569.70, date: '2026-03-25' },
  { id: 's10', clientName: 'Larissa Monteiro', product: 'Quadro Personalizado', quantity: 1, unitPrice: 399.90, total: 399.90, date: '2026-03-24' },
  { id: 's11', clientName: 'Felipe Ramos', product: 'Kit 3 Quadros Decorativos', quantity: 2, unitPrice: 259.90, total: 519.80, date: '2026-03-23' },
  { id: 's12', clientName: 'Amanda Lopes', product: 'Quadro Acrílico Premium', quantity: 1, unitPrice: 349.90, total: 349.90, date: '2026-03-22' },
]

export const mockProduction: ProductionOrder[] = [
  { id: 'pr1', clientName: 'Lucas Ferreira', product: 'Quadro Canvas Grande', quantity: 1, status: 'delivered', createdAt: '2026-04-01' },
  { id: 'pr2', clientName: 'Maria Clara Souza', product: 'Quadro Acrílico Premium', quantity: 1, status: 'done', createdAt: '2026-04-01' },
  { id: 'pr3', clientName: 'Thiago Barbosa', product: 'Quadro MDF Slim', quantity: 2, status: 'producing', createdAt: '2026-03-31' },
  { id: 'pr4', clientName: 'Beatriz Lima', product: 'Quadro Canvas Premium', quantity: 1, status: 'delivered', createdAt: '2026-03-30' },
  { id: 'pr5', clientName: 'Gabriel Nunes', product: 'Kit 3 Quadros Decorativos', quantity: 1, status: 'producing', createdAt: '2026-03-29' },
  { id: 'pr6', clientName: 'Renata Dias', product: 'Quadro Canvas Grande', quantity: 2, status: 'done', createdAt: '2026-03-28' },
  { id: 'pr7', clientName: 'Diego Martins', product: 'Placa de ACM', quantity: 1, status: 'pending', createdAt: '2026-03-27' },
  { id: 'pr8', clientName: 'Patrícia Gomes', product: 'Adesivo Parede', quantity: 1, status: 'pending', createdAt: '2026-03-26' },
  { id: 'pr9', clientName: 'Marcos Vieira', product: 'Quadro Canvas Premium', quantity: 3, status: 'producing', createdAt: '2026-03-25' },
  { id: 'pr10', clientName: 'Larissa Monteiro', product: 'Quadro Personalizado', quantity: 1, status: 'done', createdAt: '2026-03-24' },
]

export const mockChartData: ChartData[] = [
  { name: '01/03', vendas: 3, leads: 8, receita: 1250 },
  { name: '05/03', vendas: 5, leads: 12, receita: 2100 },
  { name: '10/03', vendas: 4, leads: 15, receita: 1800 },
  { name: '15/03', vendas: 7, leads: 18, receita: 3200 },
  { name: '20/03', vendas: 6, leads: 14, receita: 2800 },
  { name: '25/03', vendas: 8, leads: 20, receita: 3900 },
  { name: '30/03', vendas: 5, leads: 16, receita: 2400 },
  { name: '01/04', vendas: 4, leads: 11, receita: 1900 },
  { name: '05/04', vendas: 9, leads: 22, receita: 4200 },
]

export const mockDashboard: DashboardMetrics = {
  leadsToday: 4,
  leadsMonth: 20,
  conversions: 8,
  conversionRate: 40,
  revenue: 5518.50,
  trafficCost: 850.00,
  materialCost: 1420.00,
  profit: 3248.50,
  machineActive: true,
}

export const mockAIConversation = [
  { role: 'client' as const, message: 'Oi, vi o anúncio de vocês no Instagram. Quanto custa o quadro canvas 60x40?', time: '14:32' },
  { role: 'ai' as const, message: 'Olá! Que bom que se interessou! 😊 O Quadro Canvas Premium 60x40cm está por R$ 189,90. Temos diversas artes disponíveis e também fazemos personalizado. Gostaria de ver nosso catálogo?', time: '14:32' },
  { role: 'client' as const, message: 'Sim! Quero ver. Vocês fazem com foto personalizada?', time: '14:33' },
  { role: 'ai' as const, message: 'Fazemos sim! Ficam lindos! 🎨 Basta nos enviar a foto em alta resolução. O valor do personalizado 60x40 é R$ 189,90 também. Quer que eu monte um orçamento pra você?', time: '14:33' },
  { role: 'client' as const, message: 'Quero sim. Na verdade quero 2, um pra sala e outro pro quarto.', time: '14:34' },
  { role: 'ai' as const, message: 'Perfeito! 🛒 Montei seu orçamento:\n\n2x Quadro Canvas Premium 60x40cm\nValor: 2x R$ 189,90 = R$ 379,80\n\n🚚 Frete grátis para sua região!\n⏰ Prazo de produção: 3-5 dias úteis\n\nPosso confirmar o pedido?', time: '14:34' },
  { role: 'client' as const, message: 'Fecha! Como faço pra pagar?', time: '14:35' },
  { role: 'ai' as const, message: '✅ Pedido confirmado! Vou gerar o link de pagamento para você agora. Aceitamos PIX (5% de desconto), cartão de crédito (até 3x sem juros) ou boleto. Qual prefere?', time: '14:35' },
  { role: 'client' as const, message: 'PIX!', time: '14:35' },
  { role: 'ai' as const, message: '💰 Com PIX você ganha 5% de desconto!\n\nValor final: R$ 360,81\n\n🔗 Link do pagamento enviado!\n\nAssim que confirmarmos, já iniciamos a produção. Obrigado pela compra! 🙏', time: '14:36' },
]
