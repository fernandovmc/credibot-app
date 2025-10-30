"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
  } & Record<string, unknown>
}

const ChartContext = React.createContext<
  | {
      config: ChartConfig
    }
  | undefined
>(undefined)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  const cssVars = React.useMemo(() => {
    const vars: Record<string, string> = {}

    Object.entries(config).forEach(([key, value]) => {
      if (value.color) {
        vars[`--color-${key}`] = value.color
      }
    })

    return vars as React.CSSProperties
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={className}
        {...props}
        style={cssVars}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: any[]
    label?: any
    hideLabel?: boolean
    hideNameKey?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelFormatter?: (value: any) => React.ReactNode
    labelKey?: string
  }
>(
  (
    {
      active,
      payload,
      label,
      hideLabel = false,
      hideNameKey = false,
      indicator = "dot",
      nameKey,
      labelFormatter,
      labelKey,
      className,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.[0]) {
        return null
      }

      if (labelFormatter) {
        return labelFormatter(label)
      }

      if (typeof label === "string") {
        return label
      }

      return "value"
    }, [label, hideLabel, labelFormatter, payload])

    const sortedPayload = React.useMemo(() => {
      if (!payload?.length) return []
      return [...payload].sort((a, b) => {
        const valueA = typeof a.value === "number" ? a.value : 0
        const valueB = typeof b.value === "number" ? b.value : 0
        return valueB - valueA
      })
    }, [payload])

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={`rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm shadow-md ${className || ""}`}
        {...props}
      >
        {tooltipLabel ? (
          <div className="text-muted-foreground text-xs">{tooltipLabel}</div>
        ) : null}
        <div className="flex flex-col gap-1.5">
          {sortedPayload.map((item: any, index: number) => {
            const key = `${item.dataKey}`
            const itemConfig = config[key as keyof typeof config]
            const value = `${item.value}`

            if (hideNameKey) {
              return (
                <div
                  key={`${item.dataKey}-${index}`}
                  className="flex w-full flex-nowrap items-center gap-1.5"
                >
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: item.color || "currentColor",
                      }}
                    />
                  )}
                  <span className="text-foreground">{value}</span>
                </div>
              )
            }

            return (
              <div
                key={`${item.dataKey}-${index}`}
                className="flex w-full flex-nowrap items-center gap-1.5"
              >
                {itemConfig?.icon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color || "currentColor",
                    }}
                  />
                )}
                <div className="flex flex-1 justify-between gap-8">
                  <span className="text-muted-foreground text-xs">
                    {itemConfig?.label || key}
                  </span>
                  <span className="text-foreground font-medium text-xs">
                    {value}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart }
export type { ChartConfig }
