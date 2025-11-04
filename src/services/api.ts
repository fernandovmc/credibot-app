import {
  ClientesResponse,
  ClienteDetailResponse,
  ChatRequest,
  ChatResponse,
  SmartChatRequest,
  SmartChatResponse,
  ClientesFiltros,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to fetch data",
        }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Listar clientes com paginação e filtros
  async getClientes(
    page: number = 1,
    perPage: number = 25,
    filtros?: ClientesFiltros
  ): Promise<ClientesResponse> {
    const params = new URLSearchParams();

    // Paginação
    params.append("page", page.toString());
    params.append("per_page", perPage.toString());

    // Filtros (adicionar apenas se preenchidos)
    if (filtros?.search) params.append("search", filtros.search);
    if (filtros?.score_min !== undefined) params.append("score_min", filtros.score_min.toString());
    if (filtros?.score_max !== undefined) params.append("score_max", filtros.score_max.toString());
    if (filtros?.classe_risco) params.append("classe_risco", filtros.classe_risco);
    if (filtros?.tipo_pessoa) params.append("tipo_pessoa", filtros.tipo_pessoa);
    if (filtros?.ativo !== undefined) params.append("ativo", filtros.ativo.toString());

    return this.request<ClientesResponse>(`/clientes?${params.toString()}`);
  }

  // Buscar cliente por ID
  async getClienteById(id: string): Promise<ClienteDetailResponse> {
    return this.request<ClienteDetailResponse>(`/cliente/${id}`);
  }

  // Chat simples
  async chat(data: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Smart chat (com banco de dados)
  async smartChat(data: SmartChatRequest): Promise<SmartChatResponse> {
    return this.request<SmartChatResponse>("/smart-chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
