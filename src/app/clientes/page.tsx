"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiService } from "@/services/api";
import { Cliente } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Loader2, Search, RotateCcw, Users, User, Building2, ArrowUp, ArrowDown } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"nome_asc" | "nome_desc" | "score_asc" | "score_desc">("nome_asc");
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 1000]);
  const [typeFilter, setTypeFilter] = useState<"all" | "PF" | "PJ">("all");
  const perPage = 25;

  useEffect(() => {
    loadClientes(currentPage);
  }, [currentPage]);

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

  const getFilteredAndSortedClientes = () => {
    let filtered = clientes;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.cpf_cnpj.includes(searchTerm)
      );
    }

    // Filtro de score
    filtered = filtered.filter(
      (c) => c.score_credito >= scoreRange[0] && c.score_credito <= scoreRange[1]
    );

    // Filtro de tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((c) => c.tipo_pessoa === typeFilter);
    }

    // Ordenação
    const sorted = [...filtered];
    switch (sortBy) {
      case "nome_asc":
        sorted.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case "nome_desc":
        sorted.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case "score_asc":
        sorted.sort((a, b) => a.score_credito - b.score_credito);
        break;
      case "score_desc":
        sorted.sort((a, b) => b.score_credito - a.score_credito);
        break;
    }

    return sorted;
  };

  const filteredClientes = getFilteredAndSortedClientes();

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

  const getScoreColor = (score: number) => {
    if (score < 350) {
      return {
        text: "text-[--score-low]",
        bar: "var(--score-low)",
        cssVar: "--score-low"
      };
    } else if (score < 650) {
      return {
        text: "text-[--score-medium]",
        bar: "var(--score-medium)",
        cssVar: "--score-medium"
      };
    } else {
      return {
        text: "text-[--score-high]",
        bar: "var(--score-high)",
        cssVar: "--score-high"
      };
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

  const hasActiveFilters = searchTerm || typeFilter !== "all" || scoreRange[0] !== 0 || scoreRange[1] !== 1000;

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <div className="w-80 border-r border-border bg-gradient-to-b from-background to-muted/20 p-8 overflow-y-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Filtros</h2>
          </div>
          <p className="text-xs text-muted-foreground ml-4">Refine sua busca</p>
        </div>

        {/* Search Bar */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Buscar Cliente</label>
          <div className="relative z-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60 transition-colors pointer-events-none" />
            <Input
              placeholder="Nome ou CPF/CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="z-0 pl-12 rounded-xl border-2 border-primary/20 bg-primary/5 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:bg-primary/10 transition-all min-h-[44px] text-sm font-medium"
            />
          </div>
        </div>

        {/* Score Range Filter */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-foreground block mb-1">Faixa de Score</label>
            <p className="text-xs text-muted-foreground">Selecione o intervalo desejado</p>
          </div>

          <style>{`
            .range-slider {
              position: relative;
              height: 8px;
            }
            .range-slider input[type="range"] {
              -webkit-appearance: none;
              appearance: none;
              position: absolute;
              width: 100%;
              height: 8px;
              border-radius: 5px;
              outline: none;
              background: transparent;
              pointer-events: none;
              z-index: 5;
            }
            .range-slider input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--primary);
              cursor: pointer;
              border: 3px solid hsl(var(--background));
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
              pointer-events: auto;
              z-index: 5;
            }
            .range-slider input[type="range"]::-moz-range-thumb {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: var(--primary);
              cursor: pointer;
              border: 3px solid hsl(var(--background));
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
              pointer-events: auto;
              z-index: 5;
            }
            .range-slider input[type="range"]::-moz-range-track {
              background: transparent;
              border: none;
            }
            .range-track {
              position: absolute;
              height: 8px;
              background: hsl(var(--muted));
              border-radius: 5px;
              top: 0;
              left: 0;
              right: 0;
              pointer-events: none;
            }
            .range-fill {
              position: absolute;
              height: 100%;
              background: var(--primary);
              border-radius: 5px;
              top: 0;
              pointer-events: none;
              box-shadow: 0 1px 4px rgba(var(--primary), 0.3);
            }
          `}</style>

          <div className="space-y-4 pt-2">
            {/* Range Values Display */}
            <div className="flex items-center justify-between gap-2">
              <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold flex-1 text-center">{scoreRange[0]}</span>
              <span className="text-xs text-muted-foreground font-semibold">até</span>
              <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold flex-1 text-center">{scoreRange[1]}</span>
            </div>

            {/* Range Slider */}
            <div className="range-slider">
              <div className="range-track" />
              <div
                className="range-fill"
                style={{
                  left: `${(scoreRange[0] / 1000) * 100}%`,
                  right: `${100 - (scoreRange[1] / 1000) * 100}%`,
                }}
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={scoreRange[0]}
                onChange={(e) => {
                  const newVal = Number(e.target.value);
                  if (newVal <= scoreRange[1]) {
                    setScoreRange([newVal, scoreRange[1]]);
                  }
                }}
                style={{ zIndex: scoreRange[0] > 500 ? 5 : 3 }}
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={scoreRange[1]}
                onChange={(e) => {
                  const newVal = Number(e.target.value);
                  if (newVal >= scoreRange[0]) {
                    setScoreRange([scoreRange[0], newVal]);
                  }
                }}
                style={{ zIndex: scoreRange[1] < 500 ? 3 : 5 }}
              />
            </div>

            {/* Range Info */}
            <div className="text-center pt-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{scoreRange[1] - scoreRange[0]}</span> pontos de intervalo
              </p>
            </div>
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">Tipo de Pessoa</label>
          <div className="flex gap-2">
            {[
              { value: "all", icon: Users, label: "Todos" },
              { value: "PF", icon: User, label: "Pessoa Física" },
              { value: "PJ", icon: Building2, label: "Pessoa Jurídica" },
            ].map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setTypeFilter(option.value as any)}
                  className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center ${
                    typeFilter === option.value
                      ? "bg-primary/20 border-primary"
                      : "border-border/50 hover:border-border"
                  }`}
                  title={option.label}
                >
                  <IconComponent className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Filter */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Ordenação</label>
          <div className="space-y-2">
            {/* Sort By */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Ordenar por:</p>
              <div className="flex gap-2">
                {[
                  { value: "nome", label: "Nome", icon: "Az" },
                  { value: "score", label: "Score", icon: "123" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      const direction = sortBy.includes("asc") ? "asc" : "desc";
                      setSortBy(`${option.value}_${direction}` as any);
                    }}
                    className={`flex-1 p-2 rounded-lg border-2 transition-all text-xs font-semibold ${
                      sortBy.includes(option.value)
                        ? "bg-primary/20 border-primary text-foreground"
                        : "border-border/50 hover:border-border text-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Direction */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Direção:</p>
              <div className="flex gap-2">
                {[
                  { value: "asc", label: "Crescente", icon: ArrowUp },
                  { value: "desc", label: "Decrescente", icon: ArrowDown },
                ].map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        const field = sortBy.split("_")[0];
                        setSortBy(`${field}_${option.value}` as any);
                      }}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${
                        sortBy.includes(option.value)
                          ? "bg-primary/20 border-primary text-foreground"
                          : "border-border/50 hover:border-border text-muted-foreground"
                      }`}
                      title={option.label}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-xs font-semibold">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl font-semibold border-2 hover:bg-primary/10 hover:border-primary transition-all"
            onClick={() => {
              setSearchTerm("");
              setScoreRange([0, 1000]);
              setTypeFilter("all");
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
              <p className="text-muted-foreground">
                {filteredClientes.length} cliente{filteredClientes.length !== 1 ? "s" : ""} encontrado{filteredClientes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Clients Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredClientes.map((cliente) => {
                const scoreColor = getScoreColor(cliente.score_credito);
                return (
                  <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full flex flex-col border-border/50">
                      <CardContent className="p-5 space-y-4">
                        {/* Header */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h3 className="text-base font-semibold line-clamp-2">
                                {cliente.nome}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {cliente.cpf_cnpj}
                              </p>
                            </div>
                            <Badge variant={getRiskVariant(cliente.classe_risco)} className="text-xs flex-shrink-0">
                              {cliente.classe_risco}
                            </Badge>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl font-bold ${scoreColor.text}`} style={{ color: scoreColor.bar }}>
                            {cliente.score_credito}
                          </span>
                          <span className="text-xs text-muted-foreground">/ 1000</span>
                        </div>

                        {/* Score Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                background: scoreColor.bar,
                                width: `${Math.round((cliente.score_credito / 1000) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Tipo</span>
                            <span className="font-medium">{cliente.tipo_pessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                          </div>

                          {(cliente.cidade || cliente.uf) && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Local</span>
                              <span className="font-medium truncate ml-2">
                                {cliente.cidade && cliente.uf
                                  ? `${cliente.cidade}, ${cliente.uf.slice(0, 2)}`
                                  : cliente.cidade || cliente.uf || 'N/A'}
                              </span>
                            </div>
                          )}
                        </div>

                        {!cliente.ativo && (
                          <div className="pt-1">
                            <Badge variant="destructive" className="text-xs w-full justify-center">
                              Inativo
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {filteredClientes.length === 0 && !loading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum cliente encontrado com esses filtros.
                  </p>
                </CardContent>
              </Card>
            )}

            {totalPages > 1 && !searchTerm && (
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
      </div>
    </div>
  );
}
