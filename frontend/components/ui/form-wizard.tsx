"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle,
  Save,
  FileText
} from 'lucide-react'

export interface FormStep {
  id: string
  title: string
  description?: string
  component: React.ComponentType<FormStepProps>
  validation?: (data: any) => string[] // Return array of error messages
  optional?: boolean
}

export interface FormStepProps {
  data: any
  updateData: (updates: any) => void
  errors: string[]
  isValid: boolean
}

export interface FormWizardProps {
  steps: FormStep[]
  initialData?: any
  onComplete: (data: any) => void
  onSave?: (data: any) => void
  title?: string
  description?: string
  allowSkip?: boolean
  autoSave?: boolean
  autoSaveInterval?: number // in milliseconds
}

export function FormWizard({
  steps,
  initialData = {},
  onComplete,
  onSave,
  title,
  description,
  allowSkip = false,
  autoSave = true,
  autoSaveInterval = 30000 // 30 seconds
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialData)
  const [stepErrors, setStepErrors] = useState<Record<string, string[]>>({})
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave) return

    const interval = setInterval(() => {
      onSave(formData)
      setLastSaved(new Date())
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [autoSave, autoSaveInterval, formData, onSave])

  const updateData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const validateStep = (stepIndex: number): boolean => {
    const step = steps[stepIndex]
    if (!step.validation) return true

    const errors = step.validation(formData)
    setStepErrors(prev => ({ ...prev, [step.id]: errors }))

    if (errors.length === 0) {
      setCompletedSteps(prev => new Set([...prev, stepIndex]))
      return true
    }
    return false
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to previous steps or next step if current is valid
    if (stepIndex <= currentStep || (stepIndex === currentStep + 1 && validateStep(currentStep))) {
      setCurrentStep(stepIndex)
    }
  }

  const handleSkip = () => {
    if (allowSkip && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = async () => {
    // Validate all steps
    let allValid = true
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        allValid = false
      }
    }

    if (!allValid) {
      // Navigate to first invalid step
      for (let i = 0; i < steps.length; i++) {
        if (stepErrors[steps[i].id]?.length > 0) {
          setCurrentStep(i)
          break
        }
      }
      return
    }

    setIsSubmitting(true)
    try {
      await onComplete(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentStepErrors = (): string[] => {
    return stepErrors[steps[currentStep]?.id] || []
  }

  const isCurrentStepValid = (): boolean => {
    return getCurrentStepErrors().length === 0
  }

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' | 'error' => {
    if (completedSteps.has(stepIndex)) return 'completed'
    if (stepIndex === currentStep) {
      return getCurrentStepErrors().length > 0 ? 'error' : 'current'
    }
    return 'upcoming'
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  const CurrentStepComponent = steps[currentStep]?.component

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      {(title || description) && (
        <div className="text-center space-y-2">
          {title && <h1 className="text-3xl font-bold">{title}</h1>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const status = getStepStatus(index)
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => handleStepClick(index)}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  transition-colors duration-200
                  ${status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : status === 'current'
                    ? 'bg-primary text-primary-foreground'
                    : status === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-muted text-muted-foreground'
                  }
                  ${index <= currentStep || completedSteps.has(index) 
                    ? 'cursor-pointer hover:opacity-80' 
                    : 'cursor-not-allowed'
                  }
                `}
                disabled={index > currentStep && !completedSteps.has(index)}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : status === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </button>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  completedSteps.has(index) ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 text-center px-2">
            <div className="font-medium">{step.title}</div>
            {step.optional && (
              <Badge variant="outline" className="text-xs mt-1">
                Optional
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {steps[currentStep]?.title}
          </CardTitle>
          {steps[currentStep]?.description && (
            <CardDescription>
              {steps[currentStep].description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {/* Step Errors */}
          {getCurrentStepErrors().length > 0 && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                Please fix the following issues:
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {getCurrentStepErrors().map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step Component */}
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={formData}
              updateData={updateData}
              errors={getCurrentStepErrors()}
              isValid={isCurrentStepValid()}
            />
          )}
        </CardContent>
      </Card>

      {/* Auto-save indicator */}
      {autoSave && onSave && lastSaved && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Save className="h-4 w-4" />
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {allowSkip && currentStep < steps.length - 1 && steps[currentStep].optional && (
            <Button
              variant="ghost"
              onClick={handleSkip}
            >
              Skip
            </Button>
          )}

          {onSave && (
            <Button
              variant="outline"
              onClick={() => {
                onSave(formData)
                setLastSaved(new Date())
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          )}

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepValid() && !allowSkip}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
