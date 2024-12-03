"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

interface ChartPayloadItem {
  value: number
  name: string
  dataKey: string
  payload: Record<string, number | string>
  color?: string
  [key: string]: number | string | Record<string, number | string> | undefined
}

interface TooltipProps {
  active?: boolean
  payload?: ChartPayloadItem[]
  label?: string
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, configItem]) => configItem.theme || configItem.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipProps & {
    className?: string
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      nameKey = "name",
      labelKey = "value",
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background px-3 py-2 text-sm shadow-md",
          className
        )}
        {...props}
      >
        {!hideLabel && (
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            {label}
          </div>
        )}
        <div className="grid gap-2">
          {payload.map((item, index) => {
            const itemConfig = getPayloadConfigFromPayload(config, item, nameKey)
            const rawName = itemConfig?.label || item[nameKey]
            const name = isValidReactNode(rawName) ? rawName : String(rawName)
            const color = itemConfig?.color || item.color
            const value = item[labelKey]

            return (
              <div key={index} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {!hideIndicator && (
                    <>
                      {indicator === "dot" && (
                        <div
                          className="h-1 w-1 rounded-full"
                          style={{ background: color }}
                        />
                      )}
                      {indicator === "line" && (
                        <div
                          className="h-0.5 w-2"
                          style={{ background: color }}
                        />
                      )}
                      {indicator === "dashed" && (
                        <div
                          className="h-px w-3"
                          style={{
                            backgroundImage: `linear-gradient(to right, ${color} 50%, transparent 50%)`,
                            backgroundSize: "4px 100%",
                          }}
                        />
                      )}
                    </>
                  )}
                  {name}
                </div>
                <div>{value}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<{
      value: string
      type?: string
      id?: string
      color?: string
    }>
    hideIcon?: boolean
  }
>(({ className, payload = [], hideIcon, ...props }, ref) => {
  const { config } = useChart()

  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap gap-4", className)}
      {...props}
    >
      {payload.map((item, index) => {
        const itemConfig = getPayloadConfigFromPayload(config, item, "value")
        const Icon = itemConfig?.icon
        const color = itemConfig?.color || item.color

        return (
          <div key={index} className="flex items-center gap-1.5">
            {!hideIcon && !Icon && (
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: color }}
              />
            )}
            {!hideIcon && Icon && (
              <Icon />
            )}
            {itemConfig?.label || item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const dataKey =
    payload &&
    typeof payload === "object" &&
    "dataKey" in payload &&
    typeof payload.dataKey === "string"
      ? payload.dataKey
      : typeof (payload as { id?: string }).id === "string"
      ? (payload as { id: string }).id
      : key in payload
      ? (payload as Record<string, unknown>)[key]?.toString()
      : null

  if (!dataKey) {
    return null
  }

  return config[dataKey] || null
}

const isValidReactNode = (value: unknown): value is React.ReactNode => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || typeof value === 'number') return true;
  if (React.isValidElement(value)) return true;
  return false;
};

export {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
}
