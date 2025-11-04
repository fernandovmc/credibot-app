"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { apiService } from "@/services/api";
import { Cliente, ClientesFiltros, PaginationInfo } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, RotateCcw, Users, User, Building2 } from "lucide-react";

// Debounce helper
function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function ClientesPage() {
  // Estado de dados
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de paginação
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    page: 1,
    per_page: 25,
    total: 0,
    total_pages: 0,
  });

  // Estado de filtros
  const [searchInput, setSearchInput] = useState("");
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 1000]);
  const [typeFilter, setTypeFilter] = useState<"all" | "PF" | "PJ">("all");
  const [classeRiscoFilter, setClasseRiscoFilter] = useState<string>("");
  const [ativoFilter, setAtivoFilter] = useState<boolean | undefined>();

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Ref para IntersectionObserver
  const observerTarget = useRef<HTMLDivElement>(null);
  const perPage = 25;

  // Filtros que serão enviados à API
  const filtros = useMemo<ClientesFiltros>(() => {
    return {
      search: debouncedSearch,
      score_min: scoreRange[0] !== 0 ? scoreRange[0] : undefined,
      score_max: scoreRange[1] !== 1000 ? scoreRange[1] : undefined,
      classe_risco: classeRiscoFilter || undefined,
      tipo_pessoa: typeFilter !== "all" ? typeFilter : undefined,
      ativo: ativoFilter,
    };
  }, [debouncedSearch, scoreRange, classeRiscoFilter, typeFilter, ativoFilter]);

  // 1️⃣ Resetar lista quando filtros mudam
  useEffect(() => {
    setClientes([]);
    setPaginationInfo({
      page: 1,
      per_page: 25,
      total: 0,
      total_pages: 0,
    });
  }, [filtros]);

  // 2️⃣ Carregar próxima página
  const carregarProxima = useCallback(async () => {
    if (loading || paginationInfo.page >= paginationInfo.total_pages) {
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const nextPage = paginationInfo.page + 1;
      const response = await apiService.getClientes(nextPage, perPage, filtros);

      setClientes((prev) => [...prev, ...response.data]);
      setPaginationInfo(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [loading, paginationInfo.page, paginationInfo.total_pages, perPage, filtros]);

  // 3️⃣ Carregar primeira página (quando filtros mudam)
  useEffect(() => {
    const carregarPrimeira = async () => {
      try {
        setError(null);
        setInitialLoading(true);

        const response = await apiService.getClientes(1, perPage, filtros);
        setClientes(response.data);
        setPaginationInfo(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar clientes");
      } finally {
        setInitialLoading(false);
      }
    };

    carregarPrimeira();
  }, [filtros, perPage]);

  // 4️⃣ Intersection Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && paginationInfo.page < paginationInfo.total_pages) {
          carregarProxima();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [carregarProxima, loading, paginationInfo.page, paginationInfo.total_pages]);

  // Helpers para estilo
  const getRiskVariant = (classe: string) => {
    switch (classe.toLowerCase()) {
      case "baixo":
      case "a":
        return "default";
      case "médio":
      case "medio":
      case "b":
        return "secondary";
      case "alto":
      case "c":
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
        cssVar: "--score-low",
      };
    } else if (score < 650) {
      return {
        text: "text-[--score-medium]",
        bar: "var(--score-medium)",
        cssVar: "--score-medium",
      };
    } else {
      return {
        text: "text-[--score-high]",
        bar: "var(--score-high)",
        cssVar: "--score-high",
      };
    }
  };

  const hasActiveFilters =
    searchInput ||
    typeFilter !== "all" ||
    scoreRange[0] !== 0 ||
    scoreRange[1] !== 1000 ||
    classeRiscoFilter ||
    ativoFilter !== undefined;

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <div className="w-80 border-r border-border bg-gradient-to-b from-background to-muted/20 p-8 overflow-y-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Filtros
            </h2>
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
              <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold flex-1 text-center">
                {scoreRange[0]}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">até</span>
              <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-bold flex-1 text-center">
                {scoreRange[1]}
              </span>
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
                    typeFilter === option.value ? "bg-primary/20 border-primary" : "border-border/50 hover:border-border"
                  }`}
                  title={option.label}
                >
                  <IconComponent className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl font-semibold border-2 hover:bg-primary/10 hover:border-primary transition-all"
            onClick={() => {
              setSearchInput("");
              setScoreRange([0, 1000]);
              setTypeFilter("all");
              setClasseRiscoFilter("");
              setAtivoFilter(undefined);
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
                {clientes.length} de {paginationInfo.total} cliente{paginationInfo.total !== 1 ? "s" : ""} carregado
                {clientes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Card className="bg-destructive/10 border-destructive/50">
                <CardContent className="pt-6">
                  <p className="text-destructive text-center">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Clients Grid */}
            {clientes.length > 0 ? (
              <>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {clientes.map((cliente) => {
                    const scoreColor = getScoreColor(cliente.score_credito);
                    return (
                      <Link key={cliente.id} href={`/clientes/${cliente.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full flex flex-col border-border/50">
                          <CardContent className="p-5 space-y-4">
                            {/* Header */}
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                  <h3 className="text-base font-semibold line-clamp-2">{cliente.nome}</h3>
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
                              <span
                                className={`text-3xl font-bold ${scoreColor.text}`}
                                style={{ color: scoreColor.bar }}
                              >
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
                                <span className="font-medium">
                                  {cliente.tipo_pessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                                </span>
                              </div>

                              {(cliente.cidade || cliente.uf) && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Local</span>
                                  <span className="font-medium truncate ml-2">
                                    {cliente.cidade && cliente.uf
                                      ? `${cliente.cidade}, ${cliente.uf.slice(0, 2)}`
                                      : cliente.cidade || cliente.uf || "N/A"}
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

                {/* Sentinel for Infinite Scroll */}
                <div ref={observerTarget} style={{ height: "1px" }} />

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Carregando mais clientes...</p>
                    </div>
                  </div>
                )}

                {/* End message */}
                {!loading && paginationInfo.page >= paginationInfo.total_pages && clientes.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Fim da lista ({clientes.length} clientes)
                    </p>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Nenhum cliente encontrado com esses filtros.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
