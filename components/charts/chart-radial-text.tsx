"use client"

import {
    Label,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
} from "recharts"

import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { cn } from "@/lib/utils";

interface ChartRadialTextProps {
    chartConfig: ChartConfig;
    chartData: any[];
    dataKey: string;
    text: {
        value: string;
        label: string;
    };
    maxValue?: number;
    className?: string;
}

export function ChartRadialText({ chartConfig, chartData, dataKey, text, maxValue = 100, className }: ChartRadialTextProps) {
    const processedData = chartData.map(item => ({
        ...item,
        [dataKey]: Math.min(item[dataKey], maxValue)
    }));

    return (
        <ChartContainer
            config={chartConfig}
            className={cn("mx-auto aspect-square max-h-[250px] min-h-[200px]", className)}
        >
            <RadialBarChart
                data={processedData}
                startAngle={90}
                endAngle={-270}
                innerRadius={80}
                outerRadius={110}
                cx="50%"
                cy="50%"
            >
                <PolarAngleAxis type="number" domain={[0, maxValue]} tick={false} axisLine={false} />
                <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[86, 74]}
                />
                <RadialBar 
                    dataKey={dataKey} 
                    background={{ fill: "black" }}
                    cornerRadius={10}
                    fill={`var(--color-${dataKey})`}
                    stackId="a"
                />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                                            className="fill-foreground text-4xl font-bold"
                                        >
                                            {text.value}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                        >
                                            {text.label}
                                        </tspan>
                                    </text>
                                )
                            }
                        }}
                    />
                </PolarRadiusAxis>
            </RadialBarChart>
        </ChartContainer>
    )
}
