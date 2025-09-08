"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, File, X, Check, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  title?: string
  description?: string
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  maxFiles?: number
  onFilesUploaded?: (files: File[]) => void
}

interface UploadedFile {
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  id: string
}

export function FileUpload({
  title = "Upload Files",
  description = "Drag and drop files here or click to browse",
  acceptedFileTypes = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".png"],
  maxFileSize = 10,
  maxFiles = 5,
  onFilesUploaded,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.slice(0, maxFiles - uploadedFiles.length).map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
        id: Math.random().toString(36).substr(2, 9),
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Simulate file upload progress
      newFiles.forEach((uploadFile) => {
        const interval = setInterval(() => {
          setUploadedFiles((prev) =>
            prev.map((f) => {
              if (f.id === uploadFile.id) {
                const newProgress = Math.min(f.progress + Math.random() * 30, 100)
                const newStatus = newProgress === 100 ? "completed" : "uploading"
                return { ...f, progress: newProgress, status: newStatus }
              }
              return f
            }),
          )
        }, 500)

        setTimeout(() => {
          clearInterval(interval)
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 100, status: "completed" } : f)),
          )
        }, 3000)
      })

      if (onFilesUploaded) {
        onFilesUploaded(newFiles.map((f) => f.file))
      }
    },
    [maxFiles, uploadedFiles.length, onFilesUploaded],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize * 1024 * 1024,
    maxFiles: maxFiles - uploadedFiles.length,
  })

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "uploading":
      default:
        return <Upload className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "uploading":
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="font-medium mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">Accepted formats: {acceptedFileTypes.join(", ")}</p>
              <p className="text-sm text-muted-foreground">
                Max file size: {maxFileSize}MB • Max files: {maxFiles}
              </p>
            </div>
          )}
        </div>

        {/* File Rejections */}
        {fileRejections.length > 0 && (
          <div className="space-y-2">
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">{file.name}</p>
                {errors.map((error) => (
                  <p key={error.code} className="text-xs text-red-600">
                    {error.message}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Uploaded Files</h4>
            {uploadedFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <File className="h-8 w-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                    <Badge className={getStatusColor(uploadFile.status)} variant="secondary">
                      {uploadFile.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{formatFileSize(uploadFile.file.size)}</p>
                  {uploadFile.status === "uploading" && <Progress value={uploadFile.progress} className="h-1" />}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(uploadFile.status)}
                  <Button variant="ghost" size="sm" onClick={() => removeFile(uploadFile.id)} className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
