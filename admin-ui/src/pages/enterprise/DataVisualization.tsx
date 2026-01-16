/**
 * Data Visualization & Charts Demo Page
 *
 * Showcases components 65-72:
 * - AreaChart (65)
 * - BarChart (66)
 * - PieChart (67)
 * - LineChart (68)
 * - ScatterPlot (69)
 * - Gauge (70)
 * - Heatmap (71)
 * - FunnelChart (72)
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Eye,
  Activity,
  Target,
} from 'lucide-react';
import {
  PageContainer,
  Section,
  Card,
  CardBody,
  Badge,
  Button,
} from '../../design-system/components';
import { AreaChart, SimpleAreaChart, StackedAreaChart } from '../../design-system/components/AreaChart';
import { BarChart, HorizontalBarChart, ProgressBarChart, MiniBarChart } from '../../design-system/components/BarChart';
import { PieChart, DonutChart, HalfDonut, MiniPie, LabeledPieChart } from '../../design-system/components/PieChart';
import { LineChart, Sparkline, ComparisonLineChart } from '../../design-system/components/LineChart';
import { ScatterPlot, BubbleChart } from '../../design-system/components/ScatterPlot';
import { Gauge, ProgressRing, MultiGauge, Speedometer, MiniGauge } from '../../design-system/components/Gauge';
import { Heatmap, CalendarHeatmap, HeatmapRow } from '../../design-system/components/Heatmap';
import { FunnelChart, ComparisonFunnel, FunnelSteps, MiniFunnel } from '../../design-system/components/FunnelChart';
import { cn } from '../../utils/cn';

// ============================================================================
// Demo Data
// ============================================================================

// Area Chart data
const areaChartData = [
  { x: 'Jan', y: 4000 },
  { x: 'Feb', y: 3000 },
  { x: 'Mar', y: 5000 },
  { x: 'Apr', y: 4500 },
  { x: 'May', y: 6000 },
  { x: 'Jun', y: 5500 },
  { x: 'Jul', y: 7000 },
  { x: 'Aug', y: 6500 },
  { x: 'Sep', y: 8000 },
  { x: 'Oct', y: 7500 },
  { x: 'Nov', y: 9000 },
  { x: 'Dec', y: 8500 },
];

const stackedAreaSeries = [
  {
    id: 'revenue',
    name: 'Revenue',
    data: [
      { x: 'Jan', y: 4000 },
      { x: 'Feb', y: 3000 },
      { x: 'Mar', y: 5000 },
      { x: 'Apr', y: 4500 },
      { x: 'May', y: 6000 },
      { x: 'Jun', y: 5500 },
    ],
    color: '#6366f1',
  },
  {
    id: 'profit',
    name: 'Profit',
    data: [
      { x: 'Jan', y: 2400 },
      { x: 'Feb', y: 1398 },
      { x: 'Mar', y: 2800 },
      { x: 'Apr', y: 2908 },
      { x: 'May', y: 3800 },
      { x: 'Jun', y: 3200 },
    ],
    color: '#10b981',
  },
  {
    id: 'expenses',
    name: 'Expenses',
    data: [
      { x: 'Jan', y: 1600 },
      { x: 'Feb', y: 1602 },
      { x: 'Mar', y: 2200 },
      { x: 'Apr', y: 1592 },
      { x: 'May', y: 2200 },
      { x: 'Jun', y: 2300 },
    ],
    color: '#f59e0b',
  },
];

// Bar Chart data
const barChartData = [
  { label: 'Jan', value: 4000 },
  { label: 'Feb', value: 3000 },
  { label: 'Mar', value: 5000 },
  { label: 'Apr', value: 4500 },
  { label: 'May', value: 6000 },
  { label: 'Jun', value: 5500 },
];

const horizontalBarData = [
  { label: 'Chrome', value: 63 },
  { label: 'Safari', value: 18 },
  { label: 'Firefox', value: 10 },
  { label: 'Edge', value: 6 },
  { label: 'Other', value: 3 },
];

const progressBarData = [
  { label: 'Tasks Completed', value: 75, max: 100, color: '#10b981' },
  { label: 'Budget Used', value: 45000, max: 60000, color: '#f59e0b' },
  { label: 'Time Elapsed', value: 65, max: 100, color: '#6366f1' },
  { label: 'Storage', value: 8.5, max: 15, color: '#ec4899' },
];

// Pie Chart data
const pieChartData = [
  { label: 'Direct', value: 4000, color: '#6366f1' },
  { label: 'Organic', value: 3000, color: '#10b981' },
  { label: 'Referral', value: 2000, color: '#f59e0b' },
  { label: 'Social', value: 1500, color: '#ec4899' },
  { label: 'Email', value: 1000, color: '#8b5cf6' },
];

// Line Chart data
const lineChartSeries = [
  {
    id: 'visits',
    name: 'Page Visits',
    data: [
      { x: 'Mon', y: 1200 },
      { x: 'Tue', y: 1900 },
      { x: 'Wed', y: 1600 },
      { x: 'Thu', y: 2400 },
      { x: 'Fri', y: 2100 },
      { x: 'Sat', y: 1800 },
      { x: 'Sun', y: 1400 },
    ],
    color: '#6366f1',
  },
  {
    id: 'conversions',
    name: 'Conversions',
    data: [
      { x: 'Mon', y: 120 },
      { x: 'Tue', y: 190 },
      { x: 'Wed', y: 160 },
      { x: 'Thu', y: 240 },
      { x: 'Fri', y: 210 },
      { x: 'Sat', y: 180 },
      { x: 'Sun', y: 140 },
    ],
    color: '#10b981',
  },
];

const sparklineData = [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45];

// Scatter Plot data
const scatterData = [
  {
    id: 'product-a',
    name: 'Product A',
    data: Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    })),
    color: '#6366f1',
  },
  {
    id: 'product-b',
    name: 'Product B',
    data: Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    })),
    color: '#10b981',
  },
];

const bubbleData = [
  {
    id: 'sales',
    name: 'Sales Performance',
    data: [
      { x: 20, y: 30, size: 10 },
      { x: 40, y: 50, size: 20 },
      { x: 60, y: 40, size: 15 },
      { x: 80, y: 70, size: 25 },
      { x: 30, y: 60, size: 18 },
      { x: 50, y: 80, size: 30 },
      { x: 70, y: 20, size: 12 },
    ],
    color: '#8b5cf6',
  },
];

// Heatmap data
const heatmapData = [
  { x: 0, y: 0, value: 10 },
  { x: 1, y: 0, value: 20 },
  { x: 2, y: 0, value: 30 },
  { x: 3, y: 0, value: 40 },
  { x: 4, y: 0, value: 50 },
  { x: 5, y: 0, value: 60 },
  { x: 6, y: 0, value: 70 },
  { x: 0, y: 1, value: 15 },
  { x: 1, y: 1, value: 25 },
  { x: 2, y: 1, value: 35 },
  { x: 3, y: 1, value: 45 },
  { x: 4, y: 1, value: 55 },
  { x: 5, y: 1, value: 65 },
  { x: 6, y: 1, value: 75 },
  { x: 0, y: 2, value: 20 },
  { x: 1, y: 2, value: 30 },
  { x: 2, y: 2, value: 40 },
  { x: 3, y: 2, value: 50 },
  { x: 4, y: 2, value: 60 },
  { x: 5, y: 2, value: 70 },
  { x: 6, y: 2, value: 80 },
  { x: 0, y: 3, value: 25 },
  { x: 1, y: 3, value: 35 },
  { x: 2, y: 3, value: 45 },
  { x: 3, y: 3, value: 55 },
  { x: 4, y: 3, value: 65 },
  { x: 5, y: 3, value: 75 },
  { x: 6, y: 3, value: 85 },
  { x: 0, y: 4, value: 30 },
  { x: 1, y: 4, value: 40 },
  { x: 2, y: 4, value: 50 },
  { x: 3, y: 4, value: 60 },
  { x: 4, y: 4, value: 70 },
  { x: 5, y: 4, value: 80 },
  { x: 6, y: 4, value: 90 },
];

// Generate calendar heatmap data (last 365 days)
const generateCalendarData = () => {
  const data: Array<{ date: string; value: number }> = [];
  const today = new Date();

  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10),
    });
  }

  return data;
};

// Funnel Chart data
const funnelStages = [
  { id: 'visitors', label: 'Website Visitors', value: 10000 },
  { id: 'leads', label: 'Leads Generated', value: 5000 },
  { id: 'qualified', label: 'Qualified Leads', value: 2500 },
  { id: 'proposals', label: 'Proposals Sent', value: 1250 },
  { id: 'customers', label: 'Customers', value: 500 },
];

const funnelComparison = {
  current: [
    { id: 'visitors', label: 'Visitors', value: 10000 },
    { id: 'leads', label: 'Leads', value: 5000 },
    { id: 'qualified', label: 'Qualified', value: 2500 },
    { id: 'customers', label: 'Customers', value: 500 },
  ],
  previous: [
    { id: 'visitors', label: 'Visitors', value: 8000 },
    { id: 'leads', label: 'Leads', value: 3500 },
    { id: 'qualified', label: 'Qualified', value: 1800 },
    { id: 'customers', label: 'Customers', value: 350 },
  ],
};

// ============================================================================
// Component
// ============================================================================

export default function DataVisualization() {
  const [selectedPieSegment, setSelectedPieSegment] = useState<string | null>(null);
  const calendarData = useMemo(() => generateCalendarData(), []);

  return (
    <PageContainer
      title="Data Visualization & Charts"
      description="Showcasing Data Visualization components (65-72)"
    >
      <div className="space-y-8">
        {/* Section 1: Area Charts */}
        <Section title="Area Charts" description="Stacked and filled area visualizations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simple Area Chart */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Simple Area Chart (65)</h3>
                <SimpleAreaChart
                  data={areaChartData}
                  height={250}
                  showGrid={true}
                  showTooltip={true}
                  color="#6366f1"
                  gradientOpacity={0.3}
                />
              </CardBody>
            </Card>

            {/* Stacked Area Chart */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Stacked Area Chart</h3>
                <StackedAreaChart
                  series={stackedAreaSeries}
                  height={250}
                  showLegend={true}
                  showGrid={true}
                />
              </CardBody>
            </Card>
          </div>
        </Section>

        {/* Section 2: Bar Charts */}
        <Section title="Bar Charts" description="Vertical and horizontal bar visualizations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vertical Bar Chart */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Bar Chart (66)</h3>
                <BarChart
                  data={barChartData}
                  height={250}
                  showValues={true}
                  showGrid={true}
                  animate={true}
                />
              </CardBody>
            </Card>

            {/* Horizontal Bar Chart */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Horizontal Bar Chart</h3>
                <HorizontalBarChart
                  data={horizontalBarData}
                  height={250}
                  showValues={true}
                  formatValue={(v) => `${v}%`}
                  color="#10b981"
                />
              </CardBody>
            </Card>
          </div>

          {/* Progress Bars */}
          <Card className="mt-6">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Progress Bar Chart</h3>
              <ProgressBarChart items={progressBarData} showLabels={true} />
            </CardBody>
          </Card>

          {/* Mini Bar Charts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {['Revenue', 'Users', 'Orders', 'Views'].map((label, i) => (
              <Card key={label}>
                <CardBody className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-neutral-500">{label}</p>
                    <p className="text-2xl font-bold">
                      {[14500, 8420, 1250, 45200][i].toLocaleString()}
                    </p>
                  </div>
                  <MiniBarChart
                    data={Array.from({ length: 7 }, () => Math.random() * 100)}
                    width={80}
                    height={40}
                    color={['#6366f1', '#10b981', '#f59e0b', '#ec4899'][i]}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>

        {/* Section 3: Pie Charts */}
        <Section title="Pie Charts" description="Pie and donut chart variations">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Pie Chart (67)</h3>
                <PieChart
                  data={pieChartData}
                  size={200}
                  showLegend={true}
                  showTooltip={true}
                  onSegmentClick={(segment) => setSelectedPieSegment(segment.label)}
                />
                {selectedPieSegment && (
                  <p className="text-sm text-neutral-500 mt-4 text-center">
                    Selected: <strong>{selectedPieSegment}</strong>
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Donut Chart */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Donut Chart</h3>
                <DonutChart
                  data={pieChartData}
                  size={200}
                  thickness={40}
                  showLegend={true}
                  centerContent={
                    <div className="text-center">
                      <div className="text-2xl font-bold">11.5K</div>
                      <div className="text-xs text-neutral-500">Total</div>
                    </div>
                  }
                />
              </CardBody>
            </Card>

            {/* Half Donut & Mini Pie */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Half Donut & Mini</h3>
                <div className="space-y-6">
                  <HalfDonut
                    value={75}
                    max={100}
                    size={150}
                    thickness={20}
                    label="Performance"
                    color="#6366f1"
                  />
                  <div className="flex justify-center gap-6">
                    <MiniPie
                      data={pieChartData.slice(0, 3)}
                      size={60}
                    />
                    <MiniPie
                      data={pieChartData.slice(2, 5)}
                      size={60}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Labeled Pie Chart */}
          <Card className="mt-6">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Labeled Pie Chart</h3>
              <LabeledPieChart
                data={pieChartData}
                size={300}
                showPercentages={true}
              />
            </CardBody>
          </Card>
        </Section>

        {/* Section 4: Line Charts */}
        <Section title="Line Charts" description="Multi-line trend visualizations">
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Multi-Line Chart (68)</h3>
              <LineChart
                series={lineChartSeries}
                height={300}
                showGrid={true}
                showLegend={true}
                showTooltip={true}
                showDots={true}
              />
            </CardBody>
          </Card>

          {/* Sparklines */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Revenue', value: '$124,500', change: 12.5, color: '#6366f1' },
              { label: 'Users', value: '8,420', change: 8.2, color: '#10b981' },
              { label: 'Orders', value: '1,250', change: -3.1, color: '#f59e0b' },
              { label: 'Sessions', value: '45,200', change: 15.8, color: '#ec4899' },
            ].map((item) => (
              <Card key={item.label}>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-neutral-500">{item.label}</p>
                    <span className={cn(
                      'flex items-center text-xs font-medium',
                      item.change >= 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {item.change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(item.change)}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold mb-3">{item.value}</p>
                  <Sparkline
                    data={sparklineData.map(v => v * (1 + Math.random() * 0.5))}
                    width={200}
                    height={40}
                    color={item.color}
                    showArea={true}
                  />
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Comparison Line Chart */}
          <Card className="mt-6">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Comparison Line Chart</h3>
              <ComparisonLineChart
                current={lineChartSeries[0].data}
                previous={lineChartSeries[0].data.map(d => ({ ...d, y: d.y * 0.8 }))}
                height={250}
                currentLabel="This Week"
                previousLabel="Last Week"
              />
            </CardBody>
          </Card>
        </Section>

        {/* Section 5: Scatter Plots */}
        <Section title="Scatter Plots" description="Data point and bubble visualizations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scatter Plot */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Scatter Plot (69)</h3>
                <ScatterPlot
                  series={scatterData}
                  height={300}
                  showGrid={true}
                  showLegend={true}
                  showTooltip={true}
                  xAxisLabel="Price ($)"
                  yAxisLabel="Sales"
                />
              </CardBody>
            </Card>

            {/* Bubble Chart */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Bubble Chart</h3>
                <BubbleChart
                  series={bubbleData}
                  height={300}
                  showGrid={true}
                  showTooltip={true}
                  maxBubbleSize={40}
                />
              </CardBody>
            </Card>
          </div>
        </Section>

        {/* Section 6: Gauges */}
        <Section title="Gauges" description="Circular progress and gauge meters">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Main Gauge */}
            <Card>
              <CardBody className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">Gauge (70)</h3>
                <Gauge
                  value={75}
                  min={0}
                  max={100}
                  size={180}
                  thickness={20}
                  label="Performance"
                  showValue={true}
                  segments={[
                    { color: '#ef4444', label: 'Low' },
                    { color: '#f59e0b', label: 'Medium' },
                    { color: '#10b981', label: 'Good' },
                  ]}
                />
              </CardBody>
            </Card>

            {/* Progress Ring */}
            <Card>
              <CardBody className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">Progress Ring</h3>
                <ProgressRing
                  value={68}
                  max={100}
                  size={150}
                  strokeWidth={12}
                  color="#6366f1"
                  showLabel={true}
                />
              </CardBody>
            </Card>

            {/* Speedometer */}
            <Card>
              <CardBody className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">Speedometer</h3>
                <Speedometer
                  value={85}
                  max={120}
                  size={150}
                  unit="mph"
                  showTicks={true}
                />
              </CardBody>
            </Card>

            {/* Mini Gauges */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Mini Gauges</h3>
                <div className="space-y-4">
                  {[
                    { label: 'CPU', value: 65, color: '#6366f1' },
                    { label: 'Memory', value: 82, color: '#f59e0b' },
                    { label: 'Disk', value: 45, color: '#10b981' },
                    { label: 'Network', value: 28, color: '#ec4899' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <MiniGauge value={item.value} max={100} size={40} color={item.color} />
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-neutral-500">{item.value}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Multi Gauge */}
          <Card className="mt-6">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Multi Gauge</h3>
              <MultiGauge
                segments={[
                  { value: 85, max: 100, color: '#6366f1', label: 'Tasks' },
                  { value: 65, max: 100, color: '#10b981', label: 'Goals' },
                  { value: 45, max: 100, color: '#f59e0b', label: 'Budget' },
                ]}
                size={200}
                showLabels={true}
              />
            </CardBody>
          </Card>
        </Section>

        {/* Section 7: Heatmaps */}
        <Section title="Heatmaps" description="Color-coded data grids">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matrix Heatmap */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Matrix Heatmap (71)</h3>
                <Heatmap
                  data={heatmapData}
                  rows={5}
                  cols={7}
                  rowLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
                  colLabels={['12AM', '4AM', '8AM', '12PM', '4PM', '8PM', '11PM']}
                  showTooltip={true}
                  colorScale={['#f0fdf4', '#86efac', '#22c55e', '#15803d', '#166534']}
                />
              </CardBody>
            </Card>

            {/* Heatmap Row */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Heatmap Rows</h3>
                <div className="space-y-4">
                  {['Sales', 'Marketing', 'Engineering', 'Support'].map((label, i) => (
                    <HeatmapRow
                      key={label}
                      label={label}
                      values={Array.from({ length: 12 }, () => Math.random() * 100)}
                      colorScale={['#dbeafe', '#3b82f6', '#1e40af']}
                      showValues={false}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Calendar Heatmap */}
          <Card className="mt-6">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Calendar Heatmap (GitHub-style)</h3>
              <CalendarHeatmap
                data={calendarData}
                showMonthLabels={true}
                showWeekdayLabels={true}
                colorScale={['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']}
              />
            </CardBody>
          </Card>
        </Section>

        {/* Section 8: Funnel Charts */}
        <Section title="Funnel Charts" description="Conversion funnel visualizations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vertical Funnel */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Funnel Chart (72)</h3>
                <FunnelChart
                  stages={funnelStages}
                  orientation="vertical"
                  height={350}
                  showLabels={true}
                  showValues={true}
                  showPercentages={true}
                  showConversionRates={true}
                  animate={true}
                />
              </CardBody>
            </Card>

            {/* Comparison Funnel */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold mb-4">Comparison Funnel</h3>
                <ComparisonFunnel
                  current={funnelComparison.current}
                  previous={funnelComparison.previous}
                  currentLabel="This Month"
                  previousLabel="Last Month"
                  height={350}
                  showChange={true}
                  animate={true}
                />
              </CardBody>
            </Card>
          </div>

          {/* Funnel Steps */}
          <Card className="mt-6">
            <CardBody>
              <h3 className="text-lg font-semibold mb-4">Funnel Steps</h3>
              <FunnelSteps
                stages={[
                  { label: 'Impressions', value: 50000, sublabel: 'Ad views' },
                  { label: 'Clicks', value: 12500, sublabel: 'Click-throughs' },
                  { label: 'Sign-ups', value: 3750, sublabel: 'Registrations' },
                  { label: 'Activations', value: 1875, sublabel: 'Active users' },
                  { label: 'Purchases', value: 562, sublabel: 'Conversions' },
                ]}
                showConnectors={true}
              />
            </CardBody>
          </Card>

          {/* Mini Funnels */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Product A', data: [100, 75, 50, 25] },
              { label: 'Product B', data: [100, 60, 40, 30] },
              { label: 'Product C', data: [100, 80, 60, 40] },
              { label: 'Product D', data: [100, 70, 45, 20] },
            ].map((product) => (
              <Card key={product.label}>
                <CardBody className="flex items-center gap-4">
                  <MiniFunnel
                    stages={product.data.map(v => ({ value: v }))}
                    width={60}
                    height={80}
                  />
                  <div>
                    <p className="font-medium">{product.label}</p>
                    <p className="text-sm text-neutral-500">
                      {product.data[product.data.length - 1]}% conv.
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>

        {/* Summary */}
        <Section title="Component Summary">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: 65, name: 'AreaChart', desc: 'Stacked/filled areas', icon: <Activity className="w-5 h-5" /> },
              { num: 66, name: 'BarChart', desc: 'Vertical/horizontal bars', icon: <Target className="w-5 h-5" /> },
              { num: 67, name: 'PieChart', desc: 'Pie/donut charts', icon: <DollarSign className="w-5 h-5" /> },
              { num: 68, name: 'LineChart', desc: 'Multi-line trends', icon: <TrendingUp className="w-5 h-5" /> },
              { num: 69, name: 'ScatterPlot', desc: 'Data point scatter', icon: <Eye className="w-5 h-5" /> },
              { num: 70, name: 'Gauge', desc: 'Circular gauges', icon: <Activity className="w-5 h-5" /> },
              { num: 71, name: 'Heatmap', desc: 'Color-coded grids', icon: <Users className="w-5 h-5" /> },
              { num: 72, name: 'FunnelChart', desc: 'Conversion funnels', icon: <ShoppingCart className="w-5 h-5" /> },
            ].map((component) => (
              <Card key={component.num} className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                      {component.icon}
                    </div>
                    <Badge>#{component.num}</Badge>
                  </div>
                  <h4 className="font-semibold">{component.name}</h4>
                  <p className="text-sm text-neutral-500 mt-1">{component.desc}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}
