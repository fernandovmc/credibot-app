"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  XAxis,
} from "recharts"
import { TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ApprovalTrendData {
  month: string
  approved: number
  rejected: number
  pending: number
}

interface ChartDataPoint {
  name: string
  value?: number
  approved?: number
  rejected?: number
  total?: number
  count?: number
  [key: string]: string | number | undefined
}

// Chart configurations using CSS variables
const approvalChartConfig = {
  approved: {
    label: "Aprovados",
    color: "var(--chart-1)",
  },
  rejected: {
    label: "Rejeitados",
    color: "var(--chart-3)",
  },
  pending: {
    label: "Pendentes",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const scoreChartConfig = {
  views: {
    label: "Quantidade",
  },
  value: {
    label: "Clientes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const riskChartConfig = {
  low: {
    label: "Baixo",
    color: "var(--chart-1)",
  },
  medium: {
    label: "Médio",
    color: "var(--chart-4)",
  },
  high: {
    label: "Alto",
    color: "var(--chart-3)",
  },
  veryHigh: {
    label: "Muito Alto",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const regionalChartConfig = {
  approved: {
    label: "Aprovados",
    color: "var(--chart-1)",
  },
  rejected: {
    label: "Rejeitados",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const sectorChartConfig = {
  value: {
    label: "Clientes",
  },
} satisfies ChartConfig

interface ApprovalTrendChartProps {
  data: ApprovalTrendData[]
  onDataClick?: (data: ApprovalTrendData) => void
}

export function ApprovalTrendChart({ data }: ApprovalTrendChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Tendência de Aprovações</CardTitle>
        <CardDescription>
          Evolução de aprovações, rejeições e pendências ao longo dos meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={approvalChartConfig} className="h-[250px]">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillApproved" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-approved)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-approved)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRejected" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rejected)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rejected)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-pending)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-pending)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="approved"
              type="natural"
              fill="url(#fillApproved)"
              fillOpacity={0.4}
              stroke="var(--color-approved)"
              stackId="a"
            />
            <Area
              dataKey="rejected"
              type="natural"
              fill="url(#fillRejected)"
              fillOpacity={0.4}
              stroke="var(--color-rejected)"
              stackId="a"
            />
            <Area
              dataKey="pending"
              type="natural"
              fill="url(#fillPending)"
              fillOpacity={0.4}
              stroke="var(--color-pending)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 leading-none font-medium">
          Tendência ao longo dos meses <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Visualizando dados de aprovações, rejeições e pendências
        </div>
      </CardFooter>
    </Card>
  )
}

interface ScoreDistributionChartProps {
  data: ChartDataPoint[]
  onBarClick?: (data: ChartDataPoint) => void
}

export function ScoreDistributionChart({
  data,
  onBarClick,
}: ScoreDistributionChartProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof scoreChartConfig>("value")

  const total = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + (curr.value || 0), 0)
  }, [data])

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Distribuição de Score</CardTitle>
          <CardDescription>
            Quantidade de clientes por faixa de score
          </CardDescription>
        </div>
        <div className="flex">
          <button
            data-active={activeChart === "value"}
            className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
            onClick={() => setActiveChart("value")}
          >
            <span className="text-muted-foreground text-xs">
              {scoreChartConfig.value.label}
            </span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {total.toLocaleString()}
            </span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={scoreChartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              bottom: 50,
            }}
          >
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={(props: any) => {
                const { x, y, payload } = props
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={4}
                      textAnchor="end"
                      fill="currentColor"
                      style={{ fontSize: "12px" }}
                      transform="rotate(-45)"
                    >
                      {payload.value}
                    </text>
                  </g>
                )
              }}
              height={70}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideNameKey />}
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              onClick={(entry: any) => {
                if (onBarClick) {
                  onBarClick(entry)
                }
              }}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface RiskClassificationChartProps {
  data: { name: string; value: number; count: number }[]
  onPieClick?: (data: { name: string; value: number; count: number }) => void
}

