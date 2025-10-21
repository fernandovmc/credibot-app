"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiService } from "@/services/api";
import { Cliente } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Loader2, Search, Filter, X } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const perPage = 25;

  useEffect(() => {
    loadClientes(currentPage);
  }, [currentPage]);

  useEffect(() => {
    filterClientes();
  }, [clientes, searchTerm, riskFilter, typeFilter]);

  const loadClientes = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getClientes(page, perPage);
      setClientes(response.data);
      setTotalPages(response.pagination.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const filterClientes = () => {
    let filtered = [...clientes];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.cpf_cnpj.includes(searchTerm)
      );
    }

    // Filtro de risco
    if (riskFilter !== "all") {
      filtered = filtered.filter((c) => c.classe_risco.toLowerCase() === riskFilter);
    }

    // Filtro de tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((c) => c.tipo_pessoa === typeFilter);
    }

    setFilteredClientes(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRiskFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = searchTerm || riskFilter !== "all" || typeFilter !== "all";

  const getRiskVariant = (classe: string) => {
    switch (classe.toLowerCase()) {
      case "baixo":
        return "default";
      case "médio":
      case "medio":
        return "secondary";
      case "alto":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">{error}</p>
            <Button
              onClick={() => loadClientes(currentPage)}
              className="w-full"
              variant="outline"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie os clientes do banco
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou CPF/CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">Todos os riscos</option>
                  <option value="baixo">Baixo</option>
                  <option value="médio">Médio</option>
                  <option value="alto">Alto</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFilters}
                    title="Limpar filtros"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{filteredClientes.length} cliente(s) encontrado(s)</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClientes.map((cliente) => (
            <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {cliente.nome}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {cliente.cpf_cnpj}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <span className="text-xl font-bold">
                      {cliente.score_credito}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risco</span>
                    <Badge variant={getRiskVariant(cliente.classe_risco)}>
                      {cliente.classe_risco}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Tipo</span>
                    <Badge variant="outline">
                      {cliente.tipo_pessoa}
                    </Badge>
                  </div>

                  {!cliente.ativo && (
                    <Badge variant="destructive" className="w-full justify-center">
                      Inativo
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredClientes.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Nenhum cliente encontrado com os filtros aplicados.
              </p>
            </CardContent>
          </Card>
        )}

        {totalPages > 1 && !hasActiveFilters && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
