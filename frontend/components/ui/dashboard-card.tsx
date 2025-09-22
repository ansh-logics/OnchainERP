"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label?: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: React.ComponentType<{ className?: string }>
  color?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  actions?: {
    label: string
    onClick: () => void
  }[]
  loading?: boolean
  className?: string
}

const colorVariants = {
  default: {
    card: 'border-border',
    icon: 'text-muted-foreground',
    trend: {
      up: 'text-green-600 bg-green-50',
      down: 'text-red-600 bg-red-50',
      neutral: 'text-muted-foreground bg-muted'
    }
  },
  blue: {
    card: 'border-blue-200 bg-blue-50/50',
    icon: 'text-blue-600',
    trend: {
      up: 'text-green-600 bg-green-50',
      down: 'text-red-600 bg-red-50',
      neutral: 'text-blue-600 bg-blue-100'
    }
  },
  green: {
    card: 'border-green-200 bg-green-50/50',
    icon: 'text-green-600',
    trend: {
      up: 'text-green-600 bg-green-50',
      down: 'text-red-600 bg-red-50',
      neutral: 'text-green-600 bg-green-100'
    }
  },
  yellow: {
    card: 'border-yellow-200 bg-yellow-50/50',
    icon: 'text-yellow-600',
    trend: {
      up: 'text-green-600 bg-green-50',
      down: 'text-red-600 bg-red-50',
      neutral: 'text-yellow-600 bg-yellow-100'
    }
  },
  red: {
    card: 'border-red-200 bg-red-50/50',
    icon: 'text-red-600',
    trend: {
      up: 'text-green-600 bg-green-50',
      down: 'text-red-600 bg-red-50',
      neutral: 'text-red-600 bg-red-100'
    }
  },
  purple: {
    card: 'border-purple-200 bg-purple-50/50',
    icon: 'text-purple-600',
    trend: {
      up: 'text-green-600 bg-green-50',
      down: 'text-red-600 bg-red-50',
      neutral: 'text-purple-600 bg-purple-100'
    }
  },
  indigo: {
    card: 'border-indigo-200 bg-indigo-50/50',
    icon: 'text-indigo-600',
    trend: {
      up: 'text-green-600 bg-green-50',
      down: 'text-red-600 bg-red-50',
      neutral: 'text-indigo-600 bg-indigo-100'
    }
  }
}

const sizeVariants = {
  sm: {
    card: 'p-4',
    title: 'text-sm font-medium',
    value: 'text-2xl font-bold',
    description: 'text-xs',
    icon: 'h-4 w-4'
  },
  md: {
    card: 'p-6',
    title: 'text-sm font-medium',
    value: 'text-3xl font-bold',
    description: 'text-sm',
    icon: 'h-5 w-5'
  },
  lg: {
    card: 'p-8',
    title: 'text-base font-semibold',
    value: 'text-4xl font-bold',
    description: 'text-base',
    icon: 'h-6 w-6'
  }
}

export function DashboardCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  color = 'default',
  size = 'md',
  onClick,
  actions,
  loading = false,
  className = ''
}: DashboardCardProps) {
  const colorClasses = colorVariants[color]
  const sizeClasses = sizeVariants[size]

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <Card className={`${colorClasses.card} ${className}`}>
        <CardContent className={sizeClasses.card}>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={`
        ${colorClasses.card} 
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} 
        ${className}
      `}
      onClick={onClick}
    >
      <CardContent className={sizeClasses.card}>
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <p className={`${sizeClasses.title} text-muted-foreground`}>
                {title}
              </p>
              <div className="flex items-center gap-2">
                {Icon && <Icon className={`${sizeClasses.icon} ${colorClasses.icon}`} />}
                {actions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action, index) => (
                        <DropdownMenuItem key={index} onClick={action.onClick}>
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            <div className="flex items-baseline gap-2">
              <p className={sizeClasses.value}>
                {formatValue(value)}
              </p>
              {onClick && (
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-50" />
              )}
            </div>

            <div className="flex items-center justify-between">
              {description && (
                <p className={`${sizeClasses.description} text-muted-foreground`}>
                  {description}
                </p>
              )}
              
              {trend && (
                <div className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                  ${colorClasses.trend[trend.direction]}
                `}>
                  {getTrendIcon(trend.direction)}
                  <span>
                    {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                    {Math.abs(trend.value)}%
                  </span>
                  {trend.label && <span className="ml-1">{trend.label}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Grid layout for multiple dashboard cards
interface DashboardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DashboardGrid({ 
  children, 
  columns = 3, 
  gap = 'md',
  className = '' 
}: DashboardGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6'
  }

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}
