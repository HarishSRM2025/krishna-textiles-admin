'use client';

import { useState } from 'react';
import { TrendingUp, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { useTheme } from '@/app/ThemeContext';

export default function InteractiveChart({ data = [] }) {
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No sales trend data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const chartHeight = 220;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 30;

  // Calculate points for line chart
  const stepX = (chartWidth - paddingX * 2) / Math.max(data.length - 1, 1);
  const points = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = chartHeight - paddingY - (d.revenue / maxRevenue) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`;

  return (
    <div className="w-full">
      {/* Chart Top Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Revenue Performance (₹)</span>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-700/60 p-1 rounded-xl">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              chartType === 'line' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Trend Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              chartType === 'bar' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Monthly Bars
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative overflow-hidden">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64 overflow-visible">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={isDark ? 0.45 : 0.25} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke={isDark ? '#1E293B' : '#E2E8F0'}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  ₹{Math.round((maxRevenue * ratio) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Bar Mode */}
          {chartType === 'bar' &&
            points.map((pt, i) => {
              const barWidth = 32;
              const barHeight = (pt.revenue / maxRevenue) * (chartHeight - paddingY * 2);
              const barY = chartHeight - paddingY - barHeight;
              const isHovered = hoveredIndex === i;

              return (
                <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  <rect
                    x={pt.x - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="6"
                    fill={isHovered ? '#4F46E5' : '#6366F1'}
                    className="transition-all duration-200 cursor-pointer"
                  />
                  <text
                    x={pt.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fill={isHovered ? (isDark ? '#FFFFFF' : '#0F172A') : '#94A3B8'}
                    fontSize="11"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                  >
                    {pt.month}
                  </text>
                </g>
              );
            })}

          {/* Line Mode */}
          {chartType === 'line' && (
            <>
              <path d={areaD} fill="url(#revenueGradient)" />
              <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
              {points.map((pt, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 7 : 4}
                      fill="#FFFFFF"
                      stroke="#4F46E5"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150"
                    />
                    <text
                      x={pt.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fill={isHovered ? (isDark ? '#FFFFFF' : '#0F172A') : '#94A3B8'}
                      fontSize="11"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
                      {pt.month}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute bg-white dark:bg-dark-950 border border-slate-200 dark:border-brand-500/40 p-2.5 rounded-xl shadow-xl pointer-events-none text-xs transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
              top: `${(points[hoveredIndex].y / chartHeight) * 100 - 12}%`,
            }}
          >
            <div className="font-bold text-slate-900 dark:text-white mb-0.5">{points[hoveredIndex].month} 2026</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              ₹{points[hoveredIndex].revenue.toLocaleString('en-IN')}
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Approx {points[hoveredIndex].orders || 0} Orders
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