export function RiskClassificationChart({
  data,
  onPieClick,
}: RiskClassificationChartProps) {
  const getRiskColor = (name: string) => {
    if (name.includes("Baixo")) return "var(--chart-1)"
    if (name.includes("Médio")) return "var(--chart-4)"
    if (name.includes("Alto") && !name.includes("Muito")) return "var(--chart-3)"
    return "var(--chart-5)"
  }

  const chartDataWithFill = data.map((entry) => ({
    ...entry,
    fill: getRiskColor(entry.name),
  }))

  const maxRiskEntry = React.useMemo(() => {
    if (!chartDataWithFill.length) return null
    return chartDataWithFill.reduce((max, curr) =>
      curr.value > max.value ? curr : max
    )
  }, [chartDataWithFill])

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Classificação de Risco</CardTitle>
        <CardDescription>
          Distribuição de clientes por nível de risco
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={riskChartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const item = chartDataWithFill.find(
                      (d) => d.value === value
                    )
                    return item ? item.name : value
                  }}
                />
              }
            />
            <Pie
              data={chartDataWithFill}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={2}
              onClick={(entry: any) => {
                if (onPieClick) {
                  onPieClick({
                    name: entry.name,
                    value: entry.value,
                    count: entry.count,
                  })
                }
              }}
            >
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
                          {maxRiskEntry?.value.toLocaleString() || 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {maxRiskEntry?.name || "Risco"}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-4 text-sm">
        <div className="grid w-full gap-3">
          {chartDataWithFill.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground text-xs">
                {item.name}
              </span>
              <span className="ml-auto text-foreground font-medium text-xs">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

interface RegionalAnalysisChartProps {
  data: ChartDataPoint[]
  onBarClick?: (data: ChartDataPoint) => void
}

export function RegionalAnalysisChart({
  data,
  onBarClick,
}: RegionalAnalysisChartProps) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof regionalChartConfig>("approved")

  const total = React.useMemo(
    () => ({
      approved: data.reduce((acc, curr) => acc + (curr.approved || 0), 0),
      rejected: data.reduce((acc, curr) => acc + (curr.rejected || 0), 0),
    }),
    [data]
  )

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Análise por Região</CardTitle>
          <CardDescription>
            Aprovações e rejeições por região
          </CardDescription>
        </div>
        <div className="flex">
          {["approved", "rejected"].map((key) => {
            const chart = key as keyof typeof regionalChartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {regionalChartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={regionalChartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              bottom: 50,
            }}
          >
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={(props: any) => {
                const { x, y, payload } = props
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={4}
                      textAnchor="end"
                      fill="currentColor"
                      style={{ fontSize: "12px" }}
                      transform="rotate(-45)"
                    >
                      {payload.value}
                    </text>
                  </g>
                )
              }}
              height={70}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideNameKey />}
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              onClick={(entry: any) => {
                if (onBarClick) {
                  onBarClick(entry)
                }
              }}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface SectorAnalysisChartProps {
  data: ChartDataPoint[]
  onPieClick?: (data: ChartDataPoint) => void
}

export function SectorAnalysisChart({
  data,
  onPieClick,
}: SectorAnalysisChartProps) {
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ]

  const chartDataWithFill = data.map((entry, index) => ({
    ...entry,
    fill: chartColors[index % chartColors.length],
  }))

  const maxSectorEntry = React.useMemo(() => {
    if (!chartDataWithFill.length) return null
    return chartDataWithFill.reduce((max, curr) =>
      (curr.value || 0) > (max.value || 0) ? curr : max
    )
  }, [chartDataWithFill])

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Análise por Setor</CardTitle>
        <CardDescription>
          Distribuição de clientes e aprovações por setor
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={sectorChartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const item = chartDataWithFill.find(
                      (d) => (d.value || 0) === value
                    )
                    return item ? item.name : value
                  }}
                />
              }
            />
            <Pie
              data={chartDataWithFill}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={2}
              onClick={(entry: any) => {
                if (onPieClick) {
                  onPieClick({
                    name: entry.name,
                    value: entry.value || 0,
                    total: entry.total,
                    count: entry.count,
                  } as ChartDataPoint)
                }
              }}
            >
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
                          {(maxSectorEntry?.value || 0).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {maxSectorEntry?.name || "Setor"}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-4 text-sm">
        <div className="grid w-full gap-3">
          {chartDataWithFill.map((item, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground text-xs">
                {item.name}
              </span>
              <span className="ml-auto text-foreground font-medium text-xs">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
