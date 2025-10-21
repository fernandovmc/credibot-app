import {
  ClientesResponse,
  ClienteDetailResponse,
  ChatRequest,
  ChatResponse,
  SmartChatRequest,
  SmartChatResponse,
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

  // Listar clientes com paginação
  async getClientes(page: number = 1, perPage: number = 25): Promise<ClientesResponse> {
    return this.request<ClientesResponse>(
      `/clientes?page=${page}&per_page=${perPage}`
    );
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
