// Tipos de dados para o dashboard
export interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface ClientRiskData {
  name: string;
  value: number;
  count: number;
}

export interface ApprovalTrendData {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
}

// Dados simulados
export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Total de Clientes",
    value: "1,234",
    change: 12,
    icon: "Users",
    color: "bg-blue-500",
  },
  {
    label: "Score Médio",
    value: "742",
    change: 5,
    icon: "TrendingUp",
    color: "bg-green-500",
  },
  {
    label: "Alto Risco",
    value: "89",
    change: -3,
    icon: "AlertTriangle",
    color: "bg-red-500",
  },
  {
    label: "Taxa de Aprovação",
    value: "72.3%",
    change: 8,
    icon: "CheckCircle",
    color: "bg-purple-500",
  },
];

// Tendência de aprovações ao longo do tempo
export const approvalTrendData: ApprovalTrendData[] = [
  { month: "Jan", approved: 340, rejected: 89, pending: 45 },
  { month: "Fev", approved: 365, rejected: 92, pending: 38 },
  { month: "Mar", approved: 389, rejected: 78, pending: 32 },
  { month: "Abr", approved: 412, rejected: 85, pending: 41 },
  { month: "Mai", approved: 445, rejected: 76, pending: 35 },
  { month: "Jun", approved: 478, rejected: 68, pending: 28 },
  { month: "Jul", approved: 512, rejected: 72, pending: 31 },
  { month: "Ago", approved: 545, rejected: 65, pending: 25 },
  { month: "Set", approved: 589, rejected: 58, pending: 20 },
  { month: "Out", approved: 623, rejected: 61, pending: 24 },
  { month: "Nov", approved: 667, rejected: 54, pending: 19 },
  { month: "Dez", approved: 702, rejected: 51, pending: 15 },
];

// Distribuição de score
export const scoreDistributionData: ChartDataPoint[] = [
  { name: "300-400", value: 45, count: 45 },
  { name: "400-500", value: 78, count: 78 },
  { name: "500-600", value: 156, count: 156 },
  { name: "600-700", value: 289, count: 289 },
  { name: "700-800", value: 423, count: 423 },
  { name: "800+", value: 243, count: 243 },
];

// Classificação de risco
export const riskClassificationData: ClientRiskData[] = [
  { name: "Baixo Risco", value: 623, count: 623 },
  { name: "Médio Risco", value: 398, count: 398 },
  { name: "Alto Risco", value: 156, count: 156 },
  { name: "Muito Alto Risco", value: 57, count: 57 },
];

// Análise por região
export const regionAnalysisData: ChartDataPoint[] = [
  { name: "Sul", approved: 156, rejected: 23, total: 179 },
  { name: "Sudeste", approved: 234, rejected: 31, total: 265 },
  { name: "Nordeste", approved: 98, rejected: 14, total: 112 },
  { name: "Centro-Oeste", approved: 67, rejected: 10, total: 77 },
  { name: "Norte", approved: 45, rejected: 8, total: 53 },
];

// Análise por setor
export const sectorAnalysisData: ChartDataPoint[] = [
  { name: "Varejo", value: 289, approved: 234 },
  { name: "Serviços", value: 198, approved: 167 },
  { name: "Manufatura", value: 156, approved: 134 },
  { name: "Tecnologia", value: 145, approved: 128 },
  { name: "Outros", value: 446, approved: 361 },
];

// Filtros disponíveis
export const periodFilters = [
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
  { value: "1y", label: "Este ano" },
  { value: "all", label: "Todo o período" },
];

export const riskFilters = [
  { value: "all", label: "Todos os riscos" },
  { value: "low", label: "Baixo risco" },
  { value: "medium", label: "Médio risco" },
  { value: "high", label: "Alto risco" },
  { value: "very-high", label: "Muito alto risco" },
];

export const statusFilters = [
  { value: "all", label: "Todos os status" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
  { value: "pending", label: "Pendentes" },
];
