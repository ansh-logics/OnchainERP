"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface FilterOption {
  id: string
  label: string
  value: string
}

interface FilterGroup {
  id: string
  label: string
  options: FilterOption[]
}

interface SearchFilterProps {
  placeholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filterGroups?: FilterGroup[]
  activeFilters?: Record<string, string[]>
  onFilterChange?: (groupId: string, values: string[]) => void
  sortOptions?: { label: string; value: string }[]
  sortValue?: string
  onSortChange?: (value: string) => void
}

export function SearchFilter({
  placeholder = "Search...",
  searchValue,
  onSearchChange,
  filterGroups = [],
  activeFilters = {},
  onFilterChange,
  sortOptions = [],
  sortValue,
  onSortChange,
}: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleFilterToggle = (groupId: string, optionValue: string) => {
    if (!onFilterChange) return

    const currentValues = activeFilters[groupId] || []
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue]

    onFilterChange(groupId, newValues)
  }

  const clearFilter = (groupId: string, optionValue: string) => {
    if (!onFilterChange) return
    const currentValues = activeFilters[groupId] || []
    const newValues = currentValues.filter((v) => v !== optionValue)
    onFilterChange(groupId, newValues)
  }

  const clearAllFilters = () => {
    if (!onFilterChange) return
    filterGroups.forEach((group) => {
      onFilterChange(group.id, [])
    })
  }

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((count, values) => count + values.length, 0)
  }

  const getFilterLabel = (groupId: string, value: string) => {
    const group = filterGroups.find((g) => g.id === groupId)
    const option = group?.options.find((o) => o.value === value)
    return option?.label || value
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {sortOptions.length > 0 && (
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {filterGroups.length > 0 && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {getActiveFilterCount() > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                      Clear all
                    </Button>
                  )}
                </div>

                {filterGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <Label className="text-sm font-medium">{group.label}</Label>
                    <div className="space-y-2">
                      {group.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={(activeFilters[group.id] || []).includes(option.value)}
                            onCheckedChange={() => handleFilterToggle(group.id, option.value)}
                          />
                          <Label htmlFor={option.id} className="text-sm">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([groupId, values]) =>
            values.map((value) => (
              <Badge key={`${groupId}-${value}`} variant="secondary" className="flex items-center gap-1">
                {getFilterLabel(groupId, value)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter(groupId, value)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )),
          )}
        </div>
      )}
    </div>
  )
}
