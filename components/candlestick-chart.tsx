"use client"

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Bar,
  Rectangle
} from 'recharts';
import { StockData, CandlestickData } from "@/types/stock";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    dataKey: string;
    payload: CandlestickData;
  }>;
  label?: string;
}

interface CandlestickChartProps {
  symbol: string;
  data: StockData;
}

interface ShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  background?: boolean;
  payload: CandlestickData;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border rounded shadow-lg">
        <p className="font-semibold">{data.date}</p>
        <p className="text-sm">Open: ${data.open.toFixed(2)}</p>
        <p className="text-sm">Close: ${data.close.toFixed(2)}</p>
        <p className="text-sm">High: ${data.high.toFixed(2)}</p>
        <p className="text-sm">Low: ${data.low.toFixed(2)}</p>
        <p className="text-sm">Volume: {data.volume.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function renderCandlestick(props: unknown) {
  const { x, y, width, height, payload } = props as ShapeProps;
  const data = payload as CandlestickData;
  const isPositive = data.close >= data.open;

  return (
    <Rectangle
      x={x - width / 2}
      y={isPositive ? y : y - height}
      width={width}
      height={height}
      fill={isPositive ? '#34D399' : '#EF4444'}
    />
  );
}

export function CandlestickChart({ symbol, data }: CandlestickChartProps) {
  const [chartData, setChartData] = useState<CandlestickData[]>([]);

  useEffect(() => {
    if (data?.historicalData) {
      setChartData(data.historicalData);
    }
  }, [data]);

  if (!chartData.length) {
    return <div>Loading chart data...</div>;
  }

  // Calculate price range for Y-axis
  const prices = chartData.flatMap(d => [d.high, d.low]);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceMargin = (maxPrice - minPrice) * 0.1;

  // Calculate volume range for secondary Y-axis
  const volumes = chartData.map(d => d.volume);
  const maxVolume = Math.max(...volumes);

  const formatYAxis = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatVolume = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{symbol} Stock Price</h2>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="price"
            domain={[minPrice - priceMargin, maxPrice + priceMargin]}
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxis}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            domain={[0, maxVolume]}
            tickFormatter={formatVolume}
          />
          <Tooltip content={<CustomTooltip />} />
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* Candlestick bodies */}
          <Bar
            dataKey="close"
            yAxisId="price"
            barSize={8}
            shape={renderCandlestick}
          />
          
          {/* Moving average line */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="#8884d8"
            dot={false}
            strokeWidth={2}
            yAxisId="price"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
