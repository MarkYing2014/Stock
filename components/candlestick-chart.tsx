"use client"

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from 'recharts';

interface CandlestickChartProps {
  symbol: string;
  data: any;
}

const CustomTooltip = ({ active, payload }: any) => {
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

export function CandlestickChart({ symbol, data }: CandlestickChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data?.historicalData) {
      const formattedData = data.historicalData.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(),
        open: item.open,
        close: item.close,
        high: item.high,
        low: item.low,
        volume: item.volume,
        // Calculate the candlestick body
        bodyHeight: Math.abs(item.close - item.open),
        bodyBottom: Math.min(item.close, item.open),
        // Color coding
        isPositive: item.close >= item.open,
      }));
      setChartData(formattedData);
    }
  }, [data]);

  if (!data || !chartData.length) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
        <p className="text-lg text-gray-600">No data available</p>
      </div>
    );
  }

  // Calculate price range for Y-axis
  const prices = chartData.flatMap(d => [d.high, d.low]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceMargin = (maxPrice - minPrice) * 0.05;

  // Calculate volume range for secondary Y-axis
  const volumes = chartData.map(d => d.volume);
  const maxVolume = Math.max(...volumes);

  return (
    <div className="w-full h-[400px] bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{symbol} Stock Price</h2>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <XAxis 
            dataKey="date" 
            scale="band"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="price"
            domain={[minPrice - priceMargin, maxPrice + priceMargin]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            domain={[0, maxVolume]}
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* Volume bars in background */}
          <Bar
            dataKey="volume"
            yAxisId="volume"
            fill="#E5E7EB"
            opacity={0.5}
            barSize={8}
          />

          {/* Candlestick wicks (high-low lines) */}
          {chartData.map((entry, index) => (
            <Line
              key={`wick-${index}`}
              type="monotone"
              data={[entry]}
              dataKey="high"
              stroke={entry.isPositive ? '#34D399' : '#EF4444'}
              dot={false}
              yAxisId="price"
            />
          ))}

          {/* Candlestick bodies */}
          <Bar
            dataKey="bodyHeight"
            yAxisId="price"
            barSize={8}
            shape={(props: any) => {
              const { x, y, width, height, payload } = props;
              return (
                <rect
                  x={x - width / 2}
                  y={payload.isPositive ? y : y - height}
                  width={width}
                  height={height}
                  fill={payload.isPositive ? '#34D399' : '#EF4444'}
                />
              );
            }}
          />
          
          {/* Moving average line */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="#6366F1"
            dot={false}
            strokeWidth={1}
            yAxisId="price"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
