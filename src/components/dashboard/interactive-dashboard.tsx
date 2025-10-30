"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  ApprovalTrendChart,
  ScoreDistributionChart,
  RiskClassificationChart,
  RegionalAnalysisChart,
  SectorAnalysisChart,
} from "./dashboard-charts";
import {
  dashboardMetrics,
  approvalTrendData,
  scoreDistributionData,
  riskClassificationData,
  regionAnalysisData,
  sectorAnalysisData,
} from "@/data/dashboard-data";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
};

export function InteractiveDashboard() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h1>
        <p className="text-muted-foreground mt-2">
          Visualize e interaja com métricas de crédito em tempo real
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric, index) => {
          const Icon = ICON_MAP[metric.icon];
          const isPositive = metric.change >= 0;

          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={isPositive ? "text-green-600" : "text-red-600"}>
                    {isPositive ? "+" : ""}
                    {metric.change}%
                  </span>{" "}
                  em relação ao período anterior
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid - 2 columns layout */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Approval Trend - Full width */}
        <div className="lg:col-span-2">
          <ApprovalTrendChart data={approvalTrendData} />
        </div>

        {/* Score Distribution */}
        <ScoreDistributionChart data={scoreDistributionData} />

        {/* Risk Classification */}
        <RiskClassificationChart data={riskClassificationData} />

        {/* Regional Analysis */}
        <RegionalAnalysisChart data={regionAnalysisData} />

        {/* Sector Analysis */}
        <SectorAnalysisChart data={sectorAnalysisData} />
      </div>

    </div>
  );
}
