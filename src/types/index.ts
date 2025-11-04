export interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj: string;
  score_credito: number;
  classe_risco: string;
  tipo_pessoa: "PF" | "PJ";
  renda_mensal?: number;
  faturamento_anual?: number;
  uf?: string;
  cidade?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ClientesResponse {
  success: boolean;
  data: Cliente[];
  pagination: PaginationInfo;
  message: string;
}

export interface ClienteDetailResponse {
  success: boolean;
  data: Cliente;
  message: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  model?: string;
  max_tokens?: number;
}

export interface SmartChatRequest {
  message: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    message: string;
    model?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    created_at: string;
  };
  message: string;
}

export interface SmartChatResponse {
  success: boolean;
  data: {
    message: string;
    used_database: boolean;
    sql_query?: string;
    created_at: string;
  };
  message: string;
}

export interface ApiError {
  error: boolean;
  message: string;
  code: number;
}

export interface ClientesFiltros {
  search?: string;
  score_min?: number;
  score_max?: number;
  classe_risco?: string;
  tipo_pessoa?: "PF" | "PJ";
  ativo?: boolean;
}
