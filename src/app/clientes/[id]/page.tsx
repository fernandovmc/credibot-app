"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { Cliente } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadCliente(params.id as string);
    }
  }, [params.id]);

  const loadCliente = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getClienteById(id);
      setCliente(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar cliente");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-destructive text-center mb-4">
              {error || "Cliente não encontrado"}
            </p>
            <Button
              onClick={() => router.push("/clientes")}
              className="w-full"
              variant="outline"
            >
              Voltar para Clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scoreData = [
    { name: "Score", value: cliente.score_credito },
    { name: "Restante", value: 1000 - cliente.score_credito },
  ];

  const scoreChartConfig = {
    value: {
      label: "Score",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  const COLORS = ["oklch(0.7227 0.1920 149.5793)", "oklch(0.9670 0.0029 264.5419)"];

  const scoreHistoryData = [
    { month: "Jan", score: cliente.score_credito - 50 },
    { month: "Fev", score: cliente.score_credito - 30 },
    { month: "Mar", score: cliente.score_credito - 20 },
    { month: "Abr", score: cliente.score_credito - 10 },
    { month: "Mai", score: cliente.score_credito },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/clientes")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {cliente.nome}
              </h1>
              <p className="text-muted-foreground">{cliente.cpf_cnpj}</p>
            </div>
            <Badge variant={getRiskVariant(cliente.classe_risco)}>
              Risco {cliente.classe_risco}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Score de Crédito
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cliente.score_credito}</div>
              <p className="text-xs text-muted-foreground">De 0 a 1000</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {cliente.tipo_pessoa === "PF" ? "Renda Mensal" : "Faturamento Anual"}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cliente.tipo_pessoa === "PF"
                  ? cliente.renda_mensal
                    ? `R$ ${cliente.renda_mensal.toLocaleString("pt-BR")}`
                    : "N/A"
                  : cliente.faturamento_anual
                  ? `R$ ${cliente.faturamento_anual.toLocaleString("pt-BR")}`
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Declarado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Localização
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {cliente.cidade || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">{cliente.uf || "N/A"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {cliente.tipo_pessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
              </div>
              <div className="mt-2">
                {cliente.ativo ? (
                  <Badge>Ativo</Badge>
                ) : (
                  <Badge variant="destructive">Inativo</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={scoreChartConfig} className="h-[250px]">
                <BarChart
                  accessibilityLayer
                  data={scoreHistoryData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid vertical={false} horizontal={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    domain={[0, 1000]}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideNameKey />} />
                  <Bar
                    dataKey="score"
                    fill="var(--color-value)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição do Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={scoreChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          const item = scoreData.find((d) => d.value === value);
                          return item ? item.name : value;
                        }}
                      />
                    }
                  />
                  <Pie
                    data={scoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={2}
                  >
                    {scoreData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {cliente.score_credito}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-sm"
                              >
                                Score
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações Detalhadas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{cliente.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                <p className="font-medium">{cliente.cpf_cnpj}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Pessoa</p>
                <p className="font-medium">
                  {cliente.tipo_pessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Score de Crédito</p>
                <p className="font-medium">{cliente.score_credito}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Classe de Risco</p>
                <Badge variant={getRiskVariant(cliente.classe_risco)}>
                  {cliente.classe_risco}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cidade/UF</p>
                <p className="font-medium">
                  {cliente.cidade && cliente.uf
                    ? `${cliente.cidade} - ${cliente.uf}`
                    : "Não informado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
