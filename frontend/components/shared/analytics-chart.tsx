"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, BarChart3, PieChartIcon } from "lucide-react"
import { useState } from "react"

interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}

interface AnalyticsChartProps {
  title: string
  description?: string
  data: ChartData[]
  type?: "bar" | "line" | "pie"
  dataKey?: string
  xAxisKey?: string
  showTimeFilter?: boolean
}

export function AnalyticsChart({
  title,
  description,
  data,
  type = "bar",
  dataKey = "value",
  xAxisKey = "name",
  showTimeFilter = true,
}: AnalyticsChartProps) {
  const [timeFilter, setTimeFilter] = useState("7d")

  const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]

  const getChartIcon = () => {
    switch (type) {
      case "line":
        return <TrendingUp className="h-4 w-4" />
      case "pie":
        return <PieChartIcon className="h-4 w-4" />
      case "bar":
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={dataKey} stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )
      case "bar":
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getChartIcon()}
            <CardTitle>{title}</CardTitle>
          </div>
          {showTimeFilter && (
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
